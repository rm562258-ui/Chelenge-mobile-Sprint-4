import { isMedicationInProgress } from '../utils/date';
import { useListFilter } from './useListFilter';

type FilterableMedication = {
    endDate?: string;
    name?: string;
};

const medicationName = (medication: FilterableMedication) => medication.name || '';
const isActive = (medication: FilterableMedication) => isMedicationInProgress(medication.endDate);

export function useFilteredMedications(medications: FilterableMedication[] | undefined) {
    return useListFilter(medications, { searchText: medicationName, matchesFilter: isActive });
}
