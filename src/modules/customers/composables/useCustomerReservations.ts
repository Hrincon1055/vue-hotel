import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRef } from 'vue';
import { customersService } from '../services/customers.service';

const QUERY_KEY = 'customer-reservations';

export function useCustomerReservations(customerId: MaybeRef<string>) {
  const {
    data: reservations,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: computed(() => [QUERY_KEY, toValue(customerId)]),
    queryFn: () => customersService.getReservations(toValue(customerId)),
    enabled: computed(() => !!toValue(customerId)),
    refetchOnMount: 'always',
  });

  const reservationsList = computed(() => {
    const data = reservations.value;
    return Array.isArray(data) ? data : [];
  });
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
