import { apiClient, ApiResponse } from '../api';

export interface Project {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  isPublic: boolean;
  license: string;
  tags: Array<{ id: string; tag: string }>;
  stars: number;
  downloads: number;
  versions: ProjectVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  changelog?: string;
  files: ProjectFile[];
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  path: string;
  content?: string;
  size: number;
  type: 'FILE' | 'DIRECTORY';
}

export interface CreateProjectData {
  title: string;
  description: string;
  license: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'Unlicense' | 'Other';
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  license?: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'Unlicense' | 'Other';
  tags?: string[];
  isPublic?: boolean;
}

export interface CreateVersionData {
  version: string;
  changelog?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectStats {
  stars: number;
  downloads: number;
  versions: number;
  createdAt: string;
  updatedAt: string;
}

export const projectApi = {
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    author?: string;
    public?: boolean;
  }): Promise<ApiResponse<ProjectsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) queryParams.append('tags', params.tags.join(','));
    if (params?.author) queryParams.append('author', params.author);
    if (params?.public !== undefined) queryParams.append('public', params.public.toString());

    const query = queryParams.toString();
    return apiClient.get(`/projects${query ? `?${query}` : ''}`);
  },

  getProject: async (id: string): Promise<ApiResponse<Project>> => {
    return apiClient.get(`/projects/${id}`);
  },

  createProject: async (data: CreateProjectData): Promise<ApiResponse<Project>> => {
    return apiClient.post('/projects', data);
  },

  updateProject: async (id: string, data: UpdateProjectData): Promise<ApiResponse<Project>> => {
    return apiClient.put(`/projects/${id}`, data);
  },

  deleteProject: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/projects/${id}`);
  },

  createVersion: async (id: string, data: CreateVersionData): Promise<ApiResponse<ProjectVersion>> => {
    return apiClient.post(`/projects/${id}/version`, data);
  },

  getVersions: async (id: string): Promise<ApiResponse<ProjectVersion[]>> => {
    return apiClient.get(`/projects/${id}/versions`);
  },

  starProject: async (id: string): Promise<ApiResponse<Project>> => {
    return apiClient.post(`/projects/${id}/star`);
  },

  unstarProject: async (id: string): Promise<ApiResponse<Project>> => {
    return apiClient.delete(`/projects/${id}/star`);
  },

  getStats: async (id: string): Promise<ApiResponse<ProjectStats>> => {
    return apiClient.get(`/projects/${id}/stats`);
  },
};

