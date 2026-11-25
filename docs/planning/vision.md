# Vision and principles

What this app is for, and the rules that keep its scope in check. This replaces the
roadmap in the archived `00-overview.md`. The order things get built in is in
`roadmap.md`.

## What it is

A practice tool for musicians. It should make focused practice easy to start, easy to
log, and worth keeping up. The metronome is one feature of it, and not the main one.

The test for everything: would the author open it every day to practice?

## Who it's for

- The author first: a performing guitarist with a specific method (timed blocks,
  stepping the tempo up). If the author wouldn't use it daily, it isn't finished.
- Then other musicians who want some structure and a record of what they've done.
- Eventually, once there's a backend: teachers keeping track of students, and friends
  keeping each other going.

## How ambitious

It's a side project. The author has a day job, so there's no revenue pressure and no
need to match the established apps (Modacity, Etuda, Tonara, Riffshed; see
`roadmap.md`) feature for feature. "Let's see where it goes" is a fine goal.

That said, the author is a fullstack developer and wants the groundwork done properly
early on, so accounts, social features and teacher mode can come later without a
rewrite. Features get built for one person first, but nothing in the architecture
should rule out a backend.

## Solo features and platform features

The feature list splits in two:

- Solo, running on the device with no server: metronome, sessions, presets, logging,
  streaks, challenges, badges, onboarding, practice tips.
- Platform, needing a backend, accounts and other people: social feed, custom feed,
  teacher mode, students, comments, events.

So: build features solo-first (there's no point building social screens with no users),
but keep the data model and storage ready for a backend from the start. Moving to the
platform side is a separate decision for later, and when it comes it should mean
connecting a backend, not rebuilding the app.

## What's in scope

1. Practice: metronome, free and stepped-tempo sessions, saved presets, session
   logging, lifetime hours.
2. Motivation: streaks, challenges, badges and medals.
3. Personalisation: onboarding (instruments, level, genres, daily and weekly goals, what
   you like to practice), which then sets up everything above.
4. Guidance: practice tips grounded in research, and guided session templates.
5. Music to practice with: a slow-downer or embedded players. Not yet known to be
   feasible; see the investigation in the roadmap.
6. Social (platform): a practice feed, friends, and a feed that doesn't invite
   comparison.
7. Teacher mode (platform): tracking students, their feeds, comments, events.

## Principles

- Build it for the author first. Daily use is the bar.
- No AI-generated visuals or designs. People design the look. Vuetify's Material
  components and `mdi` icons are a human-made design system, so they're fine as a
  baseline. Anything illustrative (badges, medals, studio art) waits for real artwork
  from a person. AI writes code here, not art.
- Comparison can do harm. Seeing how much everyone else practiced makes people anxious.
  If a feed ever exists, "see who practiced, not how much" has to be a proper option
  from day one, and comparison is never forced. It's written down now so it gets built
  in from the start.
- Ready for a backend from the start. Records have stable ids and timestamps, the app's
  logic goes through a storage layer instead of touching storage directly, and there's
  a "current profile" even with a single user. See "Platform foundations" in
  `roadmap.md`.
- The metronome is a feature, not the whole app, and the navigation and docs should
  reflect that.

## Not doing (for now)

- Competing with the established apps on number of features.
- Running a server before the solo features need one.
- Anything to do with making money. Only worth revisiting if people actually use it.
- AI-generated images of any kind.
