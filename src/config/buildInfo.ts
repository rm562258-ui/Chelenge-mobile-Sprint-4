import Constants from 'expo-constants';
import { env } from './env';

type BuildExtra = {
    commitHash?: string;
    builtAt?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as BuildExtra;
const commitHash = extra.commitHash || 'desconhecido';

const getApiHost = (apiUrl: string): string => {
    try {
        return new URL(apiUrl).host || 'Indisponível';
    } catch {
        return 'Indisponível';
    }
};

export const buildInfo = {
    commitHash,
    commitShort: commitHash === 'desconhecido' ? commitHash : commitHash.slice(0, 7),
    builtAt: extra.builtAt || 'Indisponível',
    version: Constants.expoConfig?.version ?? 'Indisponível',
    appName: Constants.expoConfig?.name ?? 'ClyvoCare Pet',
    apiHost: getApiHost(env.apiUrl),
};

export default buildInfo;
