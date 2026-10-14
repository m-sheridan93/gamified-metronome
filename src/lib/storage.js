/**
 * Persistence for player progress.
 *
 * Everything durable lives in one versioned JSON blob under a single key, so the
 * schema can evolve with a `version` bump rather than a scatter of string keys.
 *
 * Reads and writes go through a storage adapter with an async interface, so the
 * browser's localStorage can be swapped for native storage on iOS/Android (where
 * WebView localStorage can be cleared by the OS) without touching feature code.
 */

const STORAGE_KEY = 'gm-progress'
const SCHEMA_VERSION = 1

/**
 * A storage adapter is any async string key-value store:
 *   { get(key) => Promise<string|null>, set(key, value) => Promise, remove(key) => Promise }
 */
export const localStorageAdapter = {
  async get(key) {
    return localStorage.getItem(key)
  },
  async set(key, value) {
    localStorage.setItem(key, value)
  },
  async remove(key) {
    localStorage.removeItem(key)
  },
}

let adapter = localStorageAdapter

/** Swap the storage backend, e.g. for a native adapter in the mobile app. Call before loading. */
export function setStorageAdapter(next) {
  adapter = next
}

/** A fresh, empty progress blob. */
export function defaults() {
  return {
    version: SCHEMA_VERSION,
    // Economy
    pointsBalance: 0,          // spendable wallet
    pointsEarnedLifetime: 0,   // never decreases (achievements/stats)
    pointsProgressSeconds: 0,  // practice seconds banked towards the next point
    // Practice history
    lifetimeSeconds: 0,        // total practice time ever
    dailySeconds: {},          // { 'YYYY-MM-DD': seconds }, powers challenges
    sessions: [],              // logged practice sessions, oldest first (see useSessionLog)
    presets: [],               // saved session plans (see usePresets)
    profile: null,             // onboarding answers and goals (see useProfile)
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
export async function loadState() {
  let raw = null
  try {
    raw = await adapter.get(STORAGE_KEY)
    if (raw) {
      return migrate({ ...defaults(), ...JSON.parse(raw) })
    }
    const legacy = await loadLegacy()
    if (legacy) {
      await saveState(legacy)
      return legacy
    }
  } catch (e) {
    // Corrupt/unavailable storage: fall back to a clean slate rather than crash. Keep
    // a copy of any unreadable data first, so the next save can't destroy it.
    console.warn('Failed to load progress, starting fresh:', e)
    if (raw) {
      await adapter.set(`${STORAGE_KEY}-unreadable-${Date.now()}`, raw).catch(() => {})
    }
  }
  return defaults()
}

// Writes run one after another, in call order, so a slow native write can never land
// after (and overwrite) a newer one.
let writeQueue = Promise.resolve()

/** Persist the full progress blob. Swallows quota/availability errors. */
export function saveState(state) {
  // Snapshot now, so later changes to `state` don't alter what this write stores.
  const json = JSON.stringify(state)
  writeQueue = writeQueue
    .then(() => adapter.set(STORAGE_KEY, json))
    .catch((e) => console.warn('Failed to save progress:', e))
  return writeQueue
}

/** Forward-migrate an older blob to the current schema. No-op for v1. */
function migrate(state) {
  state.version = SCHEMA_VERSION
  return state
}

/** One-time import from the pre-v1 loose keys. */
async function loadLegacy() {
  const total = await adapter.get('metronome-total-points')
  const lastPractice = await adapter.get('metronome-last-practice')
  const streak = await adapter.get('metronome-practice-streak')
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
