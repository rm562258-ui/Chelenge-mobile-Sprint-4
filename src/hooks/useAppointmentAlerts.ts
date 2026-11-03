import { useAppointments } from './useAppointments';
import { useNotifications } from './useNotifications';
import { formatDisplayDate, parseAppDate } from '../utils/date';

type AlertItem = {
    id?: string | number;
    title?: string;
    message?: string;
    createdAt?: string;
};

type AppointmentForAlert = {
    id?: string | number;
    date?: string;
    time?: string;
    petName?: string;
    status?: string;
};

export function useAppointmentAlerts() {
    const { data, isLoading, isError, isRefetching, refetch } = useNotifications();
    const {
        data: appointments = [],
        isLoading: isAppointmentsLoading,
        isRefetching: isAppointmentsRefetching,
        refetch: refetchAppointments,
    } = useAppointments();

    const notifications: AlertItem[] = Array.isArray(data) ? data : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromToday = new Date(today);
    weekFromToday.setDate(weekFromToday.getDate() + 7);

    const appointmentAlerts: AlertItem[] = (Array.isArray(appointments) ? appointments : [])
        .filter((appointment: AppointmentForAlert) => appointment.status !== 'Concluída')
        .map((appointment: AppointmentForAlert) => ({
            appointment,
            date: parseAppDate(appointment.date),
        }))
        .filter(({ date }) => date !== null && date >= today && date <= weekFromToday)
        .map(({ appointment }) => ({
            id: `appointment-alert-${appointment.id}`,
            title: 'Consulta programada',
            message: `${appointment.petName || 'Pet'} tem uma consulta marcada para ${formatDisplayDate(appointment.date)}${appointment.time ? ` às ${appointment.time}` : ''}.`,
        }));

    const refreshAlerts = async () => {
        await Promise.all([refetch(), refetchAppointments()]);
    };

    return {
        alertItems: [...notifications, ...appointmentAlerts],
        data,
        isError,
        loading: isLoading || isAppointmentsLoading,
        refreshing: isRefetching || isAppointmentsRefetching,
        refreshAlerts,
        refetch,
    };
}
