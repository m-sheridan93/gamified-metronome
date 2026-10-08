<template>
    <v-card class="mx-auto" style="width: 100%; max-width: 600px;">
        <v-card-title>Session</v-card-title>
        <v-card-text>
            <div v-if="currentBlock" class="text-center">
                <div class="text-overline">Block {{currentIndex +1}} / {{blocks.length}}</div>
                <div class="text-h6">{{currentBlock.label}}</div>
                <div class="text-h2 my-2">{{bpm}} <span class="text-h6">bpm</span></div>
                <div class="text-h4 mb-3">{{formattedTime}}</div>
                <v-progress-linear
                :model-value="blockProgress"
                color="primary"
                height="8"
                rounded
                class="mb-4"
                >
            </v-progress-linear>
        </div>
        <div v-else class="text-center text-medium-emphasis py-6">
            Press start to begin your session.
        </div>

        <div class="text-center">
            <v-btn v-if="!isActive" color="primary"
            @click="start">Start Session
        </v-btn>
        <template v-else>
            <v-btn color="error" variant="outlined" class="mr-2"
            @click="stop">Stop
        </v-btn>
        <v-btn color="primary"
        @click="skip">Skip
    </v-btn>
</template>
</div>
</v-card-text>
</v-card>
</template>

<script setup>
    import {computed} from 'vue'
    import {useSessionRunner} from '../composables/useSessionRunner'

    // Hardcoded sample for now — short blocks so it's quick to test.
    // Step 3 will let you build these in the UI.
    const sampleBlocks = [
    {bpm: 60, seconds: 5, label: 'Slow'},
    {bpm: 80, seconds: 5, label: '+20'},
    {bpm: 70, seconds: 5, label: '-10'},
    {bpm: 90, seconds: 5, label: '+20'},
    ]

    const {
    blocks, isActive, currentIndex, secondsLeft, currentBlock, bpm,
    start, stop, skip,
} = useSessionRunner(sampleBlocks)

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
