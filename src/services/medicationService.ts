import { createCrudService } from '../api/crudService';
import { API_ENDPOINTS } from '../api/endpoints';
import { userScope } from './userScope';

export type MedicationPayload = {
    name: string;
    petId: string;
    frequency?: string;
    dosage?: string;
    quantity?: number | string;
    time?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
};

const crud = createCrudService<MedicationPayload>(API_ENDPOINTS.medications, { getScope: userScope });
export const medicationService = { ...crud, list: crud.getAll, detail: crud.getById };

export default medicationService;
