import { createCrudService } from '../api/crudService';
import { API_ENDPOINTS } from '../api/endpoints';
import { userScope } from './userScope';
import { createOfflineCrudService, type SyncState } from './offlineCrudService';
import { offlinePetStorage, type OfflinePet } from './offlinePetStorage';

export type PetPayload = {
    id?: string;
    petNome?: string;
    especie?: string;
    raca?: string;
    idade?: number | string;
    peso?: number | string;
    name: string;
    type?: string;
    breed?: string;
    age?: number | string;
    weight?: number | string;
    ownerName?: string;
    contact?: string;
    createdAt?: string;
    updatedAt?: string;
    pendingSync?: boolean;
    isLocalOnly?: boolean;
};

// Excluir um pet também exclui as vacinas e os medicamentos dele (relação petId no JSON Server).
const crud = createCrudService<PetPayload>(API_ENDPOINTS.pets, {
    getScope: userScope,
    deleteParams: { _dependent: ['vaccines', 'medications'] },
});

// As telas usam os campos em português; o seed da API também traz os equivalentes em inglês.
const toOfflinePet = (pet: Record<string, unknown>, id: string, syncState: SyncState): OfflinePet => {
    const data = pet as Partial<PetPayload>;
    return {
        ...pet,
        id,
        name: data.name ?? data.petNome ?? '',
        petNome: data.petNome ?? data.name ?? '',
        type: data.type ?? data.especie ?? '',
        especie: data.especie ?? data.type ?? '',
        breed: data.breed ?? data.raca ?? '',
        raca: data.raca ?? data.breed ?? '',
        ...syncState,
    };
};

const offlinePets = createOfflineCrudService<PetPayload, OfflinePet>({
    crud,
    storage: offlinePetStorage,
    toRecord: toOfflinePet,
    localIdPrefix: 'local-pet',
    offlineMessage: 'Sem conexão. O pet foi salvo no dispositivo e será sincronizado quando houver internet.',
    logTag: '[PETS]',
});

export const syncOfflinePets = offlinePets.sync;

export const petService = {
    ...crud,
    list: offlinePets.list,
    detail: offlinePets.detail,
    create: offlinePets.create,
    update: offlinePets.update,
    delete: offlinePets.remove,
};

export default petService;
