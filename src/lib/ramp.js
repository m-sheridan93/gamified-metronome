/**
 * Tempo-ramp generator for the Session editor's Generate button.
 *
 * Builds blocks that climb evenly from an auto-picked start tempo up to the goal on the
 * last block. By default each block is 1 minute. Optionally, set the number of tempo
 * steps, and/or a song length so each block is a whole number of plays of the song
 * (a tempo is never cut off mid-song).
 */

/** Parse a song length like "3:12" (m:ss) or "3.5" (minutes) into seconds, or null. */
export function parseSongLength(text) {
  const s = String(text ?? '').trim()
  if (!s) return null
  const mmss = s.match(/^(\d+):([0-5]?\d)$/)
  if (mmss) {
    const seconds = Number(mmss[1]) * 60 + Number(mmss[2])
    return seconds > 0 ? seconds : null
  }
  const minutes = Number(s)
  return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : null
}

/**
 * Build the ramp.
 * @param goal         target tempo in bpm, reached on the last block
 * @param totalMinutes requested session length
 * @param options.steps        number of tempo steps (default: one per minute, or one per play)
 * @param options.songSeconds  length of one play of the song
 * @returns {{ rows, totalSeconds, plays }} editor rows ({ bpm, minutes, label, songSeconds? }),
 *   the actual length after rounding to whole plays, and plays per block (null without a song)
 */
export function generateRamp(goal, totalMinutes, { steps = null, songSeconds = null } = {}) {
  const g = Math.round(Number(goal))
  const requestedSeconds = Math.max(1, Number(totalMinutes)) * 60

  let count // number of blocks, i.e. tempo steps
  let blockSeconds
  let plays = null
  if (songSeconds) {
    // Aim for the requested length per step, but always whole plays of the song.
    count = steps || Math.max(1, Math.round(requestedSeconds / songSeconds))
    plays = Math.max(1, Math.round(requestedSeconds / count / songSeconds))
    blockSeconds = plays * songSeconds
  } else if (steps) {
    count = steps
    blockSeconds = requestedSeconds / steps
  } else {
    count = Math.max(1, Math.round(requestedSeconds / 60))
    blockSeconds = 60
  }

  // Ease in from ~60% of the goal, with a floor, and never above the goal.
  const start = Math.min(g, Math.max(40, Math.round(g * 0.6)))
  const span = g - start
  const minutes = Math.round((blockSeconds / 60) * 100) / 100

  const rows = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 1 : i / (count - 1) // 0 → 1 across the blocks
    rows.push({
      bpm: Math.round(start + span * t),
      minutes,
      label: i === count - 1 ? 'Goal' : '',
      ...(songSeconds ? { songSeconds } : {}),
    })
  }
  return { rows, totalSeconds: count * blockSeconds, plays }
}
