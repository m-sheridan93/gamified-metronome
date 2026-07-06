<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Shop</span>
      <v-chip color="primary" variant="flat">
        <v-icon start>mdi-star-four-points</v-icon>
        {{ totalPoints }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col
            v-for="item in ITEMS"
            :key="item.id"
            cols="6"
        >
          <v-card variant="outlined" class="text-center pa-3 h-100 d-flex flex-column">
            <v-icon size="40" class="mb-2">{{ item.icon }}</v-icon>
            <div class="text-body-2 mb-1">{{ item.name }}</div>
            <div class="text-caption mb-3">{{ item.cost }} pts</div>

            <v-btn
                v-if="isOwned(item.id)"
                color="success"
                variant="tonal"
                size="small"
                disabled
                class="mt-auto"
            >
              <v-icon start>mdi-check</v-icon>
              Owned
            </v-btn>
            <v-btn
                v-else
                color="primary"
                size="small"
                :disabled="totalPoints < item.cost"
                class="mt-auto"
                @click="buy(item)"
            >
              Buy
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {useProgress} from '../composables/useProgress'
import {useStudio} from '../composables/useStudio'

const {totalPoints} = useProgress()
const {ITEMS, isOwned, buy} = useStudio()
</script>
