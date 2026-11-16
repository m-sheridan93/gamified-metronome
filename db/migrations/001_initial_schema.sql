-- 001: initial schema for synced practice data.
--
-- Mirrors the on-device save blob (src/lib/storage.js) so the first sign-in can upload
-- it as-is: profile, sessions, presets, and daily practice totals.
--
-- Run once in the Neon SQL Editor, AFTER enabling Neon Auth and the Data API on the
-- project: they create the `authenticated` role and the `auth.user_id()` function this
-- file relies on. See db/README.md.
--
-- Security model: the app talks to the Data API with the signed-in user's token, never
-- with a database password. Row Level Security on every table limits each user to their
-- own rows; `auth.user_id()` is the user id from that token.

begin;

-- Profile: onboarding answers and goals. One row per user.
create table profiles (
  user_id      text primary key default auth.user_id(),
  instruments  text[] not null default '{}',
  level        text,
  genres       text[] not null default '{}',
  focus        text[] not null default '{}',
  goals        jsonb,                          -- { daysPerWeek, minutesPerDay }, null if skipped
  completed_at timestamptz,
  skipped_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Logged practice sessions. Ids come from the device, so re-uploading is an upsert, not
-- a duplicate. Text, not uuid: devices without crypto.randomUUID make other ids.
create table sessions (
  id               text primary key,
  user_id          text not null default auth.user_id(),
  type             text not null check (type in ('free', 'runner')),
  started_at       timestamptz not null,
  ended_at         timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  details          jsonb not null default '{}',  -- per type, e.g. bpm, blockCount, completed
  created_at       timestamptz not null default now()
);
create index sessions_user_started on sessions (user_id, started_at desc);

-- Saved session plans.
create table presets (
  id           text primary key,
  user_id      text not null default auth.user_id(),
  name         text not null,
  blocks       jsonb not null,                   -- [{ bpm, minutes, label, songSeconds? }]
  last_used_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index presets_user on presets (user_id);

-- Seconds of practice per local calendar day; powers streaks and challenges.
create table daily_practice (
  user_id text not null default auth.user_id(),
  day     date not null,
  seconds integer not null default 0 check (seconds >= 0),
  primary key (user_id, day)
);

-- Row Level Security: private by default. With RLS on and no policy, nothing is
-- visible; each policy below lets a signed-in user see and change only their own rows.
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table presets enable row level security;
alter table daily_practice enable row level security;

create policy "Own profile" on profiles for all to authenticated
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());
create policy "Own sessions" on sessions for all to authenticated
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());
create policy "Own presets" on presets for all to authenticated
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());
create policy "Own daily practice" on daily_practice for all to authenticated
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

-- Table access for signed-in users only. Signed-out (anonymous) users get nothing.
grant select, insert, update, delete on profiles, sessions, presets, daily_practice
  to authenticated;

commit;
