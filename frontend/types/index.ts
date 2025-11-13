// Типы для frontend (расширяют общие типы из shared)

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  level: number;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

