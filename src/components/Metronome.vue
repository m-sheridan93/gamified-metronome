<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title>
      Metronome
    </v-card-title>
    <v-card-text>
      <MetronomeControls
          :bpm="bpm"
          @update:bpm="bpm = $event"
          :volume="volume"
          @update:volume="volume = $event"
          :soundType="soundType"
          @update:soundType="soundType = $event"
      />
      <div class="beat-indicator mt-4">
        <div
            class="beat-dot"
            :class="{ 'beat-dot--pulse': isPulsing, 'beat-dot--idle': !isRunning }"
        ></div>
      </div>

      <v-btn
          class="mt-4"
          color="primary"
          @click="toggle"
      >
        {{ isRunning ? 'Stop' : 'Start' }}
      </v-btn>

      <v-card class="mt-4" variant="outlined">
        <v-card-title class="text-h6">Session Timer</v-card-title>
        <v-card-text>
          <div class="text-h4 text-center mb-2">{{ formattedTime }}</div>
          <div class="text-center">
            <v-chip
                :color="isRunning ? 'success' : 'default'"
                variant="outlined"
                class="mb-2"
            >
              {{ isRunning ? 'Active' : 'Paused' }}
            </v-chip>
            <br>
            <v-btn
                color="warning"
                variant="outlined"
                size="small"
                @click="resetSession"
            >
              Reset Session
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="mt-4" variant="outlined">
        <v-card-title class="text-h6">Practice Points</v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-3">
            <div>
              <div class="text-h4 text-primary">{{ totalPoints }}</div>
              <div class="text-caption">Total Points</div>
            </div>
            <div class="text-right">
              <div class="text-h6 text-success">+{{ sessionPoints }}</div>
              <div class="text-caption">This Session</div>
            </div>
          </div>

          <v-progress-linear
              :model-value="progressToNextPoint"
              color="primary"
              height="8"
              rounded
              class="mb-2"
          ></v-progress-linear>
          <div class="text-caption text-center">
            {{ secondsToNextPoint }}s until next point
          </div>

          <div v-if="consistencyBonus > 0" class="mt-3">
            <v-chip color="success" variant="outlined" size="small">
              <v-icon start>mdi-star</v-icon>
              Consistency Bonus: +{{ consistencyBonus }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {ref, watch, onUnmounted} from 'vue'
import MetronomeControls from './MetonomeControls.vue'
import {useMetronome} from '../composables/useMetronome'
import {useProgress} from '../composables/useProgress'

// Audio engine (single AudioContext + look-ahead scheduler).
const {bpm, volume, soundType, isRunning, toggle, onBeat} = useMetronome()

// Player progress (shared, persisted): points, streak, session totals.
const {
  totalPoints,
  sessionPoints,
  consistencyBonus,
  formattedTime,
  progressToNextPoint,
  secondsToNextPoint,
  tick,
  startSession,
  resetSession,
} = useProgress()

// Visual beat indicator: pulse the dot on each beat, synced to the audio clock.
const isPulsing = ref(false)
let pulseTimeout = null
const stopBeatListener = onBeat(() => {
  isPulsing.value = true
  clearTimeout(pulseTimeout)
  pulseTimeout = setTimeout(() => { isPulsing.value = false }, 120)
})

// Feed practice time to the progress store while the metronome runs. The audio
// itself is handled entirely by useMetronome; here we only track time + points.
let timerIntervalId = null
let lastTickAt = 0
watch(isRunning, (running) => {
  if (running) {
    startSession()
    lastTickAt = Date.now()
    timerIntervalId = setInterval(() => {
      const now = Date.now()
      tick((now - lastTickAt) / 1000)
      lastTickAt = now
    }, 100)
  } else if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
})

onUnmounted(() => {
  stopBeatListener()
  clearTimeout(pulseTimeout)
  if (timerIntervalId) clearInterval(timerIntervalId)
})
</script>

<style scoped>
.beat-indicator {
  display: flex;
  justify-content: center;
}

.beat-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-primary));
  opacity: 0.35;
  transform: scale(1);
  transition: transform 110ms ease-out, opacity 110ms ease-out;
}

.beat-dot--pulse {
  opacity: 1;
  transform: scale(1.5);
}

.beat-dot--idle {
  opacity: 0.2;
}
</style>
