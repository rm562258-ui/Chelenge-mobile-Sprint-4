import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryProvider } from './src/providers/QueryProvider';
import { ToastProvider } from './src/context/ToastProvider';
import OfflineBanner from './src/components/ui/OfflineBanner';

function AppContent() {
  const { colors, isDark } = useAppTheme();
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
              <NavigationContainer theme={navigationTheme}>
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
