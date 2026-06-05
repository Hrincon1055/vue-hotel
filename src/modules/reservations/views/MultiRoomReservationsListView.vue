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
    @delete="onDelete"
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
    <template #[`item.status`]="{ item }">
      <v-chip size="small" :color="getStatusColor(item.status as string)" variant="tonal" label>
        {{ getStatusLabel(item.status as string) }}
      </v-chip>
    </template>
    <template #[`item.rooms`]="{ item }">
      <div class="d-flex flex-wrap ga-1">
        <v-tooltip
          v-for="res in item.reservations as ReservationRow[]"
          :key="res.id"
          :text="getStatusLabel(res.status)"
          location="top"
        >
          <template #activator="{ props: tooltipProps }">
            <v-chip
              v-bind="tooltipProps"
              size="small"
              :color="getStatusColor(res.status)"
              variant="tonal"
              label
            >
              Hab. {{ res.room?.number ?? '-' }}
            </v-chip>
          </template>
        </v-tooltip>
      </div>
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
        <v-tooltip text="Ver detalle" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-eye"
              size="x-small"
              color="primary"
              variant="tonal"
              @click.stop="
                router.push({
                  name: 'reservations-multi-detail',
                  params: { id: item.id as string },
                })
              "
            />
          </template>
        </v-tooltip>
      </div>
    </template>
  </data-table>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>

  <v-dialog v-model="deleteDialog" max-width="420">
    <v-card>
      <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
      <v-card-text>
        ¿Estás seguro de que deseas eliminar
        {{
          itemsToDelete.length === 1
            ? 'esta reserva multi-habitación'
            : `${itemsToDelete.length} reservas multi-habitación`
        }}? Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">Volver</v-btn>
        <v-btn color="error" variant="tonal" :loading="isDeletingMany" @click="confirmDelete">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import type {
  MultiRoomReservation,
  MultiRoomReservationFilters,
} from '../interfaces/reservation.interface';

interface ReservationRow {
  id: string;
  status: string;
  room?: { number?: string };
}

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

const { multiRoomReservations, totalItems, isFetching, isError, removeMany, isDeletingMany } =
  useMultiRoomReservations(filters);

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
const deleteDialog = ref(false);
const itemsToDelete = ref<Record<string, unknown>[]>([]);

const tableItems = computed<Record<string, unknown>[]>(
  () => multiRoomReservations.value as unknown as Record<string, unknown>[],
);

const columns: TableColumn[] = [
  { key: 'reservationCode', title: 'Código', visible: true },
  { key: 'customer', title: 'Cliente', visible: true },
  { key: 'status', title: 'Estado', visible: true },
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
  openDrawer({
    title: 'Reserva Multi-Habitación',
    component: MultiRoomReservationForm,
    props: {
      multiRoomReservation: item as unknown as MultiRoomReservation,
      inDrawer: true,
    },
  });
};

const onDelete = (items: Record<string, unknown>[]) => {
  itemsToDelete.value = items;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    const ids = itemsToDelete.value.map((item) => item.id as string);
    await removeMany(ids);
    selectedItems.value = [];
    deleteDialog.value = false;
    showAlert({ message: 'Reserva(s) eliminada(s) correctamente', type: 'success' });
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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'secondary',
  CANCELLED: 'error',
  NO_SHOW: 'purple',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CHECKED_IN: 'En curso',
  CHECKED_OUT: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No presentado',
};

const getStatusColor = (status: string): string => STATUS_COLORS[status] ?? 'default';
const getStatusLabel = (status: string): string => STATUS_LABELS[status] ?? status;

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
</script>
