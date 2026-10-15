# Design assets

The visuals to draw by hand (see `vision.md`: no AI-generated visuals). Ordered by what
the app needs first. Generic controls (play, pause, plus, delete, check, save) can stay
as `mdi` icons; draw custom ones only where the meaning is specific to this app or where
the look matters.

## Palette

| Name | Hex | Used for |
|---|---|---|
| Forest Green | `#062425` | Icon background; app top bar; dark-mode background |
| Teal Green | `#2e765e` | Icon frame; buttons and accents in light mode |
| Spearmint | `#88cdb2` | The P; buttons and accents in dark mode |
| Blue Grotto | `#077ab2` | Secondary / info accent |

Spearmint on Forest Green has the strongest contrast (8.9:1). Never put Blue Grotto and
Teal Green on top of each other (1.1:1, they blur together). The app theme is defined in
`src/main.js` and follows the phone's light / dark setting.

## Shared rules for icons

- **Canvas**: 24 × 24 `viewBox`, with the drawing inside the middle 20 × 20 (2px padding).
- **One colour**: use `currentColor` for fills/strokes, with no hard-coded colours, so
  the app can theme them (light/dark, active/inactive).
- **One style throughout**: pick a stroke width (e.g. 2px, round caps and joins) or solid
  shapes, and stick to it.
- **Check at real size**: they show at 24px (tabs) and sometimes 16px. Fine detail
  disappears.
- **Clean SVG**: shapes converted to paths, no embedded images, no hidden layers or
  editor metadata. Name files `kebab-case.svg`.

## 1. Identity (needed before anything is shared)

- [x] **App mark**: a symbol, not a wordmark, since the name isn't final. v1 is a P
  as the pendulum inside a metronome (`design/PP_Logo.psd`).
- [x] **App icon** (from the mark, v1 in `design/icon-1024.png`): design at
  1024 × 1024, square corners (iOS rounds them), no transparency, main shape within the middle ~80%. Keep the background and the
  foreground as separate layers: Apple's Icon Composer (iOS 26) builds icons from layered
  SVGs, and iOS also shows dark and tinted versions. Android later needs a foreground,
  a background, and a one-colour version (adaptive and themed icons).
- [x] **Favicon**: currently the app icon scaled down. A simplified version may read
  better at 16px.
- [ ] **Launch screen**: the mark centred on a solid colour, shown while the app opens.

## 2. Navigation

Each in an **outline** (inactive) and **filled** (active tab) version.

- [ ] Metronome
- [ ] Session (a stepped tempo plan)
- [ ] Challenges
- [ ] History
- [ ] Profile (top bar button)

## 3. App-specific actions and ideas

- [ ] **Generate plan**: currently a magic wand (`mdi-auto-fix`), which suggests AI.
  Something like a rising staircase fits better.
- [ ] **Tempo step / ramp**: for blocks in a plan and the planned staircase preview.
- [ ] **Preset / saved plan**
- [ ] **Song plays** (repeat a song N times): for song-length steps and "Play X of N".
- [ ] **Skip to next step**
- [ ] **Practice time** (lifetime hours, this week)
- [ ] **Streak**

## 4. Metronome visuals

- [ ] **Beat dot** in four states: off, normal beat, accented beat, silent beat. The
  last two are needed for time signatures and accents.
- [ ] **Bar position**: how a row of dots shows where you are in the bar (e.g. 3/4 vs
  7/8). A layout sketch is enough; the app draws it.
- [ ] **Tempo staircase preview**: a sketch of how a plan's steps should look before you
  start (a layout idea, not a fixed image, since it's drawn from the data).

## 5. Challenges

- [ ] Daily challenge
- [ ] Weekly challenge
- [ ] Completed state (tick or seal that fits the style)

## 6. Empty states (small illustrations, optional)

- [ ] History with no sessions yet
- [ ] No saved presets yet
- [ ] Challenges before goals are set up

## 7. Onboarding (optional)

The answers are text chips today; icons would make them friendlier.

- [ ] Instruments: guitar, bass, piano / keys, drums, vocals, violin, cello, brass,
  woodwind, other
- [ ] Levels: beginner, intermediate, advanced, professional (e.g. a filling scale)

## 8. Badges and medals (later; logic not built yet)

Design a system rather than one-offs: a **frame** per tier plus an **inner glyph** per
achievement, so new badges are cheap to add.

- [ ] Frames for 3 or 4 tiers, plus a **locked** (not yet earned) look
- [ ] Glyphs for: first session, hours practiced (e.g. 10 / 50 / 100 / 500 / 1000),
  streaks (7 / 30 / 100 days), goal tempo reached, weekly challenges completed

## Not needed now

- Studio / shop items (sofa, amp, mic, and so on): the studio is parked.
- Teacher mode (grad-cap badge) and social features: wait for the backend.
