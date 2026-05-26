import { storeToRefs } from 'pinia';
import { useDrawerStore, type DrawerOptions } from '../store/drawer.store';

export function useDrawer() {
  const drawerStore = useDrawerStore();
  const { isOpen, title, width, component, componentProps, persistent } = storeToRefs(drawerStore);

  const openDrawer = (options?: DrawerOptions) => {
    drawerStore.open(options);
  };

  const closeDrawer = () => {
    drawerStore.close();
  };

  const toggleDrawer = () => {
    drawerStore.toggle();
  };

  return {
    // Estado reactivo
    isOpen,
    title,
    width,
    component,
    componentProps,
    persistent,
    // Métodos
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
}
