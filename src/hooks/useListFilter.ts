import { useMemo, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

type ListFilterRules<T> = {
    /** Texto do item em que a busca procura. */
    searchText: (item: T) => string;
    /** Regra do botão de filtro da lista (ex.: só os ativos). */
    matchesFilter?: (item: T) => boolean;
    compare?: (first: T, second: T) => number;
};

/** Busca com debounce e filtro opcional, compartilhados pelas listas do app. */
export function useListFilter<T>(data: T[] | undefined, { searchText, matchesFilter, compare }: ListFilterRules<T>) {
    const [query, setQuery] = useState('');
    const [filterActive, setFilterActive] = useState(false);
    const debouncedQuery = useDebouncedValue(query);

    const items = useMemo(() => {
        const normalizedQuery = debouncedQuery.toLowerCase();
        const filtered = (Array.isArray(data) ? data : []).filter((item) => (
            searchText(item).toLowerCase().includes(normalizedQuery)
            && (!filterActive || !matchesFilter || matchesFilter(item))
        ));
        return compare ? filtered.sort(compare) : filtered;
    }, [data, debouncedQuery, filterActive, searchText, matchesFilter, compare]);

    const toggleFilter = () => setFilterActive((current) => !current);

    return { items, query, setQuery, filterActive, toggleFilter };
}
