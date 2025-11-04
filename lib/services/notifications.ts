import { api } from "../api";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export const notificationService = {
  listNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationListResponse> => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());
    if (unreadOnly) query.append("unreadOnly", "true");
    return api.get(`/api/v1/notifications?${query.toString()}`);
  },

  getNotification: async (id: string): Promise<Notification> => {
    return api.get(`/api/v1/notifications/${id}`);
  },

  markAsRead: async (id: string): Promise<Notification> => {
    return api.put(`/api/v1/notifications/${id}/read`, {});
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    return api.put("/api/v1/notifications/mark-all-read", {});
  },

  deleteNotification: async (id: string): Promise<{ message: string }> => {
    return api.del(`/api/v1/notifications/${id}`);
  },
};
