-- ─────────────────────────────────────────────────────────────────────────────
-- PathwayHQ — Phase 3: Wellness/RPE unique constraint + Goals RLS fix
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow upsert on wellness_logs (one entry per athlete per day)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'wellness_logs_athlete_date_unique'
  ) then
    alter table wellness_logs add constraint wellness_logs_athlete_date_unique unique (athlete_id, logged_at);
  end if;
end $$;

-- Parents can view their child's wellness logs
create policy "parents can view child wellness"
  on wellness_logs for select
  to authenticated
  using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

-- Parents can view goals for their child
create policy "parents can view child goals"
  on goals for select
  to authenticated
  using (
    athlete_id in (select id from athletes where parent_id = auth.uid())
  );

-- Coaches can view athlete wellness in their club (skip if already exists)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'goals' and policyname = 'coaches view club athlete goals'
  ) then
    execute $pol$
      create policy "coaches view club athlete goals"
        on goals for select
        to authenticated
        using (club_id = my_club_id() and my_role() in ('club_admin', 'coach'))
    $pol$;
  end if;
end $$;

notify pgrst, 'reload schema';
