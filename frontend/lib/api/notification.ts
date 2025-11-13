import { apiClient, ApiResponse } from '../api';

export interface Notification {
  id: string;
  userId: string;
  type: 'PROJECT_STAR' | 'PROJECT_COMMENT' | 'FORUM_REPLY' | 'MESSAGE' | 'COURSE_ENROLLMENT' | 'TEAM_INVITE' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export const notificationApi = {
  getNotifications: async (
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<NotificationsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get(`/notifications${query ? `?${query}` : ''}`);
  },

  getUnreadNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    return apiClient.get('/notifications/unread');
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.get('/notifications/unread/count');
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    return apiClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/notifications/${id}`);
  },
};

