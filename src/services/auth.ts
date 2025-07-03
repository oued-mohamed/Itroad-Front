// ===== 7. src/services/auth.ts =====
import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyToken(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }
};

