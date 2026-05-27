import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import type {
  ChangePasswordDto,
  CreateEmployeeDto,
  EmployeeFilters,
  UpdateEmployeeDto,
} from '../interfaces/employee.interface';
import { employeesService } from '../services/employees.service';

const QUERY_KEY = 'employees';

export function useEmployees(filters: Ref<EmployeeFilters>) {
  const queryClient = useQueryClient();

  const {
    data: employeesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => employeesService.getAll(filters.value),
  });

  const employees = computed(() => employeesData.value?.data ?? []);
  const meta = computed(() => employeesData.value?.meta);
  const totalItems = computed(() => meta.value?.total ?? 0);
  const totalPages = computed(() => meta.value?.totalPages ?? 0);

  const createMutation = useMutation({
    mutationFn: (employee: CreateEmployeeDto) => employeesService.create(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => employeesService.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordDto }) =>
      employeesService.changePassword(id, data),
  });

  return {
    // Data
    employees,
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
    changePassword: changePasswordMutation.mutateAsync,
    // Estados de mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingMany: deleteManyMutation.isPending,
  };
}
