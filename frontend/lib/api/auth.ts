import { apiClient, ApiResponse } from '../api';
import { User } from '@/types';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post('/auth/register', data);
  },

  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post('/auth/login', data);
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiClient.get('/auth/me');
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post('/auth/logout');
  },

  refreshToken: async (data: RefreshTokenData): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return apiClient.post('/auth/refresh', data);
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/reset-password', data);
  },

  verifyEmail: async (data: VerifyEmailData): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/verify-email', data);
  },
};

