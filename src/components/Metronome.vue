<template>
  <v-card class="mx-auto" max-width="400">
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
import { ref, watch } from 'vue'
import MetronomeControls from './MetonomeControls.vue'

const bpm = ref(100)
const running = ref(false)
const soundType = ref('Tick')
const volume = ref(1)
let intervalId = null

function playTick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 1000
  gain.gain.setValueAtTime(volume.value, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(volume.value * 0.3, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.07)
}

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
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

function playMetronomeSound() {
  if (soundType.value === 'Tick') {
    playTick()
  } else if (soundType.value === 'Beep') {
    playBeep()
  }
}
// Then in your watcher and interval:
watch(running, (newVal) => {
  if (newVal) {
    playMetronomeSound()
    intervalId = setInterval(playMetronomeSound, (60 / bpm.value) * 1000)
  } else {
    clearInterval(intervalId)
    intervalId = null
  }
})


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
