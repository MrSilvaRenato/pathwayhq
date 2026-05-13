-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Expand sports + independent athlete support
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. EXPAND SPORT TYPE ENUM ───────────────────────────────────────────────
-- Drop the old enum and recreate with all Olympic + major Australian sports.
-- We need to handle existing data first.

alter table clubs    alter column sport type text;
alter table athletes alter column sport type text;
alter table squads   alter column sport type text;
alter table sessions alter column ftem_focus type text using ftem_focus::text;

drop type if exists sport_type;

create type sport_type as enum (
  -- Aquatics
  'swimming',
  'diving',
  'water_polo',
  'artistic_swimming',
  'marathon_swimming',
  -- Athletics
  'athletics',
  'road_running',
  'race_walking',
  -- Ball sports
  'soccer',
  'basketball',
  'basketball_3x3',
  'volleyball',
  'beach_volleyball',
  'hockey',
  'handball',
  'rugby_sevens',
  'baseball',
  'softball',
  'cricket',
  'flag_football',
  'lacrosse',
  -- Racquet
  'tennis',
  'table_tennis',
  'badminton',
  'squash',
  -- Combat
  'boxing',
  'judo',
  'taekwondo',
  'wrestling',
  'fencing',
  'karate',
  -- Gymnastics
  'artistic_gymnastics',
  'rhythmic_gymnastics',
  'trampoline',
  'acrobatic_gymnastics',
  'parkour',
  -- Cycling
  'cycling_road',
  'cycling_track',
  'cycling_mountain',
  'cycling_bmx',
  'cycling_bmx_freestyle',
  -- Water / Paddle
  'rowing',
  'canoe_sprint',
  'canoe_slalom',
  'sailing',
  'surfing',
  'kayaking',
  -- Other Olympic
  'triathlon',
  'modern_pentathlon',
  'equestrian',
  'archery',
  'shooting',
  'weightlifting',
  'golf',
  'sport_climbing',
  'skateboarding',
  'breaking',
  -- Australian popular
  'netball',
  'afl',
  'rugby_league',
  'touch_football',
  -- General
  'other'
);

alter table clubs    alter column sport type sport_type using sport::sport_type;
alter table athletes alter column sport type sport_type using sport::sport_type;
alter table squads   alter column sport type sport_type using sport::sport_type;

-- ─── 2. ADD ATHLETE ROLE ──────────────────────────────────────────────────────
-- Independent athletes are first-class users, not just managed records.

alter type user_role add value if not exists 'athlete';

-- ─── 3. MAKE ATHLETES.CLUB_ID NULLABLE ───────────────────────────────────────
-- Independent athletes have no club affiliation.

alter table athletes alter column club_id drop not null;

-- ─── 4. ADD SELF_ATHLETE_ID TO PROFILES ──────────────────────────────────────
-- When a user signs up as an athlete, link their profile to their athlete record.

alter table profiles add column if not exists athlete_id uuid references athletes(id) on delete set null;

-- ─── 5. UPDATE RLS POLICIES FOR INDEPENDENT ATHLETES ─────────────────────────

-- Athletes can view and manage their own record
drop policy if exists "athletes can view own record" on athletes;
create policy "athletes can view own record"
  on athletes for select
  to authenticated
  using (
    id in (select athlete_id from profiles where id = auth.uid())
  );

drop policy if exists "athletes can update own record" on athletes;
create policy "athletes can update own record"
  on athletes for update
  to authenticated
  using (
    id in (select athlete_id from profiles where id = auth.uid())
  );

-- Athletes can view their own FTEM history
drop policy if exists "athletes can view own ftem history" on ftem_history;
create policy "athletes can view own ftem history"
  on ftem_history for select
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

-- Athletes can insert their own FTEM history (self-assessed)
drop policy if exists "athletes can insert own ftem history" on ftem_history;
create policy "athletes can insert own ftem history"
  on ftem_history for insert
  to authenticated
  with check (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

-- Athletes can view their own milestones
drop policy if exists "athletes can view own milestones" on milestones;
create policy "athletes can view own milestones"
  on milestones for select
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

-- Athletes can insert their own milestones
drop policy if exists "athletes can manage own milestones" on milestones;
create policy "athletes can manage own milestones"
  on milestones for all
  to authenticated
  using (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  )
  with check (
    athlete_id in (select athlete_id from profiles where id = auth.uid())
  );

-- ─── 6. INDEPENDENT ATHLETE INSERT POLICY ────────────────────────────────────
-- When an athlete signs up, they insert their own athlete record.

drop policy if exists "athletes can insert own record" on athletes;
create policy "athletes can insert own record"
  on athletes for insert
  to authenticated
  with check (true);

-- Anon insert for signup flow
drop policy if exists "anon can insert athlete on signup" on athletes;
create policy "anon can insert athlete on signup"
  on athletes for insert
  to anon
  with check (true);

-- ─── 7. SPORTS TABLE FOR REFERENCE (optional enrichment) ─────────────────────
-- Stores display names, icons, and whether it's in the 2032 Olympics program.

create table if not exists sports_reference (
  sport         sport_type primary key,
  display_name  text not null,
  category      text not null,
  in_2032       boolean not null default false,
  emoji         text
);

insert into sports_reference (sport, display_name, category, in_2032, emoji) values
  ('swimming',            'Swimming',              'Aquatics',      true,  '🏊'),
  ('diving',              'Diving',                'Aquatics',      true,  '🤿'),
  ('water_polo',          'Water Polo',            'Aquatics',      true,  '🤽'),
  ('artistic_swimming',   'Artistic Swimming',     'Aquatics',      true,  '🏊'),
  ('marathon_swimming',   'Marathon Swimming',     'Aquatics',      true,  '🏊'),
  ('athletics',           'Athletics',             'Athletics',     true,  '🏃'),
  ('road_running',        'Road Running',          'Athletics',     true,  '🏃'),
  ('race_walking',        'Race Walking',          'Athletics',     true,  '🚶'),
  ('soccer',              'Soccer / Football',     'Team Sports',   true,  '⚽'),
  ('basketball',          'Basketball',            'Team Sports',   true,  '🏀'),
  ('basketball_3x3',      '3x3 Basketball',        'Team Sports',   true,  '🏀'),
  ('volleyball',          'Volleyball',            'Team Sports',   true,  '🏐'),
  ('beach_volleyball',    'Beach Volleyball',      'Team Sports',   true,  '🏐'),
  ('hockey',              'Hockey',                'Team Sports',   true,  '🏑'),
  ('handball',            'Handball',              'Team Sports',   true,  '🤾'),
  ('rugby_sevens',        'Rugby Sevens',          'Team Sports',   true,  '🏉'),
  ('baseball',            'Baseball',              'Team Sports',   false, '⚾'),
  ('softball',            'Softball',              'Team Sports',   false, '🥎'),
  ('cricket',             'Cricket T20',           'Team Sports',   true,  '🏏'),
  ('flag_football',       'Flag Football',         'Team Sports',   true,  '🏈'),
  ('lacrosse',            'Lacrosse',              'Team Sports',   true,  '🥍'),
  ('tennis',              'Tennis',                'Racquet',       true,  '🎾'),
  ('table_tennis',        'Table Tennis',          'Racquet',       true,  '🏓'),
  ('badminton',           'Badminton',             'Racquet',       true,  '🏸'),
  ('squash',              'Squash',                'Racquet',       true,  '🎱'),
  ('boxing',              'Boxing',                'Combat',        true,  '🥊'),
  ('judo',                'Judo',                  'Combat',        true,  '🥋'),
  ('taekwondo',           'Taekwondo',             'Combat',        true,  '🥋'),
  ('wrestling',           'Wrestling',             'Combat',        true,  '🤼'),
  ('fencing',             'Fencing',               'Combat',        true,  '🤺'),
  ('karate',              'Karate',                'Combat',        false, '🥋'),
  ('artistic_gymnastics', 'Artistic Gymnastics',   'Gymnastics',    true,  '🤸'),
  ('rhythmic_gymnastics', 'Rhythmic Gymnastics',   'Gymnastics',    true,  '🤸'),
  ('trampoline',          'Trampolining',          'Gymnastics',    true,  '🤸'),
  ('acrobatic_gymnastics','Acrobatic Gymnastics',  'Gymnastics',    false, '🤸'),
  ('parkour',             'Parkour',               'Gymnastics',    false, '🏃'),
  ('cycling_road',        'Road Cycling',          'Cycling',       true,  '🚴'),
  ('cycling_track',       'Track Cycling',         'Cycling',       true,  '🚴'),
  ('cycling_mountain',    'Mountain Bike',         'Cycling',       true,  '🚵'),
  ('cycling_bmx',         'BMX Racing',            'Cycling',       true,  '🚴'),
  ('cycling_bmx_freestyle','BMX Freestyle',        'Cycling',       true,  '🚴'),
  ('rowing',              'Rowing',                'Water',         true,  '🚣'),
  ('canoe_sprint',        'Canoe Sprint',          'Water',         true,  '🛶'),
  ('canoe_slalom',        'Canoe Slalom',          'Water',         true,  '🛶'),
  ('sailing',             'Sailing',               'Water',         true,  '⛵'),
  ('surfing',             'Surfing',               'Water',         true,  '🏄'),
  ('kayaking',            'Kayaking',              'Water',         false, '🛶'),
  ('triathlon',           'Triathlon',             'Multi-Sport',   true,  '🏊'),
  ('modern_pentathlon',   'Modern Pentathlon',     'Multi-Sport',   true,  '🏇'),
  ('equestrian',          'Equestrian',            'Equestrian',    true,  '🏇'),
  ('archery',             'Archery',               'Precision',     true,  '🏹'),
  ('shooting',            'Shooting',              'Precision',     true,  '🎯'),
  ('weightlifting',       'Weightlifting',         'Strength',      true,  '🏋️'),
  ('golf',                'Golf',                  'Precision',     true,  '⛳'),
  ('sport_climbing',      'Sport Climbing',        'Urban',         true,  '🧗'),
  ('skateboarding',       'Skateboarding',         'Urban',         true,  '🛹'),
  ('breaking',            'Breaking',              'Urban',         false, '💃'),
  ('netball',             'Netball',               'Australian',    false, '🏀'),
  ('afl',                 'Australian Football',   'Australian',    false, '🏈'),
  ('rugby_league',        'Rugby League',          'Australian',    false, '🏉'),
  ('touch_football',      'Touch Football',        'Australian',    false, '🏉'),
  ('other',               'Other',                 'Other',         false, '🏅')
on conflict (sport) do nothing;

notify pgrst, 'reload schema';
