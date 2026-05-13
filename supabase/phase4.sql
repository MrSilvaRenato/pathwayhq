-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Phase 4: Club discovery + platform superadmin
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. PUBLIC CLUB SEARCH ───────────────────────────────────────────────────
-- Allow anyone (anon + authenticated) to list clubs for the /clubs discovery page.
-- Club data (name, sport, state, city) is not sensitive.
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'clubs' and policyname = 'public can search clubs'
  ) then
    execute $pol$
      create policy "public can search clubs"
        on clubs for select
        to anon, authenticated
        using (true)
    $pol$;
  end if;
end $$;

-- ─── 2. SUPERADMIN STATS FUNCTION ────────────────────────────────────────────
-- Returns per-club stats. Called server-side with the service role key
-- (bypasses RLS), so no separate policy is needed.
create or replace function club_stats()
returns table (
  id                uuid,
  name              text,
  sport             text,
  state             text,
  city              text,
  subscription_tier text,
  created_at        timestamptz,
  member_count      bigint,
  athlete_count     bigint
)
language sql security definer
as $$
  select
    c.id,
    c.name,
    c.sport::text,
    c.state::text,
    c.city,
    c.subscription_tier::text,
    c.created_at,
    (select count(*) from profiles p where p.club_id = c.id),
    (select count(*) from athletes a where a.club_id = c.id)
  from clubs c
  order by c.created_at desc;
$$;

notify pgrst, 'reload schema';
