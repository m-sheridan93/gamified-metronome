# Accounts & security

Plan for adding user accounts and a backend, written before any of it is built so the
security decisions are made deliberately rather than under pressure. Companions:
`vision.md` (principles), `roadmap.md` (sequencing), `mobile.md` (iOS/Android).

## Decision summary

- **Onboarding does not need accounts.** It's built on-device first, stored in the same
  save blob as sessions and presets.
- **Accounts come later**, only when there's a reason (see triggers below).
- **We never handle passwords ourselves.** Sign-in goes through a managed provider.
- **Provider: Neon** (Postgres database, with Neon Auth for sign-in and the Data API for
  the app). Schema and setup steps are in `db/`.
- **Local-first:** the app stays fully usable without an account. Signing in is optional
  and uploads the user's existing on-device data.

## When accounts become necessary

Add accounts when one of these is actually wanted, not before:

1. **Backup.** Today, a lost phone or cleared browser data loses the user's history.
2. **Sync across devices**, e.g. phone and laptop sharing one practice history.
3. **Social features and teacher mode**, which need other people's data by definition.

## Principles

- **Don't build auth.** Hand-rolled login is where most security failures come from.
  A managed provider handles password hashing (salted, slow algorithms like bcrypt or
  argon2), email verification, password reset, brute-force protection, OAuth, session
  tokens, and multi-factor auth.
- **Prefer no passwords at all.** A password we never store can't leak. Lead with
  passwordless options: magic link (email a sign-in link), Sign in with Apple, Google.
- **Collect the minimum.** Only store what a feature needs. Onboarding answers are low
  sensitivity but still personal data under GDPR.
- **Every table is private by default.** Access rules live in the database (Row Level
  Security), not just in app code.

## Provider choice

| Option | Database | Notes |
|---|---|---|
| **Neon** (chosen) | Postgres (SQL) | Serverless Postgres with Neon Auth and a Data API; Row Level Security keeps users apart. Generous free plan (1 GB per project, scales to zero when idle). SQL suits a fullstack dev. |
| Supabase | Postgres (SQL) | The most widely used option: auth, database, file storage, and realtime in one. Also a good fit; we don't need storage or realtime yet. |
| Firebase | Firestore (NoSQL) | Mature, Google-run. Security rules language instead of SQL. Data modelling differs from what we have. |
| Clerk / Auth0 | none (auth only) | Excellent auth UIs, but a database is still needed separately, so two vendors instead of one. |

## Sign-in methods

- **Magic link (email):** default for everyone. No password to forget or leak.
- **Sign in with Apple:** needed on iOS anyway (see app store rules) and privacy friendly
  (users can hide their email).
- **Google:** convenient on Android and web.
- **Email + password:** optional. If offered, the provider stores and hashes passwords;
  our code and database never see them.

On mobile (Capacitor), magic links and OAuth redirect back into the app via a deep link
(custom URL scheme / universal links). Sessions should be kept in secure device storage
rather than plain `localStorage`.

## Data model

The on-device save blob was shaped for this from the start (stable ids, ISO timestamps),
so it maps onto tables directly:

| Table | From | Key columns |
|---|---|---|
| `profiles` | `state.profile` (onboarding) | `id` = auth user id, instruments, level, genres, focus, goals, timestamps |
| `sessions` | `state.sessions` | `id` (uuid), `user_id`, type, started/ended, duration, details |
| `presets` | `state.presets` | `id` (uuid), `user_id`, name, blocks (jsonb), timestamps |
| `daily_practice` | `state.dailySeconds` | `user_id`, date, seconds |

Lifetime totals and streaks can be derived from these rather than stored.

### Row Level Security (the important part)

The app never holds a database password. It calls Neon's **Data API** with the
signed-in user's token, and Row Level Security stops anyone reading or writing rows
that aren't theirs. `auth.user_id()` is the user id from that token. Every table gets
RLS switched on, with a policy like:

```sql
alter table sessions enable row level security;

create policy "Own sessions" on sessions for all to authenticated
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());
```

The full schema is `db/migrations/001_initial_schema.sql`.

The **connection string** (database password) bypasses all of this. It must never be
shipped in the app or committed to git; it's only for migrations and admin work from
the author's computer, kept in `.env.local`.

## Local-first migration

1. The app works with no account, exactly as today.
2. When the user signs in for the first time, upload their on-device profile, sessions,
   presets, and daily totals. Stable ids make this safe to retry (upsert by id, no
   duplicates).
3. After that, the database is the source of truth and the device keeps a cached copy
   so practice still works offline.

## App store and legal requirements

- **Account deletion:** both Apple and Google require that users who can create an
  account can also delete it from within the app, along with its data.
- **Apple login rule:** if the iOS app offers a third-party login such as Google, it must
  also offer a privacy-focused alternative. Sign in with Apple satisfies this.
- **GDPR (EU):** a privacy policy stating what's collected and why, a way to export data,
  and deletion on request. Keep data in an EU region where possible.
- **Google Play data safety form** and Apple **privacy nutrition labels** have to
  describe the data collected.

## Security checklist (before launching accounts)

- [ ] RLS enabled on every table, with policies tested against a second user's data.
- [ ] No connection string or other secret in the app bundle or the repo (and no
  `VITE_`-prefixed secrets).
- [ ] Only passwordless/OAuth methods enabled (or provider-hashed passwords if offered).
- [ ] Email verification on, rate limits left at provider defaults or stricter.
- [ ] Sessions stored in secure storage on mobile.
- [ ] Redirect URLs restricted to our own domains and app schemes.
- [ ] In-app account and data deletion works end to end.
- [ ] Privacy policy published; store privacy forms filled in.

## Open questions

- Which trigger (backup, sync, or social) will actually prompt adding accounts?
- Check that Neon Auth supports Sign in with Apple (needed on iOS if Google is offered)
  and redirects back into the Capacitor app via a deep link, before building sign-in.
- Teacher mode needs shared access between users; its RLS policies are more complex and
  should get their own plan when it's in scope.
