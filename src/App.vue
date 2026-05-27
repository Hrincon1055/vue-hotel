<template>
  <GlobalLoading />
  <router-view />
  <AlertNotification />

  <VueQueryDevtools />
</template>

<script setup lang="ts">
import AlertNotification from '@/modules/common/components/AlertNotification.vue';
import GlobalLoading from '@/modules/common/components/GlobalLoading.vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
</script>
