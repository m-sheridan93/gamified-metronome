<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 700px;">
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

      <div v-if="rows.length === 0" class="text-center text-medium-emphasis py-8">
        <v-icon size="48" class="mb-2">mdi-history</v-icon>
        <div>No sessions logged yet.</div>
        <div class="text-caption">
          Practice on the Metronome or Session tab and it will show up here.
        </div>
      </div>

      <v-data-table
          v-else
          :headers="headers"
          :items="rows"
          :sort-by="[{key: 'startedAt', order: 'desc'}]"
          :items-per-page="10"
          density="compact"
          item-value="id"
      >
        <template #item.startedAt="{ item }">
          <div>{{ item.dateLabel }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.timeLabel }}</div>
        </template>

        <template #item.type="{ item }">
          <v-icon size="small" class="mr-1">{{ item.typeIcon }}</v-icon>
          {{ item.typeLabel }}
        </template>

        <template #item.durationSeconds="{ item }">
          {{ formatDuration(item.durationSeconds) }}
        </template>

        <template #item.result="{ item }">
          <v-chip
              v-if="item.result"
              :color="item.completed ? 'success' : 'default'"
              size="small"
              variant="tonal"
          >
            {{ item.result }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {computed} from 'vue'
import {useSessionLog} from '../composables/useSessionLog'
import {formatDuration, bpmRange} from '../lib/format'

const {sessions, lifetimeSeconds, weekSeconds, sessionCount} = useSessionLog()

const headers = [
  {title: 'Date', key: 'startedAt'},
  {title: 'Type', key: 'type'},
  {title: 'BPM', key: 'bpmLabel', sortable: false},
  {title: 'Time', key: 'durationSeconds'},
  {title: 'Result', key: 'result', sortable: false},
]

// One display-ready row per logged session.
const rows = computed(() => sessions.value.map((s) => {
  const when = new Date(s.startedAt)
  const isRunner = s.type === 'runner'
  return {
    id: s.id,
    startedAt: s.startedAt,
    durationSeconds: s.durationSeconds,
    completed: !!s.completed,
    dateLabel: when.toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'}),
    timeLabel: when.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}),
    type: s.type,
    typeLabel: isRunner ? 'Session' : 'Free',
    typeIcon: isRunner ? 'mdi-playlist-play' : 'mdi-metronome',
    bpmLabel: isRunner
        ? bpmRange(s.bpmLow, s.bpmHigh)
        : (s.bpm ? `${s.bpm}` : ''),
    result: isRunner
        ? (s.completed ? 'Completed' : `Stopped at ${s.blocksPlayed}/${s.blockCount}`)
        : '',
  }
}))
</script>
