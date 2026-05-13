-- Allow anyone to insert a club (needed during signup before auth exists)
-- The profile trigger links the user to their club after auth is created
create policy "anyone can create a club during signup"
  on clubs for insert with check (true);

-- Allow users to insert their own profile (trigger handles this but belt-and-braces)
create policy "users can insert own profile"
  on profiles for insert with check (id = auth.uid());
