import { QueryClient } from '@tanstack/vue-query';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Tipos para el manejo de refresh
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Estado del refresh token
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Función para limpiar la sesión
const clearSession = () => {
  localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
  localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
  localStorage.removeItem(import.meta.env.VITE_USER_KEY);
  globalThis.location.href = '/login';
};

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    // Si no hay config o ya se intentó retry, rechazar
    if (!originalRequest) {
      throw error;
    }
    // Solo intentar refresh en errores 401 y si no es la ruta de refresh/login
    const isAuthRoute =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login');
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      throw error;
    }
    // Si ya está refrescando, encolar la petición
    if (isRefreshing) {
      const token = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }
    originalRequest._retry = true;
    isRefreshing = true;
    const refreshToken = localStorage.getItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      isRefreshing = false;
      clearSession();
      throw error;
    }

    try {
      // Llamar al endpoint de refresh
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const { accessToken, refreshToken: newRefreshToken, employee } = response.data.data;
      // Guardar nuevos tokens
      localStorage.setItem(import.meta.env.VITE_ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, newRefreshToken);
      localStorage.setItem(import.meta.env.VITE_USER_KEY, JSON.stringify(employee));
      // Actualizar header de la petición original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      // Procesar cola de peticiones pendientes
      processQueue(null, accessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      clearSession();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});
