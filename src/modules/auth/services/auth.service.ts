import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type { AuthResponse, LoginDto } from '../interfaces/auth.interface';

export const authService = {
  async login(payload: LoginDto) {
    const response = await api.post<Response<AuthResponse>>('/auth/login', payload);
    console.log('auth.service LINE 7 =>', response.data);
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await api.post<Response<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async me() {
    const response = await api.post<Response<AuthResponse>>('/auth/me');
    return response.data;
  },
};
