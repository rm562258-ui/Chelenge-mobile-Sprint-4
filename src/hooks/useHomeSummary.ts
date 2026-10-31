import { useAppointments } from './useAppointments';
import { useAuth } from './useAuth';
import { useMedications } from './useMedications';
import { usePets } from './usePets';
import { useVaccines } from './useVaccines';
import { combineDateAndTime, parseAppDate } from '../utils/date';

type AppointmentSummaryItem = {
    date?: string;
    id?: string | number;
    petName?: string;
    status?: string;
    time?: string;
    type?: string;
};

type VaccineSummaryItem = {
    boosterDate?: string;
    id?: string | number;
    name?: string;
};

type MedicationSummaryItem = {
    endDate?: string;
    id?: string | number;
    name?: string;
};

const isMedicationInProgress = (medication: MedicationSummaryItem, today: Date) => {
    if (!medication.endDate) return true;

    const endDate = parseAppDate(medication.endDate);
    if (!endDate) return false;

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
};

export function useHomeSummary() {
    const { user } = useAuth();
    const petsQuery = usePets();
    const appointmentsQuery = useAppointments();
    const vaccinesQuery = useVaccines();
    const medicationsQuery = useMedications();

    const now = new Date();
    const appointments: AppointmentSummaryItem[] = Array.isArray(appointmentsQuery.data)
        ? appointmentsQuery.data
        : [];
    const vaccines: VaccineSummaryItem[] = Array.isArray(vaccinesQuery.data)
        ? vaccinesQuery.data
        : [];
    const medications: MedicationSummaryItem[] = Array.isArray(medicationsQuery.data)
        ? medicationsQuery.data
        : [];

    const nextAppointment = appointments
        .filter((appointment) => appointment.status === 'Agendada' && appointment.date && appointment.time)
        .map((appointment) => ({
            ...appointment,
            scheduledAt: combineDateAndTime(appointment.date as string, appointment.time as string),
        }))
        .filter((appointment) => appointment.scheduledAt && appointment.scheduledAt > now)
        .sort((first, second) => first.scheduledAt!.getTime() - second.scheduledAt!.getTime())[0] ?? null;

    const nextVaccine = vaccines
        .map((vaccine) => ({ ...vaccine, date: parseAppDate(vaccine.boosterDate) }))
        .filter((vaccine) => vaccine.date && vaccine.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        .sort((first, second) => first.date!.getTime() - second.date!.getTime())[0] ?? null;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const medicationsInProgress = medications.filter((medication) => isMedicationInProgress(medication, new Date(today))).length;

    return {
        tutorName: user?.displayName || user?.email || '',
        petsCount: Array.isArray(petsQuery.data) ? petsQuery.data.length : 0,
        nextAppointment,
        nextVaccine,
        medicationsInProgress,
        petsQuery,
        appointmentsQuery,
        vaccinesQuery,
        medicationsQuery,
        refetchAll: () => Promise.all([
            petsQuery.refetch(),
            appointmentsQuery.refetch(),
            vaccinesQuery.refetch(),
            medicationsQuery.refetch(),
        ]),
    };
}
