import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import type { EmployeeRole } from '../interfaces/auth.interface';

/**
 * Obtiene el usuario del localStorage
 */
const getUser = () => {
  const userStr = localStorage.getItem(import.meta.env.VITE_USER_KEY);
  if (!userStr || userStr === 'null' || userStr === 'undefined') return null;
  try {
    const user = JSON.parse(userStr);
    // Verificar que el usuario tenga las propiedades mínimas
    return user?.id && user?.email ? user : null;
  } catch {
    return null;
  }
};

/**
 * Guard: Requiere autenticación
 * Uso: beforeEnter: requireAuth
 */
export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
  const user = getUser();

  if (!token || !user) {
    // Limpiar cualquier dato residual
    localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(import.meta.env.VITE_USER_KEY);
    next({ name: 'login' });
  } else {
    next();
  }
};

/**
 * Guard: Solo para invitados (no autenticados)
 * Uso: beforeEnter: guestOnly
 */
export const guestOnly = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
  if (token) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
};

/**
 * Guard Factory: Requiere roles específicos
 * Uso: beforeEnter: requireRoles(['ADMIN', 'MANAGER'])
 */
export const requireRoles = (allowedRoles: EmployeeRole[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const token = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }
    const user = getUser();
    if (!user || !allowedRoles.includes(user.role)) {
      next({ name: 'unauthorized' });
      return;
    }
    next();
  };
};

/**
 * Guard combinado: Auth + Roles
 * Uso: beforeEnter: authWithRoles(['ADMIN'])
 */
export const authWithRoles = (allowedRoles?: EmployeeRole[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const token = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }
    if (allowedRoles && allowedRoles.length > 0) {
      const user = getUser();
      if (!user || !allowedRoles.includes(user.role)) {
        next({ name: 'unauthorized' });
        return;
      }
    }
    next();
  };
};
