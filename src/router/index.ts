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
        {
          path: '/employees/new',
          name: 'employees-new',
          component: () => import('@/modules/employees/views/EmployeeFormView.vue'),
        },
        // Customers routes
        {
          path: '/customers',
          name: 'customers-list',
          component: () => import('@/modules/customers/views/CustomersListView.vue'),
        },
        {
          path: '/customers/new',
          name: 'customers-create',
          component: () => import('@/modules/customers/views/CustomerFormView.vue'),
        },
        {
          path: '/customers/:id',
          name: 'customers-detail',
          component: () => import('@/modules/customers/views/CustomerDetailView.vue'),
        },
        {
          path: '/customers/:id/reservations',
          name: 'customers-reservations',
          component: () => import('@/modules/customers/views/CustomerReservationsView.vue'),
        },
        // Rooms routes
        {
          path: '/rooms',
          name: 'rooms-list',
          component: () => import('@/modules/rooms/views/RoomsListView.vue'),
        },
        {
          path: '/rooms/new',
          name: 'rooms-create',
          component: () => import('@/modules/rooms/views/RoomFormView.vue'),
        },
        {
          path: '/rooms/:id',
          name: 'rooms-detail',
          component: () => import('@/modules/rooms/views/RoomDetailView.vue'),
        },
        {
          path: '/rooms/:id/edit',
          name: 'rooms-edit',
          component: () => import('@/modules/rooms/views/RoomFormView.vue'),
        },
        // Reservations routes
        {
          path: '/reservations',
          name: 'reservations-list',
          component: () => import('@/modules/reservations/views/ReservationsListView.vue'),
        },
        {
          path: '/reservations/new',
          name: 'reservations-create',
          component: () => import('@/modules/reservations/views/ReservationFormView.vue'),
        },
        {
          path: '/reservations/:id',
          name: 'reservations-detail',
          component: () => import('@/modules/reservations/views/ReservationDetailView.vue'),
        },
        {
          path: '/reservations/:id/edit',
          name: 'reservations-edit',
          component: () => import('@/modules/reservations/views/ReservationFormView.vue'),
        },
        // Multi-Room Reservations routes
        {
          path: '/reservations/multi-room',
          name: 'reservations-multi-list',
          component: () => import('@/modules/reservations/views/MultiRoomReservationsListView.vue'),
        },
        {
          path: '/reservations/multi-room/new',
          name: 'reservations-multi-create',
          component: () => import('@/modules/reservations/views/MultiRoomReservationFormView.vue'),
        },
        {
          path: '/reservations/multi-room/:id',
          name: 'reservations-multi-detail',
          component: () =>
            import('@/modules/reservations/views/MultiRoomReservationDetailView.vue'),
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
