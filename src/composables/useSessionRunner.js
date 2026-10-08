import { ref, computed, onScopeDispose } from 'vue'
import { useMetronome } from './useMetronome'

/**
 * Stepped-tempo session runner.
 * A "session" is an ordered list of blocks: { bpm, seconds, label }.
 * Plays each block on the metronome, counts it down, then advances.
 */
export function useSessionRunner(initialBlocks = []) {
    // The runner drives its OWN metronome engine instance.
    const metronome = useMetronome()

    const blocks = ref(initialBlocks) // the session plan
    const isActive = ref(false)       // is a session currently running?
    const currentIndex = ref(0)       // which block we're on
    const secondsLeft = ref(0)        // countdown within the current block

    let countdownId = null

    const currentBlock = computed(() => blocks.value[currentIndex.value] ?? null)

    // Start a specific block: set the tempo and reset its countdown.
    function beginBlock(index) {
        const block = blocks.value[index]
        if (!block) { stop(); return }
        // Cue the change when moving INTO a new block mid-session (not the first).
        if (index > 0) metronome.playCue(2000, 0.14)
        currentIndex.value = index
        secondsLeft.value = block.seconds
        metronome.bpm.value = block.bpm            // phase-continuous tempo change
        if (!metronome.isRunning.value) metronome.start()
    }

    // Called once per second while a session runs.
    function tick() {
        secondsLeft.value -= 1
        if (secondsLeft.value <= 0) {
            const next = currentIndex.value + 1
            if (next < blocks.value.length) beginBlock(next)
            else finish()                            // finished the last block
        }
    }

    function start() {
        if (isActive.value || blocks.value.length === 0) return
        isActive.value = true
        beginBlock(0)
        countdownId = setInterval(tick, 1000)
    }

    function stop() {
        isActive.value = false
        if (countdownId) { clearInterval(countdownId); countdownId = null }
        metronome.stop()
    }

    // Natural end of the session: a little rising flourish, then stop.
    function finish() {
        metronome.playCue(1500, 0.12, 0)
        metronome.playCue(2000, 0.12, 0.14)
        metronome.playCue(2600, 0.20, 0.28)
        stop()
    }

    function skip() {
        if (!isActive.value) return
        const next = currentIndex.value + 1
        if (next < blocks.value.length) beginBlock(next)
        else finish()
    }

    onScopeDispose(stop) // clean up if the component unmounts mid-session

    return {
        blocks, isActive, currentIndex, secondsLeft, currentBlock,
        bpm: metronome.bpm, // exposed for display
        start, stop, skip,
    }
}
