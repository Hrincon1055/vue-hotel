<template>
  <v-card variant="flat" class="room-item mb-2" @click="$emit('click', room)">
    <v-card-item>
      <template #prepend>
        <v-avatar :color="statusColor" variant="tonal" size="40">
          <v-icon size="20">mdi-door</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-body-1 font-weight-medium">
        Habitación {{ room.number }}
      </v-card-title>
      <v-card-subtitle class="text-caption">
        {{ typeLabel }} • Piso {{ room.floor }}
      </v-card-subtitle>
      <template #append>
        <div class="text-right">
          <v-chip :color="statusColor" size="small" label variant="tonal">
            {{ statusLabel }}
          </v-chip>
          <div class="text-body-2 font-weight-medium mt-1">
            {{ formatCurrency(room.pricePerNight) }}/noche
          </div>
        </div>
      </template>
    </v-card-item>
    <v-card-text class="pt-0">
      <div class="d-flex align-center ga-3 text-caption text-medium-emphasis">
        <span>
          <v-icon size="14" class="mr-1">mdi-account-multiple</v-icon>
          {{ room.capacity }} personas
        </span>
        <span v-if="room.amenities?.length">
          <v-icon size="14" class="mr-1">mdi-star</v-icon>
          {{ room.amenities.length }} amenidades
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Room, RoomStatus, RoomType } from '@/modules/rooms/interfaces/room.interface';
import { computed } from 'vue';

const props = defineProps<{
  room: Room;
}>();

defineEmits<{
  click: [room: Room];
}>();

const statusColor = computed(() => {
  const colors: Record<RoomStatus, string> = {
    AVAILABLE: 'success',
    OCCUPIED: 'error',
    RESERVED: 'info',
    CLEANING: 'warning',
    MAINTENANCE: 'orange',
    OUT_OF_SERVICE: 'grey',
  };
  return colors[props.room.status] || 'grey';
});

const statusLabel = computed(() => {
  const labels: Record<RoomStatus, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
    CLEANING: 'Limpieza',
    MAINTENANCE: 'Mantenimiento',
    OUT_OF_SERVICE: 'Fuera de servicio',
  };
  return labels[props.room.status] || props.room.status;
});

const typeLabel = computed(() => {
  const labels: Record<RoomType, string> = {
    SINGLE: 'Individual',
    DOUBLE: 'Doble',
    TWIN: 'Twin',
    SUITE: 'Suite',
    DELUXE: 'Deluxe',
    PRESIDENTIAL: 'Presidencial',
    FAMILY: 'Familiar',
  };
  return labels[props.room.type] || props.room.type;
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
</script>

<style scoped>
.room-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.room-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
