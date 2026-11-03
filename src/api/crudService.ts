import api from './client';

export type ResourceEndpoints = {
    list: string;
    create: string;
    detail: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
};

type CrudOptions = {
    /** Campos que filtram a listagem e são gravados em todo registro criado (ex.: dono do dado). */
    getScope?: () => Record<string, string>;
    /** Parâmetros enviados na exclusão (ex.: `_dependent` para excluir registros relacionados). */
    deleteParams?: Record<string, string | string[]>;
};

export const createCrudService = <TPayload>(endpoints: ResourceEndpoints, options: CrudOptions = {}) => {
    const scope = () => options.getScope?.() ?? {};

    return {
        getAll: () => api.get(endpoints.list, { params: scope() }),
        getById: (id: string) => api.get(endpoints.detail(id)),
        create: (payload: TPayload) => api.post(endpoints.create, { ...payload, ...scope() }),
        // PATCH: o JSON Server substitui o registro inteiro no PUT e apagaria os campos não enviados.
        update: (id: string, payload: Partial<TPayload>) => api.patch(endpoints.update(id), payload),
        delete: (id: string) => api.delete(endpoints.delete(id), {
            params: options.deleteParams,
            // `_dependent=a&_dependent=b`, formato esperado pelo JSON Server.
            paramsSerializer: { indexes: null },
        }),
    };
};
