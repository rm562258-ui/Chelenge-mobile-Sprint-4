import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useAppTheme } from './ThemeProvider';
import { subscribeToast } from '../utils/toast';

type ToastType = 'success' | 'error' | 'info';

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>('info');
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!message) {
      return;
    }

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setMessage(null));
  }, [message, opacity]);

  useEffect(() => {
    const unsubscribe = subscribeToast((nextMessage, nextType) => {
      setType(nextType);
      setMessage(nextMessage);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showToast = (nextMessage: string, nextType: ToastType = 'info') => {
    setType(nextType);
    setMessage(nextMessage);
  };

  const value = useMemo(
    () => ({
      showToast,
    }),
    [],
  );

  const toastColors = {
    success: colors.success,
    error: colors.danger,
    info: colors.info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 90,
            opacity,
            backgroundColor: toastColors[type],
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 16,
            shadowColor: colors.text,
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const createStyles = (colors: import('../theme/colors').AppColors) => StyleSheet.create({
  message: { color: colors.primaryText, fontWeight: '700', textAlign: 'center' },
});

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
