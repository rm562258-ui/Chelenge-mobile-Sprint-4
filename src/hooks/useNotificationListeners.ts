import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { NotificationResponse } from 'expo-notifications';
import { flushPendingNotificationNavigation, navigateFromNotification } from '../navigation/navigationRef';

export function useNotificationListeners(): void {
    const lastResponse = Notifications.useLastNotificationResponse();
    const handledResponseId = useRef<string | null>(null);

    const handleResponse = useCallback((response: NotificationResponse) => {
        const requestId = response.notification.request.identifier;
        if (handledResponseId.current === requestId) return;
        handledResponseId.current = requestId;
        navigateFromNotification(response.notification.request.content.data);
        void Notifications.clearLastNotificationResponseAsync().catch((error) => {
            console.warn('[NOTIFICATIONS] Não foi possível limpar a última resposta de notificação.', error);
        });
    }, []);

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
        flushPendingNotificationNavigation();
        return () => subscription.remove();
    }, [handleResponse]);

    useEffect(() => {
        if (lastResponse) handleResponse(lastResponse);
    }, [lastResponse, handleResponse]);
}
