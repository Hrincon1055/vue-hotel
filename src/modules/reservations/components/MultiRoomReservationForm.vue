<template>
  <form-header
    :title="isEditMode ? 'Ver Reserva Multi-Hab.' : 'Nueva Reserva Multi-Hab.'"
    :subtitle="
      isEditMode
        ? 'Detalles del grupo de habitaciones reservadas'
        : 'Reserva múltiples habitaciones en una sola operación'
    "
    :is-saving="isCreating"
    :is-valid="isFormValid"
    @cancel="handleCancel"
    @save="handleSubmit"
  />
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <!-- Cliente -->
    <v-row>
      <v-col cols="12">
        <v-autocomplete
          v-model="form.customerId"
          label="Cliente"
          :items="customerOptions"
          :rules="[rules.required]"
          :loading="isLoadingCustomers"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account"
          item-title="label"
          item-value="value"
          no-data-text="No se encontraron clientes"
        />
      </v-col>

      <!-- Fechas compartidas -->
      <v-col cols="12" sm="6">
        <v-date-input
          v-model="form.checkInDate"
          label="Fecha de Check-in"
          :rules="[rules.required]"
          :min="today"
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
          :min="minCheckOutDate"
          variant="solo"
          density="comfortable"
          prepend-icon=""
          prepend-inner-icon="mdi-calendar-arrow-left"
        />
      </v-col>

      <!-- Notas generales -->
      <v-col cols="12">
        <v-textarea
          v-model="form.notes"
          label="Notas generales"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-note-text"
          rows="2"
          auto-grow
        />
      </v-col>
    </v-row>

    <!-- Habitaciones -->
    <v-divider class="my-4" />
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-subtitle-1 font-weight-medium">
        <v-icon class="mr-1">mdi-bed-double</v-icon>
        Habitaciones ({{ form.rooms.length }})
      </span>
      <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" @click="addRoom">
        Agregar habitación
      </v-btn>
    </div>

    <v-alert v-if="form.rooms.length === 0" type="info" variant="tonal" class="mb-4">
      Agrega al menos una habitación para continuar.
    </v-alert>

    <v-card v-for="(room, index) in form.rooms" :key="index" variant="outlined" class="mb-3">
      <v-card-title class="text-subtitle-2 d-flex align-center justify-space-between py-2 px-4">
        <span>Habitación {{ index + 1 }}</span>
        <v-btn
          v-if="form.rooms.length > 1"
          icon="mdi-delete"
          size="x-small"
          color="error"
          variant="text"
          @click="removeRoom(index)"
        />
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="room.roomId"
              label="Habitación"
              :items="getAvailableRoomOptions(index)"
              :rules="[rules.required]"
              :loading="isLoadingRooms"
              variant="solo"
              density="comfortable"
              prepend-inner-icon="mdi-bed"
              item-title="label"
              item-value="value"
              no-data-text="No hay habitaciones disponibles"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="room.adults"
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
              v-model.number="room.children"
              label="Niños"
              type="number"
              :rules="[rules.minValue(0)]"
              variant="solo"
              density="comfortable"
              prepend-inner-icon="mdi-account-child"
              min="0"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="room.notes"
              label="Notas de la habitación"
              variant="solo"
              density="comfortable"
              prepend-inner-icon="mdi-note-outline"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import FormHeader from '@/modules/common/components/FormHeader.vue';
import { useAlert } from '@/modules/common/composables/useAlert';
import { useDrawerStore } from '@/modules/common/store/drawer.store';
import { customersService } from '@/modules/customers/services/customers.service';
import { roomsService } from '@/modules/rooms/services/rooms.service';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMultiRoomReservationMutations } from '../composables/useMultiRoomReservations';
import type { CreateMultiRoomReservationRoomDto } from '../interfaces/reservation.interface';

const props = defineProps<{
  inDrawer?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const router = useRouter();
const { create, isCreating } = useMultiRoomReservationMutations();
const drawerStore = useDrawerStore();
const { showAlert } = useAlert();

const formRef = ref();
const isValid = ref(false);
const isEditMode = false;

// Opciones
const customerOptions = ref<{ label: string; value: string }[]>([]);
const roomOptions = ref<{ label: string; value: string }[]>([]);
const isLoadingCustomers = ref(false);
const isLoadingRooms = ref(false);

// Date constraints
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const minCheckOutDate = computed(() => {
  if (form.value.checkInDate) {
    const checkIn = new Date(form.value.checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn;
  }
  const nextDay = new Date(today);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
});

interface RoomEntry extends CreateMultiRoomReservationRoomDto {
  roomId: string;
  adults: number;
  children: number;
  notes: string;
}

const form = ref<{
  customerId: string;
  checkInDate: string;
  checkOutDate: string;
  notes: string;
  rooms: RoomEntry[];
}>({
  customerId: '',
  checkInDate: '',
  checkOutDate: '',
  notes: '',
  rooms: [{ roomId: '', adults: 1, children: 0, notes: '' }],
});

const isFormValid = computed(() => {
  return isValid.value && form.value.rooms.length > 0 && form.value.rooms.every((r) => !!r.roomId);
});

const rules = {
  required: (v: string | number) => !!v || v === 0 || 'Este campo es requerido',
  minValue: (min: number) => (v: number) => v >= min || `El valor mínimo es ${min}`,
  checkOutAfterCheckIn: (v: string) => {
    if (!form.value.checkInDate || !v) return true;
    return (
      new Date(v) > new Date(form.value.checkInDate) || 'Check-out debe ser posterior al check-in'
    );
  },
};

// Opciones de habitaciones excluyendo las ya seleccionadas en otras filas
const getAvailableRoomOptions = (currentIndex: number) => {
  const selectedIds = new Set(
    form.value.rooms
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.roomId)
      .filter(Boolean),
  );
  return roomOptions.value.filter((opt) => !selectedIds.has(opt.value));
};

const addRoom = () => {
  form.value.rooms.push({ roomId: '', adults: 1, children: 0, notes: '' });
};

const removeRoom = (index: number) => {
  form.value.rooms.splice(index, 1);
};

const loadCustomers = async () => {
  isLoadingCustomers.value = true;
  try {
    const response = await customersService.getAll({ limit: 100 });
    customerOptions.value = response.data.map((c) => ({
      label: `${c.firstName} ${c.lastName} - ${c.documentNumber}`,
      value: c.id,
    }));
  } finally {
    isLoadingCustomers.value = false;
  }
};

const loadRooms = async () => {
  isLoadingRooms.value = true;
  try {
    const response = await roomsService.getAll({ limit: 100, status: 'AVAILABLE' });
    roomOptions.value = response.data.map((room) => ({
      label: `${room.number} - ${getRoomTypeLabel(room.type)} ($${room.pricePerNight}/noche)`,
      value: room.id,
    }));
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

const toDateString = (val: unknown): string => {
  if (!val) return '';
  const raw = val instanceof Date ? val.toISOString() : String(val);
  const parts = raw.split('T');
  return parts.length > 0 ? (parts[0] as string) : raw;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid || form.value.rooms.length === 0) return;

  try {
    await create({
      customerId: form.value.customerId,
      checkInDate: toDateString(form.value.checkInDate),
      checkOutDate: toDateString(form.value.checkOutDate),
      notes: form.value.notes || undefined,
      rooms: form.value.rooms.map((r) => ({
        roomId: r.roomId,
        adults: r.adults,
        children: r.children,
        notes: r.notes || undefined,
      })),
    });

    showAlert({ message: 'Reserva multi-habitación creada exitosamente', type: 'success' });

    if (props.inDrawer) {
      emit('saved');
      drawerStore.close();
    } else {
      router.push({ name: 'reservations-multi-list' });
    }
  } catch {
    // El interceptor de Axios ya maneja el error
  }
};

const handleCancel = () => {
  if (props.inDrawer) {
    drawerStore.close();
  } else {
    router.push({ name: 'reservations-multi-list' });
  }
};
</script>
