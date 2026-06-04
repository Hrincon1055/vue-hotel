<template>
  <DrawerPanel />
  <ContentHeader
    title="Reservas Multi-Habitación"
    subtitle="Gestión de reservas con múltiples habitaciones"
    icon="mdi-bed-double"
    :item-count="totalItems"
    :selected-items="selectedItems"
    create-route="/reservations/multi-room/new"
    item-key="id"
    @search="onSearch"
  />

  <v-alert v-if="isError" type="error" variant="tonal" class="ma-4">
    Error al cargar las reservas. Por favor, intenta de nuevo.
  </v-alert>

  <data-table
    v-model="selectedItems"
    :columns="columns"
    :items="tableItems"
    :page="filters.page"
    :items-per-page="filters.limit"
    :total-items="totalItems"
    item-key="id"
    @update:page="onPageChange"
    @update:items-per-page="onItemsPerPageChange"
    @sort="onSort"
    @row-click="onRowClick"
  >
    <template #[`item.reservationCode`]="{ item }">
      <span class="font-weight-medium">{{ item.reservationCode || '-' }}</span>
    </template>
    <template #[`item.customer`]="{ item }">
      {{ getCustomerName(item) }}
    </template>
    <template #[`item.rooms`]="{ item }">
      <v-chip size="small" color="primary" variant="tonal"> {{ getRoomsCount(item) }} hab. </v-chip>
    </template>
    <template #[`item.checkInDate`]="{ value }">
      {{ formatDate(value as string) }}
    </template>
    <template #[`item.checkOutDate`]="{ value }">
      {{ formatDate(value as string) }}
    </template>
    <template #[`item.totalAmount`]="{ value }">
      {{ formatCurrency(value as number) }}
    </template>
    <template #[`item.actions`]="{ item }">
      <div class="d-flex ga-1">
        <v-tooltip text="Confirmar todas" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-check-all"
              size="x-small"
              color="info"
              variant="tonal"
              :loading="isConfirming"
              @click.stop="onConfirm(item)"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="Cancelar todas" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-close-circle-multiple"
              size="x-small"
              color="error"
              variant="tonal"
              :loading="isCancelling"
              @click.stop="onCancel(item)"
            />
          </template>
        </v-tooltip>
      </div>
    </template>
  </data-table>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import ContentHeader from '@/modules/common/components/ContentHeader.vue';
import type { TableColumn } from '@/modules/common/components/DataTable.vue';
import DataTable from '@/modules/common/components/DataTable.vue';
import DrawerPanel from '@/modules/common/components/DrawerPanel.vue';
import { useAlert } from '@/modules/common/composables/useAlert';
import { useDrawer } from '@/modules/common/composables/useDrawer';
import { useLoading } from '@/modules/common/composables/useLoading';
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MultiRoomReservationForm from '../components/MultiRoomReservationForm.vue';
import { useMultiRoomReservations } from '../composables/useMultiRoomReservations';
import type { MultiRoomReservationFilters } from '../interfaces/reservation.interface';

const router = useRouter();
const { openDrawer } = useDrawer();
const { showLoading, hideLoading } = useLoading();
const { showAlert } = useAlert();

const filters = ref<MultiRoomReservationFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const {
  multiRoomReservations,
  totalItems,
  isFetching,
  isError,
  confirm,
  cancel,
  isConfirming,
  isCancelling,
} = useMultiRoomReservations(filters);

watch(
  isFetching,
  (fetching) => {
    if (fetching) showLoading();
    else hideLoading();
  },
  { immediate: true },
);

const selectedItems = ref<Record<string, unknown>[]>([]);
const snackbar = reactive({ show: false, message: '', color: 'success' });

const tableItems = computed<Record<string, unknown>[]>(
  () => multiRoomReservations.value as unknown as Record<string, unknown>[],
);

const columns: TableColumn[] = [
  { key: 'reservationCode', title: 'Código', visible: true },
  { key: 'customer', title: 'Cliente', visible: true },
  { key: 'rooms', title: 'Habitaciones', visible: true },
  { key: 'checkInDate', title: 'Check-in', type: 'date', visible: true },
  { key: 'checkOutDate', title: 'Check-out', type: 'date', visible: true },
  { key: 'totalAmount', title: 'Total', visible: true },
  { key: 'actions', title: 'Acciones', visible: true },
];

const onSearch = (value: string) => {
  filters.value = { ...filters.value, search: value, page: 1 };
};

const onPageChange = (page: number) => {
  filters.value = { ...filters.value, page };
};

const onItemsPerPageChange = (limit: number) => {
  filters.value = { ...filters.value, limit, page: 1 };
};

const onSort = (key: string, order: 'asc' | 'desc') => {
  filters.value = { ...filters.value, sortBy: key, sortOrder: order };
};

const onRowClick = (item: Record<string, unknown>) => {
  router.push({ name: 'reservations-multi-detail', params: { id: item.id as string } });
};

const onConfirm = async (item: Record<string, unknown>) => {
  try {
    await confirm(item.id as string);
    showAlert({ message: 'Todas las reservas han sido confirmadas', type: 'success' });
  } catch {
    // El interceptor ya maneja el error
  }
};

const onCancel = async (item: Record<string, unknown>) => {
  try {
    await cancel(item.id as string);
    showAlert({ message: 'Las reservas elegibles han sido canceladas', type: 'success' });
  } catch {
    // El interceptor ya maneja el error
  }
};

const getCustomerName = (item: Record<string, unknown>): string => {
  const customer = item.customer as { firstName?: string; lastName?: string } | undefined;
  if (customer?.firstName && customer?.lastName) {
    return `${customer.firstName} ${customer.lastName}`;
  }
  return '-';
};

const getRoomsCount = (item: Record<string, unknown>): number => {
  const reservations = item.reservations as unknown[] | undefined;
  return reservations?.length ?? 0;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
};

// Expuesto para que ContentHeader muestre el botón "Nuevo" que abre el drawer si se necesita
const openCreateDrawer = () => {
  openDrawer({
    title: 'Nueva Reserva Multi-Habitación',
    component: MultiRoomReservationForm,
    props: { inDrawer: true },
  });
};

// openCreateDrawer disponible para uso futuro desde template si se necesita
</script>
