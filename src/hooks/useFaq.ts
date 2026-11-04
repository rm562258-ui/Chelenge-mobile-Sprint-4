import { faqService } from '../services/faqService';
import { useApiQuery } from './useApiQuery';

export function useFaq() {
    return useApiQuery(['faq'], faqService.list);
}
