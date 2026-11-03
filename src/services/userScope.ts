import { auth } from './firebase';

/**
 * Cada registro da API pertence ao tutor autenticado: o uid do Firebase filtra as listagens
 * e é gravado nos registros criados, para que uma conta não veja os dados de outra.
 */
export const userScope = (): Record<string, string> => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado.');
    return { userId };
};
