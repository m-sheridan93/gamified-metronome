# Gamified Metronome

A practice app for musicians. It started life as a metronome with a little idle game
bolted on, and the game part has mostly gone: what's left is a metronome, a way to run
stepped-tempo practice sessions, and a log of how much you've actually practiced. The
name is a placeholder until a better one turns up.

It's a side project, built for my own guitar practice first. The method it's built
around is simple: pick a passage, start it slower than you can play it cleanly, and
step the tempo up in timed blocks until you reach the speed you're after.

## What it does

- Metronome: 20 to 300 BPM, a tick or a beep, and volume. Time spent with it running
  counts as practice.
- Sessions: a plan is a list of tempo steps (BPM and minutes). Give it a goal BPM
  and how long you've got, and it builds the steps for you. If you're working on a whole
  song, give it the song length and each step becomes whole plays of the song, so it
  never cuts out halfway through a chorus. You can pause, skip a step, and save plans
  you use often.
- Challenges: daily and weekly targets, based on the goals you set when you first
  open the app.
- History: total hours, this week, and a list of past sessions.

Everything is stored on the device for now. There are no accounts yet; backup and sync
are planned in `docs/planning/accounts-and-security.md`.

## Running it

You'll need Node 20.19 or newer (Vite 7 won't run on anything older).

```bash
npm install
npm run dev
```

Then open http://localhost:5173. It's designed for phones first, so shrink the browser
window or use your browser's device mode.

### On an iPhone

The iOS app is the same code wrapped with Capacitor. With Xcode installed:

```bash
npm run ios
```

That builds the app, copies it into the Xcode project and opens Xcode; pick your phone and
press Run. `npm run ios:live` points the phone at your dev server instead, so changes show
up without rebuilding. The full setup, including signing with a free Apple ID, is in
`docs/planning/mobile.md`.

## How it's put together

- `src/components`: the screens (Metronome, Session, Challenges, History, onboarding).
- `src/composables`: the logic and shared state. `useMetronome` is the audio engine,
  `useProgress` holds the saved data, and the rest build on those.
- `src/lib`: plain helpers, including storage and the tempo plan generator (`ramp.js`).
- `ios`: the Xcode project. `design`: the app icon source. `db`: the database schema.
- `docs/planning`: the plan. Start with `vision.md`, then `roadmap.md`.

One thing worth knowing about the metronome: it doesn't tick on a `setInterval`. Timers
in the browser drift and stall, which is the one thing a metronome can't do. Instead a
cheap timer wakes every 25ms and schedules the next tenth of a second of clicks on the
audio hardware's own clock. It's the approach from Chris Wilson's
["A tale of two clocks"](https://web.dev/articles/audio-scheduling).

## What's next

The roadmap lives in `docs/planning/roadmap.md`. Near the top: accounts and sync,
time signatures with accented beats, and keeping the screen awake during a session.

Conventions for branches, commits and pull requests are in `CONTRIBUTING.md`.

No licence has been chosen yet.
