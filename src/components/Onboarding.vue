<template>
  <v-dialog
      :model-value="modelValue"
      persistent
      scrollable
      max-width="560"
      :fullscreen="smAndDown"
  >
    <v-card>
      <v-card-title>{{ editing ? 'Your profile' : 'Set up your practice' }}</v-card-title>
      <v-card-subtitle>Step {{ step + 1 }} of {{ STEP_COUNT }}</v-card-subtitle>
      <v-progress-linear :model-value="((step + 1) / STEP_COUNT) * 100" color="primary" class="mt-2"/>

      <v-card-text style="min-height: 300px;">
        <!-- Step 1: instrument and level -->
        <template v-if="step === 0">
          <div class="text-subtitle-1 mb-2">What do you play?</div>
          <v-chip-group v-model="answers.instruments" multiple column filter>
            <v-chip v-for="i in INSTRUMENTS" :key="i" :value="i">{{ i }}</v-chip>
          </v-chip-group>

          <div class="text-subtitle-1 mt-4 mb-2">How would you describe your level?</div>
          <v-chip-group v-model="answers.level" column filter>
            <v-chip v-for="l in LEVELS" :key="l.value" :value="l.value">{{ l.title }}</v-chip>
          </v-chip-group>
        </template>

        <!-- Step 2: music and focus -->
        <template v-else-if="step === 1">
          <div class="text-subtitle-1 mb-2">What kind of music do you play?</div>
          <v-chip-group v-model="answers.genres" multiple column filter>
            <v-chip v-for="g in GENRES" :key="g" :value="g">{{ g }}</v-chip>
          </v-chip-group>

          <div class="text-subtitle-1 mt-4 mb-2">What do you like to practice?</div>
          <v-chip-group v-model="answers.focus" multiple column filter>
            <v-chip v-for="f in FOCUS_AREAS" :key="f" :value="f">{{ f }}</v-chip>
          </v-chip-group>
        </template>

        <!-- Step 3: goals -->
        <template v-else-if="step === 2">
          <div class="text-subtitle-1 mb-2">How many days a week do you want to practice?</div>
          <v-chip-group v-model="answers.goals.daysPerWeek" mandatory column filter>
            <v-chip v-for="d in DAY_OPTIONS" :key="d" :value="d">{{ d }}</v-chip>
          </v-chip-group>

          <div class="text-subtitle-1 mt-4 mb-2">And for how long on those days?</div>
          <v-chip-group v-model="answers.goals.minutesPerDay" mandatory column filter>
            <v-chip v-for="m in MINUTE_OPTIONS" :key="m" :value="m">{{ m }} min</v-chip>
          </v-chip-group>

          <div class="text-caption text-medium-emphasis mt-4">
            Start with something you can keep up. You can change it any time.
          </div>
        </template>

        <!-- Step 4: summary -->
        <template v-else>
          <div class="text-subtitle-1 mb-3">Here's what you'll aim for:</div>
          <v-list density="compact" class="pa-0">
            <v-list-item prepend-icon="mdi-calendar-today" :title="`Practice ${humanDuration(targets.dailySeconds)} a day`"/>
            <v-list-item prepend-icon="mdi-calendar-week" :title="`On ${plural(targets.weeklyDays, 'day')} a week`"/>
            <v-list-item prepend-icon="mdi-clock-outline" :title="`That's ${humanDuration(targets.weeklySeconds)} a week`"/>
          </v-list>
          <div class="text-body-2 text-medium-emphasis mt-4">
            These become your daily and weekly challenges. Your answers are saved on this
            device only. Change them any time from the profile button in the top bar.
          </div>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-btn v-if="step === 0" variant="text" @click="skipOrCancel">
          {{ editing ? 'Cancel' : 'Skip for now' }}
        </v-btn>
        <v-btn v-else variant="text" @click="step--">Back</v-btn>
        <v-spacer/>
        <v-btn v-if="step < STEP_COUNT - 1" color="primary" variant="flat" @click="step++">Next</v-btn>
        <v-btn v-else color="primary" variant="flat" @click="finish">{{ editing ? 'Save' : 'Finish' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import {useDisplay} from 'vuetify'
import {
  useProfile, INSTRUMENTS, LEVELS, GENRES, FOCUS_AREAS, DAY_OPTIONS, MINUTE_OPTIONS,
} from '../composables/useProfile'
import {challengeTargets} from '../composables/useChallenges'
import {humanDuration, plural} from '../lib/format'

const props = defineProps({modelValue: Boolean})
const emit = defineEmits(['update:modelValue'])

const {smAndDown} = useDisplay()
const {profile, currentAnswers, saveProfile, skipOnboarding} = useProfile()

const STEP_COUNT = 4
const step = ref(0)
const answers = ref(currentAnswers())

// Editing an existing profile (vs first-run onboarding).
const editing = computed(() => !!profile.value)

// What the chosen goals turn into, using the same function as the Challenges tab.
const targets = computed(() => challengeTargets(answers.value.goals))

// Start fresh from the saved profile each time the dialog opens.
watch(() => props.modelValue, (open) => {
  if (open) {
    step.value = 0
    answers.value = currentAnswers()
  }
})

function close() {
  emit('update:modelValue', false)
}

function skipOrCancel() {
  if (!editing.value) skipOnboarding()
  close()
}

function finish() {
  saveProfile(answers.value)
  close()
}
</script>
