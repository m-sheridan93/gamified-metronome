<template>
  <div>
    <v-text-field
        :model-value="bpm"
        @update:modelValue="emit('update:bpm', $event)"
        label="BPM"
        type="number"
        min="20"
        max="300"
        class="mt-2"
    />
    <v-slider
        :model-value="bpm"
        @update:modelValue="emit('update:bpm', $event)"
        :min="20"
        :max="300"
        step="1"
        label="BPM"
        class="mt-4"
    />
    <v-slider
        :model-value="volume"
        @update:modelValue="emit('update:volume', $event)"
        :min="0"
        :max="1"
        :step="0.01"
        label="VOL"
        class="mt-4"
    />
    <div class="text-caption mb-2">Volume: {{ Math.round(volume * 100) }}%</div>
    <v-select
        :model-value="soundType"
        @update:modelValue="emit('update:soundType', $event)"
        :items="['Tick', 'Beep']"
        label="Sound Type"
        class="mt-4"
    />
    <div>Current BPM: {{ bpm }}</div>
  </div>
</template>

<script setup>
const props = defineProps(['bpm', 'volume', 'soundType'])
const emit = defineEmits(['update:bpm', 'update:volume', 'update:soundType'])
</script>
