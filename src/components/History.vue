<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title>History</v-card-title>
    <v-card-text>
      <v-row dense class="mb-2">
        <v-col cols="4" class="text-center">
          <div class="text-h5">{{ formatDuration(lifetimeSeconds) }}</div>
          <div class="text-caption text-medium-emphasis">Lifetime</div>
        </v-col>
        <v-col cols="4" class="text-center">
          <div class="text-h5">{{ formatDuration(weekSeconds) }}</div>
          <div class="text-caption text-medium-emphasis">This week</div>
        </v-col>
        <v-col cols="4" class="text-center">
          <div class="text-h5">{{ sessionCount }}</div>
          <div class="text-caption text-medium-emphasis">Sessions</div>
        </v-col>
      </v-row>
      <v-divider class="mb-2"/>

      <div v-if="sessions.length === 0" class="text-center text-medium-emphasis py-8">
        <v-icon size="48" class="mb-2">mdi-history</v-icon>
        <div>No sessions logged yet.</div>
        <div class="text-caption">
          Practice on the Metronome or Session tab and it will show up here.
        </div>
      </div>

      <v-list v-else density="compact" class="pa-0">
        <v-list-item v-for="s in sessions" :key="s.id" class="px-0">
          <template #prepend>
            <v-icon :icon="s.type === 'runner' ? 'mdi-playlist-play' : 'mdi-metronome'" class="mr-3"/>
          </template>
          <v-list-item-title>
            {{ formatDuration(s.durationSeconds) }}
            <span class="text-medium-emphasis"> · {{ describe(s) }}</span>
          </v-list-item-title>
          <v-list-item-subtitle>{{ formatWhen(s.startedAt) }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {useSessionLog, formatDuration} from '../composables/useSessionLog'

const {sessions, lifetimeSeconds, weekSeconds, sessionCount} = useSessionLog()

// One-line summary of what the session was.
function describe(s) {
  if (s.type === 'runner') {
    const range = s.bpmLow === s.bpmHigh ? `${s.bpmLow} bpm` : `${s.bpmLow} → ${s.bpmHigh} bpm`
    const outcome = s.completed ? 'completed' : 'stopped early'
    return `Session, ${range}, ${s.blocksPlayed}/${s.blockCount} blocks, ${outcome}`
  }
  return s.bpm ? `Free practice, ${s.bpm} bpm` : 'Free practice'
}

// e.g. "Thu 8 Oct, 14:32"
function formatWhen(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
