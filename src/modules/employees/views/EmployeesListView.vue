<template>
  <DrawerPanel />
  <ContentHeader
    title="Empleados"
    subtitle="Gestión de personal"
    icon="mdi-account-group"
    :item-count="totalItems"
    :selected-items="selectedEmployees"
    create-route="/employees/new"
    edit-route="/employees"
    item-key="id"
    @search="onSearch"
    @delete="onDelete"
    @edit="onEdit"
  />
  <v-progress-linear v-if="isLoading" indeterminate color="primary" />
  <v-alert v-if="isError" type="error" variant="tonal" class="ma-4">
    Error al cargar los empleados. Por favor, intenta de nuevo.
  </v-alert>
  <data-table
    v-model="selectedEmployees"
    :columns="columns"
    :items="tableItems"
    :page="filters.page"
    :items-per-page="filters.limit"
    :total-items="totalItems"
    item-key="id"
    @update:page="onPageChange"
    @update:items-per-page="onItemsPerPageChange"
    @sort="onSort"
  >
    <template #[`item.role`]="{ value }">
      <v-chip :color="getRoleColor(value as string)" size="small" label>
        {{ getRoleLabel(value as string) }}
      </v-chip>
    </template>
    <template #[`item.status`]="{ value }">
      <v-chip :color="getStatusColor(value as string)" size="small" label>
        {{ getStatusLabel(value as string) }}
      </v-chip>
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
          employeesToDelete.length === 1
            ? 'este empleado'
            : `${employeesToDelete.length} empleados`
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
import ContentHeader from '@/modules/common/components/ContentHeader.vue';
import type { TableColumn } from '@/modules/common/components/DataTable.vue';
import DataTable from '@/modules/common/components/DataTable.vue';
import DrawerPanel from '@/modules/common/components/DrawerPanel.vue';
import { useDrawer } from '@/modules/common/composables/useDrawer';
import { computed, reactive, ref } from 'vue';
import EmployeeForm from '../components/EmployeeForm.vue';
import { useEmployees } from '../composables/useEmployees';
import type { EmployeeFilters } from '../interfaces/employee.interface';

// Filtros reactivos
const filters = ref<EmployeeFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Composables
const { employees, totalItems, isLoading, isError, removeMany, isDeletingMany } =
  useEmployees(filters);
const { openDrawer } = useDrawer();

// Estado local
const selectedEmployees = ref<Record<string, unknown>[]>([]);
const deleteDialog = ref(false);
const employeesToDelete = ref<Record<string, unknown>[]>([]);
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

const tableItems = computed<Record<string, unknown>[]>(() => {
  return employees.value as unknown as Record<string, unknown>[];
});

// Columnas de la tabla
const columns: TableColumn[] = [
  { key: 'firstName', title: 'Nombre', visible: true },
  { key: 'lastName', title: 'Apellido', visible: true },
  { key: 'email', title: 'Email', visible: true },
  { key: 'role', title: 'Rol', type: 'status', visible: true },
  { key: 'status', title: 'Estado', type: 'status', visible: true },
  { key: 'createdAt', title: 'Creado', type: 'date', visible: true },
];

// Handlers
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
  employeesToDelete.value = items;
  deleteDialog.value = true;
};

const onEdit = (item: Record<string, unknown>) => {
  openDrawer({
    title: 'Editar Empleado',
    component: EmployeeForm,
    props: {
      employee: item,
      inDrawer: true,
    },
  });
};

const confirmDelete = async () => {
  try {
    const ids = employeesToDelete.value.map((item) => item.id as string);
    await removeMany(ids);
    selectedEmployees.value = [];
    deleteDialog.value = false;
    showSnackbar('Empleado(s) eliminado(s) correctamente', 'success');
  } catch {
    showSnackbar('Error al eliminar empleado(s)', 'error');
  }
};

const showSnackbar = (message: string, color: string) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

// Helpers de formato
const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: 'error',
    MANAGER: 'warning',
    RECEPTIONIST: 'info',
    HOUSEKEEPING: 'success',
  };
  return colors[role] ?? 'grey';
};

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    RECEPTIONIST: 'Recepcionista',
    HOUSEKEEPING: 'Limpieza',
  };
  return labels[role] ?? role;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    INACTIVE: 'grey',
    ON_LEAVE: 'warning',
    TERMINATED: 'error',
  };
  return colors[status] ?? 'grey';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    ON_LEAVE: 'De permiso',
    TERMINATED: 'Terminado',
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
.employees-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
