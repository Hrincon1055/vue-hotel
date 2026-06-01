<template>
  <form-header
    :title="isEditMode ? 'Editar' : 'Crear'"
    :subtitle="
      isEditMode ? 'Modifica los detalles del cliente' : 'Ingresa los detalles del nuevo cliente'
    "
    :is-saving="isCreating || isUpdating"
    :is-valid="!!isValid"
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
      <v-col cols="12" sm="6">
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
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.phone"
          label="Teléfono"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-phone"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.documentType"
          label="Tipo de Documento"
          :items="documentTypeOptions"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-card-account-details"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.documentNumber"
          label="Número de Documento"
          :rules="[rules.required]"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-identifier"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="form.address"
          label="Dirección"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-map-marker"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.nationality"
          label="Nacionalidad"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-flag"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.birthDate"
          label="Fecha de Nacimiento"
          type="date"
          variant="solo"
          density="comfortable"
          prepend-inner-icon="mdi-calendar"
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
import { useCustomers } from '../composables/useCustomers';
import type {
  CreateCustomerDto,
  Customer,
  CustomerFilters,
  DocumentType,
  UpdateCustomerDto,
} from '../interfaces/customer.interface';

const props = defineProps<{
  customer?: Customer;
  inDrawer?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [customer: Customer];
}>();

const router = useRouter();
const filters = ref<CustomerFilters>({});
const { create, update, isCreating, isUpdating } = useCustomers(filters);
const drawerStore = useDrawerStore();
const { showAlert } = useAlert();
const formRef = ref();
const isValid = ref(false);
const isEditMode = computed(() => !!props.customer?.id);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  address: string;
  nationality: string;
  birthDate: string;
}

const form = ref<FormData>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  documentType: 'NATIONAL_ID',
  documentNumber: '',
  address: '',
  nationality: '',
  birthDate: '',
});

const documentTypeOptions = [
  { title: 'Pasaporte', value: 'PASSPORT' as DocumentType },
  { title: 'Cédula de Identidad', value: 'NATIONAL_ID' as DocumentType },
  { title: 'Licencia de Conducir', value: 'DRIVERS_LICENSE' as DocumentType },
  { title: 'Otro', value: 'OTHER' as DocumentType },
];

const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email inválido',
};

watch(
  () => props.customer,
  (customer) => {
    if (customer) {
      form.value = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        documentType: customer.documentType,
        documentNumber: customer.documentNumber,
        address: customer.address || '',
        nationality: customer.nationality || '',
        birthDate: customer.birthDate || '',
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
    if (isEditMode.value && props.customer) {
      const updateData: UpdateCustomerDto = {
        firstName: capitalize(form.value.firstName),
        lastName: capitalize(form.value.lastName),
        email: normalizeEmail(form.value.email),
        phone: form.value.phone || undefined,
        documentType: form.value.documentType,
        documentNumber: form.value.documentNumber,
        address: form.value.address || undefined,
        nationality: form.value.nationality || undefined,
        birthDate: form.value.birthDate || undefined,
      };
      await update({ id: props.customer.id, data: updateData });
      showAlert({ message: 'Cliente actualizado correctamente', type: 'success' });
    } else {
      const createData: CreateCustomerDto = {
        firstName: capitalize(form.value.firstName),
        lastName: capitalize(form.value.lastName),
        email: normalizeEmail(form.value.email),
        phone: form.value.phone || undefined,
        documentType: form.value.documentType,
        documentNumber: form.value.documentNumber,
        address: form.value.address || undefined,
        nationality: form.value.nationality || undefined,
        birthDate: form.value.birthDate || undefined,
      };
      await create(createData);
      showAlert({ message: 'Cliente creado correctamente', type: 'success' });
    }

    if (props.inDrawer) {
      emit('close');
      drawerStore.close();
    } else {
      router.push('/customers');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert({
      message: isEditMode.value ? 'Error al actualizar el cliente' : 'Error al crear el cliente',
      type: 'error',
    });
  }
};

const handleCancel = () => {
  if (props.inDrawer) {
    emit('close');
    drawerStore.close();
  } else {
    router.push('/customers');
  }
};
</script>
