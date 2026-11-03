import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppNotificationData } from '../services/localNotificationService';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Home: undefined;
    Configuracoes: undefined;
    HistoricoNotificacoes: undefined;
    IaVeterinaria: undefined;
    Pets: undefined;
    PetDetails: { id: string };
    CadastroPet: { id?: string } | undefined;
    PerfilPet: undefined;
    AgendaCuidados: undefined;
    AppointmentForm: { id?: string } | undefined;
    AppointmentDetails: { id: string };
    Vaccines: undefined;
    VaccineForm: { id?: string } | undefined;
    VaccineDetails: { id: string };
    Medications: undefined;
    MedicationForm: { id?: string } | undefined;
    MedicationDetails: { id: string };
    Alertas: undefined;
    Equipe: undefined;
    Sobre: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingNotification: AppNotificationData | null = null;

const isAppNotificationData = (value: unknown): value is AppNotificationData => {
    if (!value || typeof value !== 'object') return false;
    const data = value as Record<string, unknown>;
    return (data.type === 'appointment' || data.type === 'vaccine')
        && (typeof data.id === 'string' || typeof data.id === 'number');
};

const navigate = (data: AppNotificationData) => {
    const id = String(data.id);
    if (data.type === 'appointment') {
        navigationRef.navigate('AppointmentDetails', { id });
    } else {
        navigationRef.navigate('VaccineDetails', { id });
    }
};

export function navigateFromNotification(data: unknown): void {
    if (!isAppNotificationData(data)) return;
    if (!navigationRef.isReady()) {
        pendingNotification = { ...data, id: String(data.id) };
        return;
    }
    navigate(data);
}

export function flushPendingNotificationNavigation(): void {
    if (!navigationRef.isReady() || !pendingNotification) return;
    const notification = pendingNotification;
    pendingNotification = null;
    navigate(notification);
}
