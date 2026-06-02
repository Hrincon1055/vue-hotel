<template>
  <v-card variant="flat" class="reservation-item mb-2" @click="$emit('click', reservation)">
    <v-card-item>
      <template #prepend>
        <v-avatar :color="statusColor" variant="tonal" size="40">
          <v-icon size="20">mdi-calendar-check</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-body-1 font-weight-medium">
        {{ reservation.reservationCode }}
      </v-card-title>
      <v-card-subtitle class="text-caption">
        {{ customerName }}
      </v-card-subtitle>
      <template #append>
        <div class="text-right">
          <v-chip :color="statusColor" size="small" label variant="tonal">
            {{ statusLabel }}
          </v-chip>
          <div class="text-caption text-medium-emphasis mt-1">Hab. {{ roomNumber }}</div>
        </div>
      </template>
    </v-card-item>
    <v-card-text class="pt-0">
      <v-row dense>
        <v-col cols="6">
          <div class="text-caption text-medium-emphasis">Check-in</div>
          <div class="text-body-2">{{ formatDate(reservation.checkInDate) }}</div>
        </v-col>
        <v-col cols="6">
          <div class="text-caption text-medium-emphasis">Check-out</div>
          <div class="text-body-2">{{ formatDate(reservation.checkOutDate) }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type {
  Reservation,
  ReservationStatus,
} from '@/modules/reservations/interfaces/reservation.interface';
import { computed } from 'vue';

const props = defineProps<{
  reservation: Reservation;
}>();

defineEmits<{
  click: [reservation: Reservation];
}>();

const customerName = computed(() => {
  if (props.reservation.customer) {
    return `${props.reservation.customer.firstName} ${props.reservation.customer.lastName}`;
  }
  return 'Cliente no disponible';
});

const roomNumber = computed(() => {
  return props.reservation.room?.number ?? 'N/A';
});

const statusColor = computed(() => {
  const colors: Record<ReservationStatus, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'secondary',
    CANCELLED: 'error',
    NO_SHOW: 'grey',
  };
  return colors[props.reservation.status] || 'grey';
});

const statusLabel = computed(() => {
  const labels: Record<ReservationStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CHECKED_IN: 'Check-in',
    CHECKED_OUT: 'Check-out',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No Show',
  };
  return labels[props.reservation.status] || props.reservation.status;
});

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
};
</script>

<style scoped>
.reservation-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.reservation-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
