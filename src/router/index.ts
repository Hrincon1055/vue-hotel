import { guestOnly, requireAuth } from '@/modules/auth/guard/auth.guard';
import AdminLayout from '@/modules/layouts/AdminLayout.vue';
import AuthLayout from '@/modules/layouts/AuthLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      beforeEnter: [requireAuth],
      redirect: { name: 'dashboard' },
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/views/DashboardView.vue'),
        },
        {
          path: '/employees',
          name: 'employees-list',
          component: () => import('@/modules/employees/views/EmployeesListView.vue'),
        },
      ],
    },
    {
      path: '/auth',
      name: 'auth',
      beforeEnter: [guestOnly],
      redirect: { name: 'login' },
      component: AuthLayout,
      children: [
        {
          path: '/login',
          name: 'login',
          component: () => import('@/modules/auth/views/LoginView.vue'),
        },
      ],
    },
  ],
});

export default router;
