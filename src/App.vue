<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Gamified Metronome</v-toolbar-title>
      <v-btn icon="mdi-account-circle" aria-label="Profile" title="Profile" @click="profileOpen = true"/>
    </v-app-bar>
    <Onboarding v-model="profileOpen"/>
    <v-main>
      <v-container fluid>
        <!-- Larger screens: tabs across the top -->
        <v-tabs v-if="!smAndDown" v-model="tab" align-tabs="center" class="mb-4">
          <v-tab v-for="t in TABS" :key="t.value" :value="t.value">
            <v-icon start>{{ t.icon }}</v-icon>
            {{ t.label }}
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item v-for="t in TABS" :key="t.value" :value="t.value">
            <component :is="t.component"/>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>

    <!-- Phones: a bottom tab bar (icon + label), the usual mobile pattern -->
    <v-bottom-navigation v-if="smAndDown" v-model="tab" color="primary" grow>
      <v-btn v-for="t in TABS" :key="t.value" :value="t.value">
        <v-icon>{{ t.icon }}</v-icon>
        <span>{{ t.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import {useDisplay} from 'vuetify'
import Metronome from './components/Metronome.vue'
import SessionRunner from './components/SessionRunner.vue'
import Challenges from './components/Challenges.vue'
import History from './components/History.vue'
import Onboarding from './components/Onboarding.vue'
import {useProfile} from './composables/useProfile'
// Shop.vue / Studio.vue are kept in the repo but hidden from the UI for now.

// One list drives both the top tabs and the bottom bar, and the content panels.
const TABS = [
  {value: 'metronome', label: 'Metronome', icon: 'mdi-metronome', component: Metronome},
  {value: 'session', label: 'Session', icon: 'mdi-playlist-play', component: SessionRunner},
  {value: 'challenges', label: 'Challenges', icon: 'mdi-trophy', component: Challenges},
  {value: 'history', label: 'History', icon: 'mdi-history', component: History},
]

// Same breakpoint as the full-screen onboarding dialog.
const {smAndDown} = useDisplay()

const tab = ref('metronome')

// First launch opens onboarding; afterwards the profile button reopens it.
const {needsOnboarding} = useProfile()
const profileOpen = ref(needsOnboarding.value)
</script>

<style>
/*
 * Safe areas on phones with a notch / Dynamic Island / home indicator. The page draws
 * edge to edge (viewport-fit=cover in index.html), and these pad the fixed bars and
 * content by the device's insets. env() is 0 on other devices and desktop browsers.
 */
.v-app-bar.v-toolbar {
  padding-top: env(safe-area-inset-top); /* blue bar extends behind the status bar */
}
.v-main {
  padding-top: calc(var(--v-layout-top) + env(safe-area-inset-top)) !important;
  padding-bottom: calc(var(--v-layout-bottom) + env(safe-area-inset-bottom)) !important;
}
.v-bottom-navigation {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(56px + env(safe-area-inset-bottom)) !important;
}
.v-dialog--fullscreen > .v-overlay__content > .v-card {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
