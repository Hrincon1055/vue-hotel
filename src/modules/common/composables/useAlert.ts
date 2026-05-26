import { ref } from 'vue';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  message: string;
  type?: AlertType;
  timeout?: number;
  title?: string;
}

interface AlertState {
  show: boolean;
  message: string;
  type: AlertType;
  timeout: number;
  title: string;
}

// Estado global reactivo para las alertas
const alertState = ref<AlertState>({
  show: false,
  message: '',
  type: 'info',
  timeout: 5000,
  title: '',
});

// Iconos según el tipo de alerta
export const alertIcons: Record<AlertType, string> = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information',
};

// Títulos por defecto según el tipo
const defaultTitles: Record<AlertType, string> = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información',
};

export function useAlert() {
  const showAlert = (options: AlertOptions) => {
    const type = options.type || 'info';
    alertState.value = {
      show: true,
      message: options.message,
      type,
      timeout: options.timeout ?? 5000,
      title: options.title || defaultTitles[type],
    };
  };

  const showSuccess = (message: string, title?: string) => {
    showAlert({ message, type: 'success', title });
  };

  const showError = (message: string, title?: string) => {
    showAlert({ message, type: 'error', title, timeout: 8000 });
  };

  const showWarning = (message: string, title?: string) => {
    showAlert({ message, type: 'warning', title });
  };

  const showInfo = (message: string, title?: string) => {
    showAlert({ message, type: 'info', title });
  };

  const hideAlert = () => {
    alertState.value.show = false;
  };

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    alertIcons,
  };
}
