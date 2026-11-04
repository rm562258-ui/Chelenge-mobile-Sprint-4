import { createCrudService } from '../api/crudService';
import { API_ENDPOINTS } from '../api/endpoints';
import { userScope } from './userScope';
import { isPast, parseAppDate } from '../utils/date';
import type { AppointmentReminder } from '../constants/appointments';
import { createOfflineCrudService, type SyncState } from './offlineCrudService';
import { offlineAppointmentStorage, type OfflineAppointment } from './offlineAppointmentStorage';

export type AppointmentPayload = {
    petName: string;
    date: string;
    type: string;
    status: 'Agendada' | 'Concluída' | 'Atrasada';
    time: string;
    reminder: AppointmentReminder;
    notes?: string;
    veterinarian?: string;
    clinic?: string;
    specialty?: string;
};

const crud = createCrudService<AppointmentPayload>(API_ENDPOINTS.appointments, { getScope: userScope });

export const normalizeAppointment = <T extends Partial<AppointmentPayload>>(appointment: T) => {
    const date = parseAppDate(appointment.date);
    if (date) date.setHours(23, 59, 59, 999);
    const status = appointment.status === 'Concluída'
        ? 'Concluída'
        : date && isPast(date)
            ? 'Atrasada'
            : 'Agendada';

    return { ...appointment, status };
};

const toOfflineAppointment = (appointment: Record<string, unknown>, id: string, syncState: SyncState): OfflineAppointment => ({
    ...normalizeAppointment(appointment as Partial<AppointmentPayload>),
    id,
    ...syncState,
});

const offlineAppointments = createOfflineCrudService<AppointmentPayload, OfflineAppointment>({
    crud,
    storage: offlineAppointmentStorage,
    toRecord: toOfflineAppointment,
    localIdPrefix: 'local-appointment',
    offlineMessage: 'Sem conexão. A consulta foi salva no dispositivo e será sincronizada quando houver internet.',
    logTag: '[APPOINTMENTS]',
});

export const appointmentService = {
    ...crud,
    list: offlineAppointments.list,
    detail: offlineAppointments.detail,
    create: offlineAppointments.create,
    update: offlineAppointments.update,
    delete: offlineAppointments.remove,
};
export default appointmentService;
