import { apiClient, ApiResponse } from '../api';

export interface User {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message | null;
  updatedAt: string;
}

export interface CreateConversationData {
  userId: string;
  type?: 'direct' | 'group';
  participantIds?: string[];
}

export interface CreateMessageData {
  content: string;
}

export interface UpdateMessageData {
  content: string;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const messageApi = {
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    return apiClient.get('/messages/conversations');
  },

  getConversation: async (id: string): Promise<ApiResponse<Conversation>> => {
    return apiClient.get(`/messages/conversations/${id}`);
  },

  createConversation: async (
    data: CreateConversationData
  ): Promise<ApiResponse<Conversation>> => {
    return apiClient.post('/messages/conversations', data);
  },

  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<MessagesResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get(
      `/messages/conversations/${conversationId}/messages${query ? `?${query}` : ''}`
    );
  },

  createMessage: async (
    conversationId: string,
    data: CreateMessageData
  ): Promise<ApiResponse<Message>> => {
    return apiClient.post(`/messages/conversations/${conversationId}/messages`, data);
  },

  updateMessage: async (
    id: string,
    data: UpdateMessageData
  ): Promise<ApiResponse<Message>> => {
    return apiClient.put(`/messages/messages/${id}`, data);
  },

  deleteMessage: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/messages/messages/${id}`);
  },

  markAsRead: async (conversationId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post(`/messages/conversations/${conversationId}/read`);
  },

  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
    return apiClient.get('/messages/unread-count');
  },
};

