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
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="metronome">
            <Metronome/>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import Metronome from './components/Metronome.vue'
// Shop.vue / Studio.vue are kept in the repo but hidden from the UI for now.

const tab = ref('metronome')
</script>
