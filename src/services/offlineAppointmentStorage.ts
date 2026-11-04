import { createOfflineStorage, type OfflineRecord } from './offlineStorage';

export type OfflineAppointment = OfflineRecord;

export const offlineAppointmentStorage = createOfflineStorage<OfflineAppointment>('@clyvocare:offline-appointments');

export const clearOfflineAppointments = offlineAppointmentStorage.clear;
