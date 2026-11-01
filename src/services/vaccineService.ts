import { createCrudService } from '../api/crudService';
import { API_ENDPOINTS } from '../api/endpoints';

export type VaccinePayload = {
    name: string;
    petId: string;
    date: string;
    dose?: string;
    nextDoseDate?: string;
    boosterDate?: string;
    veterinarian?: string;
    notes?: string;
};

const crud = createCrudService<VaccinePayload>(API_ENDPOINTS.vaccines);
export const vaccineService = { ...crud, list: crud.getAll, detail: crud.getById };

export default vaccineService;
