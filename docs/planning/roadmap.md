# Roadmap

How the pile of ideas is sequenced. Companion: `vision.md` (why + the rules).
Buckets are **Now / Next / Later / Someday**, plus a cross-cutting **Platform
foundations** workstream and **Investigations**. Write a per-feature doc only when an
item reaches "Next".

## Status snapshot (built)

- **Metronome engine**: `useMetronome`, drift-free look-ahead scheduler, visual beat,
  `playCue` tones (PRs #2, #7).
- **Progress & state**: `useProgress` + `storage.js`, versioned save blob, lifetime,
  streak, and per-day practice history (PRs #3, #9).
- **Session runner**: stepped-tempo blocks, block editor, goal-BPM ramp builder,
  completion cues (PR #7).
- **Challenges**: daily + weekly auto challenges derived from practice history (PR #9).
- **Onboarding + profile**: first-run setup (skippable), editable from the profile
  button; goals drive the challenge targets. Stored on-device.
- **Saved presets**: name and save a session plan, auto-load the last one used, update
  or delete it; offered after each session.
- **Session logging + History tab**: every free or runner session is recorded with an id
  and timestamps; the History tab shows lifetime hours, this week, and a session list.
- **Shop / studio**: built, then hidden from the UI along with the points card (files
  kept; PRs #4, #8).

## Now: finish the solo core

- ~~Surface lifetime hours~~ Done: shown on the History tab.
- ~~Decide the orphaned Practice Points card~~ Done: hidden (PR #8).
- **Free session mode**: largely covered now that the Metronome tab logs sessions.
  Revisit only if a dedicated "just practice" timer is still wanted.

## Next: the heart of the method (all solo, high personal value)

1. ~~Stepped-tempo session runner~~ Done (PR #7).
2. ~~Savable presets~~ Done. After a session you're offered to save it; the Session tab
   opens on your most recently used preset, with load, update, and delete.
3. ~~Session logging + history~~ Done. Runner and free practice both feed lifetime
   hours, the streak, and challenges.
4. ~~Light onboarding~~ Done (on-device). Instruments, level, genres, focus areas, and
   goals; goals set the challenge targets. Using answers to suggest presets is a
   possible follow-up.

## Later: content & reward polish

- **Badges / medals / rewards**: plan now, but needs **human-designed art** (no AI
  visuals), so hold the visual polish until assets exist. Logic can use `mdi` placeholders.
- **Practice tips / guided templates**: curated, science-backed guidance shown during
  sessions. Content-heavy (research + writing by the author), not code-heavy.
- **Personalised practice suggestions**: use onboarding + history to suggest what to work on.

## Someday: platform (needs backend; deliberate later decision)

Do not build the UI for these until the backend exists and there are real users. Keep
the data model ready for them (see Platform foundations).
Accounts, sign-in, and the security rules for all of this are planned in
`accounts-and-security.md`.

- **Social feed**: what friends practiced; reactions/comments.
- **Comparison-safe custom feed**: toggle to see *who* practiced, not *how much*
  (a `vision.md` principle; design it in when the feed is built).
- **Teacher mode**: "I teach / I'm learning / both" at onboarding; students under a
  teacher; teacher sees student feeds, leaves comments; grad-cap badge; events
  (lessons, recitals); messaging. This is effectively a second product, so scope it as one.

## Platform foundations: do incrementally, starting now

Cheap now, prevents a rewrite later. The point is backend-*ready*, not a backend yet.

- **Explicit domain entities with stable IDs + timestamps**: `Profile`, `Project`,
  `Session`, `Preset`, `Challenge`, `Badge`. Give each a `uuid` and `updatedAt` so they
  can sync/merge later.
- ~~A repository/storage layer~~ Partly done: storage goes through a swappable async
  adapter and loads before the app mounts, so it's ready for native storage on mobile.
  Per-entity repositories are deferred until backend sync, since the single save blob
  maps onto tables at sync time (see `accounts-and-security.md`).
- ~~A "current profile" concept~~ Done: the on-device profile from onboarding.
- ~~Pick a target backend direction~~ Decided: Supabase (Postgres + auth). See
  `accounts-and-security.md`.
- **Keep state serialisable and sync-shaped** (no functions in stored state, deterministic
  IDs, no reliance on array position).

## Mobile delivery: iOS + Android (see `mobile.md`)

The app must ship on both stores. Approach: **Capacitor**, which wraps the existing Vue app:
one codebase → web + iOS + Android. For a web dev this needs no new language; the real
cost is native toolchains (Xcode, Android Studio) and store accounts (Apple $99/yr,
Google $25 once). **Sequencing:** not yet. Do it after the *Next* block, when there's
enough app to be worth installing; Android first (cheaper/faster), iOS after. Optional
early step: stand up the Capacitor shell just for on-device testing while building. Full
plan, prerequisites, and what-changes in `mobile.md`.

## Investigations (research before planning)

- **Music material feasibility**: what's actually possible for a slow-downer with
  YouTube / Spotify / Songsterr / MuseScore? Known walls: Spotify API won't slow tracks;
  YouTube embeds only do fixed speeds; MuseScore in-app viewing isn't openly available;
  Songsterr is its own app. Likely realistic scope: a speed-adjustable player for files
  the *user* owns. Produce a findings note before this pillar gets a plan.

## Dependency notes

- Presets → Stepped-tempo runner.
- Onboarding → the features it configures (runner, challenges, presets).
- Social & Teacher → Platform foundations (backend, accounts).
- Badge visuals → human-designed assets.
