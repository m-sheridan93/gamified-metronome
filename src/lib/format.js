/**
 * Display formatting shared across features (durations, clocks, plurals, tempo ranges).
 */

/** "1 day" / "5 days". */
export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/** Countdown/stopwatch clock: "02:05". Minutes are not wrapped into hours. */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
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
  if (h > 0) parts.push(plural(h, 'hour'))
  if (m > 0) parts.push(plural(m, 'minute'))
  return parts.length ? parts.join(' ') : '0 minutes'
}

/** Tempo range label: "80" or "60 → 90". */
export function bpmRange(low, high) {
  return low === high ? `${low}` : `${low} → ${high}`
}
