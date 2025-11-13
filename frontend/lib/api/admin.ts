import { apiClient, ApiResponse } from '../api';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isEmailVerified: boolean;
  isBanned: boolean;
  reputation: number;
  level: number;
  createdAt: string;
  _count: {
    projects: number;
    forumTopics: number;
    forumPosts: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalTopics: number;
  totalCourses: number;
  totalMessages: number;
  activeUsers: number;
  bannedUsers: number;
}

export interface UpdateUserData {
  username?: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  isEmailVerified?: boolean;
  isBanned?: boolean;
}

export interface UpdateProjectData {
  isPublic?: boolean;
  isFeatured?: boolean;
}

export interface UpdateTopicData {
  isLocked?: boolean;
  isPinned?: boolean;
}

export interface UpdateCourseData {
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    banned?: boolean;
  }): Promise<ApiResponse<UsersResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.banned !== undefined) queryParams.append('banned', params.banned.toString());

    const query = queryParams.toString();
    return apiClient.get(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUser: async (id: string): Promise<ApiResponse<AdminUser>> => {
    return apiClient.get(`/admin/users/${id}`);
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<ApiResponse<AdminUser>> => {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/admin/users/${id}`);
  },

  getProjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    public?: boolean;
    featured?: boolean;
  }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.public !== undefined) queryParams.append('public', params.public.toString());
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const query = queryParams.toString();
    return apiClient.get(`/admin/projects${query ? `?${query}` : ''}`);
  },

  updateProject: async (id: string, data: UpdateProjectData): Promise<ApiResponse<any>> => {
    return apiClient.put(`/admin/projects/${id}`, data);
  },

  deleteProject: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/admin/projects/${id}`);
  },

  getTopics: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    locked?: boolean;
    pinned?: boolean;
  }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.locked !== undefined) queryParams.append('locked', params.locked.toString());
    if (params?.pinned !== undefined) queryParams.append('pinned', params.pinned.toString());

    const query = queryParams.toString();
    return apiClient.get(`/admin/topics${query ? `?${query}` : ''}`);
  },

  updateTopic: async (id: string, data: UpdateTopicData): Promise<ApiResponse<any>> => {
    return apiClient.put(`/admin/topics/${id}`, data);
  },

  deleteTopic: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/admin/topics/${id}`);
  },

  getCourses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    published?: boolean;
    featured?: boolean;
  }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.published !== undefined) queryParams.append('published', params.published.toString());
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const query = queryParams.toString();
    return apiClient.get(`/admin/courses${query ? `?${query}` : ''}`);
  },

  updateCourse: async (id: string, data: UpdateCourseData): Promise<ApiResponse<any>> => {
    return apiClient.put(`/admin/courses/${id}`, data);
  },

  deleteCourse: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/admin/courses/${id}`);
  },

  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    return apiClient.get('/admin/stats');
  },
};

