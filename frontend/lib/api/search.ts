import { apiClient, ApiResponse } from '../api';

export interface SearchResult {
  type: 'project' | 'topic' | 'user' | 'course';
  id: string;
  title: string;
  description?: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  url: string;
  relevance?: number;
}

export interface ProjectsSearchResponse {
  projects: Array<{
    id: string;
    title: string;
    description: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
    tags: Array<{ id: string; tag: string }>;
    stars: number;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ForumSearchResponse {
  topics: Array<{
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
    category: {
      id: string;
      name: string;
    };
    createdAt: string;
    _count: {
      posts: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersSearchResponse {
  users: Array<{
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
    reputation: number;
    level: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CoursesSearchResponse {
  courses: Array<{
    id: string;
    title: string;
    description: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
    rating: number;
    enrolledUsers: number;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const searchApi = {
  globalSearch: async (
    query: string,
    limit?: number
  ): Promise<ApiResponse<SearchResult[]>> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit.toString());

    return apiClient.get(`/search?${params.toString()}`);
  },

  searchProjects: async (
    query: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<ProjectsSearchResponse>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get(`/search/projects?${searchParams.toString()}`);
  },

  searchForum: async (
    query: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<ForumSearchResponse>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get(`/search/forum?${searchParams.toString()}`);
  },

  searchUsers: async (
    query: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<UsersSearchResponse>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get(`/search/users?${searchParams.toString()}`);
  },

  searchCourses: async (
    query: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<CoursesSearchResponse>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiClient.get(`/search/courses?${searchParams.toString()}`);
  },
};

