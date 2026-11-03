import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccineService, type VaccinePayload } from '../services/vaccineService';
import { useApiQuery } from './useApiQuery';
import {
    cancelVaccineReminder,
    confirmVaccineCreated,
    scheduleVaccineReminder,
} from '../services/reminderService';
import { useRemindersEnabled } from './useRemindersEnabled';
import { showToast } from '../utils/toast';

export function useVaccines() {
    const queryKey = ['vaccines'];

    const list = useApiQuery<any, Error>(queryKey, () => vaccineService.list().then((r) => r.data));

    return {
        ...list,
    };
}

export function useCreateVaccine() {
    const qc = useQueryClient();
    const remindersEnabled = useRemindersEnabled();
    return useMutation({
        mutationFn: (payload: VaccinePayload) => vaccineService.create(payload).then((r) => r.data),
        onSuccess: async (created, payload) => {
            try {
                const vaccine = { ...payload, ...created };
                await confirmVaccineCreated(vaccine, remindersEnabled);
                await scheduleVaccineReminder(vaccine, remindersEnabled);
            } catch {
                showToast('Vacina salva, mas não foi possível configurar todas as notificações.', 'error');
            } finally {
                await Promise.all([
                    qc.invalidateQueries({ queryKey: ['vaccines'] }),
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                ]);
            }
        },
    });
}

export function useUpdateVaccine() {
    const qc = useQueryClient();
    const remindersEnabled = useRemindersEnabled();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<VaccinePayload> }) => vaccineService.update(id, payload).then((r) => r.data),
        onSuccess: async (updated, variables) => {
            try {
                const current = qc.getQueryData<any[]>(['vaccines'])
                    ?.find((vaccine) => String(vaccine.id) === String(variables.id));
                const vaccine = { ...current, ...updated, ...variables.payload, id: variables.id };
                await scheduleVaccineReminder(vaccine, remindersEnabled);
            } catch {
                showToast('Vacina atualizada, mas não foi possível atualizar o lembrete.', 'error');
            } finally {
                await Promise.all([
                    qc.invalidateQueries({ queryKey: ['vaccines'] }),
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                ]);
            }
        },
    });
}

export function useDeleteVaccine() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => vaccineService.delete(id).then((r) => r.data),
        onSuccess: async (_deleted, id) => {
            try {
                await cancelVaccineReminder(id);
            } catch {
                showToast('Vacina excluída, mas não foi possível cancelar seu lembrete.', 'error');
            } finally {
                await Promise.all([
                    qc.invalidateQueries({ queryKey: ['vaccines'] }),
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                ]);
            }
        },
    });
}
