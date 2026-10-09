import { computed } from 'vue'
import { state, persistNow } from './useProgress'
import { startOfWeekISO } from '../lib/storage'
import { newId } from '../lib/ids'

/**
 * Practice session log.
 *
 * Every practice run (free metronome or stepped-tempo runner) becomes a record in
 * `state.sessions`. Records carry a stable id and ISO timestamps so they can sync to a
 * backend later without reshaping.
 *
 * Totals (lifetime hours, this week) come from the running accumulators in
 * useProgress, not from summing this list, so time practiced before logging existed
 * still counts.
 */

const MIN_LOGGED_SECONDS = 10 // ignore accidental start/stop taps

/**
 * Start timing a practice session. Returns a handle; call handle.end(extra) when it
 * stops. Returns the saved record, or null if it was too short to keep.
 */
export function beginSession(type, details = {}) {
  const startedAt = Date.now()
  return {
    end(extra = {}) {
      const endedAt = Date.now()
      const durationSeconds = Math.round((endedAt - startedAt) / 1000)
      if (durationSeconds < MIN_LOGGED_SECONDS) return null
      const record = {
        id: newId(),
        type, // 'free' | 'runner'
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        durationSeconds,
        ...details,
        ...extra,
      }
      state.sessions.push(record)
      persistNow()
      return record
    },
  }
}

/** Human-friendly duration: "45s", "12m 30s", "12m", "1h 5m", "2h". Drops zero parts. */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  if (m > 0) return sec > 0 ? `${m}m ${sec}s` : `${m}m`
  return `${sec}s`
}

/** Wordier duration for sentences: "20 minutes", "1 hour 40 minutes", "2 hours". */
export function humanDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  const parts = []
  if (h > 0) parts.push(`${h} hour${h === 1 ? '' : 's'}`)
  if (m > 0) parts.push(`${m} minute${m === 1 ? '' : 's'}`)
  return parts.length ? parts.join(' ') : '0 minutes'
}

export function useSessionLog() {
  const sessions = computed(() => [...state.sessions].reverse()) // newest first
  const lifetimeSeconds = computed(() => state.lifetimeSeconds)
  const weekSeconds = computed(() => {
    const weekStart = startOfWeekISO()
    let total = 0
    for (const [date, secs] of Object.entries(state.dailySeconds)) {
      if (date >= weekStart) total += secs
    }
    return total
  })
  const sessionCount = computed(() => state.sessions.length)

  return { sessions, lifetimeSeconds, weekSeconds, sessionCount }
}
