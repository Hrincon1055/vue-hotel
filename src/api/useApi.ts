import { useAlert } from '@/modules/common/composables/useAlert';
import { QueryClient } from '@tanstack/vue-query';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Inicializar el composable de alertas
const { showError, showWarning } = useAlert();

// Interfaz para respuestas de error del API
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// Función para extraer el mensaje de error
const getErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
  // Intentar obtener el mensaje del cuerpo de la respuesta
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }

  // Mensajes por defecto según el código de estado
  const statusMessages: Record<number, string> = {
    400: 'Solicitud incorrecta. Verifica los datos enviados.',
    401: 'No autorizado. Por favor inicia sesión nuevamente.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'El recurso solicitado no fue encontrado.',
    409: 'Conflicto con el estado actual del recurso.',
    422: 'Los datos enviados no son válidos.',
    500: 'Error interno del servidor. Intenta más tarde.',
    502: 'Error de conexión con el servidor.',
    503: 'Servicio no disponible temporalmente.',
  };

  const status = error.response?.status;
  const statusMessage = status ? statusMessages[status] : undefined;
  if (statusMessage) {
    return statusMessage;
  }

  // Mensaje genérico si no hay respuesta
  if (!error.response) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  return 'Ha ocurrido un error inesperado.';
};

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
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    // Si no hay config o ya se intentó retry, rechazar
    if (!originalRequest) {
      showError(getErrorMessage(error));
      throw error;
    }
    // Solo intentar refresh en errores 401 y si no es la ruta de refresh/login
    const isAuthRoute =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login');

    // Si no es un error 401 o ya se intentó retry o es ruta de auth
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      // Mostrar alerta según el tipo de error
      const errorMessage = getErrorMessage(error);
      const status = error.response?.status;

      // No mostrar alerta para 401 que serán manejados por el redirect
      if (status !== 401) {
        if (status && status >= 400 && status < 500) {
          showWarning(errorMessage);
        } else {
          showError(errorMessage);
        }
      }

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
      showError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
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
