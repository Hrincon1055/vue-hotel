import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import type {
  CheckInDto,
  CheckOutDto,
  CreateReservationDto,
  ReservationFilters,
  UpdateReservationDto,
} from '../interfaces/reservation.interface';
import { reservationsService } from '../services/reservations.service';

const QUERY_KEY = 'reservations';

// Composable solo para mutaciones (sin query) - usar en formularios y vistas de detalle
export function useReservationMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (reservation: CreateReservationDto) => reservationsService.create(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationDto }) =>
      reservationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => reservationsService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CheckInDto }) =>
      reservationsService.checkIn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CheckOutDto }) =>
      reservationsService.checkOut(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => reservationsService.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    confirm: confirmMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    noShow: noShowMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isMarkingNoShow: noShowMutation.isPending,
  };
}

export function useReservations(filters: Ref<ReservationFilters>) {
  const queryClient = useQueryClient();

  const {
    data: reservationsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => reservationsService.getAll(filters.value),
  });

  const reservations = computed(() => reservationsData.value?.data ?? []);
  const meta = computed(() => reservationsData.value?.meta);
  const totalItems = computed(() => meta.value?.total ?? 0);
  const totalPages = computed(() => meta.value?.totalPages ?? 0);

  const createMutation = useMutation({
    mutationFn: (reservation: CreateReservationDto) => reservationsService.create(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationDto }) =>
      reservationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reservationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => reservationsService.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => reservationsService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CheckInDto }) =>
      reservationsService.checkIn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CheckOutDto }) =>
      reservationsService.checkOut(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => reservationsService.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    // Data
    reservations,
    meta,
    totalItems,
    totalPages,
    // Estado
    isLoading,
    isFetching,
    isError,
    error,
    // Acciones
    refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    removeMany: deleteManyMutation.mutateAsync,
    confirm: confirmMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    noShow: noShowMutation.mutateAsync,
    // Estados de mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingMany: deleteManyMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isMarkingNoShow: noShowMutation.isPending,
  };
}

// Composable para obtener llegadas y salidas de hoy
export function useTodayReservations() {
  const {
    data: arrivalsData,
    isLoading: isLoadingArrivals,
    refetch: refetchArrivals,
  } = useQuery({
    queryKey: [QUERY_KEY, 'today-arrivals'],
    queryFn: () => reservationsService.getTodayArrivals(),
  });

  const {
    data: departuresData,
    isLoading: isLoadingDepartures,
    refetch: refetchDepartures,
  } = useQuery({
    queryKey: [QUERY_KEY, 'today-departures'],
    queryFn: () => reservationsService.getTodayDepartures(),
  });

  const arrivals = computed(() => arrivalsData.value ?? []);
  const departures = computed(() => departuresData.value ?? []);

  return {
    arrivals,
    departures,
    isLoadingArrivals,
    isLoadingDepartures,
    refetchArrivals,
    refetchDepartures,
  };
}
