import { createCrudService } from '../api/crudService';
import { API_ENDPOINTS } from '../api/endpoints';
import { userScope } from './userScope';

export type NotificationPayload = {
    title: string;
    message: string;
    type: 'appointment' | 'vaccine';
    refId: string;
    scheduledFor: string;
    createdAt: string;
    read: boolean;
};

const notificationService = createCrudService<NotificationPayload>(API_ENDPOINTS.notifications, { getScope: userScope });

export default notificationService;