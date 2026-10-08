<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title>Session</v-card-title>
    <v-card-text>
      <!-- Running view -->
      <template v-if="isActive">
        <div class="text-center">
          <div class="text-overline">Block {{ currentIndex + 1 }} / {{ blocks.length }}</div>
          <div class="text-h6">{{ currentBlock?.label }}</div>
          <div class="text-h2 my-2">{{ bpm }} <span class="text-h6">bpm</span></div>
          <div class="text-h4 mb-3">{{ formattedTime }}</div>
          <v-progress-linear :model-value="blockProgress" color="primary" height="8" rounded class="mb-4"/>
        </div>
        <div class="text-center">
          <v-btn color="error" variant="outlined" class="mr-2" @click="stop">Stop</v-btn>
          <v-btn color="primary" @click="skip">Skip</v-btn>
        </div>
      </template>

      <!-- Editor view -->
      <template v-else>
        <div class="text-caption text-medium-emphasis mb-3">
          Each block is a tempo (BPM) held for some minutes. The label is an optional
          note to yourself - e.g. "Slow", "+20", "chorus".
        </div>

        <!-- Auto-build from a goal tempo -->
        <div class="d-flex align-center mb-3" style="gap: 8px;">
          <v-text-field v-model.number="goalBpm" label="Goal BPM" type="number" min="20" max="300"
                        density="compact" hide-details style="max-width: 120px;"/>
          <v-text-field v-model.number="goalMinutes" label="Minutes" type="number" min="1"
                        density="compact" hide-details style="max-width: 120px;"/>
          <v-btn variant="tonal" size="small" :disabled="!goalBpm || !goalMinutes" @click="autoBuild">
            <v-icon start>mdi-auto-fix</v-icon> Generate
          </v-btn>
        </div>
        <v-divider class="mb-4"/>

        <div
            v-for="(row, i) in rows"
            :key="i"
            class="d-flex align-center mb-2"
            style="gap: 8px;"
        >
          <v-text-field v-model.number="row.bpm" label="BPM" type="number" min="20" max="300"
                        density="compact" hide-details style="max-width: 90px;"/>
          <v-text-field v-model.number="row.minutes" label="Min" type="number" min="0" step="0.5"
                        density="compact" hide-details style="max-width: 90px;"/>
          <v-text-field v-model="row.label" label="Label (optional)" placeholder="e.g. Slow"
                        density="compact" hide-details/>
          <v-btn icon="mdi-delete" variant="text" size="small" color="error"
                 @click="removeRow(i)"/>
        </div>

        <v-btn variant="outlined" size="small" class="mb-4" @click="addRow">
          <v-icon start>mdi-plus</v-icon> Add block
        </v-btn>

        <div class="text-center">
          <v-btn color="primary" :disabled="rows.length === 0" @click="startSession">
            Start Session
          </v-btn>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useSessionRunner} from '../composables/useSessionRunner'

// Editable plan, in user-friendly minutes.
const rows = ref([
  {bpm: 60, minutes: 2, label: 'Slow'},
  {bpm: 80, minutes: 2, label: '+20'},
  {bpm: 70, minutes: 2, label: '-10'},
])

// Goal-based auto-builder inputs.
const goalBpm = ref(null)
const goalMinutes = ref(10)

const {
  blocks, isActive, currentIndex, secondsLeft, currentBlock, bpm,
  start, stop, skip,
} = useSessionRunner([])

function addRow() {
  rows.value.push({bpm: 100, minutes: 2, label: ''})
}

function removeRow(i) {
  rows.value.splice(i, 1)
}

// Build a ramp of 1-minute blocks from an auto-picked start tempo up to the goal.
function generateRamp(goal, totalMinutes) {
  const g = Math.round(Number(goal))
  const mins = Math.max(1, Math.round(Number(totalMinutes)))
  // Ease in from ~60% of the goal, with a floor, and never above the goal.
  const start = Math.min(g, Math.max(40, Math.round(g * 0.6)))
  if (mins === 1) return [{bpm: g, minutes: 1, label: 'Goal'}]

  const span = g - start
  const out = []
  for (let i = 0; i < mins; i++) {
    const t = i / (mins - 1)             // 0 → 1 across the blocks
    out.push({
      bpm: Math.round(start + span * t), // linear ramp
      minutes: 1,
      label: i === mins - 1 ? 'Goal' : '',
    })
  }
  return out
}

function autoBuild() {
  rows.value = generateRamp(goalBpm.value, goalMinutes.value)
}

function startSession() {
  // Convert the editor's minutes into the engine's seconds, then run.
  blocks.value = rows.value.map((r) => ({
    bpm: Number(r.bpm),
    seconds: Math.round(Number(r.minutes) * 60),
    label: r.label || `${r.bpm} bpm`,
  }))
  start()
}

const formattedTime = computed(() => {
  const s = Math.max(0, secondsLeft.value)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

const blockProgress = computed(() => {
  if (!currentBlock.value) return 0
  const total = currentBlock.value.seconds
  return ((total - secondsLeft.value) / total) * 100
})
</script>
