<template>
  <v-toolbar color="transparent" flat class="px-2 content-header">
    <v-avatar size="36" variant="tonal" class="mr-3 pa-5">
      <v-icon :icon="icon" size="18"></v-icon>
    </v-avatar>
    <div class="d-flex flex-column">
      <span class="text-disabled subtitle-text">{{ subtitle }}</span>
      <span class="text-body-1 font-weight-medium">{{ title }}</span>
    </div>
    <v-spacer></v-spacer>
    <span v-if="itemCount" class="text-body-2 text-medium-emphasis mr-4">
      {{ itemCountText }}
    </span>
    <Transition name="search-grow" mode="out-in">
      <v-text-field
        v-if="showSearch"
        v-model="searchValue"
        density="compact"
        variant="plain"
        placeholder="Buscar..."
        prepend-inner-icon="mdi-magnify"
        hide-details
        single-line
        autofocus
        class="search-field mr-2"
        style="max-width: 200px"
        @update:model-value="onSearch"
        @blur="onBlur"
      ></v-text-field>
      <v-btn v-else icon="mdi-magnify" variant="text" @click="showSearch = true"></v-btn>
    </Transition>
    <v-tooltip text="Crear item" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="mdi-plus"
          color="primary"
          size="small"
          class="ml-2"
          variant="tonal"
          :to="createRoute"
        ></v-btn>
      </template>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  title: string;
  createRoute: string;
  subtitle?: string;
  icon?: string;
  itemCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-document-outline',
  subtitle: 'Content',
});

const emit = defineEmits<{
  search: [value: string];
}>();

const showSearch = ref(false);
const searchValue = ref('');

const itemCountText = computed(() => {
  if (!props.itemCount) return '';
  if (props.itemCount === 1) return 'One Item';
  return `${props.itemCount} Items`;
});

const onSearch = (value: string) => {
  emit('search', value);
};

const onBlur = () => {
  if (!searchValue.value.trim()) {
    showSearch.value = false;
  }
};
</script>

<style scoped>
.content-header {
  border-bottom: 2px solid rgba(var(--v-border-color), 0.12);
}

.subtitle-text {
  font-size: 0.8rem;
  line-height: 1.2;
}

.search-field :deep(.v-field) {
  border-radius: 8px;
}

/* Animación de crecimiento */
.search-grow-enter-active {
  animation: grow-in 0.25s ease-out;
}

.search-grow-leave-active {
  animation: grow-in 0.2s ease-in reverse;
}

@keyframes grow-in {
  0% {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: right;
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
    transform-origin: right;
  }
}
</style>
