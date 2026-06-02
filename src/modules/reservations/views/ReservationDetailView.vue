<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          :to="{ name: 'reservations-list' }"
          class="mb-4"
        >
          Volver a la lista
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <v-row v-else-if="reservation">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-calendar-check</v-icon>
            Reservación {{ reservation.code }}
            <v-chip :color="getStatusColor(reservation.status)" size="small" label class="ml-2">
              {{ getStatusLabel(reservation.status) }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Cliente</v-list-item-title>
                <v-list-item-subtitle>
                  {{ reservation.customer?.firstName }} {{ reservation.customer?.lastName }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-bed</v-icon>
                </template>
                <v-list-item-title>Habitación</v-list-item-title>
                <v-list-item-subtitle>
                  {{ reservation.room?.number }} - {{ getRoomTypeLabel(reservation.room?.type) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-arrow-right</v-icon>
                </template>
                <v-list-item-title>Check-in</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(reservation.checkInDate) }}
                  <span v-if="reservation.actualCheckIn" class="text-success">
                    (Realizado: {{ formatDateTime(reservation.actualCheckIn) }})
                  </span>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar-arrow-left</v-icon>
                </template>
                <v-list-item-title>Check-out</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(reservation.checkOutDate) }}
                  <span v-if="reservation.actualCheckOut" class="text-success">
                    (Realizado: {{ formatDateTime(reservation.actualCheckOut) }})
                  </span>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-account-multiple</v-icon>
                </template>
                <v-list-item-title>Huéspedes</v-list-item-title>
                <v-list-item-subtitle>
                  {{ reservation.adults }} adulto(s), {{ reservation.children }} niño(s)
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-cash</v-icon>
                </template>
                <v-list-item-title>Total</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatCurrency(reservation.totalAmount) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="reservation.notes">
                <template #prepend>
                  <v-icon>mdi-note-text</v-icon>
                </template>
                <v-list-item-title>Notas</v-list-item-title>
                <v-list-item-subtitle>{{ reservation.notes }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Acciones</v-card-title>
          <v-card-text>
            <v-btn block color="primary" class="mb-2" prepend-icon="mdi-pencil" @click="onEdit">
              Editar
            </v-btn>
            <v-btn
              v-if="reservation.status === 'PENDING'"
              block
              color="info"
              class="mb-2"
              prepend-icon="mdi-check"
              :loading="isConfirming"
              @click="onConfirm"
            >
              Confirmar
            </v-btn>
            <v-btn
              v-if="reservation.status === 'CONFIRMED'"
              block
              color="success"
              class="mb-2"
              prepend-icon="mdi-login"
              :loading="isCheckingIn"
              @click="onCheckIn"
            >
              Check-in
            </v-btn>
            <v-btn
              v-if="reservation.status === 'CHECKED_IN'"
              block
              color="warning"
              class="mb-2"
              prepend-icon="mdi-logout"
              :loading="isCheckingOut"
              @click="onCheckOut"
            >
              Check-out
            </v-btn>
            <v-btn
              v-if="['PENDING', 'CONFIRMED'].includes(reservation.status)"
              block
              color="error"
              variant="outlined"
              class="mb-2"
              prepend-icon="mdi-close"
              :loading="isCancelling"
              @click="onCancel"
            >
              Cancelar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error" variant="tonal"> No se encontró la reservación. </v-alert>
      </v-col>
    </v-row>

    <DrawerPanel />
  </v-container>
</template>

<script setup lang="ts">
import DrawerPanel from '@/modules/common/components/DrawerPanel.vue';
import { useAlert } from '@/modules/common/composables/useAlert';
import { useDrawer } from '@/modules/common/composables/useDrawer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ReservationForm from '../components/ReservationForm.vue';
import { reservationsService } from '../services/reservations.service';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { openDrawer } = useDrawer();
const { showAlert } = useAlert();

const reservationId = computed(() => route.params.id as string);

const { data: reservation, isLoading } = useQuery({
  queryKey: ['reservation', reservationId],
  queryFn: () => reservationsService.getById(reservationId.value),
  enabled: computed(() => !!reservationId.value),
});

const confirmMutation = useMutation({
  mutationFn: () => reservationsService.confirm(reservationId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    showAlert('Reservación confirmada', 'success');
  },
  onError: () => {
    showAlert('Error al confirmar la reservación', 'error');
  },
});

const checkInMutation = useMutation({
  mutationFn: () => reservationsService.checkIn(reservationId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    showAlert('Check-in realizado', 'success');
  },
  onError: () => {
    showAlert('Error al realizar check-in', 'error');
  },
});

const checkOutMutation = useMutation({
  mutationFn: () => reservationsService.checkOut(reservationId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    showAlert('Check-out realizado', 'success');
  },
  onError: () => {
    showAlert('Error al realizar check-out', 'error');
  },
});

const cancelMutation = useMutation({
  mutationFn: () => reservationsService.cancel(reservationId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    showAlert('Reservación cancelada', 'success');
  },
  onError: () => {
    showAlert('Error al cancelar la reservación', 'error');
  },
});

const isConfirming = computed(() => confirmMutation.isPending.value);
const isCheckingIn = computed(() => checkInMutation.isPending.value);
const isCheckingOut = computed(() => checkOutMutation.isPending.value);
const isCancelling = computed(() => cancelMutation.isPending.value);

const onEdit = () => {
  openDrawer({
    title: 'Editar Reservación',
    component: ReservationForm,
    props: {
      reservation: reservation.value,
      inDrawer: true,
    },
  });
};

const onConfirm = () => {
  confirmMutation.mutate();
};

const onCheckIn = () => {
  checkInMutation.mutate();
};

const onCheckOut = () => {
  checkOutMutation.mutate();
};

const onCancel = () => {
  cancelMutation.mutate();
};

const getStatusColor = (status: string): string => {
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

const getStatusLabel = (status: string): string => {
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

const getRoomTypeLabel = (type?: string): string => {
  if (!type) return '-';
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

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
</script>
