import { ref, watch, onScopeDispose } from 'vue'

export const MIN_BPM = 20
export const MAX_BPM = 300

// Sound preferences are shared by every engine (Metronome tab and Session runner),
// so the level picked on the Metronome tab also applies to sessions.
const volume = ref(1)
const soundType = ref('Tick')

// Only one engine sounds at a time: starting one stops whichever was running, so the
// two tabs never click over each other or count the same practice time twice.
let stopActiveEngine = null

/**
 * Metronome audio engine.
 *
 * Uses one long-lived AudioContext and a look-ahead scheduler (the classic
 * "A Tale of Two Clocks" pattern): a cheap timer wakes every LOOKAHEAD_MS and
 * schedules any beats falling inside SCHEDULE_AHEAD seconds against the audio
 * hardware clock. Beat timing therefore comes from the audio clock, not from
 * setInterval, so it does not drift.
 */
export function useMetronome() {
  const LOOKAHEAD_MS = 25      // how often the scheduler wakes
  const SCHEDULE_AHEAD = 0.1   // how far ahead (seconds) we schedule audio

  const bpm = ref(100)
  const isRunning = ref(false)
  const currentBeat = ref(0)   // index of the most recently sounded beat

  let ctx = null
  let schedulerId = null
  let rafId = null
  let nextNoteTime = 0         // audio-clock time of the next beat
  let beatCounter = 0
  const notesInQueue = []      // scheduled beats awaiting their moment (for visuals)
  const beatCallbacks = new Set()

  // Keep BPM sane so 60 / bpm can never blow up.
  watch(bpm, (v) => {
    const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(v || 0)))
    if (clamped !== v) bpm.value = clamped
  })

  /** Register a callback fired once per beat (arg: beat index). Returns an unsubscribe fn. */
  function onBeat(cb) {
    beatCallbacks.add(cb)
    return () => beatCallbacks.delete(cb)
  }

  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    // iOS/Safari suspend the context until a user gesture; resume on start.
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  /**
   * Play a sine tone at an audio-clock time. `shape(gainParam, level)` adds any
   * envelope after the initial level is set; returns the tone's duration in seconds.
   */
  function tone(frequency, time, shape) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    // exponentialRampToValueAtTime cannot touch 0, so floor the level.
    const level = Math.max(volume.value, 0.0001)
    gain.gain.setValueAtTime(level, time)
    const duration = shape(gain.gain, level)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + duration)
  }

  /** Synthesise one click at a precise audio-clock time. */
  function scheduleClick(beatNumber, time) {
    tone(1000, time, (g, level) => {
      if (soundType.value !== 'Tick') return 0.05 // Beep: flat tone.
      // Traditional click: quick attack then exponential decay.
      g.exponentialRampToValueAtTime(level * 0.3, time + 0.02)
      g.exponentialRampToValueAtTime(0.001, time + 0.07)
      return 0.07
    })
    notesInQueue.push({ beat: beatNumber, time })
  }

  /** Schedule every beat that falls within the look-ahead window. */
  function scheduler() {
    while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleClick(beatCounter, nextNoteTime)
      // Reading bpm here each loop makes tempo changes phase-continuous:
      // already-scheduled beats play, future beats use the new tempo.
      nextNoteTime += 60 / bpm.value
      beatCounter++
    }
  }

  /**
   * Visual sync loop: because audio is scheduled ahead of time, drive UI off
   * the queue: advance currentBeat only once a beat's time has actually passed.
   */
  function drawLoop() {
    const now = ctx ? ctx.currentTime : 0
    while (notesInQueue.length && notesInQueue[0].time <= now) {
      const note = notesInQueue.shift()
      currentBeat.value = note.beat
      beatCallbacks.forEach((cb) => cb(note.beat))
    }
    rafId = requestAnimationFrame(drawLoop)
  }

  function start() {
    if (isRunning.value) return
    if (stopActiveEngine) stopActiveEngine()
    stopActiveEngine = stop
    ensureContext()
    beatCounter = 0
    currentBeat.value = 0
    notesInQueue.length = 0
    nextNoteTime = ctx.currentTime + 0.05 // small offset so the first beat isn't clipped
    schedulerId = setInterval(scheduler, LOOKAHEAD_MS)
    rafId = requestAnimationFrame(drawLoop)
    isRunning.value = true
  }

  function stop() {
    if (!isRunning.value) return
    clearInterval(schedulerId)
    schedulerId = null
    cancelAnimationFrame(rafId)
    rafId = null
    notesInQueue.length = 0
    isRunning.value = false
    if (stopActiveEngine === stop) stopActiveEngine = null
  }

  function toggle() {
    isRunning.value ? stop() : start()
  }

  /** Call after returning from background (iOS may suspend the context). */
  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume()
  }

  /** Play a one-off cue tone (block change / session end), through the same context. */
  function playCue(frequency = 2000, duration = 0.15, delay = 0) {
    const t = ensureContext().currentTime + delay
    tone(frequency, t, (g) => {
      g.exponentialRampToValueAtTime(0.001, t + duration)
      return duration
    })
  }

  // Tear down timers and the audio context when the owning scope unmounts.
  onScopeDispose(() => {
    stop()
    if (ctx) {
      ctx.close()
      ctx = null
    }
  })

  return {
    // state
    bpm,
    volume,
    soundType,
    isRunning,
    currentBeat,
    // controls
    start,
    stop,
    toggle,
    resume,
    onBeat,
    playCue,
  }
}
