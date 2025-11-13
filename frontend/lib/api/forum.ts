import { apiClient, ApiResponse } from '../api';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  _count: {
    topics: number;
  };
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    reputation: number;
    level: number;
  };
  categoryId: string;
  category: ForumCategory;
  views: number;
  likes: number;
  isLocked: boolean;
  isPinned: boolean;
  attachments?: Array<{
    id: string;
    project: {
      id: string;
      title: string;
      description: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
}

export interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    reputation: number;
    level: number;
  };
  topicId: string;
  parentId?: string;
  parent?: ForumPost;
  likes: number;
  replies?: ForumPost[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    replies: number;
  };
}

export interface CreateTopicData {
  title: string;
  content: string;
  categoryId: string;
  attachedProjectIds?: string[];
}

export interface UpdateTopicData {
  title?: string;
  content?: string;
  categoryId?: string;
  isLocked?: boolean;
  isPinned?: boolean;
}

export interface CreatePostData {
  content: string;
  parentId?: string;
}

export interface UpdatePostData {
  content: string;
}

export interface TopicsResponse {
  topics: ForumTopic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostsResponse {
  posts: ForumPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const forumApi = {
  getCategories: async (): Promise<ApiResponse<ForumCategory[]>> => {
    return apiClient.get('/forum/categories');
  },

  getTopics: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    pinned?: boolean;
  }): Promise<ApiResponse<TopicsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.pinned !== undefined) queryParams.append('pinned', params.pinned.toString());

    const query = queryParams.toString();
    return apiClient.get(`/forum/topics${query ? `?${query}` : ''}`);
  },

  getTopic: async (id: string): Promise<ApiResponse<ForumTopic>> => {
    return apiClient.get(`/forum/topics/${id}`);
  },

  createTopic: async (data: CreateTopicData): Promise<ApiResponse<ForumTopic>> => {
    return apiClient.post('/forum/topics', data);
  },

  updateTopic: async (id: string, data: UpdateTopicData): Promise<ApiResponse<ForumTopic>> => {
    return apiClient.put(`/forum/topics/${id}`, data);
  },

  deleteTopic: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/forum/topics/${id}`);
  },

  getPosts: async (
    topicId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PostsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get(`/forum/topics/${topicId}/posts${query ? `?${query}` : ''}`);
  },

  createPost: async (topicId: string, data: CreatePostData): Promise<ApiResponse<ForumPost>> => {
    return apiClient.post(`/forum/topics/${topicId}/posts`, data);
  },

  updatePost: async (id: string, data: UpdatePostData): Promise<ApiResponse<ForumPost>> => {
    return apiClient.put(`/forum/posts/${id}`, data);
  },

  deletePost: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/forum/posts/${id}`);
  },

  likePost: async (id: string): Promise<ApiResponse<ForumPost>> => {
    return apiClient.post(`/forum/posts/${id}/like`);
  },

  attachProject: async (topicId: string, projectId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post(`/forum/topics/${topicId}/attach-project`, { projectId });
  },

  getAttachedProjects: async (topicId: string): Promise<ApiResponse<any[]>> => {
    return apiClient.get(`/forum/topics/${topicId}/attached-projects`);
  },
};

