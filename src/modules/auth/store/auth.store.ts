import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AuthResponse, EmployeeRole } from '../interfaces/auth.interface';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const isAuthenticated = computed<boolean>(() => !!accessToken.value && !!user.value);
  const userRole = computed<EmployeeRole | null>(() => user.value?.role || null);

  const fullName = computed<string>(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  );

  const hasRole = (roles: EmployeeRole | EmployeeRole[]): boolean => {
    if (!user.value) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.value.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false;
    const rolePermissions: Record<EmployeeRole, string[]> = {
      ADMIN: ['*'], // Todos los permisos
      MANAGER: [
        'employees:read',
        'employees:create',
        'employees:update',
        'customers:*',
        'rooms:*',
        'reservations:*',
        'services:*',
        'housekeeping:*',
      ],
      RECEPTIONIST: [
        'customers:*',
        'rooms:read',
        'reservations:*',
        'services:read',
        'services:add-to-reservation',
        'housekeeping:read',
      ],
      HOUSEKEEPING: ['housekeeping:read', 'housekeeping:my-tasks', 'housekeeping:complete'],
    };
    const permissions = rolePermissions[user.value.role];
    if (permissions.includes('*')) return true;
    const [module] = permission.split(':');
    return permissions.includes(permission) || permissions.includes(`${module}:*`);
  };

  const setAuth = (authResponse: AuthResponse) => {
    accessToken.value = authResponse.accessToken;
    refreshToken.value = authResponse.refreshToken;
    user.value = authResponse.employee;
    localStorage.setItem(import.meta.env.VITE_ACCESS_TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(import.meta.env.VITE_USER_KEY, JSON.stringify(authResponse.employee));
  };

  const loadFromStorage = () => {
    const storedToken = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(import.meta.env.VITE_USER_KEY);
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        accessToken.value = storedToken;
        refreshToken.value = storedRefresh;
        user.value = JSON.parse(storedUser);
      } catch {
        clearAuth();
      }
    }
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(import.meta.env.VITE_USER_KEY);
  };

  // Cargar estado inicial
  loadFromStorage();

  return {
    // Estado
    user,
    accessToken,
    refreshToken,
    isLoading,
    // Getters
    isAuthenticated,
    userRole,
    fullName,
    // Métodos
    hasRole,
    hasPermission,
    setAuth,
    clearAuth,
    loadFromStorage,
  };
});
