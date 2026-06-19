-- Build Showcase: core tables, indexes, and RLS policies.
-- Applied to production 2026-06-19 (migration: create_build_showcase_tables).

-- ============ builds ============
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  year int,
  generation text,
  model text,
  engine text,
  transmission text,
  exterior_color text,
  interior_color text,
  mileage int,
  vin text,
  production_date text,
  factory_options text,
  build_name text not null,
  build_description text,
  build_goals text,
  inspiration text,
  moderation_status text not null default 'draft'
    check (moderation_status in
      ('draft','pending_initial','in_progress_shared','proofreading','pending_final','verified','rejected')),
  build_status text not null default 'planning'
    check (build_status in ('planning','in_progress','complete','sold','retired')),
  admin_notes text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ build_components ============
create table public.build_components (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.builds(id) on delete cascade,
  section text not null
    check (section in
      ('exterior','interior','electronics','powertrain','drivetrain','suspension','wheels_tires','brakes')),
  category text,
  name text not null,
  manufacturer text,
  supplier text,
  part_number text,
  cost numeric(10,2),
  quantity int default 1,
  status text not null default 'planned'
    check (status in ('planned','ordered','installed','removed')),
  installed_date date,
  description text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ============ build_photos ============
create table public.build_photos (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.builds(id) on delete cascade,
  component_id uuid references public.build_components(id) on delete set null,
  url text not null,
  media_type text not null default 'photo' check (media_type in ('photo','document')),
  gallery_category text
    check (gallery_category in ('exterior','interior','engine_bay','suspension','wheels','build_progress')),
  caption text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- indexes
create index idx_builds_user on public.builds(user_id);
create index idx_builds_moderation on public.builds(moderation_status);
create index idx_builds_gen on public.builds(generation);
create index idx_builds_engine on public.builds(engine);
create index idx_components_build on public.build_components(build_id);
create index idx_photos_build on public.build_photos(build_id);

-- ============ RLS ============
alter table public.builds enable row level security;
alter table public.build_components enable row level security;
alter table public.build_photos enable row level security;

create policy "builds_select_public_verified" on public.builds
  for select using (
    moderation_status = 'verified'
    or (moderation_status = 'in_progress_shared' and auth.role() = 'authenticated')
    or user_id = auth.uid()
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create policy "builds_insert_own" on public.builds
  for insert with check (user_id = auth.uid() and moderation_status = 'draft');

create policy "builds_update_own_unlocked" on public.builds
  for update using (
    (user_id = auth.uid() and moderation_status <> 'verified')
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create policy "builds_delete_own" on public.builds
  for delete using (
    (user_id = auth.uid() and moderation_status in ('draft','rejected'))
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create policy "components_select_via_build" on public.build_components
  for select using (exists (
    select 1 from public.builds b where b.id = build_id and (
      b.moderation_status = 'verified'
      or (b.moderation_status = 'in_progress_shared' and auth.role() = 'authenticated')
      or b.user_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
    )));

create policy "components_write_via_owner" on public.build_components
  for all using (exists (
    select 1 from public.builds b where b.id = build_id
    and b.user_id = auth.uid() and b.moderation_status <> 'verified'))
  with check (exists (
    select 1 from public.builds b where b.id = build_id
    and b.user_id = auth.uid() and b.moderation_status <> 'verified'));

create policy "photos_select_via_build" on public.build_photos
  for select using (exists (
    select 1 from public.builds b where b.id = build_id and (
      b.moderation_status = 'verified'
      or (b.moderation_status = 'in_progress_shared' and auth.role() = 'authenticated')
      or b.user_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
    )));

create policy "photos_write_via_owner" on public.build_photos
  for all using (exists (
    select 1 from public.builds b where b.id = build_id
    and b.user_id = auth.uid() and b.moderation_status <> 'verified'))
  with check (exists (
    select 1 from public.builds b where b.id = build_id
    and b.user_id = auth.uid() and b.moderation_status <> 'verified'));
