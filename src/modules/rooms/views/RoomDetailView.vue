<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          color="primary"
          prepend-icon="mdi-arrow-left"
          class="mb-4"
          @click="goBack"
        >
          Volver a Habitaciones
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="room">
      <v-row>
        <v-col cols="12" md="8">
          <v-card variant="outlined" class="mb-4">
            <v-card-item>
              <template #prepend>
                <v-avatar color="primary" size="56">
                  <v-icon size="28">mdi-door</v-icon>
                </v-avatar>
              </template>
              <v-card-title class="text-h5">Habitación {{ room.number }}</v-card-title>
              <v-card-subtitle>
                Piso {{ room.floor }} · {{ getTypeLabel(room.type) }}
              </v-card-subtitle>
              <template #append>
                <v-chip :color="getStatusColor(room.status)" label>
                  {{ getStatusLabel(room.status) }}
                </v-chip>
              </template>
            </v-card-item>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col cols="6" sm="3">
                  <div class="text-caption text-medium-emphasis">Precio/Noche</div>
                  <div class="text-h6">${{ room.pricePerNight.toFixed(2) }}</div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="text-caption text-medium-emphasis">Capacidad</div>
                  <div class="text-h6">
                    <v-icon size="small" class="mr-1">mdi-account</v-icon>
                    {{ room.capacity }} personas
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="text-caption text-medium-emphasis">Creado</div>
                  <div class="text-body-1">{{ formatDate(room.createdAt) }}</div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="text-caption text-medium-emphasis">Actualizado</div>
                  <div class="text-body-1">{{ formatDate(room.updatedAt) }}</div>
                </v-col>
              </v-row>
              <v-row v-if="room.description" class="mt-4">
                <v-col cols="12">
                  <div class="text-caption text-medium-emphasis">Descripción</div>
                  <div class="text-body-1">{{ room.description }}</div>
                </v-col>
              </v-row>
              <v-row v-if="room.amenities && room.amenities.length > 0" class="mt-4">
                <v-col cols="12">
                  <div class="text-caption text-medium-emphasis mb-2">Amenidades</div>
                  <v-chip
                    v-for="amenity in room.amenities"
                    :key="amenity"
                    class="mr-2 mb-2"
                    size="small"
                    variant="tonal"
                  >
                    {{ amenity }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title>Acciones</v-card-title>
            <v-card-text>
              <v-btn
                block
                color="primary"
                variant="tonal"
                class="mb-2"
                prepend-icon="mdi-pencil"
                @click="editRoom"
              >
                Editar Habitación
              </v-btn>
              <v-btn
                block
                color="warning"
                variant="tonal"
                class="mb-2"
                prepend-icon="mdi-tag"
                @click="changeStatusDialog = true"
              >
                Cambiar Estado
              </v-btn>
              <v-btn
                block
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="deleteDialog = true"
              >
                Eliminar
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="warning" variant="tonal"> Habitación no encontrada. </v-alert>
      </v-col>
    </v-row>

    <!-- Dialog para cambiar estado -->
    <v-dialog v-model="changeStatusDialog" max-width="400">
      <v-card>
        <v-card-title>Cambiar Estado</v-card-title>
        <v-card-text>
          <v-select
            v-model="newStatus"
            label="Nuevo Estado"
            :items="statusOptions"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="changeStatusDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            :loading="isUpdatingStatus"
            @click="confirmChangeStatus"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar esta habitación? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" :loading="isDeleting" @click="confirmDelete">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useAlert } from '@/modules/common/composables/useAlert';
import { useQuery } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRooms } from '../composables/useRooms';
import type { RoomFilters, RoomStatus } from '../interfaces/room.interface';
import { roomsService } from '../services/rooms.service';

const route = useRoute();
const router = useRouter();
const { showAlert } = useAlert();

const roomId = ref(route.params.id as string);
const filters = ref<RoomFilters>({});
const { remove, updateStatus, isDeleting, isUpdatingStatus } = useRooms(filters);

watch(
  () => route.params.id,
  (newId) => {
    roomId.value = newId as string;
  },
);

const { data: room, isLoading } = useQuery({
  queryKey: ['room', roomId],
  queryFn: () => roomsService.getById(roomId.value),
  enabled: computed(() => !!roomId.value),
});

const deleteDialog = ref(false);
const changeStatusDialog = ref(false);
const newStatus = ref<RoomStatus>('AVAILABLE');

const statusOptions = [
  { title: 'Disponible', value: 'AVAILABLE' as RoomStatus },
  { title: 'Ocupada', value: 'OCCUPIED' as RoomStatus },
  { title: 'Reservada', value: 'RESERVED' as RoomStatus },
  { title: 'Limpieza', value: 'CLEANING' as RoomStatus },
  { title: 'Mantenimiento', value: 'MAINTENANCE' as RoomStatus },
  { title: 'Fuera de Servicio', value: 'OUT_OF_SERVICE' as RoomStatus },
];

watch(
  room,
  (r) => {
    if (r) {
      newStatus.value = r.status;
    }
  },
  { immediate: true },
);

const getTypeLabel = (type: string): string => {
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

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    AVAILABLE: 'success',
    OCCUPIED: 'error',
    RESERVED: 'warning',
    CLEANING: 'info',
    MAINTENANCE: 'orange',
    OUT_OF_SERVICE: 'grey',
  };
  return colors[status] ?? 'grey';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
    CLEANING: 'Limpieza',
    MAINTENANCE: 'Mantenimiento',
    OUT_OF_SERVICE: 'Fuera de Servicio',
  };
  return labels[status] ?? status;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const goBack = () => {
  router.push('/rooms');
};

const editRoom = () => {
  router.push(`/rooms/${roomId.value}/edit`);
};

const confirmChangeStatus = async () => {
  try {
    await updateStatus({ id: roomId.value, data: { status: newStatus.value } });
    changeStatusDialog.value = false;
    showAlert({ message: 'Estado actualizado correctamente', type: 'success' });
  } catch {
    showAlert({ message: 'Error al actualizar el estado', type: 'error' });
  }
};

const confirmDelete = async () => {
  try {
    await remove(roomId.value);
    deleteDialog.value = false;
    showAlert({ message: 'Habitación eliminada correctamente', type: 'success' });
    router.push('/rooms');
  } catch {
    showAlert({ message: 'Error al eliminar la habitación', type: 'error' });
  }
};
</script>
