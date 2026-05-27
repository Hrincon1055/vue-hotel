import { defineStore } from 'pinia';
import { ref, shallowRef, type Component } from 'vue';

export interface DrawerOptions {
  title?: string;
  width?: string | number;
  component?: Component;
  props?: Record<string, unknown>;
  persistent?: boolean;
}

export const useDrawerStore = defineStore('drawer', () => {
  const isOpen = ref(false);
  const title = ref('');
  const width = ref<string | number>(500);
  const component = shallowRef<Component | null>(null);
  const componentProps = ref<Record<string, unknown>>({});
  const persistent = ref(false);

  const open = (options: DrawerOptions = {}) => {
    title.value = options.title ?? '';
    width.value = options.width ?? 700;
    component.value = options.component ?? null;
    componentProps.value = options.props ?? {};
    persistent.value = options.persistent ?? false;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    setTimeout(() => {
      title.value = '';
      component.value = null;
      componentProps.value = {};
      persistent.value = false;
    }, 300);
  };

  const toggle = () => {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  };

  return {
    isOpen,
    title,
    width,
    component,
    componentProps,
    persistent,
    open,
    close,
    toggle,
  };
});
