import { apiClient, ApiResponse } from '../api';

export interface User {
  id: string;
  email?: string; // Только для своего профиля
  username: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  level: number;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
    forumTopics: number;
    forumPosts: number;
    enrolledCourses: number;
    certificates: number;
  };
}

export interface UserStats {
  projects: number;
  forumTopics: number;
  forumPosts: number;
  enrolledCourses: number;
  certificates: number;
  teams: number;
  totalStars: number;
  reputation: number;
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface UserActivity {
  id: string;
  type: 'project' | 'topic' | 'post' | 'enrollment';
  title?: string;
  topicId?: string;
  courseId?: string;
  date: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface UserProjectsResponse {
  projects: Array<{
    id: string;
    title: string;
    description: string;
    tags: Array<{ id: string; tag: string }>;
    stars: number;
    downloads: number;
    createdAt: string;
    _count: {
      versions: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userApi = {
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    return apiClient.get(`/users/${id}`);
  },

  updateProfile: async (id: string, data: UpdateProfileData): Promise<ApiResponse<User>> => {
    return apiClient.put(`/users/${id}`, data);
  },

  getStats: async (id: string): Promise<ApiResponse<UserStats>> => {
    return apiClient.get(`/users/${id}/stats`);
  },

  getBadges: async (id: string): Promise<ApiResponse<Badge[]>> => {
    return apiClient.get(`/users/${id}/badges`);
  },

  getActivity: async (id: string, limit?: number): Promise<ApiResponse<UserActivity[]>> => {
    const query = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/users/${id}/activity${query}`);
  },

  getProjects: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<UserProjectsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get(`/users/${id}/projects${query ? `?${query}` : ''}`);
  },

  follow: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post(`/users/${id}/follow`);
  },

  unfollow: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/users/${id}/follow`);
  },

  getFollowers: async (id: string): Promise<ApiResponse<User[]>> => {
    return apiClient.get(`/users/${id}/followers`);
  },

  getFollowing: async (id: string): Promise<ApiResponse<User[]>> => {
    return apiClient.get(`/users/${id}/following`);
  },
};

