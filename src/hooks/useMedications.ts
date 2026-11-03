import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService, type MedicationPayload } from '../services/medicationService';
import { useApiQuery } from './useApiQuery';

export function useMedications() {
    const queryKey = ['medications'];

    const list = useApiQuery<any, Error>(queryKey, () => medicationService.list().then((r) => r.data));

    return {
        ...list,
    };
}

export function useCreateMedication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: MedicationPayload) => medicationService.create(payload).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
    });
}

export function useUpdateMedication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<MedicationPayload> }) => medicationService.update(id, payload).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
    });
}

export function useDeleteMedication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => medicationService.delete(id).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
    });
}
