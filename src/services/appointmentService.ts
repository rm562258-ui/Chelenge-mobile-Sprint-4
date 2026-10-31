import type { AxiosResponse } from 'axios';
import api from '../api/client';
import { createCrudService } from '../api/crudService';
import { API_ENDPOINTS } from '../api/endpoints';
import { showToast } from '../utils/toast';
import { isPast, parseAppDate } from '../utils/date';
import type { AppointmentReminder } from '../constants/appointments';
import {
    deleteOfflineAppointment,
    getOfflineAppointments,
    saveOfflineAppointment,
    updateOfflineAppointment,
    type OfflineAppointment,
} from './offlineAppointmentStorage';

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

const crud = createCrudService<AppointmentPayload>(API_ENDPOINTS.appointments);
const now = () => new Date().toISOString();
const response = <T>(data: T): AxiosResponse<T> => ({ data } as AxiosResponse<T>);

const isNetworkFailure = (error: unknown) => {
    const message = String((error as { message?: string })?.message ?? '').toLowerCase();
    const code = String((error as { code?: string })?.code ?? '').toUpperCase();
    const status = (error as { response?: { status?: number } })?.response?.status;
    return !status || code === 'ECONNABORTED' || message.includes('network error') || message.includes('timeout') || status >= 500;
};

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

const toOfflineAppointment = (appointment: Partial<AppointmentPayload>, id: string, localOnly: boolean): OfflineAppointment => ({
    ...normalizeAppointment(appointment),
    id,
    createdAt: (appointment as OfflineAppointment).createdAt ?? now(),
    updatedAt: now(),
    pendingSync: localOnly || (appointment as OfflineAppointment).pendingSync === true,
    isLocalOnly: localOnly || (appointment as OfflineAppointment).isLocalOnly === true,
});

const notifyOffline = () => showToast('Sem conexão. A consulta foi salva no dispositivo e será sincronizada quando houver internet.', 'info');

const list = async () => {
    try {
        await syncOfflineAppointments();
        const result = await crud.getAll();
        const localAppointments = await getOfflineAppointments();
        const remoteAppointments = Array.isArray(result.data) ? result.data.map(normalizeAppointment) : [];
        await Promise.all(remoteAppointments.filter((item) => item.id).map((item) => saveOfflineAppointment(toOfflineAppointment(item, String(item.id), false))));
        const merged = new Map<string, unknown>();
        remoteAppointments.forEach((item) => item.id && merged.set(String(item.id), item));
        localAppointments.forEach((item) => merged.set(item.id, normalizeAppointment(item as unknown as Partial<AppointmentPayload>)));
        return response([...merged.values()]);
    } catch (error) {
        if (!isNetworkFailure(error)) throw error;
        return response((await getOfflineAppointments()).map((item) => normalizeAppointment(item as unknown as Partial<AppointmentPayload>)));
    }
};

const create = async (payload: AppointmentPayload) => {
    try {
        const result = await crud.create(payload);
        const saved = toOfflineAppointment(result.data, String(result.data?.id ?? `appointment-${Date.now()}`), false);
        await saveOfflineAppointment({ ...saved, pendingSync: false, isLocalOnly: false });
        return response(result.data);
    } catch (error) {
        if (!isNetworkFailure(error)) throw error;
        const saved = toOfflineAppointment(payload, `local-appointment-${Date.now()}`, true);
        await saveOfflineAppointment(saved);
        notifyOffline();
        return response(saved);
    }
};

const update = async (id: string, payload: Partial<AppointmentPayload>) => {
    try {
        const result = await crud.update(id, payload);
        const saved = toOfflineAppointment({ ...(result.data as AppointmentPayload), ...payload }, id, false);
        await updateOfflineAppointment({ ...saved, pendingSync: false, isLocalOnly: false });
        return response(result.data);
    } catch (error) {
        if (!isNetworkFailure(error)) throw error;
        const current = (await getOfflineAppointments()).find((item) => item.id === id);
        const saved = toOfflineAppointment({ ...current, ...payload }, id, true);
        await updateOfflineAppointment(saved);
        notifyOffline();
        return response(saved);
    }
};

const remove = async (id: string) => {
    try {
        const result = await crud.delete(id);
        await deleteOfflineAppointment(id);
        return result;
    } catch (error) {
        if (!isNetworkFailure(error)) throw error;
        await deleteOfflineAppointment(id);
        notifyOffline();
        return response({ id });
    }
};

export const syncOfflineAppointments = async () => {
    const pending = (await getOfflineAppointments()).filter((appointment) => appointment.pendingSync);
    const synced: OfflineAppointment[] = [];

    for (const appointment of pending) {
        try {
            const result = appointment.isLocalOnly
                ? await api.post(API_ENDPOINTS.appointments.create, appointment)
                : await api.put(API_ENDPOINTS.appointments.update(appointment.id), appointment);
            const saved = toOfflineAppointment({ ...appointment, ...result.data }, String(result.data?.id ?? appointment.id), false);
            await saveOfflineAppointment({ ...saved, pendingSync: false, isLocalOnly: false });
            synced.push(saved);
        } catch (error) {
            if (!isNetworkFailure(error)) console.error('[APPOINTMENTS] Falha ao sincronizar consulta:', error);
        }
    }

    return synced;
};

export const appointmentService = { ...crud, list, create, update, delete: remove, detail: crud.getById };
export default appointmentService;
