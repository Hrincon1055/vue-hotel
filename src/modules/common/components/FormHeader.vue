<template>
  <v-toolbar color="transparent" flat class="content-header">
    <v-avatar size="36" variant="tonal" class="mr-3 pa-5">
      <v-icon icon="mdi-package-variant-closed" size="18"></v-icon>
    </v-avatar>
    <div class="d-flex flex-column">
      <span class="text-disabled subtitle-text">{{ subtitle }}</span>
      <span class="text-body-1 font-weight-medium">{{ title }}</span>
    </div>
    <v-spacer />
    <v-tooltip text="Cancelar" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="mdi-close"
          color="secondary"
          size="small"
          class="ml-2"
          variant="tonal"
          @click="handleCancel"
          type="button"
        ></v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="Guardar" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="mdi-check"
          color="primary"
          size="small"
          class="ml-2"
          variant="tonal"
          :loading="isSaving"
          :disabled="!isValid"
          @click="handleSave"
          type="button"
        ></v-btn>
      </template>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
/**code */
defineProps<{
  title: string;
  subtitle: string;
  isSaving: boolean;
  isValid: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [];
}>();

const handleCancel = () => {
  emit('cancel');
};

const handleSave = () => {
  emit('save');
};
</script>

<style scoped>
.subtitle-text {
  font-size: 0.8rem;
  line-height: 1.2;
}
</style>
