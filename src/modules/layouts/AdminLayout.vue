<template>
  <v-layout class="layout-container">
    <v-navigation-drawer v-model="drawer" :width="256">
      <v-list>
        <v-list-item :subtitle="user?.email" :title="fullName">
          <template #prepend>
            <v-avatar color="primary" size="40">
              <span class="text-h6">{{ userInitials }}</span>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav color="primary">
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          to="/dashboard"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Empleados"
          value="employees"
          to="/employees"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Clientes"
          value="customers"
          to="/customers"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-bed"
          title="Habitaciones"
          value="rooms"
          to="/rooms"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-calendar-check"
          title="Reservaciones"
          value="reservations"
          to="/reservations"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-app-bar density="default">
        <v-app-bar-nav-icon class="d-lg-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title>
          <router-link to="/dashboard" class="text-decoration-none text-primary">
            Hotel Manager
          </router-link>
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <!-- <v-btn icon="mdi-magnify"></v-btn>
        <v-btn icon="mdi-bell"></v-btn>
        <v-btn icon="mdi-account-circle"></v-btn> -->
      </v-app-bar>
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

const drawer = ref(true);

const authStore = useAuthStore();
const { user, fullName } = storeToRefs(authStore);

const userInitials = computed(() => {
  if (!user.value) return '';
  const first = user.value.firstName?.charAt(0) || '';
  const last = user.value.lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
});
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}
</style>
