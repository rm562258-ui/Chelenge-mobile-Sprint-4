import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/** Usado na área autenticada: ao sair da conta, descarta os dados em cache dessa conta. */
export function useClearCacheOnLogout(): void {
    const queryClient = useQueryClient();

    useEffect(() => () => queryClient.clear(), [queryClient]);
}
