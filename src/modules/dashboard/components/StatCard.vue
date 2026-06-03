<template>
  <v-card
    :color="color"
    variant="tonal"
    class="stat-card"
    :class="{ 'stat-card--clickable': clickable }"
    @click="handleClick"
  >
    <v-card-item>
      <template #prepend>
        <v-avatar :color="color" variant="flat" size="48">
          <v-icon :icon="icon" size="24" />
        </v-avatar>
      </template>
      <v-card-title class="text-h4 font-weight-bold">
        <template v-if="loading">
          <v-skeleton-loader type="text" width="60" />
        </template>
        <template v-else>
          {{ formattedValue }}
        </template>
      </v-card-title>
      <v-card-subtitle class="text-body-2">
        {{ title }}
      </v-card-subtitle>
    </v-card-item>
    <v-card-text v-if="progress !== undefined" class="pt-0">
      <v-progress-linear :model-value="progress" :color="color" height="6" rounded class="mt-2" />
      <div class="text-caption text-medium-emphasis mt-1">{{ progress }}% {{ subtitle }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
  progress?: number;
  loading?: boolean;
  clickable?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('es-ES');
  }
  return props.value;
});
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.stat-card--clickable {
  cursor: pointer;
}

.stat-card--clickable:hover {
  transform: translateY(-2px);
}
</style>
