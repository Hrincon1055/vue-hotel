<template>
  <form-header
    :title="isEditMode ? 'Editar' : 'Crear'"
    :subtitle="
      isEditMode ? 'Modifica los detalles del empleado' : 'Ingresa los detalles del nuevo empleado'
    "
    :is-saving="isCreating || isUpdating"
    :is-valid="isValid"
    @cancel="handleCancel"
    @save="handleSubmit"
  />
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.firstName"
          label="Nombre"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.lastName"
          label="Apellido"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account"
        />
      </v-col>
      <v-col v-if="!isEditMode" cols="12">
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[rules.required, rules.email]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-email"
        />
      </v-col>
      <v-col v-if="!isEditMode" cols="12" sm="6">
        <v-text-field
          v-model="form.password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.required, rules.minLength(6)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-col>
      <v-col v-if="!isEditMode" cols="12" sm="6">
        <v-text-field
          v-model="confirmPassword"
          label="Confirmar Contraseña"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.required, rules.match(form.password)]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-lock-check"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.role"
          label="Rol"
          :items="roleOptions"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-shield-account"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.status"
          label="Estado"
          :items="statusOptions"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-account-check"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
/**imports */
import { capitalize, normalizeEmail } from '@/helpers/utils';
import FormHeader from '@/modules/common/components/FormHeader.vue';
import { useAlert } from '@/modules/common/composables/useAlert';
import { useDrawerStore } from '@/modules/common/store/drawer.store';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useEmployees } from '../composables/useEmployees';
/**code */
import type {
  CreateEmployeeDto,
  Employee,
  EmployeeFilters,
  EmployeeRole,
  EmployeeStatus,
  UpdateEmployeeDto,
} from '../interfaces/employee.interface';

const props = defineProps<{
  employee?: Employee;
  inDrawer?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [employee: Employee];
}>();

const router = useRouter();
const filters = ref<EmployeeFilters>({});
const { create, update, isCreating, isUpdating } = useEmployees(filters);
const drawerStore = useDrawerStore();
const { showAlert } = useAlert();
const formRef = ref();
const isValid = ref(false);
const showPassword = ref(false);
const confirmPassword = ref('');
const isEditMode = computed(() => !!props.employee?.id);
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: EmployeeRole;
  status: EmployeeStatus;
}

const form = ref<FormData>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'RECEPTIONIST',
  status: 'ACTIVE',
});

const roleOptions = [
  { title: 'Administrador', value: 'ADMIN' as EmployeeRole },
  { title: 'Gerente', value: 'MANAGER' as EmployeeRole },
  { title: 'Recepcionista', value: 'RECEPTIONIST' as EmployeeRole },
  { title: 'Limpieza', value: 'HOUSEKEEPING' as EmployeeRole },
];

const statusOptions = [
  { title: 'Activo', value: 'ACTIVE' as EmployeeStatus },
  { title: 'Inactivo', value: 'INACTIVE' as EmployeeStatus },
  { title: 'De permiso', value: 'ON_LEAVE' as EmployeeStatus },
  { title: 'Terminado', value: 'TERMINATED' as EmployeeStatus },
];

const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email inválido',
  minLength: (min: number) => (v: string) => (v && v.length >= min) || `Mínimo ${min} caracteres`,
  match: (password: string) => (v: string) => v === password || 'Las contraseñas no coinciden',
};

watch(
  () => props.employee,
  (employee) => {
    if (employee) {
      form.value = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        password: '',
        role: employee.role,
        status: employee.status,
      };
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.inDrawer) {
    drawerStore.$patch({
      componentProps: {
        ...drawerStore.componentProps,
        _saveHandler: handleSubmit,
      },
    });
  }
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    if (isEditMode.value && props.employee) {
      const updateData: UpdateEmployeeDto = {
        firstName: capitalize(form.value.firstName),
        lastName: capitalize(form.value.lastName),
        role: form.value.role,
        status: form.value.status,
      };
      await update({ id: props.employee.id, data: updateData });
      showAlert({ message: 'Empleado actualizado correctamente', type: 'success' });
    } else {
      const createData: CreateEmployeeDto = {
        firstName: capitalize(form.value.firstName),
        lastName: capitalize(form.value.lastName),
        email: normalizeEmail(form.value.email),
        password: form.value.password!,
        role: form.value.role,
        status: form.value.status,
      };
      await create(createData);
      showAlert({ message: 'Empleado creado correctamente', type: 'success' });
    }

    if (props.inDrawer) {
      emit('close');
      drawerStore.close();
    } else {
      router.push('/employees');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert({
      message: isEditMode.value ? 'Error al actualizar el empleado' : 'Error al crear el empleado',
      type: 'error',
    });
  }
};

const handleCancel = () => {
  if (props.inDrawer) {
    emit('close');
    drawerStore.close();
  } else {
    router.push('/employees');
  }
};

defineExpose({
  submit: handleSubmit,
  validate: () => formRef.value?.validate(),
  reset: () => formRef.value?.reset(),
});
</script>

<style scoped>
.content-header {
  border-bottom: 2px solid rgba(var(--v-border-color), 0.12);
  margin-bottom: 16px;
}
.subtitle-text {
  font-size: 0.8rem;
  line-height: 1.2;
}
</style>
