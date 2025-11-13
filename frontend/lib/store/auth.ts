import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { authApi } from '../api/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          if (response.success && response.data) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error?.message || 'Ошибка входа');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ email, username, password });
          if (response.success && response.data) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error?.message || 'Ошибка регистрации');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error?.message || 'Ошибка получения пользователя');
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

