import { computed } from 'vue'
import { state, persistNow } from './useProgress'
import { newId } from '../lib/ids'

/**
 * The player's profile: onboarding answers and practice goals.
 *
 * Stored on-device in the save blob. Shaped like the future `profiles` table (stable
 * id, timestamps) so it can sync once accounts exist (see
 * docs/planning/accounts-and-security.md).
 */

export const INSTRUMENTS = [
  'Guitar', 'Bass', 'Piano / Keys', 'Drums', 'Vocals',
  'Violin', 'Cello', 'Brass', 'Woodwind', 'Other',
]

export const LEVELS = [
  { value: 'beginner', title: 'Beginner' },
  { value: 'intermediate', title: 'Intermediate' },
  { value: 'advanced', title: 'Advanced' },
  { value: 'professional', title: 'Professional' },
]

export const GENRES = [
  'Rock', 'Metal', 'Classical', 'Jazz', 'Blues',
  'Pop', 'Folk', 'Funk', 'Electronic', 'Other',
]

export const FOCUS_AREAS = [
  'Scales', 'Songs', 'Technique', 'Original music',
  'Improvisation', 'Sight-reading', 'Theory',
]

export const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7]
export const MINUTE_OPTIONS = [10, 15, 20, 30, 45, 60]
export const DEFAULT_GOALS = { daysPerWeek: 5, minutesPerDay: 20 }

/** Empty answers for a first-time user. */
export function blankAnswers() {
  return { instruments: [], level: null, genres: [], focus: [], goals: { ...DEFAULT_GOALS } }
}

export function useProfile() {
  const profile = computed(() => state.profile)
  // First run: never completed or skipped.
  const needsOnboarding = computed(() => !state.profile)

  /** A detached copy of the current answers, for editing. */
  function currentAnswers() {
    const p = state.profile
    if (!p) return blankAnswers()
    return {
      instruments: [...(p.instruments ?? [])],
      level: p.level ?? null,
      genres: [...(p.genres ?? [])],
      focus: [...(p.focus ?? [])],
      goals: { ...(p.goals ?? DEFAULT_GOALS) },
    }
  }

  function saveProfile(answers) {
    const now = new Date().toISOString()
    const fields = {
      instruments: [...answers.instruments],
      level: answers.level ?? null,
      genres: [...answers.genres],
      focus: [...answers.focus],
      goals: { ...answers.goals },
    }
    if (state.profile) {
      Object.assign(state.profile, fields, {
        updatedAt: now,
        completedAt: state.profile.completedAt ?? now,
      })
    } else {
      state.profile = { id: newId(), createdAt: now, updatedAt: now, completedAt: now, ...fields }
    }
    persistNow()
  }

  /** Skip first-run onboarding. Goals stay unset, so challenges keep their defaults. */
  function skipOnboarding() {
    if (state.profile) return
    const now = new Date().toISOString()
    state.profile = {
      id: newId(), createdAt: now, updatedAt: now,
      completedAt: null, skippedAt: now,
      instruments: [], level: null, genres: [], focus: [], goals: null,
    }
    persistNow()
  }

  /** Forget the profile so first-run onboarding starts again. */
  function resetProfile() {
    state.profile = null
    persistNow()
  }

  return { profile, needsOnboarding, currentAnswers, saveProfile, skipOnboarding, resetProfile }
}
