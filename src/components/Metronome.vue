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
    </v-card-text>
  </v-card>
</template>

<script setup>
import {ref, watch, onUnmounted} from 'vue'
import MetronomeControls from './MetronomeControls.vue'
import {useMetronome} from '../composables/useMetronome'
import {useProgress} from '../composables/useProgress'
import {beginSession} from '../composables/useSessionLog'

// Audio engine (single AudioContext + look-ahead scheduler).
const {bpm, volume, soundType, isRunning, toggle, onBeat} = useMetronome()

// Session time tracking (shared, persisted). Points logic still runs under the
// hood in useProgress; we just no longer surface the points UI here.
const {formattedTime, tick, startSession, resetSession} = useProgress()

// Visual beat indicator: pulse the dot on each beat, synced to the audio clock.
const isPulsing = ref(false)
let pulseTimeout = null
const stopBeatListener = onBeat(() => {
  isPulsing.value = true
  clearTimeout(pulseTimeout)
  pulseTimeout = setTimeout(() => { isPulsing.value = false }, 120)
})

// Feed practice time to the progress store while the metronome runs, and log each
// start/stop as a free practice session. The audio itself is handled by useMetronome.
let timerIntervalId = null
let lastTickAt = 0
let practiceLog = null
watch(isRunning, (running) => {
  if (running) {
    startSession()
    practiceLog = beginSession('free')
    lastTickAt = Date.now()
    timerIntervalId = setInterval(() => {
      const now = Date.now()
      tick((now - lastTickAt) / 1000)
      lastTickAt = now
    }, 100)
  } else {
    if (timerIntervalId) {
      clearInterval(timerIntervalId)
      timerIntervalId = null
    }
    practiceLog?.end({bpm: bpm.value})
    practiceLog = null
  }
})

onUnmounted(() => {
  stopBeatListener()
  clearTimeout(pulseTimeout)
  if (timerIntervalId) clearInterval(timerIntervalId)
  practiceLog?.end({bpm: bpm.value})
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
