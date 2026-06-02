<template>
  <DrawerPanel />
  <ContentHeader
    title="Reservaciones"
    subtitle="Gestión de reservas"
    icon="mdi-calendar-check"
    :item-count="totalItems"
    :selected-items="selectedReservations"
    create-route="/reservations/new"
    edit-route="/reservations"
    item-key="id"
    @search="onSearch"
    @delete="onDelete"
  />

  <v-alert v-if="isError" type="error" variant="tonal" class="ma-4">
    Error al cargar las reservaciones. Por favor, intenta de nuevo.
  </v-alert>
  <data-table
    v-model="selectedReservations"
    :columns="columns"
    :items="tableItems"
    :page="filters.page"
    :items-per-page="filters.limit"
    :total-items="totalItems"
    item-key="id"
    @update:page="onPageChange"
    @update:items-per-page="onItemsPerPageChange"
    @sort="onSort"
    @row-click="onEdit"
  >
    <template #[`item.customer`]="{ item }">
      {{ getCustomerName(item) }}
    </template>
    <template #[`item.room`]="{ item }">
      {{ getRoomNumber(item) }}
    </template>
    <template #[`item.status`]="{ value }">
      <v-chip :color="getStatusColor(value as string)" size="small" label>
        {{ getStatusLabel(value as string) }}
      </v-chip>
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
    <template #[`item.createdAt`]="{ value }">
      {{ formatDate(value as string) }}
    </template>
  </data-table>
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
      <v-card-text>
        ¿Estás seguro de que deseas eliminar
        {{
          reservationsToDelete.length === 1
            ? 'esta reservación'
            : `${reservationsToDelete.length} reservaciones`
        }}? Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
        <v-btn color="error" variant="tonal" :loading="isDeletingMany" @click="confirmDelete">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
/**imports */
import ContentHeader from '@/modules/common/components/ContentHeader.vue';
import type { TableColumn } from '@/modules/common/components/DataTable.vue';
import DataTable from '@/modules/common/components/DataTable.vue';
import DrawerPanel from '@/modules/common/components/DrawerPanel.vue';
import { useDrawer } from '@/modules/common/composables/useDrawer';
import { useLoading } from '@/modules/common/composables/useLoading';
import { computed, reactive, ref, watch } from 'vue';
import ReservationForm from '../components/ReservationForm.vue';
import { useReservations } from '../composables/useReservations';
import type { ReservationFilters } from '../interfaces/reservation.interface';

/**code */
const filters = ref<ReservationFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const { reservations, totalItems, isFetching, isError, removeMany, isDeletingMany } =
  useReservations(filters);
const { openDrawer } = useDrawer();
const { showLoading, hideLoading } = useLoading();

watch(
  isFetching,
  (fetching) => {
    if (fetching) {
      showLoading();
    } else {
      hideLoading();
    }
  },
  { immediate: true },
);

const selectedReservations = ref<Record<string, unknown>[]>([]);
const deleteDialog = ref(false);
const reservationsToDelete = ref<Record<string, unknown>[]>([]);
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

const tableItems = computed<Record<string, unknown>[]>(() => {
  return reservations.value as unknown as Record<string, unknown>[];
});

const columns: TableColumn[] = [
  { key: 'code', title: 'Código', visible: true },
  { key: 'customer', title: 'Cliente', visible: true },
  { key: 'room', title: 'Habitación', visible: true },
  { key: 'checkInDate', title: 'Check-in', type: 'date', visible: true },
  { key: 'checkOutDate', title: 'Check-out', type: 'date', visible: true },
  { key: 'status', title: 'Estado', type: 'status', visible: true },
  { key: 'totalAmount', title: 'Total', visible: true },
  { key: 'createdAt', title: 'Creado', type: 'date', visible: true },
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

const onDelete = (items: Record<string, unknown>[]) => {
  reservationsToDelete.value = items;
  deleteDialog.value = true;
};

const onEdit = (item: Record<string, unknown>) => {
  openDrawer({
    title: 'Editar Reservación',
    component: ReservationForm,
    props: {
      reservation: item,
      inDrawer: true,
    },
  });
};

const confirmDelete = async () => {
  try {
    const ids = reservationsToDelete.value.map((item) => item.id as string);
    await removeMany(ids);
    selectedReservations.value = [];
    deleteDialog.value = false;
    showSnackbar('Reservación(es) eliminada(s) correctamente', 'success');
  } catch {
    showSnackbar('Error al eliminar reservación(es)', 'error');
  }
};

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const getCustomerName = (item: Record<string, unknown>): string => {
  const customer = item.customer as { firstName?: string; lastName?: string } | undefined;
  if (customer?.firstName && customer?.lastName) {
    return `${customer.firstName} ${customer.lastName}`;
  }
  return '-';
};

const getRoomNumber = (item: Record<string, unknown>): string => {
  const room = item.room as { number?: string } | undefined;
  return room?.number ?? '-';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'grey',
    CANCELLED: 'error',
    NO_SHOW: 'error',
  };
  return colors[status] ?? 'grey';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CHECKED_IN: 'Check-in',
    CHECKED_OUT: 'Check-out',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No Show',
  };
  return labels[status] ?? status;
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
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
</script>

<style scoped>
.reservations-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
