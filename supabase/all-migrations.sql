-- ==============================================================================
-- Orvane Works: Complete Unified Migration Script
-- Idempotent and ready to run directly in Supabase Dashboard SQL Editor
-- ==============================================================================

-- =============================================
-- Migration: 20261023000001_initial_schema.sql
-- =============================================

-- Orvane Studio Database Schema
-- Initial Schema Migration

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
do $$ begin
  create type user_role as enum ('client', 'pending_employee', 'employee', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type user_status as enum ('active', 'pending', 'suspended', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type request_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type availability_status as enum ('available', 'busy', 'unavailable');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum (
    'submitted',
    'in_review',
    'quote_sent',
    'accepted',
    'in_progress',
    'awaiting_feedback',
    'delivered',
    'closed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum (
    'unbilled',
    'quote_pending',
    'invoiced',
    'partially_paid',
    'paid_in_full',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type file_category as enum (
    'client_reference',
    'deliverable',
    'invoice',
    'feedback'
  );
exception
  when duplicate_object then null;
end $$;

-- 1. PROFILES (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'client',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. EMPLOYEE REQUESTS ("Join our team" applications)
create table if not exists public.employee_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  portfolio_url text,
  resume_url text,
  skills text[] not null default '{}',
  cover_note text not null,
  status request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  rejection_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. EMPLOYEE PROFILES (Public profiles of approved team members)
create table if not exists public.employee_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  designation text not null,
  bio text not null,
  availability_status availability_status not null default 'available',
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  github_url text,
  linkedin_url text,
  twitter_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. SPECIALIZATIONS & JUNCTION
create table if not exists public.specializations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.employee_specializations (
  employee_profile_id uuid not null references public.employee_profiles(id) on delete cascade,
  specialization_id uuid not null references public.specializations(id) on delete cascade,
  primary key (employee_profile_id, specialization_id)
);

-- 5. EXPERIENCE ENTRIES
create table if not exists public.experience_entries (
  id uuid primary key default gen_random_uuid(),
  employee_profile_id uuid not null references public.employee_profiles(id) on delete cascade,
  role text not null,
  organization text not null,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. SERVICES (Data-driven, expandable catalog)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  full_description text not null,
  icon_name text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. PACKAGES ("Starting from ₹")
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  name text not null,
  slug text not null unique,
  price_inr numeric(10,2) not null,
  delivery_time_days integer not null,
  features jsonb not null default '[]'::jsonb,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 8. PORTFOLIO PROJECTS
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  service_id uuid references public.services(id) on delete set null,
  client_name text not null,
  thumbnail_url text not null,
  gallery_urls text[] not null default '{}',
  challenge text not null,
  solution text not null,
  outcome_metrics jsonb not null default '{}'::jsonb,
  project_url text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.project_collaborators (
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  employee_profile_id uuid not null references public.employee_profiles(id) on delete cascade,
  primary key (project_id, employee_profile_id)
);

-- 9. TESTIMONIALS
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_role_company text not null,
  avatar_url text,
  rating smallint not null check (rating between 1 and 5) default 5,
  content text not null,
  service_id uuid references public.services(id) on delete set null,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 10. FAQS
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 11. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  client_id uuid not null references public.profiles(id),
  service_id uuid not null references public.services(id),
  package_id uuid references public.packages(id),
  preferred_employee_id uuid references public.profiles(id),
  title text not null,
  project_brief text not null,
  budget_min_inr numeric(10,2) not null,
  budget_max_inr numeric(10,2) not null,
  target_deadline date not null,
  preferred_contact_method text not null default 'whatsapp',
  status order_status not null default 'submitted',
  quote_amount_inr numeric(10,2),
  quote_terms text,
  payment_status payment_status not null default 'unbilled',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. ORDER ASSIGNMENTS
create table if not exists public.order_assignments (
  order_id uuid not null references public.orders(id) on delete cascade,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id),
  assigned_at timestamptz not null default now(),
  primary key (order_id, employee_id)
);

-- 13. ORDER EVENTS (Timeline audit trail)
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  previous_value text,
  new_value text not null,
  notes text,
  is_internal_only boolean not null default false,
  created_at timestamptz not null default now()
);

-- 14. ORDER MESSAGES
create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  content text not null,
  attachments jsonb not null default '[]'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 15. ORDER FILES
create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id),
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  storage_path text not null,
  file_category file_category not null default 'client_reference',
  is_deliverable boolean not null default false,
  created_at timestamptz not null default now()
);

-- 16. CONTACT MESSAGES
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_id uuid references public.services(id),
  message text not null,
  is_handled boolean not null default false,
  handled_by uuid references public.profiles(id),
  handled_at timestamptz,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

-- 17. WAITLIST ENTRIES (Hardware & IoT)
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  company_or_project text,
  interest_details text not null,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- 18. SITE SETTINGS
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- 19. AUDIT LOG (Tamper-evident record of admin and employee actions)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- 20. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 21. RATE LIMITS (Sliding-window counter table)
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  counter integer not null default 1,
  window_start timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_rate_limits_key_expires on public.rate_limits(key, expires_at);


-- =============================================
-- Migration: 20261023000002_rls_policies.sql
-- =============================================

-- Orvane Studio Database Schema
-- Row Level Security (RLS) Policies & Helper Functions

-- Helper functions for RLS
create or replace function public.current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_employee()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select role in ('employee', 'admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.employee_requests enable row level security;
alter table public.employee_profiles enable row level security;
alter table public.specializations enable row level security;
alter table public.employee_specializations enable row level security;
alter table public.experience_entries enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.project_collaborators enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.orders enable row level security;
alter table public.order_assignments enable row level security;
alter table public.order_events enable row level security;
alter table public.order_messages enable row level security;
alter table public.order_files enable row level security;
alter table public.contact_messages enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.notifications enable row level security;
alter table public.rate_limits enable row level security;

-- 1. PROFILES RLS
drop policy if exists "Public can read approved published employee profiles" on public.profiles;
create policy "Public can read approved published employee profiles" on public.profiles for select
  using (
    id in (
      select user_id from public.employee_profiles where is_published = true
    )
  );

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select
  using (public.is_admin());

drop policy if exists "Users can update own non-sensitive profile info" on public.profiles;
create policy "Users can update own non-sensitive profile info" on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update
  using (public.is_admin());

-- 2. EMPLOYEE REQUESTS RLS
drop policy if exists "Applicants can read own request" on public.employee_requests;
create policy "Applicants can read own request" on public.employee_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all requests" on public.employee_requests;
create policy "Admins can read all requests" on public.employee_requests for select
  using (public.is_admin());

drop policy if exists "Admins can update employee requests" on public.employee_requests;
create policy "Admins can update employee requests" on public.employee_requests for update
  using (public.is_admin());

-- 3. EMPLOYEE PROFILES RLS
drop policy if exists "Public can view published employee profiles" on public.employee_profiles;
create policy "Public can view published employee profiles" on public.employee_profiles for select
  using (is_published = true);

drop policy if exists "Employees can read own profile" on public.employee_profiles;
create policy "Employees can read own profile" on public.employee_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Employees can update own profile" on public.employee_profiles;
create policy "Employees can update own profile" on public.employee_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can manage all employee profiles" on public.employee_profiles;
create policy "Admins can manage all employee profiles" on public.employee_profiles for all
  using (public.is_admin());

-- 4. SERVICES & PACKAGES (Public read active, admin write)
drop policy if exists "Public can view active services" on public.services;
create policy "Public can view active services" on public.services for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services" on public.services for all
  using (public.is_admin());

drop policy if exists "Public can view active packages" on public.packages;
create policy "Public can view active packages" on public.packages for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage packages" on public.packages;
create policy "Admins manage packages" on public.packages for all
  using (public.is_admin());

-- 5. ORDERS RLS
drop policy if exists "Clients can view own orders" on public.orders;
create policy "Clients can view own orders" on public.orders for select
  using (auth.uid() = client_id);

drop policy if exists "Assigned employees can view orders" on public.orders;
create policy "Assigned employees can view orders" on public.orders for select
  using (
    exists (
      select 1 from public.order_assignments
      where order_id = public.orders.id and employee_id = auth.uid()
    )
  );

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders for select
  using (public.is_admin());

drop policy if exists "Clients can create orders" on public.orders;
create policy "Clients can create orders" on public.orders for insert
  with check (auth.uid() = client_id);

drop policy if exists "Employees can update status on assigned orders" on public.orders;
create policy "Employees can update status on assigned orders" on public.orders for update
  using (
    exists (
      select 1 from public.order_assignments
      where order_id = public.orders.id and employee_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all orders" on public.orders;
create policy "Admins can manage all orders" on public.orders for all
  using (public.is_admin());

-- 6. ORDER MESSAGES RLS
drop policy if exists "Order participants can read messages" on public.order_messages;
create policy "Order participants can read messages" on public.order_messages for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (
        o.client_id = auth.uid()
        or exists (
          select 1 from public.order_assignments oa
          where oa.order_id = o.id and oa.employee_id = auth.uid()
        )
      )
    )
    or public.is_admin()
  );

drop policy if exists "Order participants can send messages" on public.order_messages;
create policy "Order participants can send messages" on public.order_messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.orders o
        where o.id = order_id
        and (
          o.client_id = auth.uid()
          or exists (
            select 1 from public.order_assignments oa
            where oa.order_id = o.id and oa.employee_id = auth.uid()
          )
        )
      )
      or public.is_admin()
    )
  );

-- 7. ORDER FILES RLS
drop policy if exists "Order participants can view files" on public.order_files;
create policy "Order participants can view files" on public.order_files for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (
        o.client_id = auth.uid()
        or exists (
          select 1 from public.order_assignments oa
          where oa.order_id = o.id and oa.employee_id = auth.uid()
        )
      )
    )
    or public.is_admin()
  );

drop policy if exists "Order participants can upload files" on public.order_files;
create policy "Order participants can upload files" on public.order_files for insert
  with check (
    auth.uid() = uploader_id
    and (
      exists (
        select 1 from public.orders o
        where o.id = order_id
        and (
          o.client_id = auth.uid()
          or exists (
            select 1 from public.order_assignments oa
            where oa.order_id = o.id and oa.employee_id = auth.uid()
          )
        )
      )
      or public.is_admin()
    )
  );

-- 8. CONTACT & WAITLIST (Public insert, admin read/manage)
drop policy if exists "Anyone can submit contact message" on public.contact_messages;
create policy "Anyone can submit contact message" on public.contact_messages for insert
  with check (true);

drop policy if exists "Admins read and update contact messages" on public.contact_messages;
create policy "Admins read and update contact messages" on public.contact_messages for all
  using (public.is_admin());

drop policy if exists "Anyone can join waitlist" on public.waitlist_entries;
create policy "Anyone can join waitlist" on public.waitlist_entries for insert
  with check (true);

drop policy if exists "Admins read and update waitlist entries" on public.waitlist_entries;
create policy "Admins read and update waitlist entries" on public.waitlist_entries for all
  using (public.is_admin());

-- 9. AUDIT LOG (Admin read only)
drop policy if exists "Admins can view audit log" on public.audit_log;
create policy "Admins can view audit log" on public.audit_log for select
  using (public.is_admin());


-- =============================================
-- Migration: 20261023000003_rate_limiting.sql
-- =============================================

-- Orvane Studio Database Schema
-- Database-backed Sliding-Window Rate Limiting RPC

create or replace function public.check_rate_limit(
  p_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count integer;
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + (p_window_seconds || ' seconds')::interval;
begin
  -- Periodic cleanup of expired rate limits
  delete from public.rate_limits
  where expires_at < v_now - interval '1 minute';

  -- Fetch current limit counter
  select counter into v_count
  from public.rate_limits
  where key = p_key and expires_at > v_now
  for update;

  if found then
    if v_count >= p_max_requests then
      return false; -- Rate limit exceeded
    end if;

    update public.rate_limits
    set counter = counter + 1
    where key = p_key and expires_at > v_now;

    return true; -- Allowed
  else
    insert into public.rate_limits (key, counter, window_start, expires_at)
    values (p_key, 1, v_now, v_expires_at)
    on conflict do nothing;

    return true; -- Allowed
  end if;
end;
$$;


-- =============================================
-- Migration: 20261023000004_auth_triggers.sql
-- =============================================

-- Orvane Studio Database Schema
-- Auth Triggers and Role Protection

-- Function to handle new user registration in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role user_role := 'client';
  v_status user_status := 'active';
  v_requested_role text;
begin
  -- Inspect raw_user_meta_data for initial registration intent
  v_requested_role := new.raw_user_meta_data->>'requested_role';
  
  -- Security Rule: Users can ONLY ever be initialized as 'client' or 'pending_employee'
  -- Nobody can self-sign into employee or admin access.
  if v_requested_role = 'pending_employee' then
    v_role := 'pending_employee';
    v_status := 'pending';
  else
    v_role := 'client';
    v_status := 'active';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    v_role,
    v_status
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger on auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to prevent non-admins from changing role or status
create or replace function public.enforce_profile_role_integrity()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If role or status is being modified
  if (new.role <> old.role) or (new.status <> old.status) then
    -- Check if current authenticated actor is an admin
    if not public.is_admin() then
      raise exception 'Unauthorized: Only an administrator can update user roles or account status.';
    end if;
  end if;

  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists on_profile_role_update on public.profiles;
create trigger on_profile_role_update
  before update on public.profiles
  for each row execute function public.enforce_profile_role_integrity();


-- =============================================
-- Migration: 20261024000005_payments_table.sql
-- =============================================

-- Phase D: Manual Payments System
-- Creates the order_payments table for admin-recorded manual transactions
-- (UPI / Bank Transfer / Cash) with client-visible read-only view.
-- Reversible: see DROP section at the bottom (commented out).

-- ── Enums ────────────────────────────────────────────────────────────────────

do $$ begin
  create type payment_method as enum ('upi', 'bank_transfer', 'cash', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_type as enum ('advance', 'balance', 'full');
exception
  when duplicate_object then null;
end $$;

-- ── Table ─────────────────────────────────────────────────────────────────────

create table if not exists public.order_payments (
  id              uuid         primary key default gen_random_uuid(),
  order_id        uuid         not null references public.orders(id) on delete cascade,
  amount_inr      numeric(12,2) not null check (amount_inr > 0),
  -- "advance" = 50% upfront, "balance" = remaining, "full" = single payment
  payment_type    payment_type not null default 'advance',
  method          payment_method not null default 'upi',
  -- UTR / transaction reference supplied by client; nullable if cash
  reference_utr   text,
  date_received   date         not null default current_date,
  notes           text,
  -- The admin who recorded this payment
  recorded_by     uuid         not null references public.profiles(id),
  -- provider is always 'manual' in v1; reserved for Razorpay later
  provider        text         not null default 'manual',
  -- Soft-delete for voided entries; hard data is preserved for audit
  voided_at       timestamptz,
  void_reason     text,
  created_at      timestamptz  not null default now()
);

-- Index for fast per-order lookups
create index if not exists idx_order_payments_order_id
  on public.order_payments(order_id);

-- Index so voided payments are easy to filter
create index if not exists idx_order_payments_voided
  on public.order_payments(order_id) where voided_at is null;

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.order_payments enable row level security;

-- Clients can see payments for their own orders (no amounts shown in client UI,
-- enforced in the application layer — but RLS allows the select).
drop policy if exists "Clients can view own order payments" on public.order_payments;
create policy "Clients can view own order payments" on public.order_payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.client_id = auth.uid()
    )
  );

-- Employees can view payment status only — the application layer hides
-- amount/reference columns. RLS grants read access to assigned orders.
drop policy if exists "Assigned employees can view payment status" on public.order_payments;
create policy "Assigned employees can view payment status" on public.order_payments for select
  using (
    exists (
      select 1 from public.order_assignments oa
      where oa.order_id = order_id
        and oa.employee_id = auth.uid()
    )
  );

-- Only admins can insert, update, or delete payment records
drop policy if exists "Admins can manage all payments" on public.order_payments;
create policy "Admins can manage all payments" on public.order_payments for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- ── Helper: auto-update orders.payment_status after payment changes ───────────
-- Computes aggregate from non-voided payments and updates the parent order.

create or replace function public.sync_order_payment_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id      uuid;
  v_quote_amount  numeric;
  v_total_paid    numeric;
  v_new_status    payment_status;
begin
  -- Determine which order to update
  v_order_id := coalesce(new.order_id, old.order_id);

  -- Get quote amount for this order
  select quote_amount_inr into v_quote_amount
  from public.orders
  where id = v_order_id;

  -- Sum non-voided payments
  select coalesce(sum(amount_inr), 0) into v_total_paid
  from public.order_payments
  where order_id = v_order_id
    and voided_at is null;

  -- Derive the new payment_status
  if v_quote_amount is null or v_quote_amount = 0 then
    v_new_status := 'invoiced';
  elsif v_total_paid = 0 then
    v_new_status := 'invoiced';
  elsif v_total_paid >= v_quote_amount then
    v_new_status := 'paid_in_full';
  else
    v_new_status := 'partially_paid';
  end if;

  -- Write back to orders table
  update public.orders
  set payment_status = v_new_status,
      updated_at = now()
  where id = v_order_id;

  return new;
end;
$$;

-- Trigger fires after any insert / update / delete on order_payments
drop trigger if exists trg_sync_order_payment_status on public.order_payments;
create trigger trg_sync_order_payment_status
  after insert or update or delete
  on public.order_payments
  for each row
  execute function public.sync_order_payment_status();

-- ── Rollback (commented out — run manually to revert) ─────────────────────────
-- drop trigger if exists trg_sync_order_payment_status on public.order_payments;
-- drop function if exists public.sync_order_payment_status();
-- drop table if exists public.order_payments;
-- drop type if exists payment_method;
-- drop type if exists payment_type;


-- =============================================
-- Migration: 20261024000006_site_settings_rls_and_seed.sql
-- =============================================

-- Phase D addendum: site_settings RLS policies + payment_instructions seed
-- Adds missing RLS policies for site_settings table and seeds default
-- payment instructions for the ClientPaymentCard.

-- ── RLS Policies for site_settings ───────────────────────────────────────────

-- Anyone (including anonymous visitors) can read public settings
drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings" on public.site_settings for select
  using (true);

-- Only admins can write site settings
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- ── Seed: default payment instructions ───────────────────────────────────────
-- Admin can update the text via Admin → Content → Site Settings.

insert into public.site_settings (key, value, updated_at)
values (
  'payment_instructions',
  '"Please transfer the agreed amount via UPI or Bank Transfer and share the transaction reference (UTR number) with your assigned project lead via the message thread below.\n\nOur team will confirm receipt and update your payment status within 2–4 business hours.\n\nFor UPI: Use our UPI ID — contact your project lead for the current UPI ID.\nFor Bank Transfer: Request bank details from your project lead via WhatsApp or the message thread."'::jsonb,
  now()
)
on conflict (key) do nothing;


-- =============================================
-- Migration: 20261026000007_schema_completion.sql
-- =============================================

-- ==============================================================================
-- Migration: 20261026000007_schema_completion.sql
-- Completes schema with quotes table, payments alias view, sequence-based order
-- number generator (ORV-2026-0001), and optimized foreign key & filter indexes.
-- ==============================================================================

-- 1. Sequence & Function for Sequential Order Numbers (e.g. ORV-2026-0001)
create sequence if not exists public.order_number_seq start with 1 increment by 1;

create or replace function public.generate_order_number()
returns text
language plpgsql
volatile
as $$
declare
  v_seq bigint;
  v_year text;
  v_num text;
begin
  select nextval('public.order_number_seq') into v_seq;
  select to_char(now(), 'YYYY') into v_year;
  v_num := 'ORV-' || v_year || '-' || lpad(v_seq::text, 4, '0');
  return v_num;
end;
$$;

-- Default orders.order_number to sequence-generated order number
alter table public.orders
  alter column order_number set default public.generate_order_number();

-- 2. Quotes Table
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  amount_inr numeric(12,2) not null check (amount_inr >= 0),
  deliverables jsonb not null default '[]'::jsonb,
  estimated_days int not null default 7 check (estimated_days > 0),
  valid_until timestamptz,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS for quotes
alter table public.quotes enable row level security;

drop policy if exists "Admins can manage all quotes" on public.quotes;
create policy "Admins can manage all quotes" on public.quotes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Clients can view their own quotes" on public.quotes;
create policy "Clients can view their own quotes" on public.quotes for select
  using (
    client_id = auth.uid()
  );

-- 3. Payments View / Alias for order_payments compatibility
create or replace view public.payments as
  select * from public.order_payments;

-- 4. Foreign Key and Filter Indexes for High-Traffic Queries
create index if not exists idx_orders_client_id on public.orders(client_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

create index if not exists idx_order_events_order_id on public.order_events(order_id);
create index if not exists idx_order_messages_order_id on public.order_messages(order_id);
create index if not exists idx_order_files_order_id on public.order_files(order_id);

create index if not exists idx_order_payments_order_id on public.order_payments(order_id);
create index if not exists idx_order_payments_payment_type on public.order_payments(payment_type);

create index if not exists idx_quotes_order_id on public.quotes(order_id);
create index if not exists idx_quotes_client_id on public.quotes(client_id);

create index if not exists idx_employee_requests_status on public.employee_requests(status);
create index if not exists idx_contact_messages_is_handled on public.contact_messages(is_handled);
create index if not exists idx_audit_log_actor_id on public.audit_log(actor_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);


-- =============================================
-- Migration: 20261026000008_storage_buckets.sql
-- =============================================

-- ==============================================================================
-- Migration: 20261026000008_storage_buckets.sql
-- Storage buckets and security policies matching table access rules
-- ==============================================================================

-- 1. Create Storage Buckets (if not already existing)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-assets',
    'public-assets',
    true,
    10485760, -- 10MB limit for avatars and portfolio images
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
  ),
  (
    'order-deliverables',
    'order-deliverables',
    false,
    104857600, -- 100MB limit for project files and deliverables
    null -- enforced on server via strict MIME & extension whitelist
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- 2. Storage Policies for 'public-assets'
drop policy if exists "Public can view public-assets" on storage.objects;
create policy "Public can view public-assets" on storage.objects for select
  using (bucket_id = 'public-assets');

drop policy if exists "Authenticated users can upload public-assets" on storage.objects;
create policy "Authenticated users can upload public-assets" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'public-assets' and
    (
      -- Admins or approved employees uploading avatars / assets
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('admin', 'employee') and status = 'active'
      )
      -- Or any user uploading their own avatar (prefix = avatars/{user_id}/)
      or (storage.foldername(name))[1] = 'avatars' and (storage.filename(name)) like auth.uid() || '%'
    )
  );

-- 3. Storage Policies for 'order-deliverables' (Private Bucket)
-- Admins can read and write all deliverables
drop policy if exists "Admins can manage all order deliverables" on storage.objects;
create policy "Admins can manage all order deliverables" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'order-deliverables' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

-- Clients can only read files for orders they own
drop policy if exists "Clients can view their own order files" on storage.objects;
create policy "Clients can view their own order files" on storage.objects for select
  to authenticated
  using (
    bucket_id = 'order-deliverables' and
    exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.client_id = auth.uid()
    )
  );

-- Clients can upload files to their own order intake folder
drop policy if exists "Clients can upload files to their own order" on storage.objects;
create policy "Clients can upload files to their own order" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'order-deliverables' and
    exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.client_id = auth.uid()
    )
  );

-- Employees can read and upload files for orders assigned to them
drop policy if exists "Assigned employees can access order deliverables" on storage.objects;
create policy "Assigned employees can access order deliverables" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'order-deliverables' and
    exists (
      select 1 from public.orders o
      left join public.order_assignments oa on oa.order_id = o.id
      where o.id::text = (storage.foldername(name))[1]
        and (o.preferred_employee_id = auth.uid() or oa.employee_id = auth.uid())
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = 'employee' and p.status = 'active'
        )
    )
  );


