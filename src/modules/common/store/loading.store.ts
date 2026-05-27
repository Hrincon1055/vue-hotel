import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  const counter = ref(0);

  const show = () => {
    counter.value++;
    isLoading.value = true;
  };

  const hide = () => {
    counter.value = Math.max(0, counter.value - 1);
    if (counter.value === 0) {
      isLoading.value = false;
    }
  };

  const forceHide = () => {
    counter.value = 0;
    isLoading.value = false;
  };

  return {
    isLoading,
    show,
    hide,
    forceHide,
  };
});
