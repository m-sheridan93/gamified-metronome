# Roadmap

How the pile of ideas is sequenced. Companion: `vision.md` (why + the rules).
Buckets are **Now / Next / Later / Someday**, plus a cross-cutting **Platform
foundations** workstream and **Investigations**. Write a per-feature doc only when an
item reaches "Next".

## Status snapshot (built)

- **Metronome engine** — `useMetronome`, drift-free look-ahead scheduler, visual beat
  (PRs #2).
- **Progress & state** — `useProgress` + `storage.js`, versioned save blob, balance vs
  lifetime split, hardened streak, per-day practice history (PR #3, + challenges work).
- **Shop / studio** — built then **parked** (files kept, tabs hidden). Points still
  accrue under the hood (PR #4).
- **Challenges** — daily + weekly auto challenges derived from history (challenges branch).

## Now — finish the solo core

- **Surface lifetime hours** — the emotional hook ("20 years, never knew"). Already
  tracked (`lifetimeSeconds`); just needs a home in the UI.
- **Free session mode** — plain metronome + timer, "just practise," logs time. Low effort.
- **Decide the orphaned Practice Points card** — with the shop parked, swap it for a
  lifetime-hours / today's-challenge summary, or hide it.

## Next — the heart of the method (all solo, high personal value)

Build in this order; each depends on the previous:

1. **Stepped-tempo session runner** — define a sequence of tempo blocks
   (`60bpm·2m → 80·2m → 70·2m …`); the metronome auto-shifts BPM, a per-block countdown
   runs, a chime advances. This is *the* method, and it sits on the existing engine
   (phase-continuous BPM is already there).
2. **Savable presets** — after a runner session, "save this?" → reload "Master of
   Puppets solo, 10 min" next time from a presets list. Depends on the runner.
3. **Session logging + history** — every session (free or runner) recorded; a history
   view; feeds lifetime hours and the challenges.
4. **Light onboarding** — instruments, level, genres, weekly/daily practice goals, what
   you like to practise. Build *after* the above, because it configures them (goals set
   challenge targets; preferences seed presets). Onboarding before that configures nothing.

## Later — content & reward polish

- **Badges / medals / rewards** — plan now, but needs **human-designed art** (no AI
  visuals), so hold the visual polish until assets exist. Logic can use `mdi` placeholders.
- **Practice tips / guided templates** — curated, science-backed guidance shown during
  sessions. Content-heavy (research + writing by the author), not code-heavy.
- **Personalized practice suggestions** — use onboarding + history to suggest what to work on.

## Someday — platform (needs backend; deliberate later decision)

Do not build the UI for these until the backend exists and there are real users. Keep
the data model ready for them (see Platform foundations).

- **Social feed** — what friends practised; reactions/comments.
- **Comparison-safe custom feed** — toggle to see *who* practised, not *how much*
  (a `vision.md` principle; design it in when the feed is built).
- **Teacher mode** — "I teach / I'm learning / both" at onboarding; students under a
  teacher; teacher sees student feeds, leaves comments; grad-cap badge; events
  (lessons, recitals); messaging. This is effectively a second product — scope it as one.

## Platform foundations — do incrementally, starting now

Cheap now, prevents a rewrite later. The point is backend-*ready*, not a backend yet.

- **Explicit domain entities with stable IDs + timestamps**: `Profile`, `Project`,
  `Session`, `Preset`, `Challenge`, `Badge`. Give each a `uuid` and `updatedAt` so they
  can sync/merge later.
- **A repository/storage layer** the domain talks through (extend today's `storage.js`
  into per-entity repos). Keep call sites async-friendly so `localStorage` can be swapped
  for a REST/Supabase backend without touching features.
- **A "current profile" concept** now, even single-user, so accounts slot in cleanly.
- **Pick a target backend direction** (e.g. Supabase/Postgres, or a small Node API) —
  decide, don't build — so entities are shaped to fit it.
- **Keep state serializable and sync-shaped** (no functions in stored state, deterministic
  IDs, no reliance on array position).

## Mobile delivery — iOS + Android (see `mobile.md`)

The app must ship on both stores. Approach: **Capacitor** — wrap the existing Vue app,
one codebase → web + iOS + Android. For a web dev this needs no new language; the real
cost is native toolchains (Xcode, Android Studio) and store accounts (Apple $99/yr,
Google $25 once). **Sequencing:** not yet — do it after the *Next* block, when there's
enough app to be worth installing; Android first (cheaper/faster), iOS after. Optional
early step: stand up the Capacitor shell just for on-device testing while building. Full
plan, prerequisites, and what-changes in `mobile.md`.

## Investigations (research before planning)

- **Music material feasibility** — what's actually possible for a slow-downer with
  YouTube / Spotify / Songsterr / MuseScore? Known walls: Spotify API won't slow tracks;
  YouTube embeds only do fixed speeds; MuseScore in-app viewing isn't openly available;
  Songsterr is its own app. Likely realistic scope: a speed-adjustable player for files
  the *user* owns. Produce a findings note before this pillar gets a plan.

## Dependency notes

- Presets → Stepped-tempo runner.
- Onboarding → the features it configures (runner, challenges, presets).
- Social & Teacher → Platform foundations (backend, accounts).
- Badge visuals → human-designed assets.
