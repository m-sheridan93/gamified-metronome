<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Gamified Metronome</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-tabs v-model="tab" align-tabs="center" class="mb-4">
          <v-tab value="metronome">
            <v-icon start>mdi-metronome</v-icon>
            Metronome
          </v-tab>
          <v-tab value="session">
            <v-icon start>mdi-playlist-play</v-icon>
            Session
          </v-tab>
          <v-tab value="challenges">
            <v-icon start>mdi-trophy</v-icon>
            Challenges
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="metronome">
            <Metronome/>
          </v-window-item>
          <v-window-item value="session">
            <SessionRunner/>
          </v-window-item>
          <v-window-item value="challenges">
            <Challenges/>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import Metronome from './components/Metronome.vue'
import SessionRunner from './components/SessionRunner.vue'
import Challenges from './components/Challenges.vue'
// Shop.vue / Studio.vue are kept in the repo but hidden from the UI for now.

const tab = ref('metronome')
</script>
