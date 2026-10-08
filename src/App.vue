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
          <v-tab value="shop">
            <v-icon start>mdi-store</v-icon>
            Shop
          </v-tab>
          <v-tab value="studio">
            <v-icon start>mdi-sofa</v-icon>
            Studio
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="metronome">
            <Metronome/>
          </v-window-item>
          <v-window-item value="session">
            <SessionRunner/>
          </v-window-item>
          <v-window-item value="shop">
            <Shop/>
          </v-window-item>
          <v-window-item value="studio">
            <Studio/>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import Metronome from './components/Metronome.vue'
import Shop from './components/Shop.vue'
import Studio from './components/Studio.vue'
import SessionRunner from './components/SessionRunner.vue'

const tab = ref('metronome')
</script>
