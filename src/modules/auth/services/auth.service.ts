import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type { AuthResponse, LoginDto } from '../interfaces/auth.interface';

export const authService = {
  async login(payload: LoginDto) {
    const response = await api.post<Response<AuthResponse>>('/auth/login', payload);
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await api.post<Response<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async logout() {
    localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(import.meta.env.VITE_USER_KEY);
    await api.post('/auth/logout');
  },

  async me() {
    const response = await api.post<Response<AuthResponse>>('/auth/me');
    return response.data;
  },
};
