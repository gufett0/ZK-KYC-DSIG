import { createApp } from "vue";
import App from "./App.vue";

import PrimeVue from "primevue/config";
import Lara from "@primevue/themes/lara";
import "primeicons/primeicons.css";

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Lara,
  },
});

app.mount("#app");
