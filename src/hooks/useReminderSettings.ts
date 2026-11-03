import { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserContext } from '../context/UserContext';
import { useAppointments } from './useAppointments';
import { useVaccines } from './useVaccines';
import { cancelAllReminders, rescheduleAll } from '../services/reminderService';
import { ensurePermission } from '../services/localNotificationService';
import { showToast } from '../utils/toast';

type ReminderSettingsContext = {
    user: Record<string, unknown> & { lembretesAtivos?: boolean };
    setUser: (user: Record<string, unknown>) => Promise<void>;
};

export function useReminderSettings() {
    const context = useContext(UserContext) as ReminderSettingsContext | null;
    const queryClient = useQueryClient();
    const appointmentsQuery = useAppointments();
    const vaccinesQuery = useVaccines();
    const enabled = context?.user?.lembretesAtivos !== false;

    const setRemindersEnabled = async (nextEnabled: boolean) => {
        if (!context?.user || !context.setUser) {
            showToast('Não foi possível atualizar a preferência de lembretes.', 'error');
            return false;
        }

        if (!nextEnabled) {
            await cancelAllReminders();
            await context.setUser({ ...context.user, lembretesAtivos: false });
            return true;
        }

        // Só ativa a preferência se o sistema permitir notificações.
        if (!(await ensurePermission())) return false;
        await context.setUser({ ...context.user, lembretesAtivos: true });

        const [appointmentsResult, vaccinesResult] = await Promise.all([
            appointmentsQuery.refetch(),
            vaccinesQuery.refetch(),
        ]);
        if (appointmentsResult.isError || vaccinesResult.isError) {
            showToast('Não foi possível carregar os dados para reagendar os lembretes.', 'error');
            return false;
        }

        await rescheduleAll(
            Array.isArray(appointmentsResult.data) ? appointmentsResult.data : [],
            Array.isArray(vaccinesResult.data) ? vaccinesResult.data : [],
            true,
        );
        await queryClient.invalidateQueries({ queryKey: ['notifications'] });
        return true;
    };

    return { enabled, setRemindersEnabled };
}
