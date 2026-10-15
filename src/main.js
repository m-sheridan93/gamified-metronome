import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // icon font for Vuetify's mdi-* icons
import { initProgress } from './composables/useProgress'
import { savedAppearance } from './composables/useAppearance'

// Palette (see docs/planning/design-assets.md). Backgrounds stay Vuetify's neutral white
// and dark grey; the palette is for accents. Dark mode uses Spearmint, Teal Green's lighter
// shade, because Teal is too dim on dark grey for text. Error and warning keep Vuetify's
// red and orange so they still read as warnings.
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
                    primary: '#2e765e', // Teal Green
                    secondary: '#077ab2', // Blue Grotto
                    info: '#077ab2',
                    success: '#2e765e',
                },
            },
            dark: {
                colors: {
                    primary: '#88cdb2', // Spearmint
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
    vuetify.theme.change(savedAppearance()) // the saved light / dark choice, before first paint
    createApp(App).use(vuetify).mount('#app')
})
