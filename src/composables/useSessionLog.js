import { computed } from 'vue'
import { state, persistNow, weekTotals } from './useProgress'
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

export const MIN_LOGGED_SECONDS = 10 // ignore accidental start/stop taps

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

export function useSessionLog() {
  const sessions = computed(() => [...state.sessions].reverse()) // newest first
  const lifetimeSeconds = computed(() => state.lifetimeSeconds)
  const weekSeconds = computed(() => weekTotals().seconds)
  const sessionCount = computed(() => state.sessions.length)

  return { sessions, lifetimeSeconds, weekSeconds, sessionCount }
}
