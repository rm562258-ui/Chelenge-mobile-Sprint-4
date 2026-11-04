import { createOfflineStorage, type OfflineRecord } from './offlineStorage';

export type OfflinePet = OfflineRecord;

export const offlinePetStorage = createOfflineStorage<OfflinePet>('@clyvocare:offline-pets');

export const clearOfflinePets = offlinePetStorage.clear;
