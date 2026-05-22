<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Hotel Dashboard</v-app-bar-title>
      <v-spacer></v-spacer>

      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <v-btn icon>
        <v-badge color="error" content="3" floating>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="32" color="secondary">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-account" title="Perfil"></v-list-item>
          <v-list-item prepend-icon="mdi-cog" title="Configuración"></v-list-item>
          <v-divider></v-divider>
          <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        title="Admin Hotel"
        subtitle="admin@hotel.com"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.title"
          @click="selectedMenu = item.title"
          :active="selectedMenu === item.title"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="primary" variant="tonal">
            <v-icon start>mdi-help-circle</v-icon>
            Ayuda
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <!-- Breadcrumbs -->
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <!-- Stats Cards -->
        <v-row>
          <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" lg="3">
            <v-card :color="stat.color" variant="tonal">
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text-medium-emphasis">{{ stat.title }}</div>
                    <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
                    <div class="text-caption">
                      <v-icon :color="stat.trend > 0 ? 'success' : 'error'" size="small">
                        {{ stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                      </v-icon>
                      {{ Math.abs(stat.trend) }}% vs mes anterior
                    </div>
                  </div>
                  <v-avatar :color="stat.color" size="56">
                    <v-icon size="32">{{ stat.icon }}</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts and Tables Row -->
        <v-row class="mt-4">
          <!-- Progress Section -->
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>
                <v-icon start>mdi-chart-donut</v-icon>
                Ocupación por Tipo
              </v-card-title>
              <v-card-text>
                <div v-for="room in roomTypes" :key="room.type" class="mb-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span>{{ room.type }}</span>
                    <span class="text-medium-emphasis">{{ room.occupied }}/{{ room.total }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(room.occupied / room.total) * 100"
                    :color="room.color"
                    height="8"
                    rounded
                  ></v-progress-linear>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Recent Bookings Table -->
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon start>mdi-calendar-check</v-icon>
                Reservas Recientes
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  density="compact"
                  label="Buscar"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details
                  single-line
                  style="max-width: 250px"
                ></v-text-field>
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="bookings"
                :search="search"
                :items-per-page="5"
                density="comfortable"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip :color="getStatusColor(item.status)" size="small" label>
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" variant="text" @click="viewBooking(item)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="text" @click="editBooking(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabs Section -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card>
              <v-tabs v-model="tab" color="primary">
                <v-tab value="rooms">
                  <v-icon start>mdi-bed</v-icon>
                  Habitaciones
                </v-tab>
                <v-tab value="guests">
                  <v-icon start>mdi-account-group</v-icon>
                  Huéspedes
                </v-tab>
                <v-tab value="services">
                  <v-icon start>mdi-room-service</v-icon>
                  Servicios
                </v-tab>
              </v-tabs>

              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="rooms">
                  <v-container fluid>
                    <v-row>
                      <v-col
                        v-for="room in rooms"
                        :key="room.number"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                      >
                        <v-card :color="room.available ? 'success' : 'error'" variant="outlined">
                          <v-card-title class="d-flex align-center">
                            <v-icon start>mdi-door</v-icon>
                            Habitación {{ room.number }}
                            <v-spacer></v-spacer>
                            <v-chip :color="room.available ? 'success' : 'error'" size="small">
                              {{ room.available ? 'Disponible' : 'Ocupada' }}
                            </v-chip>
                          </v-card-title>
                          <v-card-text>
                            <div><strong>Tipo:</strong> {{ room.type }}</div>
                            <div><strong>Precio:</strong> ${{ room.price }}/noche</div>
                            <div class="mt-2">
                              <v-chip
                                v-for="amenity in room.amenities"
                                :key="amenity"
                                size="x-small"
                                class="mr-1 mb-1"
                              >
                                {{ amenity }}
                              </v-chip>
                            </div>
                          </v-card-text>
                          <v-card-actions>
                            <v-btn variant="text" color="primary">Ver detalles</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                              v-if="room.available"
                              variant="tonal"
                              color="success"
                              @click="openBookingDialog(room)"
                            >
                              Reservar
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-tabs-window-item>

                <v-tabs-window-item value="guests">
                  <v-container fluid>
                    <v-list lines="two">
                      <v-list-item
                        v-for="guest in guests"
                        :key="guest.id"
                        :prepend-avatar="guest.avatar"
                        :title="guest.name"
                        :subtitle="`${guest.email} • Habitación ${guest.room}`"
                      >
                        <template v-slot:append>
                          <v-chip color="info" size="small" class="mr-2">
                            {{ guest.nights }} noches
                          </v-chip>
                          <v-btn icon variant="text" size="small">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-container>
                </v-tabs-window-item>

                <v-tabs-window-item value="services">
                  <v-container fluid>
                    <v-row>
                      <v-col
                        v-for="service in services"
                        :key="service.name"
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-card>
                          <v-img :src="service.image" height="150" cover>
                            <template v-slot:placeholder>
                              <v-row class="fill-height ma-0" align="center" justify="center">
                                <v-progress-circular
                                  indeterminate
                                  color="primary"
                                ></v-progress-circular>
                              </v-row>
                            </template>
                          </v-img>
                          <v-card-title>{{ service.name }}</v-card-title>
                          <v-card-subtitle>{{ service.description }}</v-card-subtitle>
                          <v-card-text>
                            <v-rating
                              :model-value="service.rating"
                              color="amber"
                              density="compact"
                              half-increments
                              readonly
                              size="small"
                            ></v-rating>
                            <span class="text-caption ml-2">({{ service.reviews }} reseñas)</span>
                          </v-card-text>
                          <v-card-actions>
                            <span class="text-h6 text-primary">${{ service.price }}</span>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" variant="elevated">Reservar</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card>
          </v-col>
        </v-row>

        <!-- Form Section -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>
                <v-icon start>mdi-form-textbox</v-icon>
                Nueva Reserva Rápida
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="formValid">
                  <v-text-field
                    v-model="formData.name"
                    label="Nombre del huésped"
                    prepend-inner-icon="mdi-account"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    prepend-inner-icon="mdi-email"
                    :rules="[rules.required, rules.email]"
                    variant="outlined"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="formData.phone"
                    label="Teléfono"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                    class="mb-3"
                  ></v-text-field>

                  <v-select
                    v-model="formData.roomType"
                    :items="['Simple', 'Doble', 'Suite', 'Deluxe']"
                    label="Tipo de habitación"
                    prepend-inner-icon="mdi-bed"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-3"
                  ></v-select>

                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="formData.checkIn"
                        label="Check-in"
                        type="date"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="formData.checkOut"
                        label="Check-out"
                        type="date"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-slider
                    v-model="formData.guests"
                    :min="1"
                    :max="6"
                    :step="1"
                    label="Número de huéspedes"
                    thumb-label
                    class="mt-4"
                  ></v-slider>

                  <v-checkbox
                    v-model="formData.breakfast"
                    label="Incluir desayuno"
                    color="primary"
                  ></v-checkbox>

                  <v-switch
                    v-model="formData.parking"
                    label="Estacionamiento"
                    color="primary"
                    inset
                  ></v-switch>

                  <v-textarea
                    v-model="formData.notes"
                    label="Notas especiales"
                    prepend-inner-icon="mdi-note"
                    variant="outlined"
                    rows="3"
                  ></v-textarea>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn variant="text" @click="resetForm">Limpiar</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  variant="elevated"
                  :disabled="!formValid"
                  :loading="loading"
                  @click="submitForm"
                >
                  <v-icon start>mdi-check</v-icon>
                  Crear Reserva
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Timeline & Alerts -->
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title>
                <v-icon start>mdi-timeline</v-icon>
                Actividad Reciente
              </v-card-title>
              <v-card-text>
                <v-timeline side="end" density="compact">
                  <v-timeline-item
                    v-for="activity in activities"
                    :key="activity.id"
                    :dot-color="activity.color"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ activity.time }}</span>
                    </template>
                    <div>
                      <strong>{{ activity.title }}</strong>
                      <div class="text-caption">{{ activity.description }}</div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>

            <!-- Alerts -->
            <v-alert type="success" variant="tonal" class="mb-3" closable>
              <v-alert-title>Ocupación alta</v-alert-title>
              El hotel tiene un 85% de ocupación este fin de semana.
            </v-alert>

            <v-alert type="warning" variant="tonal" class="mb-3" closable>
              <v-alert-title>Mantenimiento programado</v-alert-title>
              Habitaciones 201-205 en mantenimiento hasta el viernes.
            </v-alert>

            <v-alert type="info" variant="tonal" closable>
              <v-alert-title>Nueva promoción</v-alert-title>
              20% de descuento en reservas de más de 5 noches.
            </v-alert>
          </v-col>
        </v-row>

        <!-- Bottom Components -->
        <v-row class="mt-4">
          <!-- Expansion Panels -->
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>
                <v-icon start>mdi-frequently-asked-questions</v-icon>
                Preguntas Frecuentes
              </v-card-title>
              <v-card-text>
                <v-expansion-panels>
                  <v-expansion-panel
                    v-for="faq in faqs"
                    :key="faq.question"
                    :title="faq.question"
                    :text="faq.answer"
                  ></v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Chips Group -->
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>
                <v-icon start>mdi-tag-multiple</v-icon>
                Filtros Rápidos
              </v-card-title>
              <v-card-text>
                <div class="text-subtitle-2 mb-2">Estado de habitación</div>
                <v-chip-group v-model="selectedStatus" column>
                  <v-chip filter value="all" color="primary">Todas</v-chip>
                  <v-chip filter value="available" color="success">Disponibles</v-chip>
                  <v-chip filter value="occupied" color="error">Ocupadas</v-chip>
                  <v-chip filter value="maintenance" color="warning">Mantenimiento</v-chip>
                  <v-chip filter value="cleaning" color="info">Limpieza</v-chip>
                </v-chip-group>

                <v-divider class="my-4"></v-divider>

                <div class="text-subtitle-2 mb-2">Amenidades</div>
                <v-chip-group v-model="selectedAmenities" column multiple>
                  <v-chip filter value="wifi" prepend-icon="mdi-wifi">WiFi</v-chip>
                  <v-chip filter value="tv" prepend-icon="mdi-television">TV</v-chip>
                  <v-chip filter value="minibar" prepend-icon="mdi-fridge">Minibar</v-chip>
                  <v-chip filter value="jacuzzi" prepend-icon="mdi-hot-tub">Jacuzzi</v-chip>
                  <v-chip filter value="balcony" prepend-icon="mdi-balcony">Balcón</v-chip>
                </v-chip-group>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- FAB Button -->
        <v-fab
          icon="mdi-plus"
          color="primary"
          location="bottom end"
          size="large"
          @click="openBookingDialog(null)"
        ></v-fab>
      </v-container>
    </v-main>

    <!-- Booking Dialog -->
    <v-dialog v-model="bookingDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-calendar-plus</v-icon>
          Nueva Reserva
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Complete los datos para crear una nueva reserva.
          </v-alert>
          <v-text-field label="Nombre completo" variant="outlined" class="mb-3"></v-text-field>
          <v-text-field label="Email" type="email" variant="outlined" class="mb-3"></v-text-field>
          <v-autocomplete
            :items="['101', '102', '103', '201', '202', '203', '301', '302']"
            label="Habitación"
            variant="outlined"
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="bookingDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="bookingDialog = false">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from 'vuetify';

// Theme
const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);
const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark';
};

// State
const drawer = ref(false);
const tab = ref('rooms');
const search = ref('');
const selectedMenu = ref('Dashboard');
const bookingDialog = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
const loading = ref(false);
const formValid = ref(false);
const selectedStatus = ref('all');
const selectedAmenities = ref<string[]>([]);

// Form data
const formData = ref({
  name: '',
  email: '',
  phone: '',
  roomType: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  breakfast: false,
  parking: false,
  notes: '',
});

// Validation rules
const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email inválido',
};

// Menu items
const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard' },
  { title: 'Reservas', icon: 'mdi-calendar-check' },
  { title: 'Habitaciones', icon: 'mdi-bed' },
  { title: 'Huéspedes', icon: 'mdi-account-group' },
  { title: 'Servicios', icon: 'mdi-room-service' },
  { title: 'Reportes', icon: 'mdi-chart-bar' },
  { title: 'Configuración', icon: 'mdi-cog' },
];

// Breadcrumbs
const breadcrumbs = [
  { title: 'Home', disabled: false },
  { title: 'Dashboard', disabled: true },
];

// Stats
const stats = [
  { title: 'Habitaciones Ocupadas', value: '42/50', icon: 'mdi-bed', color: 'primary', trend: 12 },
  { title: 'Check-ins Hoy', value: '8', icon: 'mdi-login', color: 'success', trend: 5 },
  { title: 'Check-outs Hoy', value: '5', icon: 'mdi-logout', color: 'warning', trend: -3 },
  {
    title: 'Ingresos del Mes',
    value: '$45,230',
    icon: 'mdi-currency-usd',
    color: 'info',
    trend: 18,
  },
];

// Room types for progress
const roomTypes = [
  { type: 'Simple', occupied: 15, total: 20, color: 'primary' },
  { type: 'Doble', occupied: 12, total: 15, color: 'success' },
  { type: 'Suite', occupied: 8, total: 10, color: 'warning' },
  { type: 'Deluxe', occupied: 7, total: 5, color: 'error' },
];

// Table headers
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Huésped', key: 'guest' },
  { title: 'Habitación', key: 'room' },
  { title: 'Check-in', key: 'checkIn' },
  { title: 'Check-out', key: 'checkOut' },
  { title: 'Estado', key: 'status' },
  { title: 'Acciones', key: 'actions', sortable: false },
];

// Bookings data
const bookings = [
  {
    id: 'RES001',
    guest: 'Juan Pérez',
    room: '101',
    checkIn: '2026-05-20',
    checkOut: '2026-05-23',
    status: 'Confirmada',
  },
  {
    id: 'RES002',
    guest: 'María García',
    room: '205',
    checkIn: '2026-05-21',
    checkOut: '2026-05-25',
    status: 'Pendiente',
  },
  {
    id: 'RES003',
    guest: 'Carlos López',
    room: '302',
    checkIn: '2026-05-22',
    checkOut: '2026-05-24',
    status: 'Check-in',
  },
  {
    id: 'RES004',
    guest: 'Ana Martínez',
    room: '401',
    checkIn: '2026-05-19',
    checkOut: '2026-05-22',
    status: 'Check-out',
  },
  {
    id: 'RES005',
    guest: 'Roberto Sánchez',
    room: '103',
    checkIn: '2026-05-23',
    checkOut: '2026-05-28',
    status: 'Confirmada',
  },
];

// Rooms
const rooms = [
  { number: '101', type: 'Simple', price: 80, available: true, amenities: ['WiFi', 'TV', 'A/C'] },
  { number: '102', type: 'Simple', price: 80, available: false, amenities: ['WiFi', 'TV', 'A/C'] },
  {
    number: '201',
    type: 'Doble',
    price: 120,
    available: true,
    amenities: ['WiFi', 'TV', 'A/C', 'Minibar'],
  },
  {
    number: '202',
    type: 'Doble',
    price: 120,
    available: true,
    amenities: ['WiFi', 'TV', 'A/C', 'Minibar'],
  },
  {
    number: '301',
    type: 'Suite',
    price: 200,
    available: false,
    amenities: ['WiFi', 'TV', 'A/C', 'Minibar', 'Jacuzzi'],
  },
  {
    number: '401',
    type: 'Deluxe',
    price: 350,
    available: true,
    amenities: ['WiFi', 'TV', 'A/C', 'Minibar', 'Jacuzzi', 'Balcón'],
  },
];

// Guests
const guests = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@email.com',
    room: '101',
    nights: 3,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria@email.com',
    room: '205',
    nights: 4,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 3,
    name: 'Carlos López',
    email: 'carlos@email.com',
    room: '302',
    nights: 2,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 4,
    name: 'Ana Martínez',
    email: 'ana@email.com',
    room: '401',
    nights: 5,
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
];

// Services
const services = [
  {
    name: 'Spa & Wellness',
    description: 'Relájate con nuestros tratamientos',
    price: 75,
    rating: 4.5,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
  },
  {
    name: 'Restaurante Gourmet',
    description: 'Cocina internacional de primer nivel',
    price: 50,
    rating: 4.8,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    name: 'Gimnasio',
    description: 'Equipamiento de última generación',
    price: 25,
    rating: 4.2,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  },
];

// Activities
const activities = [
  {
    id: 1,
    title: 'Check-in completado',
    description: 'Juan Pérez - Hab. 101',
    time: '10:30',
    color: 'success',
  },
  {
    id: 2,
    title: 'Nueva reserva',
    description: 'María García - 4 noches',
    time: '09:15',
    color: 'primary',
  },
  {
    id: 3,
    title: 'Servicio solicitado',
    description: 'Spa - Hab. 302',
    time: '08:45',
    color: 'info',
  },
  {
    id: 4,
    title: 'Check-out',
    description: 'Pedro Ruiz - Hab. 205',
    time: '08:00',
    color: 'warning',
  },
];

// FAQs
const faqs = [
  {
    question: '¿Cuál es el horario de check-in/check-out?',
    answer: 'Check-in a partir de las 15:00 y check-out hasta las 12:00.',
  },
  {
    question: '¿El desayuno está incluido?',
    answer: 'Depende del tipo de reserva. Consulte los detalles de su reservación.',
  },
  {
    question: '¿Hay estacionamiento disponible?',
    answer: 'Sí, contamos con estacionamiento gratuito para huéspedes.',
  },
  {
    question: '¿Aceptan mascotas?',
    answer: 'Sí, aceptamos mascotas pequeñas con un cargo adicional.',
  },
];

// Footer links
const footerLinks = ['Inicio', 'Servicios', 'Contacto', 'Términos', 'Privacidad'];

// Methods
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Confirmada: 'success',
    Pendiente: 'warning',
    'Check-in': 'info',
    'Check-out': 'secondary',
    Cancelada: 'error',
  };
  return colors[status] || 'grey';
};

const viewBooking = (item: (typeof bookings)[0]) => {
  snackbarText.value = `Viendo reserva ${item.id}`;
  snackbarColor.value = 'info';
  snackbar.value = true;
};

const editBooking = (item: (typeof bookings)[0]) => {
  snackbarText.value = `Editando reserva ${item.id}`;
  snackbarColor.value = 'warning';
  snackbar.value = true;
};

const openBookingDialog = (room: (typeof rooms)[0] | null) => {
  if (room) {
    snackbarText.value = `Reservando habitación ${room.number}`;
    snackbarColor.value = 'info';
    snackbar.value = true;
  }
  bookingDialog.value = true;
};

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    breakfast: false,
    parking: false,
    notes: '',
  };
};

const submitForm = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  loading.value = false;
  snackbarText.value = 'Reserva creada exitosamente';
  snackbarColor.value = 'success';
  snackbar.value = true;
  resetForm();
};
</script>

<style scoped>
.v-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
