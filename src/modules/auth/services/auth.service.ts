import { api } from '@/api/useApi';
import type { AuthResponse, LoginDto } from '../interfaces/auth.interface';

export const authService = {
  async login(data: LoginDto) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async me() {
    const response = await api.post<AuthResponse>('/auth/me');
    return response.data;
  },
};
