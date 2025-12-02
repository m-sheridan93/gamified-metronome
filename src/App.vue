<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Gamified Metronome</v-toolbar-title>
    </v-app-bar>
      <v-main>
        <v-container fluid>
          <Metronome/>
        </v-container>
      </v-main>
  </v-app>
</template>

<script setup>
import Metronome from './components/Metronome.vue'
</script>
