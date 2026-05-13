-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Supabase Database Schema
-- Run this in your Supabase SQL editor to initialise the database.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type user_role as enum ('club_admin', 'coach', 'parent');

create type ftem_phase as enum (
  'F1', 'F2', 'F3',
  'T4', 'T5', 'T6',
  'E7', 'E8', 'E9',
  'M10'
);

create type sport_type as enum (
  'soccer', 'swimming', 'athletics', 'gymnastics',
  'rowing', 'cycling', 'hockey', 'triathlon',
  'basketball', 'netball', 'rugby', 'other'
);

create type aus_state as enum ('QLD', 'NSW', 'VIC', 'WA', 'SA', 'TAS', 'ACT', 'NT');

create type subscription_tier as enum ('free', 'starter', 'growth', 'elite');

create type attendance_status as enum ('present', 'absent', 'late', 'excused');

-- ─── CLUBS ───────────────────────────────────────────────────────────────────

create table clubs (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  sport             sport_type not null,
  state             aus_state not null,
  city              text not null,
  logo_url          text,
  subscription_tier subscription_tier not null default 'free',
  created_at        timestamptz not null default now()
);

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users. Created automatically via trigger on signup.

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        user_role not null,
  club_id     uuid references clubs(id) on delete cascade,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role, club_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'coach')::user_role,
    (new.raw_user_meta_data->>'club_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── SQUADS ──────────────────────────────────────────────────────────────────

create table squads (
  id          uuid primary key default uuid_generate_v4(),
  club_id     uuid not null references clubs(id) on delete cascade,
  name        text not null,
  sport       sport_type not null,
  coach_id    uuid references profiles(id) on delete set null,
  age_group   text,
  created_at  timestamptz not null default now()
);

-- ─── ATHLETES ────────────────────────────────────────────────────────────────

create table athletes (
  id                uuid primary key default uuid_generate_v4(),
  club_id           uuid not null references clubs(id) on delete cascade,
  squad_id          uuid references squads(id) on delete set null,
  full_name         text not null,
  date_of_birth     date not null,
  gender            text not null check (gender in ('male', 'female', 'other')),
  sport             sport_type not null,
  ftem_phase        ftem_phase not null default 'F1',
  ftem_updated_at   timestamptz not null default now(),
  ftem_updated_by   uuid references profiles(id) on delete set null,
  joined_club_at    date not null default current_date,
  is_active         boolean not null default true,
  parent_id         uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ─── FTEM HISTORY ────────────────────────────────────────────────────────────
-- Append-only log of every phase change — the core data moat

create table ftem_history (
  id            uuid primary key default uuid_generate_v4(),
  athlete_id    uuid not null references athletes(id) on delete cascade,
  from_phase    ftem_phase,
  to_phase      ftem_phase not null,
  changed_by    uuid references profiles(id) on delete set null,
  note          text,
  changed_at    timestamptz not null default now()
);

-- ─── SESSIONS ────────────────────────────────────────────────────────────────

create table sessions (
  id                uuid primary key default uuid_generate_v4(),
  squad_id          uuid not null references squads(id) on delete cascade,
  club_id           uuid not null references clubs(id) on delete cascade,
  coach_id          uuid references profiles(id) on delete set null,
  date              date not null,
  duration_minutes  integer not null default 60,
  title             text not null,
  notes             text,
  ftem_focus        ftem_phase,
  created_at        timestamptz not null default now()
);

-- ─── ATTENDANCE ──────────────────────────────────────────────────────────────

create table attendance (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references sessions(id) on delete cascade,
  athlete_id  uuid not null references athletes(id) on delete cascade,
  status      attendance_status not null default 'present',
  created_at  timestamptz not null default now(),
  unique(session_id, athlete_id)
);

-- ─── MILESTONES ──────────────────────────────────────────────────────────────

create table milestones (
  id                    uuid primary key default uuid_generate_v4(),
  athlete_id            uuid not null references athletes(id) on delete cascade,
  club_id               uuid not null references clubs(id) on delete cascade,
  recorded_by           uuid references profiles(id) on delete set null,
  title                 text not null,
  description           text,
  achieved_at           date not null default current_date,
  ftem_phase            ftem_phase not null,
  is_shared_with_parent boolean not null default true,
  created_at            timestamptz not null default now()
);

-- ─── COACH NOTES ─────────────────────────────────────────────────────────────

create table coach_notes (
  id          uuid primary key default uuid_generate_v4(),
  athlete_id  uuid not null references athletes(id) on delete cascade,
  coach_id    uuid not null references profiles(id) on delete cascade,
  content     text not null,
  is_private  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Everyone can only see data belonging to their own club.

alter table clubs         enable row level security;
alter table profiles      enable row level security;
alter table squads        enable row level security;
alter table athletes      enable row level security;
alter table ftem_history  enable row level security;
alter table sessions      enable row level security;
alter table attendance    enable row level security;
alter table milestones    enable row level security;
alter table coach_notes   enable row level security;

-- Helper: get the club_id of the currently authenticated user
create or replace function my_club_id()
returns uuid as $$
  select club_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Helper: get the role of the currently authenticated user
create or replace function my_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Clubs: members can read their own club
create policy "club members can view their club"
  on clubs for select using (id = my_club_id());

-- Profiles: members can view profiles in their club
create policy "club members can view profiles"
  on profiles for select using (club_id = my_club_id());

create policy "users can update own profile"
  on profiles for update using (id = auth.uid());

-- Squads: full access within club
create policy "club members can view squads"
  on squads for select using (club_id = my_club_id());

create policy "coaches and admins can manage squads"
  on squads for all using (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  );

-- Athletes: coaches/admins see all; parents see only their child
create policy "coaches and admins can view athletes"
  on athletes for select using (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  );

create policy "parents can view their child"
  on athletes for select using (
    parent_id = auth.uid()
  );

create policy "coaches and admins can manage athletes"
  on athletes for all using (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  );

-- FTEM history: coaches/admins see all; parents see child's history
create policy "coaches and admins can view ftem history"
  on ftem_history for select using (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

create policy "parents can view child ftem history"
  on ftem_history for select using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

create policy "coaches and admins can insert ftem history"
  on ftem_history for insert with check (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

-- Sessions: coaches/admins only
create policy "coaches and admins can manage sessions"
  on sessions for all using (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  );

-- Attendance: coaches/admins manage; parents can see child's attendance
create policy "coaches and admins can manage attendance"
  on attendance for all using (
    session_id in (select id from sessions where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

create policy "parents can view child attendance"
  on attendance for select using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

-- Milestones: coaches/admins manage; parents see shared milestones
create policy "coaches and admins can manage milestones"
  on milestones for all using (
    club_id = my_club_id() and my_role() in ('club_admin', 'coach')
  );

create policy "parents can view shared milestones"
  on milestones for select using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
    and is_shared_with_parent = true
  );

-- Coach notes: coaches see all non-private notes + their own private notes
create policy "coaches can view notes"
  on coach_notes for select using (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
    and (is_private = false or coach_id = auth.uid())
  );

create policy "coaches can manage own notes"
  on coach_notes for all using (
    coach_id = auth.uid() and my_role() in ('club_admin', 'coach')
  );

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

create index idx_athletes_club_id    on athletes(club_id);
create index idx_athletes_squad_id   on athletes(squad_id);
create index idx_athletes_parent_id  on athletes(parent_id);
create index idx_sessions_squad_id   on sessions(squad_id);
create index idx_sessions_date       on sessions(date);
create index idx_attendance_session  on attendance(session_id);
create index idx_attendance_athlete  on attendance(athlete_id);
create index idx_ftem_history_athlete on ftem_history(athlete_id);
create index idx_milestones_athlete  on milestones(athlete_id);
