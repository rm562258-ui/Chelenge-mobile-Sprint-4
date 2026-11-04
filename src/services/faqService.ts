import api from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

// Conteúdo igual para todos os tutores: por isso não é filtrado por usuário.
export const faqService = {
    list: () => api.get<FaqItem[]>(API_ENDPOINTS.faq.list).then((response) => response.data),
};
