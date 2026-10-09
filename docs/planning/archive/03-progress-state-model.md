# 03: Progress & State Model

## Why this phase

Today, all state (BPM, timer, points, streak, persistence) lives inside
`Metronome.vue` as loose refs, with `localStorage` reads/writes scattered through the
functions. That's fine for one screen, but the shop and studio (`04`) need to read points
and write inventory from *other* components. We need a single, shared, persisted source
of truth before building the game.

## Recommendation: a Pinia store (or a composable)

Options:

- **Pinia**: the idiomatic Vue 3 shared-state solution. Best if state is read/written
  across many components (it will be: metronome, timer, shop, studio, header). Adds one
  dependency. **Recommended.**
- **A `useProgress` composable** with module-scoped refs: zero deps, works, but you
  hand-roll persistence and it's easy to create multiple instances by accident.

Given the app is growing into multiple screens sharing points/inventory, go with **Pinia**.

## Proposed stores

### `useProgressStore`
Owns the economy and practice history.

State:
- `totalPoints: number`
- `lifetimeSeconds: number`: total practice time ever (for stats/achievements)
- `streak: number`, `lastPracticeDate: string (ISO date)`
- `lastSeenAt: number (epoch ms)`: for idle earning (`05`)

Getters:
- `pointsSpendable` (may differ from total if we track spent separately; see below)

Actions:
- `addPracticeTime(seconds)` → accrues points at the configured rate, updates streak.
- `award(points)` / `spend(points)` → returns success/false if insufficient.
- `evaluateStreakForToday()` → the day-diff logic, hardened (see below).
- `load()` / `persist()` → via the storage wrapper.

### `useStudioStore` (defined fully in `04`)
Owns the item catalogue references and what the player owns/placed.

## Points accounting: spent vs total

Current code conflates "points earned" with "points available." Once you can spend, you
need two numbers:

- `pointsEarnedLifetime` (never decreases; good for achievements/prestige).
- `pointsBalance` (earned minus spent; what the shop checks).

Recommendation: store `pointsBalance` as the spendable wallet and `pointsEarnedLifetime`
separately. Shop spends from balance; achievements read lifetime.

## Persistence

### Bug to fix
`totalSessionTime` and `sessionPoints` are **not** persisted today, so a reload mid-session
loses time and the "this session" counter resets. Move all durable values into the store
and persist on change (debounced) and on app pause.

### Storage wrapper
Introduce `src/lib/storage.js` with `get(key)`, `set(key, value)`, `remove(key)`:
- MVP: backed by `localStorage`.
- iOS: swap to `@capacitor/preferences` behind the same interface, with no feature code changes.
- JSON-encode a single `progress` blob rather than many string keys, so schema evolves cleanly.

### Save schema (versioned)
```json
{
  "version": 1,
  "pointsBalance": 0,
  "pointsEarnedLifetime": 0,
  "lifetimeSeconds": 0,
  "streak": 0,
  "lastPracticeDate": "2026-07-06",
  "lastSeenAt": 1751800000000,
  "inventory": { "amp-basic": { "owned": true, "placed": true } },
  "settings": { "bpm": 100, "soundType": "Tick", "volume": 1 }
}
```
Include `version` from day one so migrations are possible.

## Points-earning rules (make them explicit + tunable)

Current: +1 point / 60s practiced; +streak/3 bonus every 3 consecutive days.

Decisions to lock:
- **Rate**: keep 1 pt/min? Faster early game feels better; consider 1 pt / 30s, or a
  curve. Put the rate in the store config so it's one number to tune.
- **Only-while-running**: points accrue only when the metronome is actually running
  (already the case via the timer). Confirm that's the intended rule vs "app open."
- **Streak hardening**: current logic parses `Date.toDateString()` and diffs `Date`
  objects, which is timezone/DST-fragile. Switch to comparing ISO `YYYY-MM-DD` local-date
  strings and counting whole-day differences explicitly. Also guard the case where the
  clock goes backwards.
- **Anti-cheat (optional)**: since it's `localStorage`, points are trivially editable.
  For a personal/idle game that's fine; note it and move on unless leaderboards appear.

## Migration from current keys

On first load, if the old keys (`metronome-total-points`, `metronome-last-practice`,
`metronome-practice-streak`) exist and no `progress` blob does, import them into the new
schema, then write the blob. One-time, keeps existing users' points.

## Deliverables

- [ ] Pinia installed; `useProgressStore` created.
- [ ] Storage wrapper (`storage.js`) with versioned JSON blob.
- [ ] Persist session time + session points (fixes reload-loss bug).
- [ ] `pointsBalance` vs `pointsEarnedLifetime` split.
- [ ] Hardened, timezone-safe streak logic.
- [ ] One-time migration from old localStorage keys.
- [ ] Metronome timer wired to `addPracticeTime` via the beat/running signal from `02`.
