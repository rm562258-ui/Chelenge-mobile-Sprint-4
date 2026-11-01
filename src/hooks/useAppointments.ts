import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { appointmentService, type AppointmentPayload } from '../services/appointmentService';
import { getOfflineAppointments } from '../services/offlineAppointmentStorage';
import {
    cancelAppointmentReminders,
    confirmAppointmentCreated,
    scheduleAppointmentReminders,
} from '../services/reminderService';
import { useRemindersEnabled } from './useRemindersEnabled';
import { showToast } from '../utils/toast';

const APPOINTMENTS_QUERY_KEY = ['appointments'];

export function useAppointments() {
    const queryKey = APPOINTMENTS_QUERY_KEY;
    const qc = useQueryClient();

    useEffect(() => {
        void getOfflineAppointments().then((localAppointments) => {
            if (localAppointments.length > 0) qc.setQueryData(APPOINTMENTS_QUERY_KEY, localAppointments);
        });
    }, [qc]);

    const list = useQuery<any[], Error>({
        queryKey,
        queryFn: async () => {
            const localAppointments = await getOfflineAppointments();
            if (localAppointments.length > 0) qc.setQueryData(queryKey, localAppointments);
            const result = await appointmentService.list();
            return result.data;
        },
    });

    return {
        ...list,
    };
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
