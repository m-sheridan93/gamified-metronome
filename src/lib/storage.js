/**
 * Persistence for player progress.
 *
 * Everything durable lives in one versioned JSON blob under a single key, so the
 * schema can evolve with a `version` bump rather than a scatter of string keys.
 * Backed by localStorage today; the read/write surface is small enough to swap for
 * @capacitor/preferences later without touching feature code.
 */

const STORAGE_KEY = 'gm-progress'
const SCHEMA_VERSION = 1

/** A fresh, empty progress blob. */
export function defaults() {
  return {
    version: SCHEMA_VERSION,
    // Economy
    pointsBalance: 0,          // spendable wallet
    pointsEarnedLifetime: 0,   // never decreases (achievements/stats)
    pointsProgressSeconds: 0,  // practice seconds banked toward the next point
    // Practice history
    lifetimeSeconds: 0,        // total practice time ever
    dailySeconds: {},          // { 'YYYY-MM-DD': seconds } — powers challenges
    streak: 0,
    lastPracticeDate: '',      // local YYYY-MM-DD
    consistencyBonus: 0,       // last streak bonus awarded (for the UI chip)
    lastSeenAt: 0,             // epoch ms, reserved for idle earning (phase 5)
    // Current session (persisted so a reload mid-practice doesn't lose it)
    sessionSeconds: 0,
    sessionPoints: 0,
    // Reserved for later phases
    inventory: {},             // phase 4 (shop/studio)
    settings: {},              // metronome prefs
  }
}

/** Load progress, merging over defaults and migrating legacy keys on first run. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return migrate({ ...defaults(), ...JSON.parse(raw) })
    }
    const legacy = loadLegacy()
    if (legacy) {
      saveState(legacy)
      return legacy
    }
  } catch (e) {
    // Corrupt/unavailable storage — fall back to a clean slate rather than crash.
    console.warn('Failed to load progress, starting fresh:', e)
  }
  return defaults()
}

/** Persist the full progress blob. Swallows quota/availability errors. */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save progress:', e)
  }
}

/** Forward-migrate an older blob to the current schema. No-op for v1. */
function migrate(state) {
  state.version = SCHEMA_VERSION
  return state
}

/** One-time import from the pre-v1 loose localStorage keys. */
function loadLegacy() {
  const total = localStorage.getItem('metronome-total-points')
  const lastPractice = localStorage.getItem('metronome-last-practice')
  const streak = localStorage.getItem('metronome-practice-streak')
  if (total == null && lastPractice == null && streak == null) return null

  const points = parseInt(total || '0', 10) || 0
  return {
    ...defaults(),
    pointsBalance: points,
    pointsEarnedLifetime: points,
    streak: parseInt(streak || '0', 10) || 0,
    lastPracticeDate: normalizeDate(lastPractice),
  }
}

/** Today's date as a local YYYY-MM-DD string. */
export function todayISO() {
  return toISO(new Date())
}

/** Whole-day difference (toISO - fromISO), computed at local midnight to dodge DST. */
export function daysBetween(fromISO, toISODate) {
  const a = new Date(`${fromISO}T00:00:00`)
  const b = new Date(`${toISODate}T00:00:00`)
  return Math.round((b - a) / 86400000)
}

/** Monday of the current (or given) week, as a local YYYY-MM-DD string. */
export function startOfWeekISO(date = new Date()) {
  const d = new Date(date)
  const mondayOffset = (d.getDay() + 6) % 7 // Sun=6, Mon=0, ... Sat=5
  d.setDate(d.getDate() - mondayOffset)
  return toISO(d)
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Best-effort convert a legacy date string (e.g. "Mon Jul 06 2026") to YYYY-MM-DD. */
function normalizeDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return isNaN(d.getTime()) ? '' : toISO(d)
}
