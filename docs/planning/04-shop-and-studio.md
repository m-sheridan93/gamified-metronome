# 04 — Shop & Studio

This is the motivating payoff: somewhere to **spend** points, and a **studio** that
visibly grows as you buy gear. This is the half of the vision that doesn't exist yet.

## Concept

- A **Shop**: a catalog of items with point costs. Buying deducts from `pointsBalance`
  (`03`) and marks the item owned.
- A **Studio**: a persistent scene showing everything you own, assembled over time —
  amps, speakers, rack gear, a grand piano, etc.
- Progression feel: cheap starter items early, aspirational big-ticket items (grand piano)
  that take many practice sessions to afford.

## Item catalog (data-driven)

Define items as data, not code, so adding gear is a one-line change. `src/data/items.js`:

```js
export const ITEMS = [
  { id: 'amp-basic',   name: 'Practice Amp',  cost: 20,   category: 'gear',
    icon: 'mdi-amplifier', tier: 1 },
  { id: 'speakers',    name: 'Studio Monitors', cost: 60, category: 'gear',
    icon: 'mdi-speaker', tier: 1 },
  { id: 'rack-gear',   name: 'Rack Unit',     cost: 150,  category: 'gear',
    icon: 'mdi-server', tier: 2 },
  { id: 'grand-piano', name: 'Grand Piano',   cost: 1000, category: 'instrument',
    icon: 'mdi-piano', tier: 3 },
  // ...
]
```

Fields to consider: `id`, `name`, `description`, `cost`, `category`, `tier`,
`icon`/`asset`, optional `requires` (prerequisite item id) for gated progression,
optional `unlocksFeature` (see below).

## Cosmetics vs unlockable features

Two kinds of purchase:

- **Cosmetic** — pure decoration in the studio (amp, piano, poster, plant).
- **Feature unlock** — buying enables real app functionality: extra sounds, subdivisions,
  time signatures, presets, themes. Ties the economy to genuinely useful upgrades.

Decision to lock: do we want feature-unlocks in v1, or cosmetics only first? Recommend
**cosmetics-only for the first shippable version** (simpler, fully decoupled from the
metronome engine), then layer feature-unlocks once `02` supports subdivisions/accents.

## Studio store (`useStudioStore`)

State:
- `inventory: Record<itemId, { owned: boolean, placed: boolean }>` (persisted via `03`).

Getters:
- `ownedItems`, `placedItems`, `isOwned(id)`.

Actions:
- `buy(id)` → checks cost against `pointsBalance`, calls `progress.spend(cost)`, marks
  owned + placed. Returns success/error (insufficient funds, already owned).
- `place(id)` / `remove(id)` (if we allow toggling what's shown).

## Studio visual — three options (decision pending)

The author flagged this is undecided. Ranked by effort:

1. **Emoji / CSS scene** — position emoji or styled divs in a room. Zero art, quick to
   prototype, playful. Good for validating the loop fast.
2. **Icon / card grid** — each owned item as a Vuetify card with an `mdi` icon + label.
   No art, trivial to expand, but reads more like an inventory than a "room."
3. **Layered 2D illustration** — a drawn room where items appear as illustrated objects
   at fixed positions (SVG layers or absolutely-positioned PNGs). Best "studio" feel,
   closest to *Focus Friend*, but needs art assets.

Recommendation: **build the loop against option 1 or 2 first** (so buying/persisting is
proven), then upgrade the presentation to option 3 once the economy feels right. The
studio store is presentation-agnostic, so the visual can change without touching logic.

### Layered illustration notes (if/when chosen)
- One base "room" background layer.
- Each item = a positioned layer keyed by `itemId`, shown when `placed`.
- Keep assets as SVG where possible (crisp at any density, small, tintable).
- Define positions in the item data (`{ x, y, z }`) so layout is data-driven too.

## Shop UI

- Grid of item cards: icon, name, cost, and state (Buy / Owned / can't afford).
- Disable / grey out unaffordable items; show the player's current balance prominently.
- Confirmation on expensive purchases (optional).
- Feedback on purchase (animation, the item appearing in the studio) — the dopamine hit.

## Navigation

App grows beyond one screen: **Metronome**, **Studio**, **Shop**. Options:
- Vuetify bottom navigation (feels native on iOS) or tabs.
- Keep the metronome as the home screen; studio/shop a tap away.
- Show the points balance in a persistent header/nav so earning is always visible.

Consider `vue-router` now if not already present — three screens justify it.

## Economy tuning

- Set costs relative to the earning rate from `03`. Example at 1 pt/min: a 20-pt starter
  amp = 20 min of practice; a 1000-pt grand piano = ~16.7 hours. Tune tiers so there's
  always something affordable soon *and* something to save toward.
- Consider a couple of very cheap "first buy" items so a new user gets a reward in their
  first session (retention).

## Deliverables

- [ ] `items.js` catalog (data-driven).
- [ ] `useStudioStore` with `buy` / ownership, persisted via `03`.
- [ ] Shop screen: grid, balance, buy flow, affordability states.
- [ ] Studio screen: renders owned/placed items (start with emoji/icon option).
- [ ] Navigation between Metronome / Shop / Studio + persistent balance display.
- [ ] Purchase feedback (item appears in studio).

## Deferred

- Layered illustrated studio art.
- Feature-unlock purchases (sounds, subdivisions, themes).
- Item categories/filtering, "rooms" or studio expansions, achievements.
