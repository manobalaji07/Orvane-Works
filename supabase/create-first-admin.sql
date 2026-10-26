-- ==============================================================================
-- Orvane Works: Bootstrap First Administrator
-- ==============================================================================
-- This script promotes a registered user to the 'admin' role.
-- Due to trigger 'on_profile_role_update' requiring is_admin(), bootstrapping
-- the very first admin must be executed in Supabase SQL Editor (running as postgres/superuser)
-- or via the service role key.
--
-- Instructions:
-- 1. Sign up on Orvane Works (e.g. at http://localhost:3000/login or production URL)
--    with your admin email address.
-- 2. In Supabase Dashboard -> SQL Editor, replace 'admin@example.com' below
--    with your registered email address and execute this query.
-- ==============================================================================

do $$
declare
  target_email text := 'admin@example.com'; -- <-- CHANGE THIS TO YOUR REGISTERED EMAIL
  v_user_id uuid;
begin
  -- Find the user profile by email
  select id into v_user_id from public.profiles where email = target_email;

  if v_user_id is null then
    raise notice 'User with email % was not found. Please sign up first via the web app.', target_email;
  else
    -- Temporarily disable the role update trigger to bootstrap the initial admin
    alter table public.profiles disable trigger on_profile_role_update;

    -- Elevate to admin role with active status
    update public.profiles
    set
      role = 'admin'::user_role,
      status = 'active'::user_status,
      updated_at = clock_timestamp()
    where id = v_user_id;

    -- Re-enable the role update trigger
    alter table public.profiles enable trigger on_profile_role_update;

    raise notice 'Successfully promoted % (ID: %) to Administrator.', target_email, v_user_id;
  end if;
end $$;
