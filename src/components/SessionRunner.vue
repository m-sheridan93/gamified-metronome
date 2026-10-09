<template>
  <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
    <v-card-title>Session</v-card-title>
    <v-card-text>
      <!-- Running view -->
      <template v-if="isActive">
        <div class="text-center">
          <div class="text-overline">Block {{ currentIndex + 1 }} / {{ blocks.length }}</div>
          <div class="text-h6">{{ currentBlock?.label }}</div>
          <div class="text-h2 my-2">{{ bpm }} <span class="text-h6">bpm</span></div>
          <div class="text-h4 mb-3">{{ formattedTime }}</div>
          <v-progress-linear :model-value="blockProgress" color="primary" height="8" rounded class="mb-4"/>
        </div>
        <div class="text-center">
          <v-btn color="error" variant="outlined" class="mr-2" @click="stop">Stop</v-btn>
          <v-btn color="primary" @click="skip">Skip</v-btn>
        </div>
      </template>

      <!-- Editor view -->
      <template v-else>
        <!-- After a session: offer to save the plan -->
        <v-alert v-if="showSavePrompt" type="success" variant="tonal" density="compact" class="mb-4">
          <div class="mb-2">{{ promptText }}</div>
          <v-btn size="small" color="primary" class="mr-2" @click="openSaveDialog">Save preset</v-btn>
          <v-btn size="small" variant="text" @click="showSavePrompt = false">No thanks</v-btn>
        </v-alert>

        <!-- Presets -->
        <div class="d-flex align-center" style="gap: 8px;">
          <v-select
              :model-value="selectedPresetId"
              :items="pickerItems"
              item-title="name"
              item-value="id"
              label="Preset"
              density="compact"
              hide-details
              @update:model-value="loadPreset"
          />
          <v-btn variant="tonal" size="small" :disabled="rows.length === 0" @click="openSaveDialog">
            <v-icon start>mdi-content-save-outline</v-icon> Save
          </v-btn>
          <v-btn v-if="selectedPreset" icon="mdi-delete-outline" variant="text" size="small"
                 color="error" @click="deleteDialog = true"/>
        </div>
        <div class="text-caption text-medium-emphasis mt-1 mb-3" style="min-height: 1.25em;">
          <span v-if="isEdited">Edited, not saved yet</span>
        </div>

        <div class="text-caption text-medium-emphasis mb-3">
          Each block is a tempo (BPM) held for some minutes. The label is an optional
          note to yourself - e.g. "Slow", "+20", "chorus".
        </div>

        <!-- Auto-build from a goal tempo -->
        <div class="d-flex align-center mb-3" style="gap: 8px;">
          <v-text-field v-model.number="goalBpm" label="Goal BPM" type="number" min="20" max="300"
                        density="compact" hide-details style="max-width: 120px;"/>
          <v-text-field v-model.number="goalMinutes" label="Minutes" type="number" min="1"
                        density="compact" hide-details style="max-width: 120px;"/>
          <v-btn variant="tonal" size="small" :disabled="!goalBpm || !goalMinutes" @click="autoBuild">
            <v-icon start>mdi-auto-fix</v-icon> Generate
          </v-btn>
        </div>
        <v-divider class="mb-4"/>

        <div
            v-for="(row, i) in rows"
            :key="i"
            class="d-flex align-center mb-2"
            style="gap: 8px;"
        >
          <v-text-field v-model.number="row.bpm" label="BPM" type="number" min="20" max="300"
                        density="compact" hide-details style="max-width: 90px;"/>
          <v-text-field v-model.number="row.minutes" label="Min" type="number" min="0" step="0.5"
                        density="compact" hide-details style="max-width: 90px;"/>
          <v-text-field v-model="row.label" label="Label (optional)" placeholder="e.g. Slow"
                        density="compact" hide-details/>
          <v-btn icon="mdi-delete" variant="text" size="small" color="error"
                 @click="removeRow(i)"/>
        </div>

        <v-btn variant="outlined" size="small" class="mb-4" @click="addRow">
          <v-icon start>mdi-plus</v-icon> Add block
        </v-btn>

        <div class="text-center">
          <v-btn color="primary" :disabled="rows.length === 0" @click="startSession">
            Start Session
          </v-btn>
        </div>
      </template>
    </v-card-text>

    <!-- Save preset dialog -->
    <v-dialog v-model="saveDialog" max-width="420">
      <v-card>
        <v-card-title>Save preset</v-card-title>
        <v-card-text>
          <v-text-field
              v-model="saveName"
              label="Name"
              placeholder="e.g. Master of Puppets solo"
              autofocus
              hide-details
              @keyup.enter="confirmSave"
          />
          <div v-if="willUpdate" class="text-caption text-medium-emphasis mt-2">
            This will update the existing preset with that name.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" @click="saveDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!saveName.trim()" @click="confirmSave">
            {{ willUpdate ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete preset dialog -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card>
        <v-card-title>Delete preset?</v-card-title>
        <v-card-text>
          "{{ selectedPreset?.name }}" will be removed. Your session history isn't affected.
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import {useSessionRunner} from '../composables/useSessionRunner'
import {usePresets, sameBlocks, suggestName, DEFAULT_SELECTION} from '../composables/usePresets'

const {
  presets, savePreset, deletePreset, markUsed, getPreset, nameExists,
  openSelection, rememberSelection,
} = usePresets()

const DEFAULT_ROWS = [
  {bpm: 60, minutes: 2, label: 'Slow'},
  {bpm: 80, minutes: 2, label: '+20'},
  {bpm: 70, minutes: 2, label: '-10'},
]

// Copy blocks so editing the rows never mutates a saved preset.
function copyBlocks(blocks) {
  return blocks.map((b) => ({...b}))
}

// The picker always offers the built-in default plan first, then saved presets.
const pickerItems = computed(() => [
  {id: DEFAULT_SELECTION, name: 'Default plan'},
  ...presets.value,
])

function blocksFor(id) {
  return id === DEFAULT_SELECTION ? DEFAULT_ROWS : (getPreset(id)?.blocks ?? DEFAULT_ROWS)
}

// Open on whatever was last selected (a preset or the default plan).
const selectedPresetId = ref(openSelection.value)
const rows = ref(copyBlocks(blocksFor(selectedPresetId.value)))

// The selected saved preset, or null when the default plan is selected.
const selectedPreset = computed(() => getPreset(selectedPresetId.value))
const isEdited = computed(() => !!selectedPreset.value && !sameBlocks(rows.value, selectedPreset.value.blocks))

function loadPreset(id) {
  const target = id ?? DEFAULT_SELECTION
  selectedPresetId.value = target
  rows.value = copyBlocks(blocksFor(target))
  rememberSelection(target)
}

// Save dialog. Prefills the loaded preset's name, or a name built from the plan.
const saveDialog = ref(false)
const saveName = ref('')
const willUpdate = computed(() => !!saveName.value.trim() && nameExists(saveName.value))

function openSaveDialog() {
  saveName.value = selectedPreset.value?.name ?? suggestName(rows.value)
  saveDialog.value = true
}

function confirmSave() {
  if (!saveName.value.trim()) return
  const p = savePreset(saveName.value, rows.value)
  selectedPresetId.value = p.id
  rememberSelection(p.id)
  saveDialog.value = false
  showSavePrompt.value = false
}

// Delete dialog. Afterwards, fall back to the default plan.
const deleteDialog = ref(false)
function confirmDelete() {
  deletePreset(selectedPresetId.value)
  deleteDialog.value = false
  loadPreset(DEFAULT_SELECTION)
}

// Goal-based auto-builder inputs.
const goalBpm = ref(null)
const goalMinutes = ref(10)

const {
  blocks, isActive, currentIndex, secondsLeft, currentBlock, bpm,
  start, stop, skip,
} = useSessionRunner([])

function addRow() {
  rows.value.push({bpm: 100, minutes: 2, label: ''})
}

function removeRow(i) {
  rows.value.splice(i, 1)
}

// Build a ramp of 1-minute blocks from an auto-picked start tempo up to the goal.
function generateRamp(goal, totalMinutes) {
  const g = Math.round(Number(goal))
  const mins = Math.max(1, Math.round(Number(totalMinutes)))
  // Ease in from ~60% of the goal, with a floor, and never above the goal.
  const start = Math.min(g, Math.max(40, Math.round(g * 0.6)))
  if (mins === 1) return [{bpm: g, minutes: 1, label: 'Goal'}]

  const span = g - start
  const out = []
  for (let i = 0; i < mins; i++) {
    const t = i / (mins - 1)             // 0 → 1 across the blocks
    out.push({
      bpm: Math.round(start + span * t), // linear ramp
      minutes: 1,
      label: i === mins - 1 ? 'Goal' : '',
    })
  }
  return out
}

function autoBuild() {
  rows.value = generateRamp(goalBpm.value, goalMinutes.value)
}

function startSession() {
  showSavePrompt.value = false
  sessionStartedAt = Date.now()
  if (selectedPreset.value) markUsed(selectedPreset.value.id)
  // Convert the editor's minutes into the engine's seconds, then run.
  blocks.value = rows.value.map((r) => ({
    bpm: Number(r.bpm),
    seconds: Math.round(Number(r.minutes) * 60),
    label: r.label || `${r.bpm} bpm`,
  }))
  start()
}

// When a session ends, offer to save its plan if it isn't already saved unchanged.
// Skip very short runs (accidental start/stop).
const showSavePrompt = ref(false)
let sessionStartedAt = 0

watch(isActive, (active, wasActive) => {
  if (!wasActive || active) return
  const ranLongEnough = Date.now() - sessionStartedAt >= 10000
  const unsaved = !selectedPreset.value || isEdited.value
  showSavePrompt.value = ranLongEnough && unsaved
})

const promptText = computed(() => (isEdited.value
    ? `Save your changes to "${selectedPreset.value.name}"?`
    : 'Good session. Save it as a preset for next time?'))

const formattedTime = computed(() => {
  const s = Math.max(0, secondsLeft.value)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

const blockProgress = computed(() => {
  if (!currentBlock.value) return 0
  const total = currentBlock.value.seconds
  return ((total - secondsLeft.value) / total) * 100
})
</script>
