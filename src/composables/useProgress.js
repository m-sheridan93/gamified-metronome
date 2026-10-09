import { reactive, computed } from 'vue'
import { defaults, loadState, saveState, todayISO, daysBetween, startOfWeekISO } from '../lib/storage'
import { formatClock } from '../lib/format'

/**
 * Player progress: points economy, practice time, streak.
 *
 * A single module-scoped reactive `state` is the app-wide source of truth: every
 * component that calls useProgress() shares it. This is the zero-dependency
 * equivalent of a Pinia store; if state needs grow, it can be lifted into Pinia
 * without changing the public surface here.
 */

const POINTS_THRESHOLD_SECONDS = 60 // practice time earned per point (tune here)

// Shared so sibling composables (e.g. usePresets) read/write the same save blob.
// Starts as defaults; initProgress() fills it from storage before the app mounts.
export const state = reactive(defaults())

// Saving is blocked until the stored data has loaded, so an early write can never
// overwrite real progress with empty defaults.
let loaded = false

/** Load saved progress into `state`. Await this before mounting the app. */
export async function initProgress() {
  Object.assign(state, await loadState())
  loaded = true

  // Write pending changes straight away when the page is hidden or closed: on mobile
  // the OS may kill a backgrounded app before the debounce timer fires.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistNow()
  })
  window.addEventListener('pagehide', persistNow)
}

// Debounced persistence: practice time ticks ~10x/sec, so avoid hammering storage.
let saveTimer = null
function persistSoon() {
  if (!loaded || saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    saveState(state)
  }, 1000)
}
export function persistNow() {
  if (!loaded) return
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  saveState(state)
}

function award(points) {
  state.pointsBalance += points
  state.pointsEarnedLifetime += points
  state.sessionPoints += points
}

/**
 * Accrue practice time and award any whole points it crosses.
 * Pass { session: false } to count time without touching the Metronome tab's
 * "Session Timer" (e.g. time from the stepped-tempo runner).
 */
function tick(deltaSeconds, { session = true } = {}) {
  if (!(deltaSeconds > 0)) return
  if (session) state.sessionSeconds += deltaSeconds
  state.lifetimeSeconds += deltaSeconds
  const today = todayISO()
  state.dailySeconds[today] = (state.dailySeconds[today] || 0) + deltaSeconds
  state.pointsProgressSeconds += deltaSeconds
  while (state.pointsProgressSeconds >= POINTS_THRESHOLD_SECONDS) {
    state.pointsProgressSeconds -= POINTS_THRESHOLD_SECONDS
    award(1)
  }
  persistSoon()
}

/** Call when a practice session begins: updates the daily streak once per day. */
function startSession() {
  const today = todayISO()
  if (state.lastPracticeDate === today) return // already counted today

  if (!state.lastPracticeDate) {
    state.streak = 1
  } else {
    const diff = daysBetween(state.lastPracticeDate, today)
    if (diff === 1) state.streak += 1        // consecutive day
    else if (diff > 1) state.streak = 1      // streak broken
    else state.streak = Math.max(state.streak, 1) // clock moved back, don't punish
  }
  state.lastPracticeDate = today

  // Award a consistency bonus once per day for streaks of 3+.
  state.consistencyBonus = state.streak >= 3 ? Math.floor(state.streak / 3) : 0
  if (state.consistencyBonus > 0) award(state.consistencyBonus)

  persistNow()
}

/** Clear the current session's timer/points (keeps lifetime totals). */
function resetSession() {
  state.sessionSeconds = 0
  state.sessionPoints = 0
  state.consistencyBonus = 0
  persistNow()
}

/** Attempt to spend points. Returns false if the balance is insufficient. */
function spend(points) {
  if (state.pointsBalance < points) return false
  state.pointsBalance -= points
  persistNow()
  return true
}

/** Practice this week (since Monday): total seconds and number of days with any practice. */
export function weekTotals() {
  const weekStart = startOfWeekISO()
  let seconds = 0
  let days = 0
  for (const [date, secs] of Object.entries(state.dailySeconds)) {
    if (date >= weekStart && secs > 0) {
      seconds += secs
      days += 1
    }
  }
  return { seconds, days }
}

/** Record the current time for idle-earning calculations (phase 5). */
function markSeen() {
  state.lastSeenAt = Date.now()
  persistNow()
}

export function useProgress() {
  return {
    // durable
    totalPoints: computed(() => state.pointsBalance),
    pointsEarnedLifetime: computed(() => state.pointsEarnedLifetime),
    streak: computed(() => state.streak),
    // current session
    sessionPoints: computed(() => state.sessionPoints),
    formattedTime: computed(() => formatClock(state.sessionSeconds)),
    // points progress
    pointsThresholdSeconds: POINTS_THRESHOLD_SECONDS,
    progressToNextPoint: computed(
      () => (state.pointsProgressSeconds / POINTS_THRESHOLD_SECONDS) * 100,
    ),
    secondsToNextPoint: computed(
      () => Math.ceil(POINTS_THRESHOLD_SECONDS - state.pointsProgressSeconds),
    ),
    consistencyBonus: computed(() => state.consistencyBonus),
    // actions
    tick,
    startSession,
    resetSession,
    spend,
    markSeen,
  }
}
