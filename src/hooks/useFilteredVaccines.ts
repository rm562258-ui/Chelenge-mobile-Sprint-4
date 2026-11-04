import { getNextDoseDate } from '../utils/vaccines';
import { useListFilter } from './useListFilter';

type FilterableVaccine = {
    boosterDate?: string;
    name?: string;
    nextDoseDate?: string;
};

const vaccineName = (vaccine: FilterableVaccine) => vaccine.name || '';
const hasBooster = (vaccine: FilterableVaccine) => !!getNextDoseDate(vaccine);

export function useFilteredVaccines(vaccines: FilterableVaccine[] | undefined) {
    return useListFilter(vaccines, { searchText: vaccineName, matchesFilter: hasBooster });
}
