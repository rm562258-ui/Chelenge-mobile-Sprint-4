import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';
import { lightColors } from '../theme/colors';
import { showToast } from '../utils/toast';
import notificationService, { type NotificationPayload } from './notificationService';

export const CHANNEL_ID = 'lembretes-cuidados';

const NOTIFICATION_MAP_KEY = '@clyvocare:notification-map';
const PERMISSION_DENIED_KEY = '@clyvocare:notification-permission-denied';
let permissionDenialToastShown = false;

export type AppNotificationData = {
    type: 'appointment' | 'vaccine';
    id: string;
};

type AppNotificationContent = {
    title: string;
    body: string;
    data: AppNotificationData;
};

type NotificationMap = Record<string, string[]>;
let configurationPromise: Promise<unknown> | null = null;

const readNotificationMap = async (): Promise<NotificationMap> => {
    const stored = await AsyncStorage.getItem(NOTIFICATION_MAP_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('O mapa de notificações salvo está inválido.');
    }

    return parsed as NotificationMap;
};

const writeNotificationMap = async (map: NotificationMap) => {
    await AsyncStorage.setItem(NOTIFICATION_MAP_KEY, JSON.stringify(map));
};

const recordNotificationHistory = async (
    content: AppNotificationContent,
    scheduledFor: Date,
) => {
    const createdAt = new Date().toISOString();
    const payload: NotificationPayload = {
        title: content.title,
        message: content.body,
        type: content.data.type,
        refId: content.data.id,
        scheduledFor: scheduledFor.toISOString(),
        createdAt,
        read: false,
    };

    try {
        await notificationService.create(payload);
    } catch (error) {
        console.warn('[NOTIFICATIONS] Não foi possível registrar o histórico da notificação.', error);
    }
};

// Lembrete cancelado não pode continuar no histórico como "Agendada".
const removeUpcomingHistory = async (match?: { type: string; refId: string }) => {
    try {
        const { data } = await notificationService.getAll();
        const now = Date.now();
        const upcoming = (Array.isArray(data) ? data : []).filter((record) =>
            new Date(record.scheduledFor).getTime() > now
            && (!match || (record.type === match.type && String(record.refId) === match.refId)));
        for (const record of upcoming) {
            await notificationService.delete(String(record.id));
        }
    } catch (error) {
        console.warn('[NOTIFICATIONS] Não foi possível atualizar o histórico de lembretes.', error);
    }
};

export function configureNotifications() {
    if (configurationPromise) return configurationPromise;

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (Platform.OS === 'android') {
        configurationPromise = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: 'Lembretes de cuidado',
            importance: AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: lightColors.primary,
        });
        return configurationPromise;
    }

    configurationPromise = Promise.resolve(null);
    return configurationPromise;
}

export async function ensurePermission(): Promise<boolean> {
    let permission = await Notifications.getPermissionsAsync();
    const isAllowed = () => permission.granted
        || permission.ios?.status === IosAuthorizationStatus.PROVISIONAL;

    if (isAllowed()) {
        await AsyncStorage.removeItem(PERMISSION_DENIED_KEY);
        permissionDenialToastShown = false;
        return true;
    }

    const previouslyDenied = (await AsyncStorage.getItem(PERMISSION_DENIED_KEY)) === 'true';
    if (permission.canAskAgain && !previouslyDenied) {
        permission = await Notifications.requestPermissionsAsync({
            ios: { allowAlert: true, allowSound: true, allowBadge: false },
        });
        if (isAllowed()) {
            await AsyncStorage.removeItem(PERMISSION_DENIED_KEY);
            permissionDenialToastShown = false;
            return true;
        }
        await AsyncStorage.setItem(PERMISSION_DENIED_KEY, 'true');
    } else {
        await AsyncStorage.setItem(PERMISSION_DENIED_KEY, 'true');
    }

    if (!permissionDenialToastShown) {
        showToast('Ative as notificações do ClyvoCare Pet nas configurações do sistema para receber lembretes.', 'info');
        permissionDenialToastShown = true;
    }
    return false;
}

export async function sendNow(content: AppNotificationContent): Promise<string | null> {
    if (!(await ensurePermission())) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: content.title,
            body: content.body,
            data: content.data,
            sound: 'default',
        },
        trigger: { channelId: CHANNEL_ID },
    });
    await recordNotificationHistory(content, new Date());
    return notificationId;
}

export async function scheduleAt({
    key,
    date,
    title,
    body,
    data,
}: {
    key: string;
    date: Date;
    title: string;
    body: string;
    data: AppNotificationData;
}): Promise<string | null> {
    if (!(date instanceof Date) || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        return null;
    }
    if (!(await ensurePermission())) return null;

    await cancelByKey(key);
    const notificationId = await Notifications.scheduleNotificationAsync({
        content: { title, body, data, sound: 'default' },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
            channelId: CHANNEL_ID,
        },
    });

    try {
        const map = await readNotificationMap();
        map[key] = [...(map[key] ?? []), notificationId];
        await writeNotificationMap(map);
    } catch (error) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        throw error;
    }
    await recordNotificationHistory({ title, body, data }, date);
    return notificationId;
}

export async function cancelByKey(key: string): Promise<void> {
    const map = await readNotificationMap();
    const notificationIds = map[key] ?? [];
    await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    if (!(key in map)) return;
    delete map[key];
    await writeNotificationMap(map);

    // A chave segue o formato "<tipo>:<id>" (ex.: "appointment:123").
    const separator = key.indexOf(':');
    await removeUpcomingHistory({ type: key.slice(0, separator), refId: key.slice(separator + 1) });
}

export async function cancelAll(): Promise<void> {
    await Promise.all([
        Notifications.cancelAllScheduledNotificationsAsync(),
        Notifications.dismissAllNotificationsAsync(),
    ]);
    await AsyncStorage.removeItem(NOTIFICATION_MAP_KEY);
    await removeUpcomingHistory();
}
