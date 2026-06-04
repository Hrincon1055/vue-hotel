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
            Reservación {{ reservation.reservationCode }}
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
            <v-btn
              block
              color="secondary"
              class="mb-2"
              prepend-icon="mdi-printer"
              @click="onPrintPdf"
            >
              Imprimir PDF
            </v-btn>
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
            <v-btn
              v-if="['PENDING', 'CONFIRMED'].includes(reservation.status)"
              block
              color="grey-darken-1"
              variant="outlined"
              class="mb-2"
              prepend-icon="mdi-account-off"
              :loading="isNoShow"
              @click="onNoShow"
            >
              No Show
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
import { generateReservationPdf } from '@/helpers/reservationPdf';
import DrawerPanel from '@/modules/common/components/DrawerPanel.vue';
import { useAlert } from '@/modules/common/composables/useAlert';
import { useDrawer } from '@/modules/common/composables/useDrawer';
import { useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ReservationForm from '../components/ReservationForm.vue';
import { useReservation, useReservationMutations } from '../composables/useReservations';

const route = useRoute();
const queryClient = useQueryClient();
const { openDrawer } = useDrawer();
const { showAlert } = useAlert();

const {
  confirm,
  checkIn,
  checkOut,
  cancel,
  noShow,
  isConfirming,
  isCheckingIn,
  isCheckingOut,
  isCancelling,
  isMarkingNoShow: isNoShow,
} = useReservationMutations();

const reservationId = computed(() => route.params.id as string);

const { reservation, isLoading } = useReservation(reservationId);

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

const onPrintPdf = () => {
  if (!reservation.value) return;
  generateReservationPdf({
    reservationCode: reservation.value.reservationCode,
    createdAt: reservation.value.createdAt,
    checkInDate: reservation.value.checkInDate,
    checkOutDate: reservation.value.checkOutDate,
    customer: {
      firstName: reservation.value.customer?.firstName ?? '',
      lastName: reservation.value.customer?.lastName ?? '',
      email: reservation.value.customer?.email,
      phone: reservation.value.customer?.phone,
      documentType: reservation.value.customer?.documentType,
      documentNumber: reservation.value.customer?.documentNumber,
    },
    room: {
      number: reservation.value.room?.number ?? '',
      type: reservation.value.room?.type ?? '',
    },
    adults: reservation.value.adults,
    children: reservation.value.children,
    totalAmount: reservation.value.totalAmount,
    status: reservation.value.status,
    notes: reservation.value.notes,
  });
};

const onConfirm = async () => {
  try {
    await confirm(reservationId.value);
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    showAlert({ message: 'Reservación confirmada', type: 'success' });
  } catch {
    // El interceptor ya muestra el error
  }
};

const onCheckIn = async () => {
  try {
    await checkIn({ id: reservationId.value });
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    showAlert({ message: 'Check-in realizado', type: 'success' });
  } catch {
    // El interceptor ya muestra el error
  }
};

const onCheckOut = async () => {
  try {
    await checkOut({ id: reservationId.value });
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    showAlert({ message: 'Check-out realizado', type: 'success' });
  } catch {
    // El interceptor ya muestra el error
  }
};

const onCancel = async () => {
  try {
    await cancel(reservationId.value);
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    showAlert({ message: 'Reservación cancelada', type: 'success' });
  } catch {
    // El interceptor ya muestra el error
  }
};

const onNoShow = async () => {
  try {
    await noShow(reservationId.value);
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    showAlert({ message: 'Reservación marcada como No Show', type: 'success' });
  } catch {
    // El interceptor ya muestra el error
  }
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
