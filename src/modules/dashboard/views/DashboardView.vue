<template>
  <v-container fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold">Dashboard</h1>
            <p class="text-body-2 text-medium-emphasis">
              Resumen operativo del hotel • {{ formattedDate }}
            </p>
          </div>
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-refresh"
            :loading="isRefreshing"
            @click="refreshAll"
          >
            Actualizar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- KPIs -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Total Habitaciones"
          :value="roomStats?.total ?? 0"
          icon="mdi-door"
          color="primary"
          :loading="isLoadingStats"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Disponibles"
          :value="roomStats?.byStatus?.available ?? 0"
          icon="mdi-door-open"
          color="success"
          :loading="isLoadingStats"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Ocupadas"
          :value="roomStats?.byStatus?.occupied ?? 0"
          icon="mdi-door-closed"
          color="error"
          :loading="isLoadingStats"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Ocupación"
          :value="`${occupancyRate}%`"
          icon="mdi-chart-donut"
          color="info"
          :progress="occupancyRate"
          subtitle="del hotel"
          :loading="isLoadingStats"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Llegadas Hoy"
          :value="arrivalsCount"
          icon="mdi-airplane-landing"
          color="info"
          :loading="isLoadingArrivals"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Salidas Hoy"
          :value="departuresCount"
          icon="mdi-airplane-takeoff"
          color="warning"
          :loading="isLoadingDepartures"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="En Limpieza"
          :value="roomStats?.byStatus?.cleaning ?? 0"
          icon="mdi-broom"
          color="orange"
          :loading="isLoadingStats"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <stat-card
          title="Total Clientes"
          :value="customersCount ?? 0"
          icon="mdi-account-group"
          color="purple"
          :loading="isLoadingStats"
        />
      </v-col>
    </v-row>

    <!-- Tabs Section -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card variant="flat">
          <v-tabs v-model="activeTab" color="primary" grow>
            <v-tab value="arrivals">
              <v-icon start>mdi-airplane-landing</v-icon>
              Check-ins Hoy
              <v-chip v-if="arrivalsCount > 0" size="x-small" color="info" class="ml-2">
                {{ arrivalsCount }}
              </v-chip>
            </v-tab>
            <v-tab value="departures">
              <v-icon start>mdi-airplane-takeoff</v-icon>
              Check-outs Hoy
              <v-chip v-if="departuresCount > 0" size="x-small" color="warning" class="ml-2">
                {{ departuresCount }}
              </v-chip>
            </v-tab>
            <v-tab value="available">
              <v-icon start>mdi-door-open</v-icon>
              Disponibles
              <v-chip v-if="availableRooms.length > 0" size="x-small" color="success" class="ml-2">
                {{ availableRooms.length }}
              </v-chip>
            </v-tab>
            <v-tab value="occupied">
              <v-icon start>mdi-door-closed</v-icon>
              Ocupadas
              <v-chip v-if="occupiedRooms.length > 0" size="x-small" color="error" class="ml-2">
                {{ occupiedRooms.length }}
              </v-chip>
            </v-tab>
            <v-tab value="cleaning">
              <v-icon start>mdi-broom</v-icon>
              Limpieza
              <v-chip v-if="cleaningRooms.length > 0" size="x-small" color="orange" class="ml-2">
                {{ cleaningRooms.length }}
              </v-chip>
            </v-tab>
            <v-tab value="recent">
              <v-icon start>mdi-calendar-clock</v-icon>
              Recientes
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-tabs-window v-model="activeTab">
            <!-- Tab: Llegadas de Hoy -->
            <v-tabs-window-item value="arrivals">
              <v-card-text>
                <template v-if="isLoadingArrivals">
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                </template>
                <template v-else-if="todayArrivals.length > 0">
                  <reservation-item
                    v-for="reservation in paginatedArrivals"
                    :key="reservation.id"
                    :reservation="reservation"
                    @click="goToReservation"
                  />
                  <div v-if="arrivalsTotalPages > 1" class="d-flex justify-center mt-4">
                    <v-pagination
                      v-model="arrivalsPage"
                      :length="arrivalsTotalPages"
                      :total-visible="5"
                      density="compact"
                      rounded
                      color="primary"
                    />
                  </div>
                </template>
                <v-alert v-else type="info" variant="tonal">
                  No hay check-ins programados para hoy.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Tab: Salidas de Hoy -->
            <v-tabs-window-item value="departures">
              <v-card-text>
                <template v-if="isLoadingDepartures">
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                </template>
                <template v-else-if="todayDepartures.length > 0">
                  <reservation-item
                    v-for="reservation in paginatedDepartures"
                    :key="reservation.id"
                    :reservation="reservation"
                    @click="goToReservation"
                  />
                  <div v-if="departuresTotalPages > 1" class="d-flex justify-center mt-4">
                    <v-pagination
                      v-model="departuresPage"
                      :length="departuresTotalPages"
                      :total-visible="5"
                      density="compact"
                      rounded
                      color="primary"
                    />
                  </div>
                </template>
                <v-alert v-else type="info" variant="tonal">
                  No hay check-outs programados para hoy.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Tab: Habitaciones Disponibles -->
            <v-tabs-window-item value="available">
              <v-card-text>
                <template v-if="isLoadingRooms">
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                </template>
                <template v-else-if="availableRooms.length > 0">
                  <room-item
                    v-for="room in paginatedAvailableRooms"
                    :key="room.id"
                    :room="room"
                    @click="goToRoomsList('AVAILABLE')"
                  />
                  <div v-if="availableTotalPages > 1" class="d-flex justify-center mt-4">
                    <v-pagination
                      v-model="availablePage"
                      :length="availableTotalPages"
                      :total-visible="5"
                      density="compact"
                      rounded
                      color="primary"
                    />
                  </div>
                </template>
                <v-alert v-else type="warning" variant="tonal">
                  No hay habitaciones disponibles en este momento.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Tab: Habitaciones Ocupadas -->
            <v-tabs-window-item value="occupied">
              <v-card-text>
                <template v-if="isLoadingRooms">
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                </template>
                <template v-else-if="occupiedRooms.length > 0">
                  <room-item
                    v-for="room in paginatedOccupiedRooms"
                    :key="room.id"
                    :room="room"
                    @click="goToRoomsList('OCCUPIED')"
                  />
                  <div v-if="occupiedTotalPages > 1" class="d-flex justify-center mt-4">
                    <v-pagination
                      v-model="occupiedPage"
                      :length="occupiedTotalPages"
                      :total-visible="5"
                      density="compact"
                      rounded
                      color="primary"
                    />
                  </div>
                </template>
                <v-alert v-else type="success" variant="tonal">
                  No hay habitaciones ocupadas en este momento.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Tab: Habitaciones en Limpieza -->
            <v-tabs-window-item value="cleaning">
              <v-card-text>
                <template v-if="isLoadingRooms">
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                </template>
                <template v-else-if="cleaningRooms.length > 0">
                  <room-item
                    v-for="room in cleaningRooms"
                    :key="room.id"
                    :room="room"
                    @click="goToRoomsList('CLEANING')"
                  />
                </template>
                <v-alert v-else type="success" variant="tonal">
                  No hay habitaciones en limpieza en este momento.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>

            <!-- Tab: Reservas Recientes -->
            <v-tabs-window-item value="recent">
              <v-card-text>
                <template v-if="isLoadingRecent">
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                  <v-skeleton-loader type="list-item-avatar-two-line" :loading="true" />
                </template>
                <template v-else-if="recentReservations.length > 0">
                  <reservation-item
                    v-for="reservation in recentReservations"
                    :key="reservation.id"
                    :reservation="reservation"
                    @click="goToReservation"
                  />
                </template>
                <v-alert v-else type="info" variant="tonal">
                  No hay reservaciones recientes.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Reservation } from '@/modules/reservations/interfaces/reservation.interface';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ReservationItem from '../components/ReservationItem.vue';
import RoomItem from '../components/RoomItem.vue';
import StatCard from '../components/StatCard.vue';
import {
  useDashboardStats,
  useRecentReservations,
  useRoomsByStatus,
  useTodayReservations,
} from '../composables/useDashboard';

const router = useRouter();

// Composables
const {
  roomStats,
  customersCount,
  occupancyRate,
  isLoading: isLoadingStats,
  refetchAll: refetchStats,
} = useDashboardStats();
const {
  todayArrivals,
  todayDepartures,
  arrivalsCount,
  departuresCount,
  isLoadingArrivals,
  isLoadingDepartures,
  refetchArrivals,
  refetchDepartures,
} = useTodayReservations();
const {
  recentReservations,
  isLoading: isLoadingRecent,
  refetch: refetchRecent,
} = useRecentReservations();
const {
  availableRooms,
  occupiedRooms,
  cleaningRooms,
  isLoading: isLoadingRooms,
  refetchAll: refetchRooms,
} = useRoomsByStatus();

// State
const activeTab = ref('arrivals');
const isRefreshing = ref(false);
const availablePage = ref(1);
const occupiedPage = ref(1);
const arrivalsPage = ref(1);
const departuresPage = ref(1);
const itemsPerPage = 5;

// Computed for pagination - Arrivals
const paginatedArrivals = computed(() => {
  const start = (arrivalsPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return todayArrivals.value.slice(start, end);
});

const arrivalsTotalPages = computed(() => {
  return Math.ceil(todayArrivals.value.length / itemsPerPage);
});

// Computed for pagination - Departures
const paginatedDepartures = computed(() => {
  const start = (departuresPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return todayDepartures.value.slice(start, end);
});

const departuresTotalPages = computed(() => {
  return Math.ceil(todayDepartures.value.length / itemsPerPage);
});

// Computed for pagination - Available Rooms
const paginatedAvailableRooms = computed(() => {
  const start = (availablePage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return availableRooms.value.slice(start, end);
});

const availableTotalPages = computed(() => {
  return Math.ceil(availableRooms.value.length / itemsPerPage);
});

const paginatedOccupiedRooms = computed(() => {
  const start = (occupiedPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return occupiedRooms.value.slice(start, end);
});

const occupiedTotalPages = computed(() => {
  return Math.ceil(occupiedRooms.value.length / itemsPerPage);
});

// Computed
const formattedDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Methods
const refreshAll = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([
      refetchStats(),
      refetchArrivals(),
      refetchDepartures(),
      refetchRecent(),
      refetchRooms(),
    ]);
  } finally {
    isRefreshing.value = false;
  }
};

const goToReservation = (reservation: Reservation) => {
  router.push(`/reservations/${reservation.id}`);
};

const goToRoomsList = (status: string) => {
  router.push({ path: '/rooms', query: { status } });
};
</script>

<style scoped>
.v-tabs {
  border-bottom: none;
}
</style>
