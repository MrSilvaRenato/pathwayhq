-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Phase 2: Calendar, Events, Announcements, Roster, Volunteering
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. EVENTS / CALENDAR ────────────────────────────────────────────────────
-- Covers: training sessions, matches, trials, club events, social events.
-- Sessions table already exists for training — events is the broader calendar.

create type event_type as enum (
  'training',
  'match',
  'trial',
  'tournament',
  'social',
  'meeting',
  'other'
);

create table if not exists events (
  id              uuid primary key default uuid_generate_v4(),
  club_id         uuid not null references clubs(id) on delete cascade,
  squad_id        uuid references squads(id) on delete set null,
  created_by      uuid not null references profiles(id) on delete cascade,
  title           text not null,
  description     text,
  event_type      event_type not null default 'training',
  location        text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  is_all_day      boolean not null default false,
  is_cancelled    boolean not null default false,
  audience        text not null default 'all',  -- 'all' | 'squad' | 'coaches'
  created_at      timestamptz not null default now()
);

alter table events enable row level security;

create policy "club members can view events"
  on events for select
  to authenticated
  using (club_id = my_club_id());

create policy "athletes can view own events"
  on events for select
  to authenticated
  using (
    club_id in (
      select club_id from athletes
      where id in (select athlete_id from profiles where id = auth.uid())
    )
  );

create policy "coaches and admins can manage events"
  on events for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

create index if not exists idx_events_club_starts on events(club_id, starts_at);
create index if not exists idx_events_squad on events(squad_id);

-- ─── 2. EVENT RSVPs ───────────────────────────────────────────────────────────

create type rsvp_status as enum ('going', 'not_going', 'maybe');

create table if not exists event_rsvps (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  athlete_id  uuid references athletes(id) on delete cascade,
  status      rsvp_status not null default 'going',
  note        text,
  created_at  timestamptz not null default now(),
  unique(event_id, user_id)
);

alter table event_rsvps enable row level security;

create policy "club members can manage own rsvps"
  on event_rsvps for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "coaches can view all event rsvps"
  on event_rsvps for select
  to authenticated
  using (
    event_id in (select id from events where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

-- ─── 3. ROSTER AVAILABILITY ───────────────────────────────────────────────────
-- Separate from RSVP — explicit roster selection by coach per event.

create type roster_status as enum ('selected', 'reserve', 'unavailable', 'unconfirmed');

create table if not exists event_roster (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events(id) on delete cascade,
  athlete_id  uuid not null references athletes(id) on delete cascade,
  status      roster_status not null default 'unconfirmed',
  position    text,
  note        text,
  created_at  timestamptz not null default now(),
  unique(event_id, athlete_id)
);

alter table event_roster enable row level security;

create policy "coaches and admins can manage roster"
  on event_roster for all
  to authenticated
  using (
    event_id in (select id from events where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  )
  with check (
    event_id in (select id from events where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

create policy "athletes can view own roster status"
  on event_roster for select
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

create policy "parents can view child roster status"
  on event_roster for select
  to authenticated
  using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

-- ─── 4. ANNOUNCEMENTS (already defined in phase1, ensure complete) ────────────
-- Already created. Add audience types clearly.
-- audience: 'all' | 'coaches' | 'parents' | 'athletes' | 'squad'

-- ─── 5. VOLUNTEERING ─────────────────────────────────────────────────────────

create table if not exists volunteer_shifts (
  id            uuid primary key default uuid_generate_v4(),
  club_id       uuid not null references clubs(id) on delete cascade,
  event_id      uuid references events(id) on delete set null,
  created_by    uuid not null references profiles(id) on delete cascade,
  title         text not null,
  description   text,
  location      text,
  shift_date    date not null,
  start_time    time not null,
  end_time      time not null,
  slots_needed  integer not null default 1,
  created_at    timestamptz not null default now()
);

alter table volunteer_shifts enable row level security;

create policy "club members can view volunteer shifts"
  on volunteer_shifts for select
  to authenticated
  using (club_id = my_club_id());

create policy "coaches and admins can manage volunteer shifts"
  on volunteer_shifts for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

create table if not exists volunteer_signups (
  id          uuid primary key default uuid_generate_v4(),
  shift_id    uuid not null references volunteer_shifts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  signed_up_at timestamptz not null default now(),
  unique(shift_id, user_id)
);

alter table volunteer_signups enable row level security;

create policy "users can manage own signups"
  on volunteer_signups for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "coaches and admins can view all signups"
  on volunteer_signups for select
  to authenticated
  using (
    shift_id in (select id from volunteer_shifts where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

-- ─── 6. INDEXES ───────────────────────────────────────────────────────────────
create index if not exists idx_volunteer_shifts_club on volunteer_shifts(club_id, shift_date);
create index if not exists idx_announcements_club on announcements(club_id, created_at desc);

notify pgrst, 'reload schema';
