<template>
  <v-navigation-drawer
    v-model="isOpen"
    location="right"
    temporary
    :width="width"
    :persistent="persistent"
    disable-resize-watcher
    disable-route-watcher
    class="drawer-panel"
  >
    <!-- Header del drawer -->
    <template #prepend>
      <v-toolbar color="transparent" flat class="px-2 content-header">
        <v-avatar size="36" variant="tonal" class="mr-3 pa-5">
          <v-icon icon="mdi-package-variant-closed" size="18"></v-icon>
        </v-avatar>
        <div class="d-flex flex-column">
          <span class="text-body-1 font-weight-medium">{{ title }}</span>
        </div>
        <v-spacer />
        <!-- <v-tooltip text="Guardar" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-check"
              color="primary"
              size="small"
              class="ml-2"
              variant="tonal"
            ></v-btn>
          </template>
        </v-tooltip> -->
      </v-toolbar>
    </template>

    <!-- Contenido del drawer -->
    <v-container fluid class="pa-4">
      <component v-if="component" :is="component" v-bind="componentProps" @close="closeDrawer" />
      <slot v-else />
    </v-container>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDrawer } from '../composables/useDrawer';
const { isOpen, title, width, component, componentProps, persistent, closeDrawer } = useDrawer();
</script>

<style scoped>
.drawer-panel {
  z-index: 2000 !important;
  height: 100vh !important;
  top: 0 !important;
  position: fixed !important;
}
.content-header {
  border-bottom: 2px solid rgba(var(--v-border-color), 0.12);
}
</style>
