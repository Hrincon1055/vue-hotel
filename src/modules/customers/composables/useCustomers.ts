import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import type {
  CreateCustomerDto,
  CustomerFilters,
  UpdateCustomerDto,
} from '../interfaces/customer.interface';
import { customersService } from '../services/customers.service';

const QUERY_KEY = 'customers';

export function useCustomers(filters: Ref<CustomerFilters>) {
  const queryClient = useQueryClient();

  const {
    data: customersData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => customersService.getAll(filters.value),
  });

  const customers = computed(() => customersData.value?.data ?? []);
  const meta = computed(() => customersData.value?.meta);
  const totalItems = computed(() => meta.value?.total ?? 0);
  const totalPages = computed(() => meta.value?.totalPages ?? 0);

  const createMutation = useMutation({
    mutationFn: (customer: CreateCustomerDto) => customersService.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      customersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => customersService.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => customersService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    // Data
    customers,
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
    // Estados de mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingMany: deleteManyMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}
