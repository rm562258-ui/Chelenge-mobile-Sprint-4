import { useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notificationService';
import { useApiQuery } from './useApiQuery';

type NotificationRecord = {
    createdAt?: string;
};

const queryKey = ['notifications'];

const createdTime = (record: NotificationRecord) => new Date(record.createdAt || 0).getTime();

const sortNewestFirst = (records: NotificationRecord[]) => (
    Array.isArray(records) ? [...records].sort((first, second) => createdTime(second) - createdTime(first)) : records
);

export function useNotifications() {
    return useApiQuery(
        queryKey,
        () => notificationService.getAll().then((response) => response.data),
        { select: sortNewestFirst },
    );
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });
}
