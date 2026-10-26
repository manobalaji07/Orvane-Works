-- ==============================================================================
-- Orvane Works: Demo Data Cleanup Script
-- ==============================================================================
-- FOR USER REVIEW ONLY: DO NOT RUN AUTOMATICALLY.
-- Run this in your Supabase SQL Editor if you previously seeded demo data.
--
-- This script runs inside a single atomic transaction and deletes:
-- 1. Demo orders (ORV-2026-0001, ORV-2026-0002) and cascading payments, files,
--    messages, and timeline events.
-- 2. Demo employee applications and team profiles for demo users:
--    (admin@orvane.studio, student.tce.edu, Dinesh Pandian, Karthik Raja,
--     Priya Sundaram, Arun Kumar).
-- 3. Demo contact submissions and waitlist entries with orvane.studio or demo emails.
-- 4. Packages with '[Demo]' suffixes.
-- 5. Profiles & auth records corresponding to demo email domains.
-- ==============================================================================

BEGIN;

-- 1. Orders and related payments, messages, files, timeline events
DO $$
DECLARE
  deleted_payments_count int;
  deleted_messages_count int;
  deleted_files_count int;
  deleted_events_count int;
  deleted_orders_count int;
BEGIN
  -- Delete payments linked to demo orders
  WITH deleted AS (
    DELETE FROM public.order_payments
    WHERE order_number IN ('ORV-2026-0001', 'ORV-2026-0002')
    RETURNING id
  ) SELECT count(*) INTO deleted_payments_count FROM deleted;

  -- Delete messages linked to demo orders
  WITH deleted AS (
    DELETE FROM public.order_messages
    WHERE order_id IN (
      SELECT id FROM public.orders WHERE order_number IN ('ORV-2026-0001', 'ORV-2026-0002')
    )
    RETURNING id
  ) SELECT count(*) INTO deleted_messages_count FROM deleted;

  -- Delete files linked to demo orders
  WITH deleted AS (
    DELETE FROM public.order_files
    WHERE order_id IN (
      SELECT id FROM public.orders WHERE order_number IN ('ORV-2026-0001', 'ORV-2026-0002')
    )
    RETURNING id
  ) SELECT count(*) INTO deleted_files_count FROM deleted;

  -- Delete events linked to demo orders
  WITH deleted AS (
    DELETE FROM public.order_events
    WHERE order_id IN (
      SELECT id FROM public.orders WHERE order_number IN ('ORV-2026-0001', 'ORV-2026-0002')
    )
    RETURNING id
  ) SELECT count(*) INTO deleted_events_count FROM deleted;

  -- Delete orders themselves
  WITH deleted AS (
    DELETE FROM public.orders
    WHERE order_number IN ('ORV-2026-0001', 'ORV-2026-0002')
    RETURNING id
  ) SELECT count(*) INTO deleted_orders_count FROM deleted;

  RAISE NOTICE 'Deleted % payments, % messages, % files, % events, % demo orders.',
    deleted_payments_count, deleted_messages_count, deleted_files_count, deleted_events_count, deleted_orders_count;
END $$;

-- 2. Demo employee applications and specialist profiles
DO $$
DECLARE
  deleted_emp_req_count int;
  deleted_emp_profiles_count int;
BEGIN
  WITH deleted AS (
    DELETE FROM public.employee_requests
    WHERE email ILIKE '%@orvane.studio'
       OR email ILIKE '%student.tce.edu%'
       OR full_name IN ('Dinesh Pandian', 'Karthik Raja', 'Karthik Rajan', 'Priya Sundaram', 'Arun Kumar')
    RETURNING id
  ) SELECT count(*) INTO deleted_emp_req_count FROM deleted;

  WITH deleted AS (
    DELETE FROM public.employee_profiles
    WHERE user_id IN (
      SELECT id FROM public.profiles
      WHERE email ILIKE '%@orvane.studio'
         OR email ILIKE '%student.tce.edu%'
         OR full_name IN ('Dinesh Pandian', 'Karthik Raja', 'Karthik Rajan', 'Priya Sundaram', 'Arun Kumar')
    )
    RETURNING id
  ) SELECT count(*) INTO deleted_emp_profiles_count FROM deleted;

  RAISE NOTICE 'Deleted % demo employee requests and % demo employee profiles.',
    deleted_emp_req_count, deleted_emp_profiles_count;
END $$;

-- 3. Demo contact messages and waitlist entries
DO $$
DECLARE
  deleted_contact_count int;
  deleted_waitlist_count int;
BEGIN
  WITH deleted AS (
    DELETE FROM public.contact_messages
    WHERE email ILIKE '%@orvane.studio'
       OR email ILIKE '%student.tce.edu%'
       OR name IN ('Dinesh Pandian', 'Karthik Raja', 'Karthik Rajan', 'Priya Sundaram', 'Arun Kumar')
    RETURNING id
  ) SELECT count(*) INTO deleted_contact_count FROM deleted;

  WITH deleted AS (
    DELETE FROM public.waitlist_entries
    WHERE email ILIKE '%@orvane.studio'
       OR email ILIKE '%student.tce.edu%'
       OR name IN ('Dinesh Pandian', 'Karthik Raja', 'Karthik Rajan', 'Priya Sundaram', 'Arun Kumar')
    RETURNING id
  ) SELECT count(*) INTO deleted_waitlist_count FROM deleted;

  RAISE NOTICE 'Deleted % demo contact messages and % demo waitlist entries.',
    deleted_contact_count, deleted_waitlist_count;
END $$;

-- 4. Clean up any packages with '[Demo]' in the title
UPDATE public.packages
SET name = REPLACE(name, ' [Demo]', '')
WHERE name LIKE '%[Demo]%';

-- 5. Demo profiles and auth users
DO $$
DECLARE
  demo_user_ids uuid[];
  deleted_profiles_count int;
  deleted_auth_count int;
BEGIN
  SELECT array_agg(id) INTO demo_user_ids
  FROM public.profiles
  WHERE email ILIKE '%@orvane.studio'
     OR email ILIKE '%student.tce.edu%'
     OR full_name IN ('Dinesh Pandian', 'Karthik Raja', 'Karthik Rajan', 'Priya Sundaram', 'Arun Kumar');

  IF demo_user_ids IS NOT NULL AND array_length(demo_user_ids, 1) > 0 THEN
    -- Delete audit logs created by or referencing demo users
    DELETE FROM public.audit_logs
    WHERE actor_id = ANY(demo_user_ids)
       OR target_id = ANY(demo_user_ids::text[]);

    -- Delete public.profiles
    WITH deleted AS (
      DELETE FROM public.profiles
      WHERE id = ANY(demo_user_ids)
      RETURNING id
    ) SELECT count(*) INTO deleted_profiles_count FROM deleted;

    -- Delete auth.users (requires superuser / postgres role)
    BEGIN
      WITH deleted AS (
        DELETE FROM auth.users
        WHERE id = ANY(demo_user_ids)
        RETURNING id
      ) SELECT count(*) INTO deleted_auth_count FROM deleted;
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'Skipping auth.users deletion (requires elevated privileges). Profiles deleted: %', deleted_profiles_count;
      deleted_auth_count := 0;
    END;

    RAISE NOTICE 'Deleted % demo user profiles and % auth accounts.',
      deleted_profiles_count, deleted_auth_count;
  ELSE
    RAISE NOTICE 'No demo user profiles found to delete.';
  END IF;
END $$;

COMMIT;
