<template>
  <v-toolbar color="transparent" flat class="px-2 content-header">
    <v-avatar size="36" variant="tonal" class="mr-3 pa-5">
      <v-icon :icon="icon" size="18"></v-icon>
    </v-avatar>
    <div class="d-flex flex-column">
      <span class="text-disabled subtitle-text">{{ subtitle }}</span>
      <span class="text-body-1 font-weight-medium">{{ title }}</span>
    </div>
    <v-spacer />
    <span v-if="hasSelection" class="text-body-2 mr-4">
      {{ selectedItems.length }} seleccionado{{ selectedItems.length > 1 ? 's' : '' }}
    </span>
    <span v-else-if="itemCount" class="text-body-2 text-medium-emphasis mr-4">
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
      <v-btn
        v-else
        icon="mdi-magnify"
        size="small"
        variant="text"
        @click="showSearch = true"
      ></v-btn>
    </Transition>
    <v-tooltip v-if="hasSelection" text="Eliminar" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="mdi-delete"
          color="error"
          size="small"
          class="ml-2"
          variant="tonal"
          @click="onDelete"
        ></v-btn>
      </template>
    </v-tooltip>
    <v-tooltip v-if="canEdit" text="Editar" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="mdi-pencil"
          color="info"
          size="small"
          class="ml-2"
          variant="tonal"
          @click="onEdit"
        ></v-btn>
      </template>
    </v-tooltip>
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
import { computed, ref, toRaw } from 'vue';

interface Props {
  title: string;
  createRoute: string;
  subtitle?: string;
  icon?: string;
  itemCount?: number;
  selectedItems?: Record<string, unknown>[];
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-document-outline',
  subtitle: 'Content',
  selectedItems: () => [],
});

const emit = defineEmits<{
  search: [value: string];
  delete: [items: Record<string, unknown>[]];
  edit: [item: Record<string, unknown>];
}>();

const showSearch = ref(false);
const searchValue = ref('');

const itemCountText = computed(() => {
  if (!props.itemCount) return '';
  if (props.itemCount === 1) return 'One Item';
  return `${props.itemCount} Items`;
});

const hasSelection = computed(() => props.selectedItems.length > 0);

const canEdit = computed(() => props.selectedItems.length === 1);

const onSearch = (value: string) => {
  emit('search', value);
};

const onDelete = () => {
  const rawItems = toRaw(props.selectedItems);
  const cleanItems = JSON.parse(JSON.stringify(rawItems)) as Record<string, unknown>[];
  emit('delete', cleanItems);
};

const onEdit = () => {
  if (props.selectedItems[0]) {
    const rawItem = toRaw(props.selectedItems[0]);
    const cleanItem = JSON.parse(JSON.stringify(rawItem)) as Record<string, unknown>;
    emit('edit', cleanItem);
  }
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
