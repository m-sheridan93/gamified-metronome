# 01 — Platform & Project Setup (Capacitor + iOS)

## Goal

Ship the existing Vue 3 / Vite / Vuetify app as a native iOS app via **Capacitor**,
without rewriting in Swift. Keep the web app runnable in the browser for fast dev.

## Why Capacitor (recap)

- Reuses 100% of the current Vue codebase.
- Produces a real Xcode project → App Store distribution.
- Exposes native capabilities (background audio, haptics, storage) through plugins.
- Escape hatch: if timing/background ever proves inadequate, revisit native SwiftUI —
  but only after real-device testing says so.

## Prerequisites

- macOS with **Xcode** installed (already on Darwin per environment).
- An Apple Developer account (for device testing + App Store; free tier works for
  on-device debugging).
- CocoaPods (`sudo gem install cocoapods`) — Capacitor iOS uses it.
- Node 16+ (already required by the project).

## Setup steps

1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "Gamified Metronome" com.<you>.gamifiedmetronome --web-dir=dist
   ```
2. Add the iOS platform:
   ```bash
   npm install @capacitor/ios
   npm run build          # produces dist/
   npx cap add ios
   ```
3. Dev loop:
   ```bash
   npm run build && npx cap sync ios && npx cap open ios
   ```
   Then run on simulator/device from Xcode. For faster iteration, point Capacitor at
   the Vite dev server (live reload) via `server.url` in `capacitor.config.ts` during
   development, and remove it for release builds.

## Capacitor config notes

- `webDir: 'dist'` (Vite's build output).
- `appId` in reverse-DNS form, stable — changing it later re-provisions the app.
- Consider `ios.contentInset` and `backgroundColor` to match the Vuetify theme.

## Plugins we will likely need

| Concern | Plugin | Notes |
|---|---|---|
| Persist points/inventory | `@capacitor/preferences` | Replaces raw `localStorage`; survives more reliably on iOS. Can keep `localStorage` for MVP. |
| Metronome while locked | background-audio capability | See "Background audio" below. |
| Tactile beat (optional) | `@capacitor/haptics` | Vibrate on downbeat. |
| App lifecycle (idle earning) | `@capacitor/app` | Fires on pause/resume → timestamp for offline earning (`05`). |
| Keep screen awake (optional) | `@capacitor-community/keep-awake` | Prevent dimming during practice. |

## Background audio (the important one)

A plain web app / PWA has its `AudioContext` suspended when iOS backgrounds the app,
so the metronome stops when the screen locks. To keep it ticking:

- Enable the **Audio** background mode in the iOS target
  (`UIBackgroundModes` → `audio` in `Info.plist`).
- Configure the audio session category to `playback` so it continues in background /
  with the silent switch on. (Via a Capacitor audio plugin or a small native shim.)
- Verify on a **real device** — the simulator does not faithfully model background
  audio suspension.

Decision to confirm: do we actually want the metronome to run with the screen locked,
or is "keep screen awake while practicing" enough? The former needs the background-audio
work above; the latter is just `keep-awake` and is much simpler. Recommendation: start
with keep-awake for MVP, add true background audio only if users want it.

## Audio timing in a webview

The metronome must be rewritten to use look-ahead scheduling regardless (see `02`).
In a WKWebView, Web Audio's clock is reliable enough for a metronome **if** we schedule
against `AudioContext.currentTime` rather than `setInterval`. This is the single biggest
risk item — validate early with a real-device test playing at e.g. 200 BPM for several
minutes and checking for drift.

## Storage migration

Today: `localStorage` keys `metronome-total-points`, `metronome-last-practice`,
`metronome-practice-streak`. For iOS reliability, migrate reads/writes behind a small
storage wrapper (see `03`) so we can swap `localStorage` → `@capacitor/preferences`
without touching feature code.

## Deliverables for this phase

- [ ] Capacitor installed, iOS platform added, app boots in simulator.
- [ ] App runs on a real device.
- [ ] Decision recorded: keep-awake vs true background audio.
- [ ] Storage wrapper in place (even if still backed by `localStorage`).
- [ ] Real-device drift test of the current metronome (baseline before the `02` rewrite).

## Risks

- **Audio timing in webview** — biggest unknown; mitigated by `02` rewrite + early test.
- **App Store review** — a metronome + cosmetic game is low-risk, but IAP (if added)
  brings review requirements.
- **Xcode/CocoaPods setup friction** — one-time cost.
