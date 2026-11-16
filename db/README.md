# Database (Neon)

Postgres on [Neon](https://neon.com), with Neon Auth for sign-in and the Data API for the
app to read and write. The plan and the security rules are in
`docs/planning/accounts-and-security.md`. The app doesn't use the database yet: that
comes with sign-in.

## One-time setup

1. Sign up at neon.com with a personal email and create a project in an **EU region**
   (Frankfurt), so data stays in Europe for GDPR.
2. In the project, enable **Neon Auth**, then the **Data API** (using Neon Auth as its
   auth provider). These create the `authenticated` role and the `auth.user_id()`
   function the migrations rely on.
3. Run the files in `migrations/` in order, in the Neon **SQL Editor**.

## Secrets

- The **connection string** contains the database password. It's only for running
  migrations and admin work from this computer. Put it in `.env.local` (git ignores
  `*.local`) as `DATABASE_URL=...`.
- **Never** name a secret `VITE_...`: Vite copies those into the app bundle, where
  anyone can read them.
- The app itself will only ever hold the **Data API URL** (not secret) and each user's
  own sign-in token. Row Level Security is what keeps users' data apart.

## Migrations

Numbered SQL files, run once each, in order. Never edit one that has already been run;
add a new file instead.

| File | What |
|---|---|
| `001_initial_schema.sql` | profiles, sessions, presets, daily practice, with RLS on every table |
