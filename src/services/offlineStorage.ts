import AsyncStorage from '@react-native-async-storage/async-storage';

export type OfflineRecord = {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    pendingSync: boolean;
    isLocalOnly: boolean;
    [key: string]: unknown;
};

export type OfflineStorage<TRecord extends OfflineRecord> = {
    getAll: () => Promise<TRecord[]>;
    save: (record: TRecord) => Promise<TRecord>;
    remove: (id: string) => Promise<void>;
    replaceAll: (records: TRecord[]) => Promise<void>;
    clear: () => Promise<void>;
};

export function createOfflineStorage<TRecord extends OfflineRecord>(storageKey: string): OfflineStorage<TRecord> {
    const getAll = async (): Promise<TRecord[]> => {
        const stored = await AsyncStorage.getItem(storageKey);
        if (!stored) return [];

        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const replaceAll = async (records: TRecord[]) => {
        await AsyncStorage.setItem(storageKey, JSON.stringify(records));
    };

    const save = async (record: TRecord) => {
        const records = await getAll();
        const index = records.findIndex((item) => item.id === record.id);
        const nextRecords = [...records];

        if (index >= 0) nextRecords[index] = record;
        else nextRecords.push(record);

        await replaceAll(nextRecords);
        return record;
    };

    const remove = async (id: string) => {
        const records = await getAll();
        await replaceAll(records.filter((record) => record.id !== id));
    };

    const clear = async () => {
        await AsyncStorage.removeItem(storageKey);
    };

    return { getAll, save, remove, replaceAll, clear };
}
