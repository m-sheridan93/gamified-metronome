<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      Metronome
    </v-card-title>

    <v-card-text>
      <v-text-field
          v-model="bpm"
          label="BPM"
          type="number"
          min="20"
          max="300"
          class="mt-2"
      />
      <v-slider
          v-model="bpm"
          :min="20"
          :max="300"
          step="1"
          label="BPM"
          class="mt-4"
      />
      <v-slider
          v-model="volume"
          :min="0"
          :max="1"
          :step="0.01"
          label="VOL"
          class="mt-4"
      />
      <div class="text-caption mb-2">Volume: {{ Math.round(volume * 100) }}%</div>
      <v-select
          v-model="soundType"
          :items="['Tick', 'Beep']"
          label="Sound Type"
          class="mt-4"
      />
      <div>Current BPM: {{ bpm }}</div>
      <v-btn
          class="mt-4"
          color="primary"
          @click="toggleMetronome"
      >
        {{ running ? 'Stop' : 'Start' }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>


<script setup>
import {ref, watch} from 'vue'

const bpm = ref(100)
const running = ref(false)
const soundType = ref('Tick')
const volume = ref(1) // Default to 100%
let intervalId = null

function playTick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (soundType.value === 'Tick') {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1000

    // Envelope for tick
    gain.gain.setValueAtTime(volume.value, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(volume.value * 0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.07)
  } else if (soundType.value === 'Beep') {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1000
    gain.gain.setValueAtTime(volume.value, ctx.currentTime)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  }
}

watch(running, (newVal) => {
  if (newVal) {
    // Start ticking
    playTick()
    intervalId = setInterval(playTick, (60 / bpm.value) * 1000)
  } else {
    // Stop ticking
    clearInterval(intervalId)
    intervalId = null
  }
})

// Watch for bpm changes
watch(bpm, (newVal) => {
  if (running.value) {
    clearInterval(intervalId)
    intervalId = setInterval(playTick, (60 / newVal) * 1000)
  }
})


function toggleMetronome() {
  running.value = !running.value
}


</script>
