import '@fontsource/roboto/100.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import '@mdi/font/css/materialdesignicons.css';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import App from './App.vue';
import { queryClient } from './api/useApi';
import './assets/main.css';
import { useAuthStore } from './modules/auth/store/auth.store';
import router from './router';
const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
});
app.use(VueQueryPlugin, { queryClient });
const pinia = createPinia();
app.use(pinia);
useAuthStore();

app.use(router);
app.use(vuetify);
app.mount('#app');
