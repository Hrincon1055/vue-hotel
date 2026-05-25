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
  // Estado
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);

  // Getters computados
  const isAuthenticated = computed<boolean>(() => !!accessToken.value && !!user.value);
  const userRole = computed<EmployeeRole | null>(() => user.value?.role || null);
  const fullName = computed<string>(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  );

  // Verificar si el usuario tiene uno de los roles especificados
  const hasRole = (roles: EmployeeRole | EmployeeRole[]): boolean => {
    if (!user.value) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.value.role);
  };

  // Verificar si el usuario tiene permiso para una acción específica
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false;

    // Matriz de permisos por rol
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

    // Admin tiene todos los permisos
    if (permissions.includes('*')) return true;

    // Verificar permiso exacto o wildcard del módulo
    const [module] = permission.split(':');
    return permissions.includes(permission) || permissions.includes(`${module}:*`);
  };

  // Acciones
  const setAuth = (authResponse: AuthResponse) => {
    accessToken.value = authResponse.accessToken;
    refreshToken.value = authResponse.refreshToken;
    user.value = authResponse.employee;

    // Persistir en localStorage
    localStorage.setItem(import.meta.env.VITE_ACCESS_TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(import.meta.env.VITE_USER_KEY, JSON.stringify(authResponse.employee));
  };

  const loadFromStorage = () => {
    console.log('auth.store LINE 85 =>');
    const storedToken = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(import.meta.env.VITE_USER_KEY);

    if (storedToken && storedUser) {
      accessToken.value = storedToken;
      refreshToken.value = storedRefresh;
      user.value = JSON.parse(storedUser);
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
