import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentService, type AppointmentPayload } from '../services/appointmentService';
import {
    cancelAppointmentReminders,
    confirmAppointmentCreated,
    scheduleAppointmentReminders,
} from '../services/reminderService';
import { useRemindersEnabled } from './useRemindersEnabled';
import { showToast } from '../utils/toast';

const APPOINTMENTS_QUERY_KEY = ['appointments'];

// O fallback offline fica no serviço: sem conexão, a lista vem do cache do dispositivo.
export function useAppointments() {
    return useQuery<any[], Error>({
        queryKey: APPOINTMENTS_QUERY_KEY,
        queryFn: () => appointmentService.list().then((result) => result.data),
    });
}

export function useCreateAppointment() {
    const qc = useQueryClient();
    const remindersEnabled = useRemindersEnabled();
    return useMutation({
        mutationFn: (payload: AppointmentPayload) => appointmentService.create(payload).then((r) => r.data),
        onSuccess: async (created, payload) => {
            try {
                const appointment = { ...payload, ...created };
                await confirmAppointmentCreated(appointment, remindersEnabled);
                await scheduleAppointmentReminders(appointment, remindersEnabled);
            } catch {
                showToast('Consulta salva, mas não foi possível configurar todas as notificações.', 'error');
            } finally {
                await Promise.all([
                    qc.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                ]);
            }
        },
    });
}

export function useUpdateAppointment() {
    const qc = useQueryClient();
    const remindersEnabled = useRemindersEnabled();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<AppointmentPayload> }) => appointmentService.update(id, payload).then((r) => r.data),
        onSuccess: async (updated, variables) => {
            try {
                const current = qc.getQueryData<any[]>(APPOINTMENTS_QUERY_KEY)
                    ?.find((appointment) => String(appointment.id) === String(variables.id));
                const appointment = { ...current, ...updated, ...variables.payload, id: variables.id };
                if (appointment.status === 'Concluída') {
                    await cancelAppointmentReminders(variables.id);
                } else {
                    await scheduleAppointmentReminders(appointment, remindersEnabled);
                }
            } catch {
                showToast('Consulta atualizada, mas não foi possível atualizar o lembrete.', 'error');
            } finally {
                await Promise.all([
                    qc.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                ]);
            }
        },
    });
}

export function useDeleteAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => appointmentService.delete(id).then((r) => r.data),
        onSuccess: async (_deleted, id) => {
            try {
                await cancelAppointmentReminders(id);
            } catch {
                showToast('Consulta excluída, mas não foi possível cancelar seu lembrete.', 'error');
            } finally {
                await Promise.all([
                    qc.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
                    qc.invalidateQueries({ queryKey: ['notifications'] }),
                ]);
            }
        },
    });
}
