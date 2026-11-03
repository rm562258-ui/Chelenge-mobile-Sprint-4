import { useAppointments } from './useAppointments';
import { useAuth } from './useAuth';
import { useMedications } from './useMedications';
import { usePetOptions } from './usePetOptions';
import { usePets } from './usePets';
import { useVaccines } from './useVaccines';
import {
    pickNextAppointment,
    pickNextMedication,
    pickNextVaccine,
    type AppointmentSummaryItem,
    type MedicationSummaryItem,
    type VaccineSummaryItem,
} from '../utils/homeSummary';

const asArray = <T,>(data: unknown): T[] => (Array.isArray(data) ? data : []);

export function useHomeSummary() {
    const { user } = useAuth();
    const petsQuery = usePets();
    const appointmentsQuery = useAppointments();
    const vaccinesQuery = useVaccines();
    const medicationsQuery = useMedications();
    const { getPetName } = usePetOptions();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const petNameOf = (petId?: string | number) => (petId == null || petId === '' ? null : getPetName(petId));

    const nextAppointment = pickNextAppointment(asArray<AppointmentSummaryItem>(appointmentsQuery.data), now);

    const vaccine = pickNextVaccine(asArray<VaccineSummaryItem>(vaccinesQuery.data), today);
    const nextVaccine = vaccine ? { ...vaccine, petName: petNameOf(vaccine.petId) } : null;

    const medicationSummary = pickNextMedication(asArray<MedicationSummaryItem>(medicationsQuery.data), today);
    const medication = medicationSummary.nextMedication;
    const nextMedication = medication ? { ...medication, petName: petNameOf(medication.petId) } : null;

    return {
        tutorName: user?.displayName || user?.email || '',
        petsCount: Array.isArray(petsQuery.data) ? petsQuery.data.length : 0,
        nextAppointment,
        nextVaccine,
        nextMedication,
        medicationsInProgress: medicationSummary.inProgressCount,
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
