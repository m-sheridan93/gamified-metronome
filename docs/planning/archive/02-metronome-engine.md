# 02: Metronome Engine Rewrite

## Problem with the current engine

In `src/components/Metronome.vue`:

```js
intervalId = setInterval(playMetronomeSound, (60 / bpm.value) * 1000)
// and each tick:
function playTick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()  // new context EVERY tick
  ...
}
```

Two defects:

1. **`setInterval` drifts.** JS timers are not sample-accurate; they're subject to
   event-loop jitter and throttling (especially when backgrounded). Over a few minutes
   the beat wanders audibly. Unacceptable for a metronome.
2. **A new `AudioContext` per tick.** Creating/tearing down a context every beat is
   wasteful, adds latency, and can glitch or hit browser limits. There should be exactly
   one long-lived context.

There's also a smaller bug: changing BPM restarts the interval from "now," so it doesn't
stay phase-aligned with the previous beat grid.

## The correct pattern: look-ahead scheduling

Standard approach (Chris Wilson's "A Tale of Two Clocks"):

- Keep **one** `AudioContext` for the app's lifetime.
- A cheap `setInterval` / timer runs ~every 25ms as a *scheduler*, not the beat source.
- On each wake, schedule any beats that fall within a short **look-ahead window**
  (e.g. 100ms) using `osc.start(preciseTime)` against `AudioContext.currentTime`.
- The actual sound timing is handled by the audio hardware clock → rock-solid, drift-free.

```
nextNoteTime = ctx.currentTime
scheduler():
  while (nextNoteTime < ctx.currentTime + lookahead):
    scheduleClick(nextNoteTime)
    nextNoteTime += 60 / bpm          // advance by one beat
```

Changing BPM just changes the increment; already-scheduled clicks play, future ones use
the new tempo, with no restart, no phase jump.

## Proposed module: `useMetronome` composable

Extract all audio out of the component into `src/composables/useMetronome.js`:

State (refs):
- `bpm`, `volume`, `soundType`, `isRunning`
- `beatsPerBar`, `currentBeat` (for accent + visual indicator)

Methods:
- `start()` / `stop()` / `toggle()`
- `setBpm(n)` (clamped 20–300)
- `tapTempo()` (optional, from README wishlist)

Internals:
- Single `AudioContext` (lazily created on first `start()`: iOS/Safari require a user
  gesture to unlock audio; creating on the Start tap satisfies this).
- Look-ahead scheduler as above.
- One reusable click-synthesis function (oscillator + gain envelope) called with a
  precise `when` time. Keep the existing tick/beep envelopes, just parameterise `when`.
- Emit/expose a per-beat callback so the UI can flash a visual indicator and so the
  points/timer layer can hook in.

## Accent / subdivision (sets up README wishlist)

Design the beat loop around `beatsPerBar` from the start so we can later add:
- Downbeat accent (higher pitch / louder on beat 1).
- Subdivisions (eighths, triplets): schedule N sub-clicks per beat.
- Time signatures.

Even if MVP ships plain quarter notes, structuring for `currentBeat % beatsPerBar`
avoids a second rewrite.

## Visual beat indicator

Because scheduling happens ahead of real time, drive the visual using the scheduled beat
time vs `ctx.currentTime`: push each scheduled beat into a small queue with its `when`,
and in a `requestAnimationFrame` loop pop beats whose time has passed to trigger the flash.
Keeps the visual in sync with what you actually hear.

## iOS / webview specifics

- **Unlock on gesture**: create/resume the `AudioContext` inside the Start button handler.
- **Resume after background**: on app resume (`@capacitor/app`), call `ctx.resume()` if
  the context got suspended.
- **Drift test**: run 200 BPM for 5+ minutes on a real device, record against an external
  reference (or another metronome) and confirm no audible drift.

## Interaction with timer/points

The timer currently lives in the same component. After this rewrite, the metronome
composable should expose `isRunning` and a beat callback; the **progress layer** (`03`)
subscribes to those rather than the component wiring `setInterval` for both audio and
timing. This decouples "is the metronome playing" from "how do we score practice."

## Deliverables

- [ ] `useMetronome.js` composable with single AudioContext + look-ahead scheduler.
- [ ] BPM changes are phase-continuous (no restart glitch).
- [ ] Tick/beep envelopes preserved; `when`-parameterised synthesis.
- [ ] Per-beat callback + `currentBeat` for UI and accents.
- [ ] AudioContext unlock-on-gesture and resume-after-background handled.
- [ ] Real-device drift test passed.

## Nice-to-haves (defer)

- Tap tempo, accent patterns, subdivisions, preset tempo markings (Allegro etc.),
  custom sound uploads, all from the README "Future Enhancements" list.
