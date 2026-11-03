type HttpLikeError = {
    code?: string;
    message?: string;
    response?: { status?: number };
};

export const getHttpStatus = (error: unknown): number | undefined =>
    (error as HttpLikeError | null | undefined)?.response?.status;

// Sem resposta da API (rede, timeout) ou erro do servidor: o app pode recorrer ao cache local.
export const isNetworkFailure = (error: unknown): boolean => {
    const message = String((error as HttpLikeError | null | undefined)?.message ?? '').toLowerCase();
    const code = String((error as HttpLikeError | null | undefined)?.code ?? '').toUpperCase();
    const status = getHttpStatus(error);
    return !status || code === 'ECONNABORTED' || message.includes('network error') || message.includes('timeout') || status >= 500;
};
