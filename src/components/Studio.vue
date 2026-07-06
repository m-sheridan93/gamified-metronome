<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title>My Studio</v-card-title>
    <v-card-text>
      <div v-if="ownedItems.length === 0" class="text-center text-medium-emphasis py-8">
        <v-icon size="48" class="mb-2">mdi-sofa-outline</v-icon>
        <div>Your studio is empty.</div>
        <div class="text-caption">Practise to earn points, then buy gear in the Shop.</div>
      </div>

      <v-row v-else dense>
        <v-col
            v-for="item in ownedItems"
            :key="item.id"
            cols="4"
        >
          <div class="text-center pa-3">
            <v-icon size="48" color="primary">{{ item.icon }}</v-icon>
            <div class="text-caption mt-1">{{ item.name }}</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {useStudio} from '../composables/useStudio'

const {ownedItems} = useStudio()
</script>
