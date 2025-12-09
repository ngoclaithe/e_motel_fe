import { api } from "../api";

export interface Notification {
    id: string;
    title: string;
    message: string;
    toRole?: string;
    toUserId?: string;
    createdById?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
}

export interface CreateNotificationDto {
    title: string;
    message: string;
    toRole?: 'ADMIN' | 'LANDLORD' | 'TENANT';
    toUserId?: string;
    toEmail?: string;
}

export const notificationService = {
    getMyNotifications: async (): Promise<Notification[]> => {
        return api.get('/api/v1/notifications/my');
    },

    getAllNotifications: async (): Promise<Notification[]> => {
        return api.get('/api/v1/notifications');
    },

    createNotification: async (dto: CreateNotificationDto): Promise<Notification> => {
        return api.post('/api/v1/notifications', dto);
    },

    markAsRead: async (id: string): Promise<Notification> => {
        return api.patch(`/api/v1/notifications/${id}/read`, {});
    },

    deleteNotification: async (id: string): Promise<void> => {
        return api.del(`/api/v1/notifications/${id}`);
    },
};
