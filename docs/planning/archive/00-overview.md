# Gamified Metronome — Planning Overview

## Vision

A metronome fused with a productivity idle game (in the spirit of *Focus Friend*):

- You use the metronome to practise music.
- Practising earns **points** (time-based, with consistency bonuses).
- Points are **spent** on cosmetics and new features.
- The headline cosmetic is a **studio** you build up over time — rack gear, amps,
  speakers, a grand piano, etc.

The core loop: **practise → earn → spend → see your studio grow → want to practise more.**

## Where the project stands today

Already built (in `src/components/Metronome.vue`):

- Metronome with BPM control, tick/beep sounds, volume.
- Session timer (accumulates practice time, pause/reset).
- Points earning: +1 point per 60s practised, persisted to `localStorage`.
- Day-over-day consistency streak with a bonus every 3 days.

Not yet built — the "game" half:

- Anywhere to **spend** points.
- The **studio** scene and the items you buy for it.
- Idle / offline earning.

Known issues to fix regardless of direction (see `02-metronome-engine.md`):

- Timing uses `setInterval`, which drifts and is not sample-accurate.
- A new `AudioContext` is created on every tick — wasteful and glitchy.
- `totalSessionTime` and `sessionPoints` are **not** persisted, so a mid-practice
  reload loses progress.

## Platform decision

Goal: get to a real **iOS app** while keeping the Vue codebase the author already knows.

**Chosen path: Capacitor** — wrap the Vue web app in a native shell.

| Path | Keep Vue? | App Store? | Timing | Locked-screen audio | Effort |
|---|---|---|---|---|---|
| PWA | Yes | No | OK if rewritten | No (iOS suspends) | Lowest |
| **Capacitor** | **Yes** | **Yes** | **OK if rewritten** | **Yes (bg-audio plugin)** | **Low–med** |
| Native SwiftUI | No | Yes | Best | Yes | High |

Rationale: keeps existing Vue/Vite/Vuetify code, ships to the App Store, and the
background-audio capability lets the metronome keep ticking with the screen locked
(a plain PWA cannot). Drop to native SwiftUI only if webview audio timing proves
insufficient in real testing. Details in `01-platform-setup.md`.

## Roadmap / build order

Each feature has its own planning doc. Decide and approve a doc before building it.

1. **Platform + project setup** — `01-platform-setup.md`
2. **Metronome engine rewrite** — `02-metronome-engine.md`
3. **Progress & state model** — `03-progress-state-model.md`
4. **Shop & studio** — `04-shop-and-studio.md`
5. **Idle / offline earning** — `05-idle-earning.md`

Suggested sequencing rationale:

- 1 first because it constrains everything (plugins, build, audio capabilities).
- 2 next because the whole app's credibility rests on a tight metronome, and it's a
  rewrite either way.
- 3 before 4 because the shop/studio need a clean state layer to build on; today all
  state is tangled inside one component.
- 4 is the motivating payoff (spending points).
- 5 is polish that deepens the loop once it exists.

## Open questions to resolve during planning

- Studio visual style: layered 2D illustration vs icon/card grid vs emoji/CSS scene.
  (Affects art budget and `04-shop-and-studio.md`.)
- Monetisation: free, one-off purchase, or IAP? Affects App Store setup.
- Scope of "features" you can buy vs pure cosmetics (e.g. new sounds, subdivisions,
  time signatures as unlockables).
- Do you want Apple Watch / widgets later? (Would strengthen the native case.)
