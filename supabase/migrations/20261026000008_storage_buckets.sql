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
create policy "Public can view public-assets"
  on storage.objects for select
  using (bucket_id = 'public-assets');

create policy "Authenticated users can upload public-assets"
  on storage.objects for insert
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
create policy "Admins can manage all order deliverables"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'order-deliverables' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

-- Clients can only read files for orders they own
create policy "Clients can view their own order files"
  on storage.objects for select
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
create policy "Clients can upload files to their own order"
  on storage.objects for insert
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
create policy "Assigned employees can access order deliverables"
  on storage.objects for all
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
