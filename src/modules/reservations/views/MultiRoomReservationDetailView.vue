<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-4"
          @click="$router.back()"
        >
          Volver
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="multiRoomReservation">
      <v-row>
        <!-- Info principal -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-bed-double</v-icon>
              Reserva {{ multiRoomReservation.reservationCode }}
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <template #prepend><v-icon>mdi-account</v-icon></template>
                  <v-list-item-title>Cliente</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ multiRoomReservation.customer?.firstName }}
                    {{ multiRoomReservation.customer?.lastName }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon>mdi-calendar-arrow-right</v-icon></template>
                  <v-list-item-title>Check-in</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(multiRoomReservation.checkInDate) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon>mdi-calendar-arrow-left</v-icon></template>
                  <v-list-item-title>Check-out</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(multiRoomReservation.checkOutDate) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon>mdi-cash</v-icon></template>
                  <v-list-item-title>Total</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatCurrency(multiRoomReservation.totalAmount) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="multiRoomReservation.notes">
                  <template #prepend><v-icon>mdi-note-text</v-icon></template>
                  <v-list-item-title>Notas</v-list-item-title>
                  <v-list-item-subtitle>{{ multiRoomReservation.notes }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Habitaciones individuales -->
          <v-card class="mt-4">
            <v-card-title>
              <v-icon class="mr-2">mdi-bed</v-icon>
              Habitaciones ({{ multiRoomReservation.reservations.length }})
            </v-card-title>
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th scope="col">Habitación</th>
                    <th scope="col">Código</th>
                    <th scope="col">Adultos</th>
                    <th scope="col">Niños</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Total</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="reservation in multiRoomReservation.reservations"
                    :key="reservation.id"
                  >
                    <td>{{ reservation.room?.number ?? '-' }}</td>
                    <td>{{ reservation.reservationCode }}</td>
                    <td>{{ reservation.adults }}</td>
                    <td>{{ reservation.children }}</td>
                    <td>
                      <v-chip :color="getStatusColor(reservation.status)" size="small" label>
                        {{ getStatusLabel(reservation.status) }}
                      </v-chip>
                    </td>
                    <td>{{ formatCurrency(reservation.totalAmount) }}</td>
                    <td>
                      <v-btn
                        icon="mdi-eye"
                        size="x-small"
                        variant="text"
                        :to="{ name: 'reservations-detail', params: { id: reservation.id } }"
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Acciones -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Acciones del grupo</v-card-title>
            <v-card-text>
              <v-btn
                block
                color="info"
                class="mb-2"
                prepend-icon="mdi-check-all"
                :loading="isConfirming"
                @click="onConfirmAll"
              >
                Confirmar todas
              </v-btn>
              <v-btn
                block
                color="error"
                variant="outlined"
                class="mb-2"
                prepend-icon="mdi-close-circle-multiple"
                :loading="isCancelling"
                @click="onCancelAll"
              >
                Cancelar elegibles
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error" variant="tonal">No se encontró la reserva multi-habitación.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAlert } from '@/modules/common/composables/useAlert';
import { useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  useMultiRoomReservation,
  useMultiRoomReservationMutations,
} from '../composables/useMultiRoomReservations';
import type { ReservationStatus } from '../interfaces/reservation.interface';

const route = useRoute();
const queryClient = useQueryClient();
const { showAlert } = useAlert();

const id = computed(() => route.params.id as string);
const { multiRoomReservation, isLoading } = useMultiRoomReservation(id);
const { confirm, cancel, isConfirming, isCancelling } = useMultiRoomReservationMutations();

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: ['multi-room-reservation', id] });

const onConfirmAll = async () => {
  try {
    await confirm(id.value);
    invalidate();
    showAlert({ message: 'Todas las reservas han sido confirmadas', type: 'success' });
  } catch {
    // El interceptor ya maneja el error
  }
};

const onCancelAll = async () => {
  try {
    await cancel(id.value);
    invalidate();
    showAlert({ message: 'Las reservas elegibles han sido canceladas', type: 'success' });
  } catch {
    // El interceptor ya maneja el error
  }
};

const getStatusColor = (status: ReservationStatus): string => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'grey',
    CANCELLED: 'error',
    NO_SHOW: 'error',
  };
  return colors[status] ?? 'grey';
};

const getStatusLabel = (status: ReservationStatus): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CHECKED_IN: 'Check-in',
    CHECKED_OUT: 'Check-out',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No Show',
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

const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
};
</script>
