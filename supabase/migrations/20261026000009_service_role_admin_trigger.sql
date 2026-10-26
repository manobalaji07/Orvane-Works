-- ==============================================================================
-- Migration: 20261026000009_service_role_admin_trigger.sql
-- Allow service_role key to manage profile roles/status in admin scripts
-- ==============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (auth.jwt()->>'role' = 'service_role'),
    false
  ) or coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.enforce_profile_role_integrity()
returns trigger
language plpgsql
security definer
as $$
begin
  if (new.role <> old.role) or (new.status <> old.status) then
    if not (public.is_admin() or auth.jwt()->>'role' = 'service_role' or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role') then
      raise exception 'Unauthorized: Only an administrator can update user roles or account status.';
    end if;
  end if;

  new.updated_at := clock_timestamp();
  return new;
end;
$$;

-- Elevate orvaneworks@gmail.com
update public.profiles
set role = 'admin', status = 'active'
where email = 'orvaneworks@gmail.com';
