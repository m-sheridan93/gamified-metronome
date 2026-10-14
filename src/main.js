import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // icon font for Vuetify's mdi-* icons
import { initProgress } from './composables/useProgress'

const vuetify = createVuetify({
    components,
    directives,
})

// Load saved progress first, so every component sees the user's real data on setup.
initProgress().then(() => {
    createApp(App).use(vuetify).mount('#app')
})
