import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { dashboardService } from '../services/dashboard.service';

const QUERY_KEY = 'dashboard';

export function useDashboardStats() {
  const {
    data: roomStats,
    isLoading: isLoadingRoomStats,
    refetch: refetchRoomStats,
  } = useQuery({
    queryKey: [QUERY_KEY, 'room-stats'],
    queryFn: () => dashboardService.getRoomStats(),
    staleTime: 30000, // 30 segundos
  });

  const {
    data: reservationsStats,
    isLoading: isLoadingReservationsStats,
    refetch: refetchReservationsStats,
  } = useQuery({
    queryKey: [QUERY_KEY, 'reservations-stats'],
    queryFn: () => dashboardService.getReservationsStats(),
    staleTime: 30000,
  });

  const {
    data: customersCount,
    isLoading: isLoadingCustomersCount,
    refetch: refetchCustomersCount,
  } = useQuery({
    queryKey: [QUERY_KEY, 'customers-count'],
    queryFn: () => dashboardService.getCustomersCount(),
    staleTime: 60000, // 1 minuto
  });

  const occupancyRate = computed(() => {
    if (!roomStats.value) return 0;
    // El API ya devuelve occupancyRate calculado
    return Number.parseFloat(roomStats.value.occupancyRate) || 0;
  });

  const isLoading = computed(
    () =>
      isLoadingRoomStats.value || isLoadingReservationsStats.value || isLoadingCustomersCount.value,
  );

  const refetchAll = () => {
    refetchRoomStats();
    refetchReservationsStats();
    refetchCustomersCount();
  };

  return {
    roomStats,
    reservationsStats,
    customersCount,
    occupancyRate,
    isLoading,
    refetchAll,
  };
}

export function useTodayReservations() {
  const {
    data: todayArrivals,
    isLoading: isLoadingArrivals,
    refetch: refetchArrivals,
  } = useQuery({
    queryKey: [QUERY_KEY, 'today-arrivals'],
    queryFn: () => dashboardService.getTodayArrivals(),
    staleTime: 30000,
  });

  const {
    data: todayDepartures,
    isLoading: isLoadingDepartures,
    refetch: refetchDepartures,
  } = useQuery({
    queryKey: [QUERY_KEY, 'today-departures'],
    queryFn: () => dashboardService.getTodayDepartures(),
    staleTime: 30000,
  });

  const arrivalsCount = computed(() => todayArrivals.value?.length ?? 0);
  const departuresCount = computed(() => todayDepartures.value?.length ?? 0);

  return {
    todayArrivals: computed(() => todayArrivals.value ?? []),
    todayDepartures: computed(() => todayDepartures.value ?? []),
    arrivalsCount,
    departuresCount,
    isLoadingArrivals,
    isLoadingDepartures,
    refetchArrivals,
    refetchDepartures,
  };
}

export function useRecentReservations() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEY, 'recent-reservations'],
    queryFn: () => dashboardService.getRecentReservations(10),
    staleTime: 30000,
  });

  return {
    recentReservations: computed(() => data.value ?? []),
    isLoading,
    refetch,
  };
}

export function useRoomsByStatus() {
  const {
    data: availableRooms,
    isLoading: isLoadingAvailable,
    refetch: refetchAvailable,
  } = useQuery({
    queryKey: [QUERY_KEY, 'available-rooms'],
    queryFn: () => dashboardService.getAvailableRooms(),
    staleTime: 30000,
  });

  const {
    data: occupiedRooms,
    isLoading: isLoadingOccupied,
    refetch: refetchOccupied,
  } = useQuery({
    queryKey: [QUERY_KEY, 'occupied-rooms'],
    queryFn: () => dashboardService.getOccupiedRooms(),
    staleTime: 30000,
  });

  const {
    data: cleaningRooms,
    isLoading: isLoadingCleaning,
    refetch: refetchCleaning,
  } = useQuery({
    queryKey: [QUERY_KEY, 'cleaning-rooms'],
    queryFn: () => dashboardService.getCleaningRooms(),
    staleTime: 30000,
  });

  const {
    data: maintenanceRooms,
    isLoading: isLoadingMaintenance,
    refetch: refetchMaintenance,
  } = useQuery({
    queryKey: [QUERY_KEY, 'maintenance-rooms'],
    queryFn: () => dashboardService.getMaintenanceRooms(),
    staleTime: 30000,
  });

  const isLoading = computed(
    () =>
      isLoadingAvailable.value ||
      isLoadingOccupied.value ||
      isLoadingCleaning.value ||
      isLoadingMaintenance.value,
  );

  const refetchAll = () => {
    refetchAvailable();
    refetchOccupied();
    refetchCleaning();
    refetchMaintenance();
  };

  return {
    availableRooms: computed(() => availableRooms.value ?? []),
    occupiedRooms: computed(() => occupiedRooms.value ?? []),
    cleaningRooms: computed(() => cleaningRooms.value ?? []),
    maintenanceRooms: computed(() => maintenanceRooms.value ?? []),
    isLoading,
    refetchAll,
  };
}
