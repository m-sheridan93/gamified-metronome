import { ref, computed, onScopeDispose } from 'vue'
import { useMetronome } from './useMetronome'
import { useProgress } from './useProgress'
import { beginSession } from './useSessionLog'

/**
 * Stepped-tempo session runner.
 * A "session" is an ordered list of blocks: { bpm, seconds, label }.
 * Plays each block on the metronome, counts it down, then advances.
 */
export function useSessionRunner(initialBlocks = []) {
    // The runner drives its OWN metronome engine instance.
    const metronome = useMetronome()
    const progress = useProgress()

    const blocks = ref(initialBlocks) // the session plan
    const isActive = ref(false)       // is a session currently running?
    const currentIndex = ref(0)       // which block we're on
    const secondsLeft = ref(0)        // countdown within the current block

    let countdownId = null
    let log = null                    // handle for the session being logged

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
        // Count this second towards lifetime hours, the streak, and challenges
        // (but not the Metronome tab's own session timer).
        progress.tick(1, { session: false })
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
        progress.startSession()
        const bpms = blocks.value.map((b) => b.bpm)
        log = beginSession('runner', {
            blockCount: blocks.value.length,
            bpmLow: Math.min(...bpms),
            bpmHigh: Math.max(...bpms),
        })
        beginBlock(0)
        countdownId = setInterval(tick, 1000)
    }

    // Write the log record. Safe to call twice; only the first call saves.
    function closeLog(completed) {
        if (!log) return
        log.end({
            completed,
            blocksPlayed: completed ? blocks.value.length : currentIndex.value + 1,
        })
        log = null
    }

    // Manual stop (the Stop button) or cleanup. Note: no parameters, because
    // `@click="stop"` passes the click event as the first argument.
    function stop() {
        isActive.value = false
        if (countdownId) { clearInterval(countdownId); countdownId = null }
        metronome.stop()
        closeLog(false)
    }

    // Natural end of the session: a little rising flourish, then stop.
    function finish() {
        metronome.playCue(1500, 0.12, 0)
        metronome.playCue(2000, 0.12, 0.14)
        metronome.playCue(2600, 0.20, 0.28)
        closeLog(true) // log as completed before stop() would log it as stopped early
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
