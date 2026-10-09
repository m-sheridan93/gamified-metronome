import { computed } from 'vue'
import { state, persistNow } from './useProgress'
import { newId } from '../lib/ids'

/**
 * Saved session plans ("presets"), e.g. "Master of Puppets solo, 10 min".
 *
 * Presets store blocks in the editor's units ({ bpm, minutes, label }) so they load
 * straight into the Session editor. Each has a stable id and timestamps so it can sync
 * to a backend later.
 */

/** A clean, serialisable copy of editor rows. */
export function cleanBlocks(rows) {
  return rows.map((r) => ({
    bpm: Number(r.bpm),
    minutes: Number(r.minutes),
    label: r.label || '',
  }))
}

/** True if two block lists describe the same plan. */
export function sameBlocks(a, b) {
  return JSON.stringify(cleanBlocks(a)) === JSON.stringify(cleanBlocks(b))
}

/** A default name from the plan itself, e.g. "60 → 90 bpm, 6 min". */
export function suggestName(rows) {
  if (!rows.length) return ''
  const bpms = rows.map((r) => Number(r.bpm))
  const low = Math.min(...bpms)
  const high = Math.max(...bpms)
  const minutes = Math.round(rows.reduce((sum, r) => sum + Number(r.minutes || 0), 0) * 10) / 10
  const range = low === high ? `${low} bpm` : `${low} → ${high} bpm`
  return `${range}, ${minutes} min`
}

/** Picker value for the built-in starter plan (not a stored preset). */
export const DEFAULT_SELECTION = 'default'

function findByName(name) {
  const key = name.trim().toLowerCase()
  return state.presets.find((p) => p.name.toLowerCase() === key) ?? null
}

export function usePresets() {
  // Alphabetical for the picker.
  const presets = computed(() => [...state.presets].sort((a, b) => a.name.localeCompare(b.name)))

  // The most recently used (or saved) preset, to auto-load on the Session tab.
  const mostRecent = computed(() => {
    let best = null
    for (const p of state.presets) {
      if (!best || (p.lastUsedAt ?? '') > (best.lastUsedAt ?? '')) best = p
    }
    return best
  })

  /** Save rows under a name. Saving to an existing name updates that preset. */
  function savePreset(name, rows) {
    const now = new Date().toISOString()
    const existing = findByName(name)
    if (existing) {
      existing.blocks = cleanBlocks(rows)
      existing.updatedAt = now
      existing.lastUsedAt = now
      persistNow()
      return existing
    }
    const preset = {
      id: newId(),
      name: name.trim(),
      blocks: cleanBlocks(rows),
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
    }
    state.presets.push(preset)
    persistNow()
    return preset
  }

  function deletePreset(id) {
    const i = state.presets.findIndex((p) => p.id === id)
    if (i >= 0) {
      state.presets.splice(i, 1)
      persistNow()
    }
  }

  function markUsed(id) {
    const p = state.presets.find((x) => x.id === id)
    if (p) {
      p.lastUsedAt = new Date().toISOString()
      persistNow()
    }
  }

  function getPreset(id) {
    return state.presets.find((p) => p.id === id) ?? null
  }

  // Which plan the Session tab opens on: the last selection (a preset id or the
  // default plan). Saves from before this setting existed fall back to the most
  // recently used preset.
  const openSelection = computed(() => {
    const remembered = state.settings.sessionPresetId
    if (remembered === DEFAULT_SELECTION) return DEFAULT_SELECTION
    if (remembered && getPreset(remembered)) return remembered
    return mostRecent.value?.id ?? DEFAULT_SELECTION
  })

  function rememberSelection(id) {
    state.settings.sessionPresetId = id
    persistNow()
  }

  return {
    presets, mostRecent, savePreset, deletePreset, markUsed, getPreset,
    openSelection, rememberSelection,
    nameExists: (name) => !!findByName(name),
  }
}
