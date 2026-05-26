<template>
  <div>
    <ContentHeader
      title="Rooms"
      subtitle="Habitaciones"
      icon="mdi-bed"
      :item-count="totalItems"
      :selected-items="selectedRooms"
      create-route="/rooms/create"
      edit-route="/rooms/edit"
      item-key="id"
      @search="onSearch"
      @delete="onDelete"
    />

    <DataTable
      v-model="selectedRooms"
      :columns="columns"
      :items="rooms"
      :page="page"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      item-key="id"
      class="mt-4"
      @update:page="onPageChange"
      @update:items-per-page="onItemsPerPageChange"
      @sort="onSort"
    />
  </div>
</template>

<script setup lang="ts">
import ContentHeader from '@/modules/common/components/ContentHeader.vue';
import DataTable, { type TableColumn } from '@/modules/common/components/DataTable.vue';
import { ref, watch } from 'vue';

// Columnas de la tabla
const columns: TableColumn[] = [
  { key: 'floor', title: 'Floor', type: 'number' },
  { key: 'number', title: 'Number', type: 'number' },
  { key: 'type', title: 'Type', type: 'text' },
  { key: 'images', title: 'Images', type: 'array' },
  { key: 'status', title: 'Status', type: 'status' },
  { key: 'price', title: 'Price', type: 'number', visible: false },
  { key: 'createdAt', title: 'Date Created', type: 'date', visible: false },
];

// Estado de paginación
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(23); // Total simulado del servidor
const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Datos actuales (simulando respuesta del servidor)
const rooms = ref<Record<string, unknown>[]>([]);
const selectedRooms = ref<Record<string, unknown>[]>([]);

// Simular datos del servidor
const generateRooms = (page: number, perPage: number) => {
  const allRooms = [];
  const types = ['Single', 'Double', 'Suite', 'Deluxe'];
  const statuses = ['Available', 'Occupied', 'Maintenance', 'Reserved'];

  for (let i = 1; i <= 23; i++) {
    allRooms.push({
      id: i,
      floor: Math.ceil(i / 5),
      number: 100 + i,
      type: types[i % types.length],
      images: Array.from({ length: (i % 3) + 1 }, (_, j) => i * 10 + j),
      status: statuses[i % statuses.length],
      price: 80 + (i % 4) * 50,
      createdAt: `2024-01-${String(i).padStart(2, '0')}`,
    });
  }

  // Simular paginación
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return allRooms.slice(start, end);
};

// Función para cargar datos (simula llamada al API)
const fetchData = () => {
  console.log('Fetching data:', {
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    search: searchQuery.value,
    sortKey: sortKey.value,
    sortOrder: sortOrder.value,
  });
  // Aquí iría la llamada real al API:
  // const response = await api.get('/rooms', { params: { page, limit: itemsPerPage, search, sortBy, sortOrder } });
  // rooms.value = response.data.data;
  // totalItems.value = response.data.meta.total;

  // Simulación:
  rooms.value = generateRooms(page.value, itemsPerPage.value);
};

// Handlers de paginación
const onPageChange = (newPage: number) => {
  page.value = newPage;
};

const onItemsPerPageChange = (newSize: number) => {
  itemsPerPage.value = newSize;
  page.value = 1;
};

const onSearch = (value: string) => {
  searchQuery.value = value;
  page.value = 1;
};

const onSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key;
  sortOrder.value = order;
  page.value = 1;
};

const onDelete = (items: Record<string, unknown>[]) => {
  console.log('Eliminar items:', items);
  // Aquí iría la llamada al API para eliminar
  // await api.delete('/rooms', { data: { ids: items.map(i => i.id) } });
  // Limpiar selección y recargar
  selectedRooms.value = [];
  fetchData();
};

// Recargar datos cuando cambian los parámetros
watch(
  [page, itemsPerPage, searchQuery, sortKey, sortOrder],
  () => {
    fetchData();
  },
  { immediate: true },
);
</script>
