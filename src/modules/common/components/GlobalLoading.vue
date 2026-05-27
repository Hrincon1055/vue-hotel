<template>
  <v-progress-linear v-if="isLoading" indeterminate color="primary" class="global-loading" />
</template>

<script setup lang="ts">
import { useLoading } from '../composables/useLoading';

const { isLoading } = useLoading();
</script>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2000;
}
</style>
