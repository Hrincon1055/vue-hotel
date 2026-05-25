<template>
  <div>
    <ContentHeader
      title="Rooms"
      subtitle="Habitaciones"
      icon="mdi-bed"
      :item-count="rooms.length"
      create-route="/rooms/create"
      @search="onSearch"
    />

    <DataTable
      v-model="selectedRooms"
      :columns="columns"
      :items="filteredRooms"
      item-key="id"
      class="mt-4"
      @sort="onSort"
    />
  </div>
</template>

<script setup lang="ts">
import ContentHeader from '@/modules/common/components/ContentHeader.vue';
import DataTable, { type TableColumn } from '@/modules/common/components/DataTable.vue';
import { computed, ref } from 'vue';

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

// Datos de ejemplo
const rooms = ref([
  {
    id: 1,
    floor: 1,
    number: 101,
    type: 'Single',
    images: [1, 2],
    status: 'Available',
    price: 80,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    floor: 1,
    number: 102,
    type: 'Double',
    images: [3],
    status: 'Occupied',
    price: 120,
    createdAt: '2024-01-16',
  },
  {
    id: 3,
    floor: 2,
    number: 201,
    type: 'Suite',
    images: [4, 5, 6],
    status: 'Maintenance',
    price: 250,
    createdAt: '2024-01-17',
  },
  {
    id: 4,
    floor: 2,
    number: 202,
    type: 'Double',
    images: [7, 8],
    status: 'Available',
    price: 120,
    createdAt: '2024-01-18',
  },
  {
    id: 5,
    floor: 3,
    number: 301,
    type: 'Suite',
    images: [9],
    status: 'Reserved',
    price: 280,
    createdAt: '2024-01-19',
  },
]);

const selectedRooms = ref<Record<string, unknown>[]>([]);
const searchQuery = ref('');

// Filtrar por búsqueda
const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value;
  const query = searchQuery.value.toLowerCase();
  return rooms.value.filter(
    (room) =>
      room.number.toString().includes(query) ||
      room.type.toLowerCase().includes(query) ||
      room.status.toLowerCase().includes(query),
  );
});

const onSearch = (value: string) => {
  searchQuery.value = value;
};

const onSort = (key: string, order: 'asc' | 'desc') => {
  console.log('Sort:', key, order);
};
</script>
