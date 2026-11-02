import { useEffect, useMemo } from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';
import { useNotificationListeners } from '../hooks/useNotificationListeners';
import { warmUpApi } from '../api/warmUp';
import AgendaCuidadosScreen from '../screens/AgendaCuidadosScreen';
import AlertasScreen from '../screens/AlertasScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';
import AppointmentFormScreen from '../screens/AppointmentFormScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HistoricoNotificacoesScreen from '../screens/HistoricoNotificacoesScreen';
import HomeScreen from '../screens/HomeScreen';
import IaVeterinariaScreen from '../screens/IaVeterinariaScreen';
import LoginScreen from '../screens/LoginScreen';
import MedicationDetailsScreen from '../screens/MedicationDetailsScreen';
import MedicationFormScreen from '../screens/MedicationFormScreen';
import MedicationsListScreen from '../screens/MedicationsListScreen';
import PagDev from '../screens/PagDev';
import pagPerfil from '../screens/pagPerfil';
import PetDetailsScreen from '../screens/PetDetailsScreen';
import PetFormScreen from '../screens/PetFormScreen';
import PetsListScreen from '../screens/PetsListScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SobreScreen from '../screens/SobreScreen';
import VaccineDetailsScreen from '../screens/VaccineDetailsScreen';
import VaccineFormScreen from '../screens/VaccineFormScreen';
import VaccinesListScreen from '../screens/VaccinesListScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  useNotificationListeners();
  useEffect(() => {
    warmUpApi();
  }, []);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: styles.header,
        headerTitleAlign: 'center',
        headerTintColor: colors.headerTint,
        headerBackTitleVisible: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ClyvoCare Pet' }} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
      <Stack.Screen name="HistoricoNotificacoes" component={HistoricoNotificacoesScreen} options={{ title: 'Notificações' }} />
      <Stack.Screen name="IaVeterinaria" component={IaVeterinariaScreen} options={{ title: 'Perguntas frequentes' }} />
      <Stack.Screen name="Pets" component={PetsListScreen} options={{ title: 'Meus Pets' }} />
      <Stack.Screen name="PetDetails" component={PetDetailsScreen} options={{ title: 'Detalhes do Pet' }} />
      <Stack.Screen name="CadastroPet" component={PetFormScreen} options={{ title: 'Cadastro do Pet' }} />
      <Stack.Screen name="PerfilPet" component={pagPerfil} options={{ title: 'Perfil do Pet' }} />
      <Stack.Screen name="AgendaCuidados" component={AgendaCuidadosScreen} options={{ title: 'Agenda de Cuidados' }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Agendar Consulta' }} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Detalhes da Consulta' }} />
      <Stack.Screen name="Vaccines" component={VaccinesListScreen} options={{ title: 'Carteira Vacinal' }} />
      <Stack.Screen name="VaccineForm" component={VaccineFormScreen} options={{ title: 'Registrar Vacina' }} />
      <Stack.Screen name="VaccineDetails" component={VaccineDetailsScreen} options={{ title: 'Detalhes da Vacina' }} />
      <Stack.Screen name="Medications" component={MedicationsListScreen} options={{ title: 'Medicamentos' }} />
      <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: 'Registrar Medicamento' }} />
      <Stack.Screen name="MedicationDetails" component={MedicationDetailsScreen} options={{ title: 'Detalhes do Medicamento' }} />
      <Stack.Screen name="Alertas" component={AlertasScreen} options={{ title: 'Alertas' }} />
      <Stack.Screen name="Equipe" component={PagDev} options={{ title: 'Integrantes' }} />
      <Stack.Screen name="Sobre" component={SobreScreen} options={{ title: 'Sobre o App' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={styles.loadingIndicator.color} />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}

const createStyles = (colors) => ({
  header: { backgroundColor: colors.headerBackground, shadowColor: 'transparent', elevation: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingIndicator: { color: colors.primary },
});
