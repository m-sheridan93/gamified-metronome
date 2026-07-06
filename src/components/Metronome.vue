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
            {{ Math.floor(POINTS_THRESHOLD_SECONDS - (currentSessionTimeForPoints % POINTS_THRESHOLD_SECONDS)) }}s until next point
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
import {ref, watch, computed} from 'vue'
import MetronomeControls from './MetonomeControls.vue'
import {useMetronome} from '../composables/useMetronome'

// Audio engine (single AudioContext + look-ahead scheduler).
const {bpm, volume, soundType, isRunning, toggle} = useMetronome()

// Session timer variables
const totalSessionTime = ref(0) // Accumulated time across all sessions
const currentSessionStart = ref(null)
const timerTick = ref(0) // Force reactivity updates
let timerIntervalId = null

// Points system variables
const POINTS_THRESHOLD_SECONDS = ref(60) // Change this value to adjust point earning rate
const totalPoints = ref(parseInt(localStorage.getItem('metronome-total-points') || '0'))
const sessionPoints = ref(0)
const consistencyBonus = ref(0)
const lastPracticeDate = ref(localStorage.getItem('metronome-last-practice') || '')
const practiceStreak = ref(parseInt(localStorage.getItem('metronome-practice-streak') || '0'))

// Computed property to format time as MM:SS
const formattedTime = computed(() => {
  // Include timerTick to force reactivity
  timerTick.value

  let displayTime = totalSessionTime.value
  if (isRunning.value && currentSessionStart.value) {
    displayTime += Date.now() - currentSessionStart.value
  }
  const totalSeconds = Math.floor(displayTime / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Computed properties for points system
const currentSessionTimeForPoints = computed(() => {
  timerTick.value // Force reactivity
  let displayTime = totalSessionTime.value
  if (isRunning.value && currentSessionStart.value) {
    displayTime += Date.now() - currentSessionStart.value
  }
  return Math.floor(displayTime / 1000) // Return seconds
})

const progressToNextPoint = computed(() => {
  const secondsInCurrentThreshold = currentSessionTimeForPoints.value % POINTS_THRESHOLD_SECONDS.value
  return (secondsInCurrentThreshold / POINTS_THRESHOLD_SECONDS.value) * 100
})

// Points calculation functions
function calculatePoints() {
  const currentThresholds = Math.floor(currentSessionTimeForPoints.value / POINTS_THRESHOLD_SECONDS.value)

  if (currentThresholds > sessionPoints.value) {
    const pointsToAdd = currentThresholds - sessionPoints.value
    sessionPoints.value = currentThresholds
    totalPoints.value += pointsToAdd
    savePointsToStorage()
  }
}

function calculateConsistencyBonus() {
  const today = new Date().toDateString()
  const lastPractice = lastPracticeDate.value

  if (lastPractice) {
    const lastDate = new Date(lastPractice)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      // Consecutive day - increase streak
      practiceStreak.value += 1
    } else if (daysDiff > 1) {
      // Streak broken - reset
      practiceStreak.value = 1
    }
    // If daysDiff === 0, same day, keep current streak
  } else {
    // First time practicing
    practiceStreak.value = 1
  }

  // Award consistency bonus based on streak
  if (practiceStreak.value >= 3) {
    consistencyBonus.value = Math.floor(practiceStreak.value / 3)
    totalPoints.value += consistencyBonus.value
  }

  lastPracticeDate.value = today
  savePointsToStorage()
}

function savePointsToStorage() {
  localStorage.setItem('metronome-total-points', totalPoints.value.toString())
  localStorage.setItem('metronome-last-practice', lastPracticeDate.value)
  localStorage.setItem('metronome-practice-streak', practiceStreak.value.toString())
}

// Timer functions
function startTimer() {
  currentSessionStart.value = Date.now()

  // Calculate consistency bonus when starting a session
  if (sessionPoints.value === 0) {
    calculateConsistencyBonus()
  }

  timerIntervalId = setInterval(() => {
    // Force reactivity update for the computed property
    timerTick.value++
    // Calculate points every update
    calculatePoints()
  }, 100) // Update every 100ms for smooth display
}

function stopTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
  // Add current session time to total
  if (currentSessionStart.value) {
    totalSessionTime.value += Date.now() - currentSessionStart.value
    currentSessionStart.value = null
  }
}

function resetSession() {
  // Stop current timer if running
  if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
  // Reset all timer values
  totalSessionTime.value = 0
  currentSessionStart.value = null
  // Reset session points but keep total points
  sessionPoints.value = 0
  consistencyBonus.value = 0
  // Restart timer if metronome is running
  if (isRunning.value) {
    startTimer()
  }
}

// Drive the session timer + points off the engine's running state.
// The metronome audio itself is handled entirely by useMetronome.
watch(isRunning, (running) => {
  if (running) {
    startTimer()
  } else {
    stopTimer()
  }
})
</script>
