import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // icon font for Vuetify's mdi-* icons
import { initProgress } from './composables/useProgress'

// Palette (see docs/planning/design-assets.md): Forest Green #062425, Teal Green #2e765e,
// Spearmint #88cdb2, Blue Grotto #077ab2. `brand` is the top bar, matching the app icon.
// Error and warning keep Vuetify's red and orange so they still read as warnings.
const vuetify = createVuetify({
    components,
    directives,
    defaults: {
        VSlider: {color: 'primary'}, // sliders are grey by default
    },
    theme: {
        defaultTheme: 'system', // follow the phone's light / dark setting
        themes: {
            light: {
                colors: {
                    brand: '#062425',
                    background: '#f4f8f6',
                    primary: '#2e765e',
                    secondary: '#077ab2',
                    info: '#077ab2',
                    success: '#2e765e',
                },
            },
            dark: {
                colors: {
                    brand: '#0e2f30',
                    background: '#062425',
                    surface: '#0e2f30',
                    primary: '#88cdb2',
                    secondary: '#077ab2',
                    info: '#077ab2',
                    success: '#88cdb2',
                },
            },
        },
    },
})

// Load saved progress first, so every component sees the user's real data on setup.
initProgress().then(() => {
    createApp(App).use(vuetify).mount('#app')
})
