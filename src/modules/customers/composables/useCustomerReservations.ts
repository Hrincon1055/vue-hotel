import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { customersService } from '../services/customers.service';

const QUERY_KEY = 'customer-reservations';

export function useCustomerReservations(customerId: Ref<string>) {
  const {
    data: reservations,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY, customerId],
    queryFn: () => customersService.getReservations(customerId.value),
    enabled: computed(() => !!customerId.value),
  });

  const reservationsList = computed(() => reservations.value ?? []);
  const totalReservations = computed(() => reservationsList.value.length);

  return {
    // Data
    reservations: reservationsList,
    totalReservations,
    // Estado
    isLoading,
    isFetching,
    isError,
    error,
    // Acciones
    refetch,
  };
}
