<template>
  <DrawerPanel />
  <ContentHeader
    title="Clientes"
    subtitle="Gestión de huéspedes"
    icon="mdi-account-multiple"
    :item-count="totalItems"
    :selected-items="selectedCustomers"
    create-route="/customers/new"
    edit-route="/customers"
    item-key="id"
    @search="onSearch"
    @delete="onDelete"
  />

  <v-alert v-if="isError" type="error" variant="tonal" class="ma-4">
    Error al cargar los clientes. Por favor, intenta de nuevo.
  </v-alert>
  <data-table
    v-model="selectedCustomers"
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
    <template #[`item.documentType`]="{ value }">
      <v-chip :color="getDocumentTypeColor(value as string)" size="small" label>
        {{ getDocumentTypeLabel(value as string) }}
      </v-chip>
    </template>
    <template #[`item.createdAt`]="{ value }">
      {{ formatDate(value as string) }}
    </template>
    <template #[`item.actions`]="{ item }">
      <v-tooltip text="Ver reservaciones" location="top">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon
            size="small"
            variant="text"
            color="primary"
            @click.stop="goToReservations(item)"
          >
            <v-icon>mdi-calendar-clock</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </data-table>
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
      <v-card-text>
        ¿Estás seguro de que deseas eliminar
        {{
          customersToDelete.length === 1 ? 'este cliente' : `${customersToDelete.length} clientes`
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
import { useRouter } from 'vue-router';
import CustomerForm from '../components/CustomerForm.vue';
import { useCustomers } from '../composables/useCustomers';
import type { CustomerFilters } from '../interfaces/customer.interface';

/**code */
const filters = ref<CustomerFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const { customers, totalItems, isFetching, isError, removeMany, isDeletingMany } =
  useCustomers(filters);
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
const selectedCustomers = ref<Record<string, unknown>[]>([]);
const deleteDialog = ref(false);
const customersToDelete = ref<Record<string, unknown>[]>([]);
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

const tableItems = computed<Record<string, unknown>[]>(() => {
  return customers.value as unknown as Record<string, unknown>[];
});

const router = useRouter();

const columns: TableColumn[] = [
  { key: 'firstName', title: 'Nombre', visible: true },
  { key: 'lastName', title: 'Apellido', visible: true },
  { key: 'email', title: 'Email', visible: true },
  { key: 'phone', title: 'Teléfono', visible: true },
  { key: 'documentType', title: 'Tipo Doc.', type: 'status', visible: true },
  { key: 'documentNumber', title: 'N° Documento', visible: true },
  { key: 'nationality', title: 'Nacionalidad', visible: true },
  { key: 'createdAt', title: 'Creado', type: 'date', visible: true },
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

const onDelete = (items: Record<string, unknown>[]) => {
  customersToDelete.value = items;
  deleteDialog.value = true;
};

const onEdit = (item: Record<string, unknown>) => {
  openDrawer({
    title: 'Editar Cliente',
    component: CustomerForm,
    props: {
      customer: item,
      inDrawer: true,
    },
  });
};

const confirmDelete = async () => {
  try {
    const ids = customersToDelete.value.map((item) => item.id as string);
    await removeMany(ids);
    selectedCustomers.value = [];
    deleteDialog.value = false;
    showSnackbar('Cliente(s) eliminado(s) correctamente', 'success');
  } catch {
    showSnackbar('Error al eliminar cliente(s)', 'error');
  }
};

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const getDocumentTypeColor = (documentType: string): string => {
  const colors: Record<string, string> = {
    PASSPORT: 'primary',
    NATIONAL_ID: 'success',
    DRIVERS_LICENSE: 'warning',
    OTHER: 'grey',
  };
  return colors[documentType] ?? 'grey';
};

const getDocumentTypeLabel = (documentType: string): string => {
  const labels: Record<string, string> = {
    PASSPORT: 'Pasaporte',
    NATIONAL_ID: 'Cédula',
    DRIVERS_LICENSE: 'Licencia',
    OTHER: 'Otro',
  };
  return labels[documentType] ?? documentType;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const goToReservations = (item: Record<string, unknown>) => {
  router.push({ name: 'customers-reservations', params: { id: item.id as string } });
};
</script>

<style scoped>
.customers-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
