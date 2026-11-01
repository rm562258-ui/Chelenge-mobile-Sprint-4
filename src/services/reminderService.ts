import { formatDisplayDate, combineDateAndTime, parseAppDate } from '../utils/date';
import { ensurePermission, scheduleAt, sendNow, cancelByKey, cancelAll } from './localNotificationService';

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

const vaccineDoseDate = (vaccine: ReminderVaccine) => (
    vaccine.nextDoseDate !== undefined ? vaccine.nextDoseDate : vaccine.boosterDate
);

export async function confirmAppointmentCreated(
    appointment: ReminderAppointment,
    remindersEnabled: boolean,
): Promise<void> {
    if (!remindersEnabled || appointment.id == null || !appointment.date || !appointment.time) return;
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
    if (!remindersEnabled || appointment.status === 'Concluída' || appointment.status === 'Atrasada') return;

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
    const nextDoseDate = vaccineDoseDate(vaccine);
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
    const nextDoseDate = vaccineDoseDate(vaccine);
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

    await Promise.all([
        ...appointments.map((appointment) => scheduleAppointmentReminders(appointment, true)),
        ...vaccines.map((vaccine) => scheduleVaccineReminder(vaccine, true)),
    ]);
}

export function cancelAllReminders(): Promise<void> {
    return cancelAll();
}
