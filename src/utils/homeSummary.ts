import { combineDateAndTime, isMedicationInProgress, parseAppDate } from './date';
import { getNextDoseDate } from './vaccines';

export type AppointmentSummaryItem = {
    date?: string;
    id?: string | number;
    petName?: string;
    status?: string;
    time?: string;
    type?: string;
};

export type VaccineSummaryItem = {
    boosterDate?: string;
    id?: string | number;
    name?: string;
    nextDoseDate?: string;
    petId?: string | number;
};

export type MedicationSummaryItem = {
    dosage?: string;
    endDate?: string;
    frequency?: string;
    id?: string | number;
    name?: string;
    petId?: string | number;
    startDate?: string;
};

type Dated = { at: Date };

const hasDate = <T extends { at: Date | null }>(item: T): item is T & Dated => item.at !== null;

/**
 * Item mais próximo: o primeiro que ainda vai acontecer ou, se não houver nenhum,
 * o mais recente que já passou sem ser resolvido (consulta atrasada, reforço vencido).
 */
function closest<T extends Dated>(items: T[], reference: Date) {
    const sorted = [...items].sort((first, second) => first.at.getTime() - second.at.getTime());
    const upcoming = sorted.find((item) => item.at >= reference);
    if (upcoming) return { ...upcoming, isOverdue: false };

    const latestOverdue = sorted[sorted.length - 1];
    return latestOverdue ? { ...latestOverdue, isOverdue: true } : null;
}

export function pickNextAppointment(appointments: AppointmentSummaryItem[], now: Date) {
    const pending = appointments
        .filter((appointment) => appointment.status !== 'Concluída')
        .map((appointment) => ({
            ...appointment,
            at: appointment.time
                ? combineDateAndTime(appointment.date ?? '', appointment.time)
                : parseAppDate(appointment.date),
        }))
        .filter(hasDate);

    return closest(pending, now);
}

export function pickNextVaccine(vaccines: VaccineSummaryItem[], today: Date) {
    const doses = vaccines
        .map((vaccine) => {
            const dueDate = getNextDoseDate(vaccine);
            return { ...vaccine, dueDate, at: parseAppDate(dueDate) };
        })
        .filter(hasDate);

    return closest(doses, today);
}

/** Tratamento em andamento que termina primeiro (uso contínuo por último) ou, se não houver, o próximo a começar. */
export function pickNextMedication(medications: MedicationSummaryItem[], today: Date) {
    const items = medications.map((medication) => ({
        ...medication,
        start: parseAppDate(medication.startDate),
        end: parseAppDate(medication.endDate),
    }));
    const endTime = (item: (typeof items)[number]) => item.end?.getTime() ?? Number.MAX_SAFE_INTEGER;

    const inProgress = items
        .filter((item) => (!item.start || item.start <= today) && isMedicationInProgress(item.endDate, today))
        .sort((first, second) => endTime(first) - endTime(second));
    const upcoming = items
        .filter((item) => item.start && item.start > today)
        .sort((first, second) => first.start!.getTime() - second.start!.getTime())[0];

    const nextMedication = inProgress[0]
        ? { ...inProgress[0], startsLater: false }
        : upcoming
            ? { ...upcoming, startsLater: true }
            : null;

    return { nextMedication, inProgressCount: inProgress.length };
}
