import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { AppRegistry, LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryProvider } from './src/providers/QueryProvider';
import { ToastProvider } from './src/context/ToastProvider';
import OfflineBanner from './src/components/ui/OfflineBanner';
import { configureNotifications } from './src/services/localNotificationService';
import { flushPendingNotificationNavigation, navigationRef } from './src/navigation/navigationRef';
import { showToast } from './src/utils/toast';

// Só no Expo Go (desenvolvimento) o expo-notifications avisa que push remoto não existe ali.
// O app usa apenas notificações locais, que funcionam no Expo Go; os avisos não indicam erro.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications)',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

function AppContent() {
  const { colors, isDark } = useAppTheme();
  useEffect(() => {
    void configureNotifications().catch((error) => {
      console.error('[NOTIFICATIONS] Não foi possível inicializar as notificações locais.', error);
      showToast('Não foi possível inicializar as notificações locais.', 'error');
    });
  }, []);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <UserProvider>
          <ToastProvider>
            <QueryProvider>
              <NavigationContainer
                ref={navigationRef}
                theme={navigationTheme}
                onReady={flushPendingNotificationNavigation}
              >
                <AppNavigator />
              </NavigationContainer>
              <OfflineBanner />
            </QueryProvider>
          </ToastProvider>
        </UserProvider>
      </AuthProvider>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

AppRegistry.registerComponent('main', () => App);
