<template>
  <form-header
    :title="isEditMode ? 'Editar' : 'Crear'"
    :subtitle="
      isEditMode
        ? 'Modifica los detalles de la reservación'
        : 'Ingresa los detalles de la nueva reservación'
    "
    :is-saving="isCreating || isUpdating"
    :is-valid="!!isValid"
    @cancel="handleCancel"
    @save="handleSubmit"
  />
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          v-model="form.customerId"
          label="Cliente"
          :items="customerOptions"
          :rules="[rules.required]"
          :loading="isLoadingCustomers"
          :disabled="isEditMode"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account"
          item-title="label"
          item-value="value"
          no-data-text="No se encontraron clientes"
        />
      </v-col>
      <v-col cols="12">
        <v-autocomplete
          v-model="form.roomId"
          label="Habitación"
          :items="roomOptions"
          :rules="[rules.required]"
          :loading="isLoadingRooms"
          :disabled="isEditMode"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-bed"
          item-title="label"
          item-value="value"
          no-data-text="No se encontraron habitaciones"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-date-input
          v-model="form.checkInDate"
          label="Fecha de Check-in"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-icon=""
          prepend-inner-icon="mdi-calendar-arrow-right"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-date-input
          v-model="form.checkOutDate"
          label="Fecha de Check-out"
          :rules="[rules.required, rules.checkOutAfterCheckIn]"
          variant="solo"
          density="comfortable"
          prepend-icon=""
          prepend-inner-icon="mdi-calendar-arrow-left"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model.number="form.adults"
          label="Adultos"
          type="number"
          :rules="[rules.required, rules.minValue(1)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account-multiple"
          min="1"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model.number="form.children"
          label="Niños"
          type="number"
          :rules="[rules.minValue(0)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account-child"
          min="0"
        />
      </v-col>
      <v-col v-if="isEditMode" cols="12">
        <v-select
          v-model="form.status"
          label="Estado"
          :items="statusOptions"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-flag"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="form.notes"
          label="Notas"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-note-text"
          rows="3"
          auto-grow
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
/**imports */
import FormHeader from '@/modules/common/components/FormHeader.vue';
import { useAlert } from '@/modules/common/composables/useAlert';
import { useDrawerStore } from '@/modules/common/store/drawer.store';
import { customersService } from '@/modules/customers/services/customers.service';
import { roomsService } from '@/modules/rooms/services/rooms.service';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useReservationMutations } from '../composables/useReservations';
import type {
  CreateReservationDto,
  Reservation,
  ReservationStatus,
  UpdateReservationDto,
} from '../interfaces/reservation.interface';

const props = defineProps<{
  reservation?: Reservation;
  inDrawer?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [reservation: Reservation];
}>();

const router = useRouter();
const { create, update, isCreating, isUpdating } = useReservationMutations();
const drawerStore = useDrawerStore();
const { showAlert } = useAlert();
const formRef = ref();
const isValid = ref(false);
const isEditMode = computed(() => !!props.reservation?.id);

// Customer and Room options
const customerOptions = ref<{ label: string; value: string }[]>([]);
const roomOptions = ref<{ label: string; value: string }[]>([]);
const isLoadingCustomers = ref(false);
const isLoadingRooms = ref(false);

interface FormData {
  customerId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  notes: string;
}

const form = ref<FormData>({
  customerId: '',
  roomId: '',
  checkInDate: '',
  checkOutDate: '',
  adults: 1,
  children: 0,
  status: 'PENDING',
  notes: '',
});

const statusOptions = [
  { title: 'Pendiente', value: 'PENDING' as ReservationStatus },
  { title: 'Confirmada', value: 'CONFIRMED' as ReservationStatus },
  { title: 'Check-in', value: 'CHECKED_IN' as ReservationStatus },
  { title: 'Check-out', value: 'CHECKED_OUT' as ReservationStatus },
  { title: 'Cancelada', value: 'CANCELLED' as ReservationStatus },
  { title: 'No Show', value: 'NO_SHOW' as ReservationStatus },
];

const rules = {
  required: (v: string | number) => !!v || v === 0 || 'Este campo es requerido',
  minValue: (min: number) => (v: number) => v >= min || `El valor mínimo es ${min}`,
  checkOutAfterCheckIn: (v: string) => {
    if (!form.value.checkInDate || !v) return true;
    return (
      new Date(v) > new Date(form.value.checkInDate) || 'Check-out debe ser posterior a check-in'
    );
  },
};

// Load customers
const loadCustomers = async () => {
  isLoadingCustomers.value = true;
  try {
    const response = await customersService.getAll({ limit: 100 });
    customerOptions.value = response.data.map((customer) => ({
      label: `${customer.firstName} ${customer.lastName} - ${customer.documentNumber}`,
      value: customer.id,
    }));
  } catch (error) {
    console.error('Error loading customers:', error);
  } finally {
    isLoadingCustomers.value = false;
  }
};

// Load rooms
const loadRooms = async () => {
  isLoadingRooms.value = true;
  try {
    const response = await roomsService.getAll({ limit: 100, status: 'AVAILABLE' });
    roomOptions.value = response.data.map((room) => ({
      label: `${room.number} - ${getRoomTypeLabel(room.type)} ($${room.pricePerNight}/noche)`,
      value: room.id,
    }));

    // If editing, add the current room if it's not in the list
    if (
      props.reservation?.room &&
      !roomOptions.value.some((r) => r.value === props.reservation?.roomId)
    ) {
      roomOptions.value.unshift({
        label: `${props.reservation.room.number} - ${getRoomTypeLabel(props.reservation.room.type)} ($${props.reservation.room.pricePerNight}/noche)`,
        value: props.reservation.roomId,
      });
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
  } finally {
    isLoadingRooms.value = false;
  }
};

const getRoomTypeLabel = (type: string): string => {
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

onMounted(() => {
  loadCustomers();
  loadRooms();
});

watch(
  () => props.reservation,
  (reservation) => {
    if (reservation) {
      form.value = {
        customerId: reservation.customerId,
        roomId: reservation.roomId,
        checkInDate: reservation.checkInDate?.split('T')[0] ?? '',
        checkOutDate: reservation.checkOutDate?.split('T')[0] ?? '',
        adults: reservation.adults,
        children: reservation.children,
        status: reservation.status,
        notes: reservation.notes ?? '',
      };
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    if (isEditMode.value && props.reservation) {
      const updateData: UpdateReservationDto = {
        checkInDate: form.value.checkInDate,
        checkOutDate: form.value.checkOutDate,
        adults: form.value.adults,
        children: form.value.children,
        notes: form.value.notes || undefined,
        status: form.value.status,
      };
      const updated = await update({ id: props.reservation.id, data: updateData });
      showAlert({ message: 'Reservación actualizada correctamente', type: 'success' });
      emit('saved', updated);
      if (props.inDrawer) {
        drawerStore.close();
      } else {
        router.push({ name: 'reservations-list' });
      }
    } else {
      const createData: CreateReservationDto = {
        customerId: form.value.customerId,
        roomId: form.value.roomId,
        checkInDate: form.value.checkInDate,
        checkOutDate: form.value.checkOutDate,
        adults: form.value.adults,
        children: form.value.children,
        notes: form.value.notes || undefined,
      };
      const created = await create(createData);
      showAlert({ message: 'Reservación creada correctamente', type: 'success' });
      emit('saved', created);
      if (props.inDrawer) {
        drawerStore.close();
      } else {
        router.push({ name: 'reservations-list' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    // El interceptor ya muestra el error del API
  }
};

const handleCancel = () => {
  if (props.inDrawer) {
    drawerStore.close();
  } else {
    router.push({ name: 'reservations-list' });
  }
};
</script>
