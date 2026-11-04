import { useListFilter } from './useListFilter';

type FilterablePet = {
    name?: string;
    petNome?: string;
};

const petName = (pet: FilterablePet) => pet.petNome || pet.name || '';
const byName = (first: FilterablePet, second: FilterablePet) => petName(first).localeCompare(petName(second));

export function useFilteredPets(pets: FilterablePet[] | undefined) {
    return useListFilter(pets, { searchText: petName, compare: byName });
}
