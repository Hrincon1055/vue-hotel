<template>
  <v-snackbar
    v-model="alertState.show"
    :timeout="alertState.timeout"
    :color="alertColors[alertState.type]"
    location="bottom"
    variant="outlined"
  >
    <v-icon :icon="alertIcons[alertState.type]" class="mr-2" />
    <span>{{ alertState.message }}</span>
    <template #actions>
      <v-btn variant="text" @click="hideAlert"> Cerrar </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { alertIcons, useAlert, type AlertType } from '../composables/useAlert';
const { alertState, hideAlert } = useAlert();

// Colores según el tipo de alerta
const alertColors: Record<AlertType, string> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};
</script>
