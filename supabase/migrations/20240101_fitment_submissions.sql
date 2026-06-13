-- ────────────────────────────────────────────────────────────────────────────
-- FiveSeriesHQ: fitment_submissions table
-- Optional: stores community-submitted fitment reports for curation/moderation
-- Run this in: Supabase Dashboard → SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.fitment_submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Car
  generation      text not null check (generation in ('E34','E39','E60','F10','G30')),
  body_style      text check (body_style in ('Sedan','Touring','M5')),
  year            int,

  -- Wheel spec
  wheel_width     text not null,      -- e.g. "8.5J"
  diameter        int  not null,      -- e.g. 18
  offset          text not null,      -- e.g. "ET20"
  tire_size       text not null,      -- e.g. "225/40R18"
  brand           text,               -- e.g. "BBS"
  model           text,               -- e.g. "CH-R"

  -- Fitment outcome
  suspension      text,               -- e.g. "KW V3 -30mm"
  clearance_front text,               -- e.g. "no rub"
  clearance_rear  text,
  stance          text check (stance in ('flush','slight poke','poke','tuck','moderate tuck')),
  spacers         text,               -- e.g. "10mm front"

  -- Meta
  notes           text,
  image_urls      text[],             -- Supabase storage URLs
  submitted_by    uuid references auth.users(id) on delete set null,
  verified        boolean not null default false,
  verified_by     uuid references auth.users(id) on delete set null,
  verified_at     timestamptz
);

-- Row-level security
alter table public.fitment_submissions enable row level security;

-- Anyone can read verified submissions
create policy "Public can read verified fitments"
  on public.fitment_submissions
  for select
  using (verified = true);

-- Authenticated users can insert their own
create policy "Auth users can submit fitments"
  on public.fitment_submissions
  for insert
  to authenticated
  with check (submitted_by = auth.uid());

-- Users can update their own unverified submissions
create policy "Users can edit own unverified submissions"
  on public.fitment_submissions
  for update
  to authenticated
  using (submitted_by = auth.uid() and verified = false);

-- Index for common queries
create index idx_fitment_gen        on public.fitment_submissions (generation);
create index idx_fitment_gen_size   on public.fitment_submissions (generation, diameter, wheel_width);
create index idx_fitment_verified   on public.fitment_submissions (verified);

-- ────────────────────────────────────────────────────────────────────────────
-- Admin: view all submissions (use service role or Supabase dashboard)
-- SELECT * FROM fitment_submissions ORDER BY created_at DESC;
--
-- Approve a submission:
-- UPDATE fitment_submissions SET verified = true, verified_by = '<admin-uuid>', verified_at = now()
-- WHERE id = '<submission-id>';
-- ────────────────────────────────────────────────────────────────────────────
