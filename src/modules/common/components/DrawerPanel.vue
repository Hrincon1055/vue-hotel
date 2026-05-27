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
    <v-container fluid class="pa-4">
      <component v-if="component" :is="component" v-bind="componentProps" @close="closeDrawer" />
      <slot v-else />
    </v-container>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDrawer } from '../composables/useDrawer';
const { isOpen, width, component, componentProps, persistent, closeDrawer } = useDrawer();
</script>

<style scoped>
.drawer-panel {
  z-index: 2000 !important;
  height: 100vh !important;
  top: 0 !important;
  position: fixed !important;
}
</style>
