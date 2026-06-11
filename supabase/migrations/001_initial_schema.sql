-- ─────────────────────────────────────────────────────────────
-- FiveSeriesHQ — Supabase schema
-- Run this in your Supabase SQL editor or via: supabase db push
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  username        text unique not null,
  avatar_url      text,
  bio             text,
  location        text,
  member_number   serial unique,
  post_count      int default 0,
  build_count     int default 0,
  video_count     int default 0,
  created_at      timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── Garage cars ───────────────────────────────────────────────
create table public.garage_cars (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  year            int not null,
  model           text not null,
  generation      text not null check (generation in ('E34','E39','E60','F10','G30')),
  body_style      text not null check (body_style in ('Sedan','Touring','M5')),
  color_name      text,
  color_code      text,
  mileage         text,
  vin_last5       text,
  is_primary      boolean default false,
  build_id        uuid,
  created_at      timestamptz default now()
);
alter table public.garage_cars enable row level security;

create policy "Garage cars are viewable by everyone"
  on public.garage_cars for select using (true);

create policy "Users can manage own garage"
  on public.garage_cars for all using (auth.uid() = user_id);

-- ── Forum threads ─────────────────────────────────────────────
create table public.forum_threads (
  id                  uuid default uuid_generate_v4() primary key,
  title               text not null,
  body                text not null,
  author_id           uuid references public.profiles(id) on delete set null,
  generation          text check (generation in ('E34','E39','E60','F10','G30')),
  category            text not null,
  regional_subforum   text,
  is_pinned           boolean default false,
  is_solved           boolean default false,
  reply_count         int default 0,
  view_count          int default 0,
  last_reply_at       timestamptz default now(),
  created_at          timestamptz default now()
);
alter table public.forum_threads enable row level security;

create policy "Threads are viewable by everyone"
  on public.forum_threads for select using (true);

create policy "Authenticated users can post threads"
  on public.forum_threads for insert with check (auth.uid() = author_id);

create policy "Authors can update own threads"
  on public.forum_threads for update using (auth.uid() = author_id);

-- ── Forum posts ───────────────────────────────────────────────
create table public.forum_posts (
  id          uuid default uuid_generate_v4() primary key,
  thread_id   uuid references public.forum_threads(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  body        text not null,
  image_urls  text[],
  youtube_url text,
  is_op       boolean default false,
  created_at  timestamptz default now()
);
alter table public.forum_posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.forum_posts for select using (true);

create policy "Authenticated users can post"
  on public.forum_posts for insert with check (auth.uid() = author_id);

-- ── Videos ───────────────────────────────────────────────────
create table public.videos (
  id            uuid default uuid_generate_v4() primary key,
  youtube_id    text not null,
  title         text not null,
  channel_name  text,
  category      text not null check (category in ('diy','build-progress','reviews','track-performance')),
  generation    text not null check (generation in ('E34','E39','E60','F10','G30')),
  duration      text,
  submitted_by  uuid references public.profiles(id) on delete set null,
  approved      boolean default false,
  like_count    int default 0,
  created_at    timestamptz default now()
);
alter table public.videos enable row level security;

create policy "Approved videos are viewable by everyone"
  on public.videos for select using (approved = true);

create policy "Authenticated users can submit videos"
  on public.videos for insert with check (auth.uid() = submitted_by);

-- ── Vendors ───────────────────────────────────────────────────
create table public.vendors (
  id                  uuid default uuid_generate_v4() primary key,
  name                text not null,
  type                text not null check (type in ('parts','tuner','shop','fabricator','other')),
  description         text,
  location            text,
  website_url         text,
  instagram           text,
  generations         text[],
  years_in_business   int,
  contact_email       text,
  approved            boolean default false,
  average_rating      numeric(3,2) default 0,
  review_count        int default 0,
  created_at          timestamptz default now()
);
alter table public.vendors enable row level security;

create policy "Approved vendors are viewable by everyone"
  on public.vendors for select using (approved = true);

create table public.vendor_reviews (
  id          uuid default uuid_generate_v4() primary key,
  vendor_id   uuid references public.vendors(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  body        text not null,
  created_at  timestamptz default now(),
  unique (vendor_id, author_id)
);
alter table public.vendor_reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.vendor_reviews for select using (true);

create policy "Authenticated users can review vendors"
  on public.vendor_reviews for insert with check (auth.uid() = author_id);

-- ── Technical documents ───────────────────────────────────────
create table public.tech_documents (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null,
  generation    text not null check (generation in ('E34','E39','E60','F10','G30')),
  category      text not null,
  file_url      text not null,
  file_size_mb  numeric(8,2),
  year_range    text,
  verified      boolean default false,
  submitted_by  uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now()
);
alter table public.tech_documents enable row level security;

create policy "Tech documents are viewable by everyone"
  on public.tech_documents for select using (true);

create policy "Authenticated users can submit documents"
  on public.tech_documents for insert with check (auth.uid() = submitted_by);

-- ── Technical articles ────────────────────────────────────────
create table public.tech_articles (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null,
  generation    text not null check (generation in ('E34','E39','E60','F10','G30')),
  section       text not null check (section in ('maintenance','performance')),
  system        text not null,
  content_type  text not null check (content_type in ('guide','pdf')),
  body          text,
  file_url      text,
  author_id     uuid references public.profiles(id) on delete set null,
  verified      boolean default false,
  view_count    int default 0,
  created_at    timestamptz default now()
);
alter table public.tech_articles enable row level security;

create policy "Tech articles are viewable by everyone"
  on public.tech_articles for select using (true);

create policy "Authenticated users can submit articles"
  on public.tech_articles for insert with check (auth.uid() = author_id);

-- ── Events ────────────────────────────────────────────────────
create table public.events (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  description     text,
  type            text not null check (type in ('meetup','track-day','show')),
  event_date      date not null,
  location        text not null,
  region          text,
  organizer_id    uuid references public.profiles(id) on delete set null,
  attendee_count  int default 0,
  created_at      timestamptz default now()
);
alter table public.events enable row level security;

create policy "Events are viewable by everyone"
  on public.events for select using (true);

create policy "Authenticated users can create events"
  on public.events for insert with check (auth.uid() = organizer_id);

-- ── Auto-create profile on signup ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
