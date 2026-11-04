import type { AxiosResponse } from 'axios';
import type { createCrudService } from '../api/crudService';
import { getHttpStatus, isNetworkFailure } from '../api/errors';
import { showToast } from '../utils/toast';
import type { OfflineRecord, OfflineStorage } from './offlineStorage';

export type SyncState = Pick<OfflineRecord, 'pendingSync' | 'isLocalOnly'>;

type ApiRecord = Record<string, unknown>;

type OfflineCrudOptions<TPayload, TRecord extends OfflineRecord> = {
    crud: ReturnType<typeof createCrudService<TPayload>>;
    storage: OfflineStorage<TRecord>;
    /** Converte um registro da API ou do formulário para o formato salvo no dispositivo. */
    toRecord: (data: ApiRecord, id: string, syncState: SyncState) => TRecord;
    localIdPrefix: string;
    offlineMessage: string;
    logTag: string;
};

const SYNCED: SyncState = { pendingSync: false, isLocalOnly: false };

const asResponse = <T,>(data: T): AxiosResponse<T> => ({ data } as AxiosResponse<T>);

const isPending = (record: OfflineRecord) => record.pendingSync || record.isLocalOnly;

// Os metadados do cache local não fazem parte do recurso da API.
const toApiPayload = ({ id: _id, pendingSync: _pendingSync, isLocalOnly: _isLocalOnly, ...payload }: OfflineRecord) => payload;

/**
 * CRUD com fallback offline: a API é a fonte da verdade e o dispositivo guarda uma cópia
 * dos registros, além das alterações feitas sem conexão até que possam ser sincronizadas.
 */
export function createOfflineCrudService<TPayload, TRecord extends OfflineRecord>({
    crud,
    storage,
    toRecord,
    localIdPrefix,
    offlineMessage,
    logTag,
}: OfflineCrudOptions<TPayload, TRecord>) {
    const findLocal = async (id: string) => (await storage.getAll()).find((record) => record.id === id);

    const refresh = (record: TRecord) => toRecord(record, record.id, {
        pendingSync: record.pendingSync,
        isLocalOnly: record.isLocalOnly,
    });

    const saveLocalChange = async (data: ApiRecord, id: string, isLocalOnly: boolean) => {
        const now = new Date().toISOString();
        const record = toRecord({ createdAt: now, ...data, updatedAt: now }, id, { pendingSync: true, isLocalOnly });
        await storage.save(record);
        return record;
    };

    const sync = async (): Promise<TRecord[]> => {
        const pending = (await storage.getAll()).filter(isPending);
        const synced: TRecord[] = [];

        for (const record of pending) {
            try {
                const payload = toApiPayload(record);
                const result = record.isLocalOnly
                    ? await crud.create(payload as TPayload)
                    : await crud.update(record.id, payload as Partial<TPayload>);
                const saved = toRecord(result.data, String(result.data?.id ?? record.id), SYNCED);
                if (saved.id !== record.id) await storage.remove(record.id);
                await storage.save(saved);
                synced.push(saved);
            } catch (error) {
                if (getHttpStatus(error) === 404) {
                    // O registro não existe mais na API: descarta a alteração pendente.
                    await storage.remove(record.id);
                } else if (!isNetworkFailure(error)) {
                    console.error(`${logTag} Falha ao sincronizar registro salvo offline:`, error);
                }
            }
        }

        return synced;
    };

    const list = async () => {
        try {
            await sync();
            const result = await crud.getAll();
            const remote = (Array.isArray(result.data) ? result.data as ApiRecord[] : [])
                .filter((item) => item?.id != null)
                .map((item) => toRecord(item, String(item.id), SYNCED));
            const pending = (await storage.getAll()).filter(isPending).map(refresh);
            const pendingById = new Map(pending.map((record) => [record.id, record]));
            const remoteIds = new Set(remote.map((record) => record.id));
            // Do dispositivo entram só as alterações ainda não sincronizadas; o resto vem da API.
            const records = [
                ...remote.map((record) => pendingById.get(record.id) ?? record),
                ...pending.filter((record) => !remoteIds.has(record.id)),
            ];
            await storage.replaceAll(records);
            return asResponse(records);
        } catch (error) {
            if (!isNetworkFailure(error)) throw error;
            return asResponse((await storage.getAll()).map(refresh));
        }
    };

    const detail = async (id: string) => {
        const local = await findLocal(id);
        if (local && isPending(local)) return asResponse(refresh(local));

        try {
            return await crud.getById(id);
        } catch (error) {
            if (!isNetworkFailure(error)) throw error;
            return asResponse(local ? refresh(local) : null);
        }
    };

    const create = async (payload: TPayload) => {
        try {
            const result = await crud.create(payload);
            if (result.data?.id != null) {
                await storage.save(toRecord(result.data, String(result.data.id), SYNCED));
            }
            return result;
        } catch (error) {
            if (!isNetworkFailure(error)) throw error;
            const record = await saveLocalChange(payload as ApiRecord, `${localIdPrefix}-${Date.now()}`, true);
            showToast(offlineMessage, 'info');
            return asResponse(record);
        }
    };

    const update = async (id: string, payload: Partial<TPayload>) => {
        const local = await findLocal(id);
        if (local?.isLocalOnly) {
            // Ainda não existe na API: o rascunho local será criado na próxima sincronização.
            return asResponse(await saveLocalChange({ ...local, ...payload }, id, true));
        }

        try {
            // Envia junto alterações offline anteriores que ainda não chegaram à API.
            const body = local?.pendingSync ? { ...toApiPayload(local), ...payload } : payload;
            const result = await crud.update(id, body as Partial<TPayload>);
            await storage.save(toRecord({ ...local, ...result.data }, id, SYNCED));
            return result;
        } catch (error) {
            if (!isNetworkFailure(error)) throw error;
            const record = await saveLocalChange({ ...local, ...payload }, id, false);
            showToast(offlineMessage, 'info');
            return asResponse(record);
        }
    };

    const remove = async (id: string) => {
        const local = await findLocal(id);

        try {
            // Registro criado offline nunca chegou à API: basta removê-lo do dispositivo.
            if (!local?.isLocalOnly) await crud.delete(id);
        } catch (error) {
            // 404: já não existe na API (ex.: reinício do servidor). Sem conexão, a exclusão falha.
            if (getHttpStatus(error) !== 404) throw error;
        }

        await storage.remove(id);
        return asResponse({ id });
    };

    return { list, detail, create, update, remove };
}
