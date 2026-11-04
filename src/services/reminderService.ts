import { formatDisplayDate, combineDateAndTime, parseAppDate } from '../utils/date';
import { getNextDoseDate } from '../utils/vaccines';
import {
    cancelAll,
    cancelByKey,
    ensurePermission,
    getScheduledKeys,
    hasPermission,
    scheduleAt,
    sendNow,
} from './localNotificationService';

type AppointmentReminderValue = 'none' | 'at_time' | '30min' | '1h' | '1d';

export type ReminderAppointment = {
    id?: string | number;
    date?: string;
    time?: string;
    reminder?: AppointmentReminderValue;
    status?: string;
    petName?: string;
    type?: string;
};

export type ReminderVaccine = {
    id?: string | number;
    name?: string;
    nextDoseDate?: string;
    boosterDate?: string;
};

export function calculateAppointmentReminderDate(
    date: string | undefined,
    time: string | undefined,
    reminder: AppointmentReminderValue | undefined,
): Date | null {
    if (!date || !time || !reminder || reminder === 'none') return null;

    const scheduledAt = combineDateAndTime(date, time);
    if (!scheduledAt) return null;

    const minutesBefore: Record<Exclude<AppointmentReminderValue, 'none'>, number> = {
        at_time: 0,
        '30min': 30,
        '1h': 60,
        '1d': 24 * 60,
    };

    return new Date(scheduledAt.getTime() - minutesBefore[reminder] * 60_000);
}

export function calculateVaccineReminderDate(nextDoseDate: string | undefined): Date | null {
    const doseDate = parseAppDate(nextDoseDate);
    if (!doseDate) return null;

    doseDate.setDate(doseDate.getDate() - 1);
    doseDate.setHours(9, 0, 0, 0);
    return doseDate;
}

const appointmentKey = (id: string | number) => `appointment:${id}`;
const vaccineKey = (id: string | number) => `vaccine:${id}`;

const appointmentData = (appointment: ReminderAppointment) => ({
    type: 'appointment' as const,
    id: String(appointment.id),
});

const vaccineData = (vaccine: ReminderVaccine) => ({
    type: 'vaccine' as const,
    id: String(vaccine.id),
});

const appointmentNotificationText = (appointment: ReminderAppointment) => {
    const date = formatDisplayDate(appointment.date);
    const pet = appointment.petName || 'seu pet';
    const type = appointment.type || 'consulta';
    return {
        confirmationTitle: 'Consulta agendada',
        confirmationBody: `Consulta de ${pet}: ${type}, em ${date} às ${appointment.time}.`,
        reminderTitle: 'Lembrete de consulta',
        reminderBody: `Consulta de ${pet}: ${type}, em ${date} às ${appointment.time}.`,
    };
};

export async function confirmAppointmentCreated(
    appointment: ReminderAppointment,
    remindersEnabled: boolean,
): Promise<void> {
    if (!remindersEnabled || appointment.id == null || !appointment.date || !appointment.time) return;
    // Consulta registrada no passado ou já concluída não gera o aviso de "Consulta agendada".
    const scheduledAt = combineDateAndTime(appointment.date, appointment.time);
    if (appointment.status === 'Concluída' || !scheduledAt || scheduledAt.getTime() <= Date.now()) return;

    const text = appointmentNotificationText(appointment);
    await sendNow({
        title: text.confirmationTitle,
        body: text.confirmationBody,
        data: appointmentData(appointment),
    });
}

export async function scheduleAppointmentReminders(
    appointment: ReminderAppointment,
    remindersEnabled: boolean,
): Promise<void> {
    if (appointment.id == null) return;
    const key = appointmentKey(appointment.id);
    await cancelByKey(key);
    // 'Atrasada' pode estar desatualizado após remarcar; datas passadas já são ignoradas por scheduleAt.
    if (!remindersEnabled || appointment.status === 'Concluída') return;

    const reminderDate = calculateAppointmentReminderDate(appointment.date, appointment.time, appointment.reminder);
    if (!reminderDate) return;

    const text = appointmentNotificationText(appointment);
    await scheduleAt({
        key,
        date: reminderDate,
        title: text.reminderTitle,
        body: text.reminderBody,
        data: appointmentData(appointment),
    });
}

export function cancelAppointmentReminders(id: string | number): Promise<void> {
    return cancelByKey(appointmentKey(id));
}

export async function confirmVaccineCreated(
    vaccine: ReminderVaccine,
    remindersEnabled: boolean,
): Promise<void> {
    const nextDoseDate = getNextDoseDate(vaccine);
    if (!remindersEnabled || vaccine.id == null || !nextDoseDate) return;

    await sendNow({
        title: 'Vacina registrada',
        body: `${vaccine.name || 'Vacina'} registrada. Próximo reforço em ${formatDisplayDate(nextDoseDate)}.`,
        data: vaccineData(vaccine),
    });
}

export async function scheduleVaccineReminder(
    vaccine: ReminderVaccine,
    remindersEnabled: boolean,
): Promise<void> {
    if (vaccine.id == null) return;
    const key = vaccineKey(vaccine.id);
    await cancelByKey(key);
    const nextDoseDate = getNextDoseDate(vaccine);
    if (!remindersEnabled || !nextDoseDate) return;

    const date = calculateVaccineReminderDate(nextDoseDate);
    if (!date) return;
    await scheduleAt({
        key,
        date,
        title: 'Lembrete de reforço de vacina',
        body: `O reforço de ${vaccine.name || 'vacina'} está previsto para ${formatDisplayDate(nextDoseDate)}.`,
        data: vaccineData(vaccine),
    });
}

export function cancelVaccineReminder(id: string | number): Promise<void> {
    return cancelByKey(vaccineKey(id));
}

export async function rescheduleAll(
    appointments: ReminderAppointment[],
    vaccines: ReminderVaccine[],
    remindersEnabled: boolean,
): Promise<void> {
    await cancelAll();
    if (!remindersEnabled) return;
    if (!(await ensurePermission())) return;

    // Em sequência: agendamentos paralelos sobrescreveriam o mapa de notificações no AsyncStorage
    // e deixariam lembretes impossíveis de cancelar.
    for (const appointment of appointments) {
        await scheduleAppointmentReminders(appointment, true);
    }
    for (const vaccine of vaccines) {
        await scheduleVaccineReminder(vaccine, true);
    }
}

/**
 * Ao entrar no app, agenda o que falta no aparelho (ex.: depois de sair e entrar na conta) e cancela
 * lembretes de registros que não existem mais (ex.: consulta offline que ganhou outro id ao sincronizar).
 * Diferente de rescheduleAll, preserva o que já está agendado e as notificações já entregues.
 */
export async function restoreMissingReminders(
    appointments: ReminderAppointment[],
    vaccines: ReminderVaccine[],
): Promise<void> {
    // Sem permissão não há o que restaurar; o pedido aparece ao cadastrar uma consulta ou vacina.
    if (!(await hasPermission())) return;

    const scheduledKeys = new Set(await getScheduledKeys());
    const currentKeys = new Set<string>();

    // Em sequência, pelo mesmo motivo de rescheduleAll.
    for (const appointment of appointments) {
        if (appointment.id == null) continue;
        const key = appointmentKey(appointment.id);
        currentKeys.add(key);
        if (!scheduledKeys.has(key)) await scheduleAppointmentReminders(appointment, true);
    }
    for (const vaccine of vaccines) {
        if (vaccine.id == null) continue;
        const key = vaccineKey(vaccine.id);
        currentKeys.add(key);
        if (!scheduledKeys.has(key)) await scheduleVaccineReminder(vaccine, true);
    }
    for (const key of scheduledKeys) {
        if (!currentKeys.has(key)) await cancelByKey(key);
    }
}

export function cancelAllReminders(): Promise<void> {
    return cancelAll();
}
