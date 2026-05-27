import { storeToRefs } from 'pinia';
import { useLoadingStore } from '../store/loading.store';

export function useLoading() {
  const loadingStore = useLoadingStore();
  const { isLoading } = storeToRefs(loadingStore);

  const showLoading = () => {
    loadingStore.show();
  };

  const hideLoading = () => {
    loadingStore.hide();
  };

  const forceHideLoading = () => {
    loadingStore.forceHide();
  };

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    showLoading();
    try {
      return await fn();
    } finally {
      hideLoading();
    }
  };

  return {
    isLoading,
    showLoading,
    hideLoading,
    forceHideLoading,
    withLoading,
  };
}
