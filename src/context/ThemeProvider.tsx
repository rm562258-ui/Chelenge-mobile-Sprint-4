import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { darkColors, lightColors, type AppColors } from '../theme/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
    mode: ThemeMode;
    scheme: 'light' | 'dark';
    isDark: boolean;
    colors: AppColors;
    setMode: (mode: ThemeMode) => Promise<void>;
    toggleTheme: () => void;
};

const STORAGE_KEY = '@clyvocare:theme-mode';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: string | null): value is ThemeMode {
    return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadMode = async () => {
            try {
                const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
                if (isMounted && isThemeMode(storedMode)) {
                    setModeState(storedMode);
                    Appearance.setColorScheme(storedMode === 'system' ? null : storedMode);
                }
            } catch (error) {
                console.error('Não foi possível carregar a preferência de tema.', error);
            } finally {
                if (isMounted) setIsReady(true);
            }
        };

        void loadMode();
        return () => {
            isMounted = false;
        };
    }, []);

    const setMode = useCallback(async (nextMode: ThemeMode) => {
        const previousMode = mode;
        setModeState(nextMode);
        Appearance.setColorScheme(nextMode === 'system' ? null : nextMode);

        try {
            await AsyncStorage.setItem(STORAGE_KEY, nextMode);
        } catch (error) {
            setModeState(previousMode);
            Appearance.setColorScheme(previousMode === 'system' ? null : previousMode);
            throw error;
        }
    }, [mode]);

    const scheme = mode === 'system' ? systemScheme ?? 'light' : mode;
    const isDark = scheme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    const toggleTheme = useCallback(() => {
        void setMode(isDark ? 'light' : 'dark').catch((error: unknown) => {
            console.error('Não foi possível salvar a preferência de tema.', error);
        });
    }, [isDark, setMode]);

    const value = useMemo(
        () => ({ mode, scheme, isDark, colors, setMode, toggleTheme }),
        [mode, scheme, isDark, colors, setMode, toggleTheme],
    );

    if (!isReady) return null;

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
    return context;
}

export const useTheme = useAppTheme;
