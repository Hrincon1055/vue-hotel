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
          <v-card variant="outlined" class="mb-4">
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
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-calendar-clock</v-icon>
              Historial de Reservaciones
              <v-chip class="ml-2" size="small" color="primary">
                {{ totalReservations }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <v-alert v-if="isError" type="error" variant="tonal" class="mb-4">
                Error al cargar las reservaciones. Por favor, intenta de nuevo.
              </v-alert>

              <v-progress-linear v-if="isFetching" indeterminate color="primary" class="mb-4" />

              <v-data-table
                v-if="reservations.length > 0"
                :headers="headers"
                :items="reservations"
                :items-per-page="10"
                class="elevation-0"
              >
                <template #[`item.code`]="{ item }">
                  <span class="font-weight-medium">{{ item.code }}</span>
                </template>
                <template #[`item.room`]="{ item }">
                  <v-chip size="small" variant="tonal">
                    <v-icon start size="small">mdi-door</v-icon>
                    {{ item.room?.number || 'N/A' }}
                  </v-chip>
                </template>
                <template #[`item.checkInDate`]="{ item }">
                  {{ formatDate(item.checkInDate) }}
                </template>
                <template #[`item.checkOutDate`]="{ item }">
                  {{ formatDate(item.checkOutDate) }}
                </template>
                <template #[`item.status`]="{ item }">
                  <v-chip :color="getStatusColor(item.status)" size="small" label>
                    {{ getStatusLabel(item.status) }}
                  </v-chip>
                </template>
                <template #[`item.totalAmount`]="{ item }">
                  <span class="font-weight-medium"
                    >${{ item.totalAmount?.toFixed(2) || '0.00' }}</span
                  >
                </template>
                <template #[`item.guests`]="{ item }">
                  {{ item.adults }} adultos
                  <span v-if="item.children > 0">, {{ item.children }} niños</span>
                </template>
              </v-data-table>

              <v-alert
                v-else-if="!isFetching && reservations.length === 0"
                type="info"
                variant="tonal"
              >
                Este cliente no tiene reservaciones registradas.
              </v-alert>
            </v-card-text>
          </v-card>
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
import { useQuery } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerReservations } from '../composables/useCustomerReservations';
import type { ReservationStatus } from '../interfaces/customer.interface';
import { customersService } from '../services/customers.service';

const route = useRoute();
const router = useRouter();

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
});

const { reservations, totalReservations, isFetching, isError } =
  useCustomerReservations(customerId);

const customerInitials = computed(() => {
  if (!customer.value) return '';
  return `${customer.value.firstName.charAt(0)}${customer.value.lastName.charAt(0)}`.toUpperCase();
});

const headers = [
  { title: 'Código', key: 'code', sortable: true },
  { title: 'Habitación', key: 'room', sortable: false },
  { title: 'Check-in', key: 'checkInDate', sortable: true },
  { title: 'Check-out', key: 'checkOutDate', sortable: true },
  { title: 'Huéspedes', key: 'guests', sortable: false },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true },
];

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

const goBack = () => {
  router.push('/customers');
};
</script>
