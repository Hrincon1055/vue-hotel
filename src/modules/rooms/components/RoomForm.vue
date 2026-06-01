<template>
  <form-header
    :title="isEditMode ? 'Editar' : 'Crear'"
    :subtitle="
      isEditMode
        ? 'Modifica los detalles de la habitación'
        : 'Ingresa los detalles de la nueva habitación'
    "
    :is-saving="isCreating || isUpdating"
    :is-valid="!!isValid"
    @cancel="handleCancel"
    @save="handleSubmit"
  />
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.number"
          label="Número de Habitación"
          :rules="[rules.required]"
          :readonly="isEditMode"
          :hint="isEditMode ? 'No se puede modificar' : ''"
          :persistent-hint="isEditMode"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-door"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model.number="form.floor"
          label="Piso"
          type="number"
          :rules="[rules.required, rules.minValue(1)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-stairs"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.type"
          label="Tipo de Habitación"
          :items="typeOptions"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-bed"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.status"
          label="Estado"
          :items="statusOptions"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-tag"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model.number="form.pricePerNight"
          label="Precio por Noche"
          type="number"
          :rules="[rules.required, rules.minValue(0)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-currency-usd"
          prefix="COP $"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model.number="form.capacity"
          label="Capacidad"
          type="number"
          :rules="[rules.required, rules.minValue(1)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account-group"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="form.description"
          label="Descripción"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-text"
          rows="3"
        />
      </v-col>
      <v-col cols="12">
        <v-combobox
          v-model="form.amenities"
          label="Amenidades"
          :items="amenitiesOptions"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-star"
          multiple
          chips
          closable-chips
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
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoomMutations } from '../composables/useRooms';
import type {
  CreateRoomDto,
  Room,
  RoomStatus,
  RoomType,
  UpdateRoomDto,
} from '../interfaces/room.interface';

const props = defineProps<{
  room?: Room;
  inDrawer?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [room: Room];
}>();

const router = useRouter();
const { create, update, isCreating, isUpdating } = useRoomMutations();
const drawerStore = useDrawerStore();
const { showAlert } = useAlert();
const formRef = ref();
const isValid = ref(false);
const isEditMode = computed(() => !!props.room?.id);

interface FormData {
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  capacity: number;
  description: string;
  amenities: string[];
}

const form = ref<FormData>({
  number: '',
  floor: 1,
  type: 'SINGLE',
  status: 'AVAILABLE',
  pricePerNight: 0,
  capacity: 1,
  description: '',
  amenities: [],
});

const typeOptions = [
  { title: 'Individual', value: 'SINGLE' as RoomType },
  { title: 'Doble', value: 'DOUBLE' as RoomType },
  { title: 'Twin', value: 'TWIN' as RoomType },
  { title: 'Suite', value: 'SUITE' as RoomType },
  { title: 'Deluxe', value: 'DELUXE' as RoomType },
  { title: 'Presidencial', value: 'PRESIDENTIAL' as RoomType },
  { title: 'Familiar', value: 'FAMILY' as RoomType },
];

const statusOptions = [
  { title: 'Disponible', value: 'AVAILABLE' as RoomStatus },
  { title: 'Ocupada', value: 'OCCUPIED' as RoomStatus },
  { title: 'Reservada', value: 'RESERVED' as RoomStatus },
  { title: 'Limpieza', value: 'CLEANING' as RoomStatus },
  { title: 'Mantenimiento', value: 'MAINTENANCE' as RoomStatus },
  { title: 'Fuera de Servicio', value: 'OUT_OF_SERVICE' as RoomStatus },
];

const amenitiesOptions = [
  'WiFi',
  'TV',
  'Aire Acondicionado',
  'Mini Bar',
  'Caja Fuerte',
  'Balcón',
  'Vista al Mar',
  'Jacuzzi',
  'Cocina',
  'Sala de Estar',
];

const rules = {
  required: (v: unknown) => !!v || v === 0 || 'Este campo es requerido',
  minValue: (min: number) => (v: number) => v >= min || `El valor debe ser mayor o igual a ${min}`,
};

watch(
  () => props.room,
  (room) => {
    if (room) {
      form.value = {
        number: room.number,
        floor: room.floor,
        type: room.type,
        status: room.status,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        description: room.description || '',
        amenities: room.amenities || [],
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
    if (isEditMode.value && props.room) {
      const updateData: UpdateRoomDto = {
        floor: form.value.floor,
        type: form.value.type,
        status: form.value.status,
        pricePerNight: form.value.pricePerNight,
        capacity: form.value.capacity,
        description: form.value.description || undefined,
        amenities: form.value.amenities.length > 0 ? form.value.amenities : undefined,
      };
      await update({ id: props.room.id, data: updateData });
      showAlert({ message: 'Habitación actualizada correctamente', type: 'success' });
    } else {
      const createData: CreateRoomDto = {
        number: form.value.number,
        floor: form.value.floor,
        type: form.value.type,
        status: form.value.status,
        pricePerNight: form.value.pricePerNight,
        capacity: form.value.capacity,
        description: form.value.description || undefined,
        amenities: form.value.amenities.length > 0 ? form.value.amenities : undefined,
      };
      await create(createData);
      showAlert({ message: 'Habitación creada correctamente', type: 'success' });
    }

    if (props.inDrawer) {
      emit('close');
      drawerStore.close();
    } else {
      router.push('/rooms');
    }
  } catch {
    // El interceptor de Axios ya muestra el mensaje de error del API
  }
};

const handleCancel = () => {
  if (props.inDrawer) {
    emit('close');
    drawerStore.close();
  } else {
    router.push('/rooms');
  }
};

defineExpose({
  submit: handleSubmit,
  validate: () => formRef.value?.validate(),
  reset: () => formRef.value?.reset(),
});
</script>
