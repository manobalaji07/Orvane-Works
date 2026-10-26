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

create policy "Admins can manage all quotes"
  on public.quotes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Clients can view their own quotes"
  on public.quotes for select
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
create index if not exists idx_order_payments_client_id on public.order_payments(client_id);
create index if not exists idx_order_payments_status on public.order_payments(status);

create index if not exists idx_quotes_order_id on public.quotes(order_id);
create index if not exists idx_quotes_client_id on public.quotes(client_id);

create index if not exists idx_employee_requests_status on public.employee_requests(status);
create index if not exists idx_contact_messages_is_handled on public.contact_messages(is_handled);
create index if not exists idx_audit_log_actor_id on public.audit_log(actor_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);
