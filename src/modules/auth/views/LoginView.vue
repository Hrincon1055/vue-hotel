<template>
  <v-container class="login-container d-flex align-center justify-center" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-card-text>
            <v-form ref="formRef" v-model="valid" @submit.prevent="onSubmit">
              <v-text-field
                v-model="form.email"
                label="Correo electrónico"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.password"
                label="Contraseña"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                variant="outlined"
                :rules="passwordRules"
                required
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
              <v-checkbox v-model="form.remember" label="Recordarme" color="primary"></v-checkbox>
              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
                :disabled="!valid"
              >
                Ingresar
              </v-btn>
            </v-form>
          </v-card-text>
          <!-- <v-card-actions class="justify-center pb-4">
            <a href="#" class="text-primary">¿Olvidaste tu contraseña?</a>
          </v-card-actions> -->
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
/**imports */
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
/**code */
const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
  remember: false,
});

const emailRules = [
  (v: string) => !!v || 'El correo es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'El correo debe ser válido',
];

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
];

const onSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    const authResponse = await authService.login({
      email: form.email,
      password: form.password,
    });
    authStore.setAuth(authResponse.data);
    router.replace('/');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100dvh;
}
</style>
