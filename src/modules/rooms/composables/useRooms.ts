import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import type {
  CreateRoomDto,
  RoomFilters,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from '../interfaces/room.interface';
import { roomsService } from '../services/rooms.service';

const QUERY_KEY = 'rooms';

export function useRooms(filters: Ref<RoomFilters>) {
  const queryClient = useQueryClient();

  const {
    data: roomsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => roomsService.getAll(filters.value),
  });

  const rooms = computed(() => roomsData.value?.data ?? []);
  const meta = computed(() => roomsData.value?.meta);
  const totalItems = computed(() => meta.value?.total ?? 0);
  const totalPages = computed(() => meta.value?.totalPages ?? 0);

  const createMutation = useMutation({
    mutationFn: (room: CreateRoomDto) => roomsService.create(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomDto }) =>
      roomsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => roomsService.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => roomsService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomStatusDto }) =>
      roomsService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    // Data
    rooms,
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
    restore: restoreMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    // Estados de mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingMany: deleteManyMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
