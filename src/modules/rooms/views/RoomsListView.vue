<template>
  <DrawerPanel />
  <ContentHeader
    title="Habitaciones"
    subtitle="Gestión de habitaciones"
    icon="mdi-bed"
    :item-count="totalItems"
    :selected-items="selectedRooms"
    create-route="/rooms/new"
    edit-route="/rooms"
    item-key="id"
    @search="onSearch"
    @delete="onDelete"
  />

  <v-alert v-if="isError" type="error" variant="tonal" class="ma-4">
    Error al cargar las habitaciones. Por favor, intenta de nuevo.
  </v-alert>
  <data-table
    v-model="selectedRooms"
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
    <template #[`item.number`]="{ value }">
      <span class="font-weight-medium">{{ value }}</span>
    </template>
    <template #[`item.type`]="{ value }">
      <v-chip :color="getTypeColor(value as string)" size="small" label>
        {{ getTypeLabel(value as string) }}
      </v-chip>
    </template>
    <template #[`item.status`]="{ value }">
      <v-chip :color="getStatusColor(value as string)" size="small" label>
        {{ getStatusLabel(value as string) }}
      </v-chip>
    </template>
    <template #[`item.pricePerNight`]="{ value }">
      ${{ Number(value || 0).toFixed(2) }}
    </template>
    <template #[`item.capacity`]="{ value }">
      <v-icon size="small" class="mr-1">mdi-account</v-icon>
      {{ value }}
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
          roomsToDelete.length === 1 ? 'esta habitación' : `${roomsToDelete.length} habitaciones`
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
import RoomForm from '../components/RoomForm.vue';
import { useRooms } from '../composables/useRooms';
import type { RoomFilters } from '../interfaces/room.interface';

/**code */
const filters = ref<RoomFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const { rooms, totalItems, isFetching, isError, removeMany, isDeletingMany } = useRooms(filters);
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

const selectedRooms = ref<Record<string, unknown>[]>([]);
const deleteDialog = ref(false);
const roomsToDelete = ref<Record<string, unknown>[]>([]);
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

const tableItems = computed<Record<string, unknown>[]>(() => {
  return rooms.value as unknown as Record<string, unknown>[];
});

const columns: TableColumn[] = [
  { key: 'number', title: 'Número', visible: true },
  { key: 'floor', title: 'Piso', visible: true },
  { key: 'type', title: 'Tipo', type: 'status', visible: true },
  { key: 'status', title: 'Estado', type: 'status', visible: true },
  { key: 'pricePerNight', title: 'Precio/Noche', visible: true },
  { key: 'capacity', title: 'Capacidad', visible: true },
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
  roomsToDelete.value = items;
  deleteDialog.value = true;
};

const onEdit = (item: Record<string, unknown>) => {
  openDrawer({
    title: 'Editar Habitación',
    component: RoomForm,
    props: {
      room: item,
      inDrawer: true,
    },
  });
};

const confirmDelete = async () => {
  try {
    const ids = roomsToDelete.value.map((item) => item.id as string);
    await removeMany(ids);
    selectedRooms.value = [];
    deleteDialog.value = false;
    showSnackbar('Habitación(es) eliminada(s) correctamente', 'success');
  } catch {
    showSnackbar('Error al eliminar habitación(es)', 'error');
  }
};

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    SINGLE: 'grey',
    DOUBLE: 'blue',
    TWIN: 'cyan',
    SUITE: 'purple',
    DELUXE: 'orange',
    PRESIDENTIAL: 'amber',
    FAMILY: 'green',
  };
  return colors[type] ?? 'grey';
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    SINGLE: 'Individual',
    DOUBLE: 'Doble',
    TWIN: 'Twin',
    SUITE: 'Suite',
    DELUXE: 'Deluxe',
    PRESIDENTIAL: 'Presidencial',
    FAMILY: 'Familiar',
  };
  return labels[type] ?? type;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    AVAILABLE: 'success',
    OCCUPIED: 'error',
    RESERVED: 'warning',
    CLEANING: 'info',
    MAINTENANCE: 'orange',
    OUT_OF_SERVICE: 'grey',
  };
  return colors[status] ?? 'grey';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
    CLEANING: 'Limpieza',
    MAINTENANCE: 'Mantenimiento',
    OUT_OF_SERVICE: 'Fuera de Servicio',
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
</script>

<style scoped>
.rooms-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
