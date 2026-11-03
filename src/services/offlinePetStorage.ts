import { createOfflineStorage, type OfflineRecord } from './offlineStorage';

export type OfflinePet = OfflineRecord;

export const offlinePetStorage = createOfflineStorage<OfflinePet>('@clyvocare:offline-pets');

export const getOfflinePets = offlinePetStorage.getAll;
export const saveOfflinePet = offlinePetStorage.save;
export const updateOfflinePet = offlinePetStorage.save;
export const deleteOfflinePet = offlinePetStorage.remove;
export const replaceOfflinePets = offlinePetStorage.replaceAll;
export const clearOfflinePets = offlinePetStorage.clear;
