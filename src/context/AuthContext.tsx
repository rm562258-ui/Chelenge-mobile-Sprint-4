import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    onIdTokenChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type User,
} from 'firebase/auth';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { setAuthToken } from '../api/client';
import { auth, AUTH_SESSION_KEY, firebaseErrorMessage, firebaseHealthCheck } from '../services/firebase';
import { cancelAllReminders } from '../services/reminderService';
import { showToast } from '../utils/toast';

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    restoreSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const reportAuthError = (operation: string, error: unknown) => {
    const message = firebaseErrorMessage(error);

    console.error(`Falha na operação Firebase: ${operation}.`);
    showToast(message, 'error');
    Alert.alert('Erro de autenticação', message);

    return new Error(message);
};

const persistSession = async (firebaseUser: User | null) => {
    try {
        if (!firebaseUser) {
            await AsyncStorage.removeItem(AUTH_SESSION_KEY);
            await setAuthToken(null);
            return;
        }

        const session = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? '',
        };

        await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        await setAuthToken(await firebaseUser.getIdToken());
    } catch (error) {
        console.error('Falha ao persistir a sessão de autenticação.');
        throw error;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const restoreSession = async () => {
        try {
            const storedSession = await AsyncStorage.getItem(AUTH_SESSION_KEY);

            if (auth.currentUser) {
                setUser(auth.currentUser);
                await persistSession(auth.currentUser);
            } else if (storedSession) {
                console.log('[AUTH] Sessão armazenada aguardando restauração do Firebase.');
            }
        } catch {
            console.error('Falha ao restaurar a sessão de autenticação.');
            showToast('Não foi possível restaurar sua sessão.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (__DEV__) {
            void firebaseHealthCheck();
        }

        const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            try {
                setUser(firebaseUser);
                await persistSession(firebaseUser);
            } catch (error) {
                reportAuthError('session', error);
            } finally {
                setLoading(false);
            }
        });

        void restoreSession();
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);

        try {
            const result = await signInWithEmailAndPassword(auth, email.trim(), password);
            setUser(result.user);
            await persistSession(result.user);
            showToast('Login realizado com sucesso.', 'success');
        } catch (error) {
            throw reportAuthError('login', error);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        setLoading(true);

        try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(result.user, { displayName: name.trim() });
            setUser(result.user);
            await persistSession(result.user);
            showToast('Cadastro realizado com sucesso.', 'success');
        } catch (error) {
            throw reportAuthError('register', error);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email.trim());
            showToast('E-mail de recuperação enviado.', 'success');
        } catch (error) {
            throw reportAuthError('password reset', error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        try {
            try {
                await cancelAllReminders();
            } catch {
                showToast('Não foi possível cancelar todos os lembretes locais.', 'error');
            }
            await signOut(auth);
            setUser(null);
            await persistSession(null);
            showToast('Sessão encerrada.', 'info');
        } catch (error) {
            throw reportAuthError('logout', error);
        } finally {
            setLoading(false);
        }
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            isAuthenticated: !!user,
            signIn,
            signUp,
            login: signIn,
            register: signUp,
            resetPassword,
            logout,
            restoreSession,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
