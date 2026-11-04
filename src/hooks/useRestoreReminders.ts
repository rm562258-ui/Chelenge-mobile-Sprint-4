import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { restoreMissingReminders } from '../services/reminderService';
import { useAppointments } from './useAppointments';
import { useRemindersEnabled } from './useRemindersEnabled';
import { useVaccines } from './useVaccines';

/** Usado na área autenticada: confere os lembretes do aparelho uma vez a cada entrada no app. */
export function useRestoreReminders(): void {
    const queryClient = useQueryClient();
    const remindersEnabled = useRemindersEnabled();
    const { data: appointments, isSuccess: appointmentsLoaded } = useAppointments();
    const { data: vaccines, isSuccess: vaccinesLoaded } = useVaccines();
    const checked = useRef(false);

    useEffect(() => {
        if (checked.current || !appointmentsLoaded || !vaccinesLoaded) return;
        // Marca antes de checar a preferência: ligar os lembretes depois é tarefa de rescheduleAll.
        checked.current = true;
        if (!remindersEnabled) return;

        restoreMissingReminders(
            Array.isArray(appointments) ? appointments : [],
            Array.isArray(vaccines) ? vaccines : [],
        )
            .catch((error) => console.warn('[NOTIFICATIONS] Não foi possível restaurar os lembretes.', error))
            .finally(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }));
    }, [appointments, appointmentsLoaded, queryClient, remindersEnabled, vaccines, vaccinesLoaded]);
}
