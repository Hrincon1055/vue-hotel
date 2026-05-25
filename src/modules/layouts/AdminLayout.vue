|
<template>
  <v-layout class="layout-container">
    <v-navigation-drawer v-model="drawer" :width="256">
      <v-list>
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
          subtitle="sandra_a88@gmailcom"
          title="Sandra Adams"
        ></v-list-item>
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
          prepend-icon="mdi-bed"
          title="Habitaciones"
          value="rooms"
          to="/rooms"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-app-bar density="default">
        <v-app-bar-nav-icon class="d-lg-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title>Vue Hotel</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-magnify"></v-btn>
        <v-btn icon="mdi-bell"></v-btn>
        <v-btn icon="mdi-account-circle"></v-btn>
      </v-app-bar>
      <v-container style="height: 100%">
        <!-- <v-card-text>
          The navigation drawer will appear from the bottom on smaller size screens.
        </v-card-text> -->
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const drawer = ref(true);
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}
</style>
