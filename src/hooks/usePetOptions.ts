import { useCallback, useMemo } from 'react';
import { usePets } from './usePets';

type PetRecord = {
    id?: string | number;
    petNome?: string;
    name?: string;
};

export type PetOption = {
    id: string;
    name: string;
};

/** Pets cadastrados no formato usado por seletores e para exibir o nome a partir do petId. */
export function usePetOptions() {
    const { data, isLoading } = usePets();

    const options = useMemo<PetOption[]>(() => (Array.isArray(data) ? data : [])
        .filter((pet: PetRecord) => pet.id != null)
        .map((pet: PetRecord) => ({ id: String(pet.id), name: pet.petNome || pet.name || 'Pet sem nome' }))
        .sort((first, second) => first.name.localeCompare(second.name)), [data]);

    // Registros antigos podem ter texto livre no petId; nesse caso, exibe o próprio valor.
    const getPetName = useCallback((petId?: string | number | null) => {
        if (petId == null || petId === '') return '-';
        return options.find((option) => option.id === String(petId))?.name ?? String(petId);
    }, [options]);

    return { options, isLoading, getPetName };
}
