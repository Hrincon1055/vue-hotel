<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          color="primary"
          prepend-icon="mdi-arrow-left"
          class="mb-4"
          @click="goBack"
        >
          Volver a Clientes
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="isLoadingCustomer">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="customer">
      <v-row>
        <v-col cols="12">
          <v-card variant="flat" class="mb-4">
            <v-card-item>
              <template #prepend>
                <v-avatar color="primary" size="56">
                  <span class="text-h5">{{ customerInitials }}</span>
                </v-avatar>
              </template>
              <v-card-title>{{ customer.firstName }} {{ customer.lastName }}</v-card-title>
              <v-card-subtitle>
                <v-icon size="small" class="mr-1">mdi-email</v-icon>
                {{ customer.email }}
                <span v-if="customer.phone" class="ml-3">
                  <v-icon size="small" class="mr-1">mdi-phone</v-icon>
                  {{ customer.phone }}
                </span>
              </v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            <span class="text-h6">Historial de Reservaciones</span>
            <v-chip class="ml-2" size="small" color="primary">
              {{ totalReservations }}
            </v-chip>
          </div>

          <template v-if="sortedReservations.length > 0">
            <v-card
              v-for="reservation in sortedReservations"
              :key="reservation.id"
              :color="getStatusColor(reservation.status)"
              variant="tonal"
              class="mb-3"
            >
              <v-card-item>
                <template #prepend>
                  <v-avatar :color="getStatusColor(reservation.status)" variant="flat">
                    <v-icon>mdi-calendar-check</v-icon>
                  </v-avatar>
                </template>
                <v-card-title class="d-flex align-center flex-wrap ga-2">
                  <span class="font-weight-bold">{{ reservation.reservationCode }}</span>
                  <v-chip
                    :color="getStatusColor(reservation.status)"
                    size="small"
                    label
                    variant="flat"
                  >
                    {{ getStatusLabel(reservation.status) }}
                  </v-chip>
                </v-card-title>
                <v-card-subtitle>
                  Creada el {{ formatDate(reservation.createdAt) }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-caption text-medium-emphasis">Habitación</div>
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-1">mdi-door</v-icon>
                      <span class="font-weight-medium">
                        {{ reservation.room?.number || 'N/A' }}
                        <span class="text-caption"
                          >({{ getRoomTypeLabel(reservation.room?.type) }})</span
                        >
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-caption text-medium-emphasis">Check-in</div>
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-1">mdi-calendar-arrow-right</v-icon>
                      <span class="font-weight-medium">{{
                        formatDate(reservation.checkInDate)
                      }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-caption text-medium-emphasis">Check-out</div>
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-1">mdi-calendar-arrow-left</v-icon>
                      <span class="font-weight-medium">{{
                        formatDate(reservation.checkOutDate)
                      }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-caption text-medium-emphasis">Huéspedes</div>
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-1">mdi-account-multiple</v-icon>
                      <span class="font-weight-medium">
                        {{ reservation.adults }} adulto(s)
                        <span v-if="reservation.children > 0"
                          >, {{ reservation.children }} niño(s)</span
                        >
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="justify-space-between px-4 pb-3">
                <div class="text-caption text-medium-emphasis">
                  {{ calculateNights(reservation.checkInDate, reservation.checkOutDate) }} noches
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ formatCurrency(reservation.totalAmount) }}
                </div>
              </v-card-actions>
            </v-card>
          </template>

          <v-alert v-else type="info" variant="tonal">
            Este cliente no tiene reservaciones registradas.
          </v-alert>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="warning" variant="tonal"> Cliente no encontrado. </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useLoading } from '@/modules/common/composables/useLoading';
import { useQuery } from '@tanstack/vue-query';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ReservationStatus } from '../interfaces/customer.interface';
import { customersService } from '../services/customers.service';

const route = useRoute();
const router = useRouter();
const { showLoading, hideLoading } = useLoading();

// Asegurar que el loading se oculte al desmontar el componente
onUnmounted(() => {
  hideLoading();
});

const customerId = ref(route.params.id as string);

watch(
  () => route.params.id,
  (newId) => {
    customerId.value = newId as string;
  },
);

const { data: customer, isLoading: isLoadingCustomer } = useQuery({
  queryKey: ['customer', customerId],
  queryFn: () => customersService.getById(customerId.value),
  enabled: computed(() => !!customerId.value),
  refetchOnMount: 'always',
});

// Obtener reservaciones directamente del cliente
const reservations = computed(() => {
  const data = customer.value?.reservations;
  return Array.isArray(data) ? data : [];
});

const totalReservations = computed(() => {
  return customer.value?._count?.reservations ?? reservations.value.length;
});

// Sincronizar estado de carga con GlobalLoading
watch(
  isLoadingCustomer,
  (loading) => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  },
  { immediate: true },
);

const customerInitials = computed(() => {
  if (!customer.value) return '';
  return `${customer.value.firstName.charAt(0)}${customer.value.lastName.charAt(0)}`.toUpperCase();
});

const sortedReservations = computed(() => {
  const list = reservations.value;
  if (!list || !Array.isArray(list)) return [];
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
});

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusColor = (status: ReservationStatus): string => {
  const colors: Record<ReservationStatus, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'secondary',
    CANCELLED: 'error',
    NO_SHOW: 'grey',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = (status: ReservationStatus): string => {
  const labels: Record<ReservationStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CHECKED_IN: 'Check-in',
    CHECKED_OUT: 'Check-out',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No Show',
  };
  return labels[status] || status;
};

const getRoomTypeLabel = (type?: string): string => {
  if (!type) return '';
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

const goBack = () => {
  router.push('/customers');
};
</script>
