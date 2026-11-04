import { useListFilter } from './useListFilter';

type FilterableAppointment = {
    petName?: string;
    status?: string;
    title?: string;
    type?: string;
};

const appointmentText = (item: FilterableAppointment) => `${item.title || ''} ${item.type || ''} ${item.petName || ''}`;
// Consulta atrasada também está pendente: só a concluída sai do filtro.
const isPending = (item: FilterableAppointment) => item.status !== 'Concluída';

export function useFilteredAppointments(appointments: FilterableAppointment[] | undefined) {
    return useListFilter(appointments, { searchText: appointmentText, matchesFilter: isPending });
}
