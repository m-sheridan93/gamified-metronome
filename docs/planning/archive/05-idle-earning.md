# 05: Idle / Offline Earning

## Reality check first

You cannot run code while an iOS app is fully closed; there is no true background
"idle" accrual on any mobile platform. Games like *Focus Friend* **simulate** idle
progress: they record a timestamp when you leave and, when you return, compute what you
"earned" while away. This phase implements that illusion honestly.

Because it's timestamp math, it works identically in Vue / Capacitor / native, so this
feature does **not** push towards going native.

## Design decision: what should "away" earn?

A metronome game is different from a pure idle game: the core action (practicing) is
active, not passive. So decide how generous offline earning should be:

- **Option A: No offline earning.** Points come only from real practice. Purest, most
  honest to "practice music." Idle earning would undercut the point of practicing.
- **Option B: Small passive trickle.** A modest rate while away (much lower than active
  practice), capped, to reward returning. Adds idle-game stickiness.
- **Option C: "Studio generates points."** Owned studio items produce a slow passive
  income while away (e.g. the amp earns 1 pt/hour), turning the studio into an idle
  engine. Most game-like; ties `04` and `05` together.

Recommendation: **Option A for v1** (keeps the app honest and simple), and design the
store so **Option C** can be layered later (each item carries an optional `passiveRate`).
Ship the loop first; add idle income only if engagement needs it.

## If we implement passive earning (Options B/C)

Mechanics:

- On app pause (`@capacitor/app` `pause` event) or `visibilitychange` hidden, and on a
  debounced interval, write `lastSeenAt = Date.now()` into the save blob (`03`).
- On resume / load, compute `elapsed = now - lastSeenAt` (guard against negative =
  clock moved backwards → treat as 0).
- Award `min(elapsed, cap) * rate`, where:
  - `rate` = flat trickle (B) or `sum(passiveRate of owned items)` (C).
  - `cap` = maximum offline duration that counts (e.g. 8 hours) so leaving for a week
    doesn't dump a fortune.
- Show a "While you were away you earned +N points" welcome-back toast, the satisfying
  re-entry moment.

Store additions (extend `03` schema):
- `lastSeenAt` (already reserved in the schema).
- Per-item `passiveRate` in the catalogue (`04`) for Option C.

## Anti-abuse: clock manipulation

Users can set their device clock forward to fake elapsed time. For a personal/offline
game this is acceptable; note it and don't over-engineer. If it ever matters, clamp with
a monotonic source or server time, but that's out of scope.

## Interaction with the session timer

Keep offline/idle earning **separate** from the active practice timer and points so the
two don't double-count. Active practice = "metronome running" time (`02`/`03`). Idle
earning = "time since last seen while away," awarded once on return. Different buckets.

## Deliverables (only if Option B/C is chosen)

- [ ] Write `lastSeenAt` on pause/hide + debounced interval.
- [ ] On resume/load, compute capped elapsed and award passive points.
- [ ] Welcome-back toast.
- [ ] (Option C) `passiveRate` per item; passive rate = sum over owned items.
- [ ] Negative-elapsed / clock-backwards guard.

## If Option A (recommended for v1)

- [ ] Nothing to build. Document that points come only from active practice.
- [ ] Ensure the store still records `lastSeenAt` so Option B/C can be added later
      without a schema migration.
