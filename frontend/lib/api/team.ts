import { apiClient, ApiResponse } from '../api';

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    email?: string;
    reputation?: number;
    level?: number;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  members: TeamMember[];
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    author: {
      id: string;
      username: string;
    };
    tags: Array<{ id: string; tag: string }>;
  }>;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    projects: number;
  };
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface AddMemberData {
  userId: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface UpdateMemberRoleData {
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export const teamApi = {
  getTeams: async (): Promise<ApiResponse<Team[]>> => {
    return apiClient.get('/teams');
  },

  getTeam: async (id: string): Promise<ApiResponse<Team>> => {
    return apiClient.get(`/teams/${id}`);
  },

  createTeam: async (data: CreateTeamData): Promise<ApiResponse<Team>> => {
    return apiClient.post('/teams', data);
  },

  updateTeam: async (id: string, data: UpdateTeamData): Promise<ApiResponse<Team>> => {
    return apiClient.put(`/teams/${id}`, data);
  },

  deleteTeam: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/teams/${id}`);
  },

  getMembers: async (id: string): Promise<ApiResponse<TeamMember[]>> => {
    return apiClient.get(`/teams/${id}/members`);
  },

  addMember: async (id: string, data: AddMemberData): Promise<ApiResponse<TeamMember>> => {
    return apiClient.post(`/teams/${id}/members`, data);
  },

  updateMemberRole: async (
    id: string,
    userId: string,
    data: UpdateMemberRoleData
  ): Promise<ApiResponse<TeamMember>> => {
    return apiClient.put(`/teams/${id}/members/${userId}`, data);
  },

  removeMember: async (id: string, userId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/teams/${id}/members/${userId}`);
  },
};

