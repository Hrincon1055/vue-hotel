import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRef, type Ref } from 'vue';
import type {
  CreateMultiRoomReservationDto,
  MultiRoomReservationFilters,
} from '../interfaces/reservation.interface';
import { multiRoomReservationsService } from '../services/multiRoomReservations.service';

const QUERY_KEY = 'multi-room-reservations';

export function useMultiRoomReservation(id: MaybeRef<string>) {
  const {
    data: multiRoomReservation,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: computed(() => ['multi-room-reservation', toValue(id)]),
    queryFn: () => multiRoomReservationsService.getById(toValue(id)),
    enabled: computed(() => !!toValue(id)),
    refetchOnMount: 'always',
  });

  return { multiRoomReservation, isLoading, isFetching, isError, error, refetch };
}

export function useMultiRoomReservationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateMultiRoomReservationDto) => multiRoomReservationsService.create(dto),
    onSuccess: invalidate,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => multiRoomReservationsService.confirm(id),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => multiRoomReservationsService.cancel(id),
    onSuccess: invalidate,
  });

  return {
    create: createMutation.mutateAsync,
    confirm: confirmMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

export function useMultiRoomReservations(filters: Ref<MultiRoomReservationFilters>) {
  const queryClient = useQueryClient();

  const {
    data: multiRoomData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => multiRoomReservationsService.getAll(filters.value),
    refetchOnMount: 'always',
  });

  const multiRoomReservations = computed(() => multiRoomData.value?.data ?? []);
  const meta = computed(() => multiRoomData.value?.meta);
  const totalItems = computed(() => meta.value?.total ?? 0);
  const totalPages = computed(() => meta.value?.totalPages ?? 0);

  const createMutation = useMutation({
    mutationFn: (dto: CreateMultiRoomReservationDto) => multiRoomReservationsService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => multiRoomReservationsService.confirm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => multiRoomReservationsService.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => multiRoomReservationsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => multiRoomReservationsService.deleteMany(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    multiRoomReservations,
    meta,
    totalItems,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    create: createMutation.mutateAsync,
    confirm: confirmMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    removeMany: deleteManyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingMany: deleteManyMutation.isPending,
  };
}
