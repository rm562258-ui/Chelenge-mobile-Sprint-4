import { useMutation, useQueryClient } from '@tanstack/react-query';
import { petService, type PetPayload } from '../services/petService';
import { cancelVaccineReminder } from '../services/reminderService';
import { showToast } from '../utils/toast';
import { useApiQuery } from './useApiQuery';

const PETS_QUERY_KEY = ['pets'];

// O fallback offline fica no serviço: sem conexão, a lista vem do cache do dispositivo.
export function usePets() {
    return useApiQuery<any[], Error>(PETS_QUERY_KEY, () => petService.list().then((r) => r.data));
}

export function usePet(id: string | undefined) {
    const queryKey = ['pets', id];

    return useApiQuery<any, Error>(queryKey, () => {
        if (!id) return Promise.resolve(null as any);
        return petService.detail(id).then((r) => r.data);
    }, { enabled: !!id });
}

export function useCreatePet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: PetPayload) => petService.create(payload).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
    });
}

export function useUpdatePet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<PetPayload> }) => petService.update(id, payload).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
    });
}

export function useDeletePet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => petService.delete(id).then((r) => r.data),
        onSuccess: async (_data, id) => {
            qc.setQueryData<any[]>(PETS_QUERY_KEY, (current = []) => current.filter((pet) => String(pet.id) !== String(id)));
            // A API exclui junto as vacinas do pet; os lembretes delas também precisam sair do aparelho.
            const petVaccines = (qc.getQueryData<any[]>(['vaccines']) ?? [])
                .filter((vaccine) => String(vaccine.petId) === String(id));
            try {
                for (const vaccine of petVaccines) await cancelVaccineReminder(vaccine.id);
            } catch {
                showToast('Pet excluído, mas não foi possível cancelar todos os lembretes de vacina.', 'error');
            }
            await Promise.all([
                qc.invalidateQueries({ queryKey: PETS_QUERY_KEY }),
                qc.invalidateQueries({ queryKey: ['vaccines'] }),
                qc.invalidateQueries({ queryKey: ['medications'] }),
                qc.invalidateQueries({ queryKey: ['notifications'] }),
            ]);
        },
    });
}
