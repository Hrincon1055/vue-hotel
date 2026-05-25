<template>
  <div class="data-table-container">
    <v-table density="comfortable" class="data-table">
      <thead>
        <tr>
          <th scope="col" style="width: 40px">
            <v-checkbox
              :model-value="allSelected"
              :indeterminate="someSelected && !allSelected"
              hide-details
              density="compact"
              color="primary"
              @update:model-value="toggleSelectAll"
            ></v-checkbox>
          </th>
          <th v-for="col in displayedColumns" :key="col.key" scope="col">
            <v-menu>
              <template #activator="{ props: menuProps }">
                <div v-bind="menuProps" class="column-header d-flex align-center">
                  <span class="flex-grow-1">{{ col.title }}</span>
                  <v-icon v-if="sortKey === col.key" size="x-small" class="ml-1">
                    {{ sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending' }}
                  </v-icon>
                </div>
              </template>
              <v-list density="compact" class="slim-menu">
                <v-list-item
                  prepend-icon="mdi-sort-ascending"
                  title="Sort Ascending"
                  @click="sortColumn(col.key, 'asc')"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-sort-descending"
                  title="Sort Descending"
                  @click="sortColumn(col.key, 'desc')"
                ></v-list-item>
                <v-divider></v-divider>
                <v-list-item
                  prepend-icon="mdi-format-align-left"
                  title="Left Align"
                  @click="setAlignment(col.key, 'left')"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-format-align-center"
                  title="Center Align"
                  @click="setAlignment(col.key, 'center')"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-format-align-right"
                  title="Right Align"
                  @click="setAlignment(col.key, 'right')"
                ></v-list-item>
                <v-divider></v-divider>
                <v-list-item
                  prepend-icon="mdi-eye-off"
                  title="Hide Field"
                  @click="hideColumn(col.key)"
                ></v-list-item>
              </v-list>
            </v-menu>
          </th>
          <th scope="col" style="width: 40px">
            <v-menu :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <div style="color: white; font-weight: 200 !important; font-size: 0.75rem">
                  <v-btn v-bind="menuProps" icon="mdi-plus" variant="plain" size="small"></v-btn>
                </div>
              </template>
              <v-card min-width="180" class="slim-menu">
                <v-text-field
                  v-model="columnSearch"
                  density="compact"
                  variant="outlined"
                  placeholder="Search"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  class="ma-2 text-caption"
                ></v-text-field>
                <v-divider></v-divider>
                <v-list density="compact" max-height="300" class="overflow-y-auto">
                  <v-list-item
                    v-for="col in filteredColumns"
                    :key="col.key"
                    @click="toggleColumn(col.key)"
                  >
                    <template #prepend>
                      <v-checkbox-btn
                        :model-value="visibleColumns.includes(col.key)"
                        density="compact"
                        color="primary"
                      ></v-checkbox-btn>
                    </template>
                    <v-list-item-title>{{ col.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in sortedData" :key="getItemKey(item, index)">
          <td>
            <v-checkbox
              :model-value="isSelected(item)"
              hide-details
              density="compact"
              color="primary"
              @update:model-value="toggleSelect(item)"
            ></v-checkbox>
          </td>
          <td
            v-for="col in displayedColumns"
            :key="col.key"
            :class="`text-${columnAlignments[col.key] || 'left'}`"
          >
            <slot :name="`item.${col.key}`" :item="item" :value="item[col.key]">
              <template v-if="col.type === 'status'">
                <v-chip :color="getStatusColor(item[col.key])" size="small" label>
                  {{ item[col.key] }}
                </v-chip>
              </template>
              <template v-else-if="col.type === 'array'">
                [{{ formatArrayValue(item[col.key]) }}]
              </template>
              <template v-else>
                {{ item[col.key] }}
              </template>
            </slot>
          </td>
          <td></td>
        </tr>
        <tr v-if="sortedData.length === 0">
          <td :colspan="displayedColumns.length + 2" class="text-center text-medium-emphasis pa-4">
            No hay datos disponibles
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Paginación -->
    <div
      v-if="totalItems > 0"
      class="d-flex align-center justify-space-between pa-3 pagination-container"
    >
      <div class="text-caption text-medium-emphasis">
        Mostrando {{ startItem }}-{{ endItem }} de {{ totalItems }}
      </div>
      <div class="d-flex align-center ga-4">
        <v-select
          :model-value="itemsPerPage"
          :items="itemsPerPageOptions"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 80px"
          @update:model-value="onItemsPerPageChange"
        ></v-select>
        <v-pagination
          :model-value="page"
          :length="totalPages"
          :total-visible="5"
          density="compact"
          rounded
          active-color="primary"
          @update:model-value="onPageChange"
        ></v-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface TableColumn {
  key: string;
  title: string;
  type?: 'text' | 'number' | 'status' | 'array' | 'date';
  visible?: boolean;
  align?: 'left' | 'center' | 'right';
  children?: TableColumn[];
}

interface Props {
  columns: TableColumn[];
  items: Record<string, unknown>[];
  itemKey?: string;
  modelValue?: Record<string, unknown>[];
  // Paginación
  page?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemKey: 'id',
  modelValue: () => [],
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[]];
  'update:page': [value: number];
  'update:itemsPerPage': [value: number];
  sort: [key: string, order: 'asc' | 'desc'];
}>();

// Estado
const visibleColumns = ref<string[]>([]);
const columnAlignments = ref<Record<string, string>>({});
const sortKey = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc'>('asc');
const columnSearch = ref('');
const selectedItems = ref<Record<string, unknown>[]>([...props.modelValue]);

// Inicializar columnas visibles
watch(
  () => props.columns,
  (newColumns) => {
    visibleColumns.value = newColumns.filter((col) => col.visible !== false).map((col) => col.key);
    // Inicializar alineaciones
    newColumns.forEach((col) => {
      if (col.align) {
        columnAlignments.value[col.key] = col.align;
      }
    });
  },
  { immediate: true },
);

// Sincronizar selección con v-model
watch(
  () => props.modelValue,
  (newValue) => {
    selectedItems.value = [...newValue];
  },
);

// Columnas mostradas
const displayedColumns = computed(() =>
  props.columns.filter((col) => visibleColumns.value.includes(col.key)),
);

// Columnas filtradas para el menú
const filteredColumns = computed(() => {
  const search = columnSearch.value.toLowerCase();
  if (!search) return props.columns;
  return props.columns.filter((col) => col.title.toLowerCase().includes(search));
});

// Datos ordenados
const sortedData = computed(() => {
  if (!sortKey.value) return props.items;

  return [...props.items].sort((a, b) => {
    const aVal = a[sortKey.value!];
    const bVal = b[sortKey.value!];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const comparison = aVal < bVal ? -1 : 1;
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});

// Selección
const allSelected = computed(
  () => props.items.length > 0 && selectedItems.value.length === props.items.length,
);

const someSelected = computed(
  () => selectedItems.value.length > 0 && selectedItems.value.length < props.items.length,
);

// Helpers
const getItemKey = (item: Record<string, unknown>, index: number): string | number => {
  const key = item[props.itemKey];
  return (key as string | number) ?? index;
};

const formatArrayValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(',');
  }
  return String(value ?? '');
};

const isSelected = (item: Record<string, unknown>) =>
  selectedItems.value.some((s) => s[props.itemKey] === item[props.itemKey]);

const toggleSelect = (item: Record<string, unknown>) => {
  const index = selectedItems.value.findIndex((s) => s[props.itemKey] === item[props.itemKey]);
  if (index === -1) {
    selectedItems.value.push(item);
  } else {
    selectedItems.value.splice(index, 1);
  }
  emit('update:modelValue', selectedItems.value);
};

const toggleSelectAll = (value: boolean | null) => {
  selectedItems.value = value ? [...props.items] : [];
  emit('update:modelValue', selectedItems.value);
};

// Columnas
const toggleColumn = (key: string) => {
  const index = visibleColumns.value.indexOf(key);
  if (index === -1) {
    visibleColumns.value.push(key);
  } else {
    visibleColumns.value.splice(index, 1);
  }
};

const hideColumn = (key: string) => {
  const index = visibleColumns.value.indexOf(key);
  if (index !== -1) {
    visibleColumns.value.splice(index, 1);
  }
};

// Ordenamiento
const sortColumn = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key;
  sortOrder.value = order;
  emit('sort', key, order);
};

// Alineación
const setAlignment = (key: string, align: string) => {
  columnAlignments.value[key] = align;
};

// Color de status
const getStatusColor = (status: unknown): string => {
  const statusColors: Record<string, string> = {
    Available: 'success',
    Occupied: 'error',
    Maintenance: 'warning',
    Reserved: 'info',
    Active: 'success',
    Inactive: 'error',
  };
  return statusColors[String(status)] || 'default';
};

// Paginación
const itemsPerPageOptions = [5, 10, 25, 50, 100];

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.page - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.page * props.itemsPerPage;
  return Math.min(end, props.totalItems);
});

const onPageChange = (newPage: number) => {
  emit('update:page', newPage);
};

const onItemsPerPageChange = (newItemsPerPage: number) => {
  emit('update:itemsPerPage', newItemsPerPage);
  emit('update:page', 1); // Reset a la primera página
};
</script>

<style scoped>
.data-table-container {
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  background: transparent;
}

.data-table th {
  font-weight: 500;
  white-space: nowrap;
}

.data-table td {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.column-header {
  cursor: pointer;
  padding: 4px 0;
}

.pagination-container {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>

<style>
/* Estilos globales para menús slim */
.slim-menu .v-list-item {
  min-height: 32px !important;
  padding: 4px 12px !important;
}

.slim-menu .v-list-item-title {
  font-size: 0.75rem !important;
}

.slim-menu .v-list-item__prepend > .v-icon {
  font-size: 16px !important;
  margin-inline-end: 8px !important;
}

.slim-menu .v-checkbox-btn {
  transform: scale(0.85);
}

.slim-menu .v-text-field {
  font-size: 0.75rem;
}

.slim-menu .v-field__input {
  font-size: 0.75rem !important;
  min-height: 32px !important;
  padding: 4px 8px !important;
}

.slim-menu .v-field__prepend-inner .v-icon {
  font-size: 16px !important;
}
</style>
