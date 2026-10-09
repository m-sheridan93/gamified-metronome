# Vision & Principles

The North Star and the rules that keep scope sane. This supersedes the roadmap in the
archived `00-overview.md`. Companion: `roadmap.md` (what, in what order).

## What it is

A practice tool for musicians that makes focused, deliberate practice easy to *do*,
easy to *log*, and rewarding to *keep up*. The metronome is **one feature inside it**,
not the point.

North Star: **the tool the author would open every single day to practice.**

## Who it's for

- **Primary user: the author**, a performing guitarist who practices with a specific
  method (timed blocks, stepped tempos). If he wouldn't use it daily, it isn't done.
- **Then**: other practicing musicians who want structure and a record of their work.
- **Eventually (platform phase)**: teachers tracking students; friends keeping each
  other accountable.

## Ambition & stance

- **Side project.** The author has a day job; there's no revenue pressure and no need
  to out-feature the incumbents (Modacity, Etuda, Tonara, Riffshed; see `roadmap.md`).
  "Let's see" is a valid goal.
- **But architected to grow.** The author is a fullstack developer and wants the
  foundations set up well *early*, so social, accounts, and teacher mode can be built
  on later without a rewrite. We sequence features solo-first, but we do **not** make
  solo-only architectural choices that block a backend.

## The solo → platform line

There is an architectural fault line in the feature set:

- **Solo** (runs on-device, no server): metronome, sessions, presets, logging, streaks,
  challenges, badges, onboarding, practice tips.
- **Platform** (needs backend + accounts + other people): social feed, custom feed,
  teacher mode, students, comments, events.

**Rule:** build *features* solo-first (don't build social UI with no users), but keep
the *data model and storage layer* backend-ready from day one. Crossing into platform is
a deliberate, later decision; the architecture should make it a plug-in, not a rebuild.

## Product pillars

1. **Practice Engine**: metronome, free + guided (stepped-tempo) sessions, savable
   presets, session logging, lifetime hours.
2. **Motivation**: streaks, challenges, badges/medals.
3. **Personalisation**: onboarding (instruments, level, genres, weekly/daily goals,
   what you like to practice) that configures the above.
4. **Guidance**: science-backed practice tips and guided session templates.
5. **Music material**: slow-downer / embedded players (feasibility unproven; see
   roadmap investigation).
6. **Social** *(platform)*: practice feed, friends, the comparison-safe custom feed.
7. **Teacher mode** *(platform)*: student tracking, feeds, comments, events.

## Principles & constraints

- **Build for self first.** The daily-use test above is the acceptance bar.
- **No AI-generated visuals or designs.** Humans design the look. The current stack
  (Vuetify Material components + `mdi` icons) is a human-designed system and is fine as
  the baseline; anything illustrative (badges, medals, any studio art) waits for real
  assets from a person. AI writes code, not art.
- **Comparison can harm.** Social media's "how much did everyone else do" drives anxiety.
  If/when a feed exists, **"see *who* practiced, not *how much*" is a first-class
  option**, not an afterthought. Never force comparison. Captured now so it's baked in
  later, not bolted on.
- **Backend-ready by construction.** Domain entities have stable IDs and timestamps,
  domain logic talks to a storage layer it doesn't own, and there is a "current profile"
  concept even while single-user. See `roadmap.md` → Platform foundations.
- **The metronome is a feature, not the centre.** Framing, navigation, and docs should
  reflect that.

## Non-goals (for now)

- Beating the incumbents on feature count.
- Standing up a server before solo features justify it.
- Monetisation mechanics. (Revisit only if it's actually getting used.)
- AI-generated imagery of any kind.
