-- Update the handle_new_user trigger to support athlete role and athlete_id
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role, club_id, athlete_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'coach')::user_role,
    nullif(new.raw_user_meta_data->>'club_id', '')::uuid,
    nullif(new.raw_user_meta_data->>'athlete_id', '')::uuid
  );
  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer;
