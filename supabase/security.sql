-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Security Hardening Migration
-- Run in Supabase SQL editor AFTER schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. FIX RLS POLICIES: scope to `authenticated` role ──────────────────────
-- Drop all existing policies and recreate them with `to authenticated`
-- so anonymous users can NEVER read club data.

-- CLUBS
drop policy if exists "club members can view their club" on clubs;
create policy "club members can view their club"
  on clubs for select
  to authenticated
  using (id = my_club_id());

-- Allow authenticated users to insert clubs (needed for signup flow)
drop policy if exists "authenticated users can create clubs" on clubs;
create policy "authenticated users can create clubs"
  on clubs for insert
  to authenticated
  with check (true);

-- Club admins can update their own club
drop policy if exists "club admins can update club" on clubs;
create policy "club admins can update club"
  on clubs for update
  to authenticated
  using (id = my_club_id() and my_role() = 'club_admin');

-- PROFILES
drop policy if exists "club members can view profiles" on profiles;
create policy "club members can view profiles"
  on profiles for select
  to authenticated
  using (club_id = my_club_id());

drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- Allow insert during signup (trigger runs as security definer, but keep explicit)
drop policy if exists "users can insert own profile" on profiles;
create policy "users can insert own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

-- SQUADS
drop policy if exists "club members can view squads" on squads;
create policy "club members can view squads"
  on squads for select
  to authenticated
  using (club_id = my_club_id());

drop policy if exists "coaches and admins can manage squads" on squads;
create policy "coaches and admins can manage squads"
  on squads for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

-- ATHLETES
drop policy if exists "coaches and admins can view athletes" on athletes;
create policy "coaches and admins can view athletes"
  on athletes for select
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

drop policy if exists "parents can view their child" on athletes;
create policy "parents can view their child"
  on athletes for select
  to authenticated
  using (parent_id = auth.uid());

drop policy if exists "coaches and admins can manage athletes" on athletes;
create policy "coaches and admins can manage athletes"
  on athletes for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

-- FTEM HISTORY
drop policy if exists "coaches and admins can view ftem history" on ftem_history;
create policy "coaches and admins can view ftem history"
  on ftem_history for select
  to authenticated
  using (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

drop policy if exists "parents can view child ftem history" on ftem_history;
create policy "parents can view child ftem history"
  on ftem_history for select
  to authenticated
  using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

drop policy if exists "coaches and admins can insert ftem history" on ftem_history;
create policy "coaches and admins can insert ftem history"
  on ftem_history for insert
  to authenticated
  with check (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

-- SESSIONS
drop policy if exists "coaches and admins can manage sessions" on sessions;
create policy "coaches and admins can manage sessions"
  on sessions for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

-- Parents can view sessions their child attended
drop policy if exists "parents can view child sessions" on sessions;
create policy "parents can view child sessions"
  on sessions for select
  to authenticated
  using (
    id in (
      select session_id from attendance
      where athlete_id in (select id from athletes where parent_id = auth.uid())
    )
  );

-- ATTENDANCE
drop policy if exists "coaches and admins can manage attendance" on attendance;
create policy "coaches and admins can manage attendance"
  on attendance for all
  to authenticated
  using (
    session_id in (select id from sessions where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  )
  with check (
    session_id in (select id from sessions where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
  );

drop policy if exists "parents can view child attendance" on attendance;
create policy "parents can view child attendance"
  on attendance for select
  to authenticated
  using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

-- MILESTONES
drop policy if exists "coaches and admins can manage milestones" on milestones;
create policy "coaches and admins can manage milestones"
  on milestones for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

drop policy if exists "parents can view shared milestones" on milestones;
create policy "parents can view shared milestones"
  on milestones for select
  to authenticated
  using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
    and is_shared_with_parent = true
  );

-- COACH NOTES
drop policy if exists "coaches can view notes" on coach_notes;
create policy "coaches can view notes"
  on coach_notes for select
  to authenticated
  using (
    athlete_id in (select id from athletes where club_id = my_club_id())
    and my_role() in ('club_admin', 'coach')
    and (is_private = false or coach_id = auth.uid())
  );

drop policy if exists "coaches can manage own notes" on coach_notes;
create policy "coaches can manage own notes"
  on coach_notes for all
  to authenticated
  using (coach_id = auth.uid() and my_role() in ('club_admin', 'coach'))
  with check (coach_id = auth.uid() and my_role() in ('club_admin', 'coach'));

-- ─── 2. INVITES TABLE ────────────────────────────────────────────────────────
-- Club admins/coaches invite people by email. Token is emailed, used once.

create table if not exists invites (
  id          uuid primary key default uuid_generate_v4(),
  club_id     uuid not null references clubs(id) on delete cascade,
  invited_by  uuid not null references profiles(id) on delete cascade,
  email       text not null,
  role        user_role not null,
  token       uuid not null default uuid_generate_v4(),
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now(),
  unique(club_id, email)
);

alter table invites enable row level security;

-- Admins/coaches can manage invites for their club
create policy "admins and coaches can manage invites"
  on invites for all
  to authenticated
  using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
  with check (club_id = my_club_id() and my_role() in ('club_admin', 'coach'));

-- Anyone can read an invite by token (for the accept-invite page)
create policy "anyone can read invite by token"
  on invites for select
  to anon, authenticated
  using (true);

-- ─── 3. ANON POLICIES FOR SIGNUP ─────────────────────────────────────────────
-- During signup the user is not yet authenticated, so we need anon insert.
-- These are intentionally narrow.

drop policy if exists "anon can create club during signup" on clubs;
create policy "anon can create club during signup"
  on clubs for insert
  to anon
  with check (true);

drop policy if exists "anon can create profile during signup" on profiles;
create policy "anon can create profile during signup"
  on profiles for insert
  to anon
  with check (true);

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';
