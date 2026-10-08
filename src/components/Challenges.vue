<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title>Challenges</v-card-title>
    <v-card-text>
      <template v-for="group in groups" :key="group.label">
        <div class="text-overline mt-2">{{ group.label }}</div>
        <div v-for="c in group.items" :key="c.id" class="mb-4">
          <div class="d-flex justify-space-between align-center mb-1">
            <div>
              <span class="text-body-1">{{ c.title }}</span>
              <span class="text-caption text-medium-emphasis ml-2">{{ c.description }}</span>
            </div>
            <v-chip v-if="c.done" color="success" size="small" variant="flat">
              <v-icon start>mdi-check</v-icon>
              Done
            </v-chip>
            <span v-else class="text-caption">{{ c.text }}</span>
          </div>
          <v-progress-linear
              :model-value="c.percent"
              :color="c.done ? 'success' : 'primary'"
              height="8"
              rounded
          ></v-progress-linear>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {computed} from 'vue'
import {useChallenges} from '../composables/useChallenges'

const {dailyChallenges, weeklyChallenges} = useChallenges()

const groups = computed(() => [
  {label: 'Today', items: dailyChallenges.value},
  {label: 'This Week', items: weeklyChallenges.value},
])
</script>
