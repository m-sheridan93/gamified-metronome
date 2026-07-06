# Contributing

Conventions for this project. Kept intentionally lightweight.

## Branches

`type/short-description` in kebab-case:

```
feat/capacitor-ios-setup
feat/metronome-scheduler
fix/session-time-persistence
refactor/progress-pinia-store
docs/planning-docs
```

Branch off `main`, open a PR back into `main`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `type: imperative summary`.
Keep the headline ~50 characters; add a body only when the change needs explaining.

```
feat: add look-ahead scheduler to metronome engine
fix: persist session time so reloads don't reset progress
refactor: move points state into pinia store
docs: add feature planning docs
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`.

## Pull requests

- **Title**: same convention as commits, e.g. `feat: metronome engine rewrite (look-ahead scheduling)`.
- **Numbers**: GitHub assigns PR numbers automatically — never invent one. Reference existing ones as `#12`.
- Keep PRs focused; one logical change per PR where practical.
