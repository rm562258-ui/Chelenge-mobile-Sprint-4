import { createOfflineStorage, type OfflineRecord } from './offlineStorage';

export type OfflineAppointment = OfflineRecord;

export const offlineAppointmentStorage = createOfflineStorage<OfflineAppointment>('@clyvocare:offline-appointments');

export const getOfflineAppointments = offlineAppointmentStorage.getAll;
export const saveOfflineAppointment = offlineAppointmentStorage.save;
export const updateOfflineAppointment = offlineAppointmentStorage.save;
export const deleteOfflineAppointment = offlineAppointmentStorage.remove;
export const replaceOfflineAppointments = offlineAppointmentStorage.replaceAll;
export const clearOfflineAppointments = offlineAppointmentStorage.clear;
