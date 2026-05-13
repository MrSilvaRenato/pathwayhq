-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Phase 1 completion migration
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. ATHLETE CLAIM TOKENS ──────────────────────────────────────────────────
-- When a club adds an athlete, a coach can generate a claim token.
-- The athlete uses it to create an account linked to their existing record.

create table if not exists athlete_claim_tokens (
  id          uuid primary key default uuid_generate_v4(),
  athlete_id  uuid not null references athletes(id) on delete cascade,
  club_id     uuid not null references clubs(id) on delete cascade,
  token       uuid not null default uuid_generate_v4(),
  email       text not null,
  claimed_at  timestamptz,
  expires_at  timestamptz not null default (now() + interval '30 days'),
  created_at  timestamptz not null default now(),
  unique(athlete_id)
);

alter table athlete_claim_tokens enable row level security;

create policy "coaches and admins can manage claim tokens"
  on athlete_claim_tokens for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

create policy "anyone can read claim token by value"
  on athlete_claim_tokens for select
  to anon, authenticated
  using (true);

-- ─── 2. NOTIFICATIONS TABLE ───────────────────────────────────────────────────

create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  club_id     uuid references clubs(id) on delete cascade,
  title       text not null,
  body        text,
  type        text not null default 'info',  -- 'info' | 'milestone' | 'phase_update' | 'session' | 'announcement'
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "users can view own notifications"
  on notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can update own notifications"
  on notifications for update
  to authenticated
  using (user_id = auth.uid());

create policy "coaches and admins can insert notifications"
  on notifications for insert
  to authenticated
  with check (true);

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_is_read on notifications(user_id, is_read);

-- ─── 3. MULTI-SPORT CLUBS ─────────────────────────────────────────────────────
-- Clubs can operate across multiple sports (e.g. school sports academies).
-- Add a sports array, keep primary sport for backwards compatibility.

alter table clubs add column if not exists sports text[] default '{}';

-- Migrate existing single sport into the array
update clubs set sports = array[sport::text] where sports = '{}' or sports is null;

-- ─── 4. FTEM VERIFICATION FLAG ────────────────────────────────────────────────
-- Tracks whether a phase was set by a verified coach or self-reported.

alter table athletes add column if not exists ftem_verified boolean not null default false;

-- Club athletes are always coach-verified (coach set their phase)
-- Independent athletes are self-reported (ftem_verified = false)
-- When a coach updates an independent athlete's phase after they join a club, flip to true.

-- ─── 5. ATHLETE USER LINK ─────────────────────────────────────────────────────
-- When a club athlete claims their account, link their auth user to the athlete record.
-- athlete_id already added in previous migration via profiles.athlete_id

-- ─── 6. ANNOUNCEMENTS TABLE ───────────────────────────────────────────────────

create table if not exists announcements (
  id          uuid primary key default uuid_generate_v4(),
  club_id     uuid not null references clubs(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  audience    text not null default 'all',  -- 'all' | 'coaches' | 'parents' | 'squad:<id>'
  squad_id    uuid references squads(id) on delete set null,
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "club members can view announcements"
  on announcements for select
  to authenticated
  using (club_id = my_club_id());

create policy "coaches and admins can manage announcements"
  on announcements for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

-- ─── 7. GOALS TABLE ───────────────────────────────────────────────────────────

create table if not exists goals (
  id            uuid primary key default uuid_generate_v4(),
  athlete_id    uuid not null references athletes(id) on delete cascade,
  club_id       uuid references clubs(id) on delete set null,
  set_by        uuid references profiles(id) on delete set null,
  title         text not null,
  description   text,
  ftem_phase    ftem_phase not null,
  target_date   date,
  completed_at  timestamptz,
  is_private    boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table goals enable row level security;

create policy "coaches and admins can manage goals"
  on goals for all
  to authenticated
  using (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  )
  with check (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  );

create policy "athletes can view own goals"
  on goals for select
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
    and is_private = false
  );

create policy "athletes can manage own goals"
  on goals for all
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  )
  with check (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

-- ─── 8. RPE / WELLNESS LOG ────────────────────────────────────────────────────

create table if not exists wellness_logs (
  id            uuid primary key default uuid_generate_v4(),
  athlete_id    uuid not null references athletes(id) on delete cascade,
  session_id    uuid references sessions(id) on delete set null,
  logged_at     date not null default current_date,
  rpe           integer check (rpe between 1 and 10),  -- Rate of Perceived Exertion
  energy        integer check (energy between 1 and 5),
  mood          integer check (mood between 1 and 5),
  sleep_hours   numeric(3,1),
  note          text,
  created_at    timestamptz not null default now()
);

alter table wellness_logs enable row level security;

create policy "coaches can view athlete wellness"
  on wellness_logs for select
  to authenticated
  using (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

create policy "athletes can manage own wellness"
  on wellness_logs for all
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  )
  with check (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

-- ─── 9. SEARCH INDEX ──────────────────────────────────────────────────────────

create index if not exists idx_athletes_full_name on athletes using gin(to_tsvector('english', full_name));
create index if not exists idx_athletes_ftem_phase on athletes(ftem_phase);
create index if not exists idx_athletes_sport on athletes(sport);

notify pgrst, 'reload schema';
