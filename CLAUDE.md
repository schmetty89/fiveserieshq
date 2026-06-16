# FiveSeriesHQ — Project Context for Claude Code

## Overview
FiveSeriesHQ is a community platform for BMW 5 Series enthusiasts at **fiveserieshq.com**. It covers every generation from E34 to G30 and includes forums, technical library, video library, vendor directory, events calendar, member profiles with garage, build showcase, and an admin dashboard.

---

## Tech Stack
- **Framework:** Next.js 15.3.6 (App Router)
- **Language:** TypeScript (strict — no `any` types, no unused vars)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (project ID: `xgfvrlrbeymronphmpii`)
- **Hosting:** Vercel (auto-deploys from GitHub `main` branch)
- **Repo:** GitHub — fiveserieshq
- **Domain:** fiveserieshq.com (DNS via GoDaddy pointing to Vercel)

---

## Environment Variables (set in Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://xgfvrlrbeymronphmpii.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://fiveserieshq.com
NEXT_PUBLIC_SITE_NAME=FiveSeriesHQ
```

---

## Project Structure
```
src/
  app/                          # Next.js App Router pages
    page.tsx                    # Homepage with hero
    layout.tsx                  # Root layout with AuthProvider, full SEO metadata
    sitemap.ts                  # Auto-generated sitemap
    robots.ts                   # robots.txt
    about/page.tsx              # About page
    auth/
      join/page.tsx             # Sign up
      login/page.tsx + LoginForm.tsx
      verify/page.tsx
      reset-password/page.tsx
      callback/route.ts         # Supabase auth callback
    forums/
      page.tsx                  # Forum index
      subforum/page.tsx         # Thread list (accepts ?gen, ?cat, ?region, ?engine)
      thread/[id]/page.tsx      # Individual thread
      new/page.tsx              # New thread composer
    videos/page.tsx
    vendors/page.tsx
    technical/page.tsx          # Gen/section persisted in URL (?gen=F10&section=documents)
    events/page.tsx
    builds/page.tsx             # Under construction placeholder
    members/
      me/page.tsx               # Logged-in user profile
      [username]/page.tsx       # Public profile
    admin/
      page.tsx                  # Admin overview
      vendors/page.tsx
      videos/page.tsx
      technical/page.tsx
      forums/page.tsx
      members/page.tsx          # Tier 2 approvals + role management
    terms/page.tsx
    api/og/route.ts             # OG image redirect to Supabase

  components/
    layout/
      Navbar.tsx                # Sticky dark navbar with auth state, M stripe SVG logo
      Footer.tsx
    hero/
      HeroSection.tsx           # Homepage hero — per-gen M5 images, Nürburgring bg
    auth/
      AuthProvider.tsx          # Context: user, profile, isTier2, isAdmin, isModerator
    forums/
      ForumIndex.tsx            # Forum landing — gen subforums + regional
      SubforumView.tsx          # Thread list with tier/engine support
      ThreadView.tsx            # Full thread + reply composer
      NewThreadForm.tsx         # Thread composer with gen/cat/engine/region
    videos/
      VideoLibrary.tsx          # Netflix-style rows by category
      SubmitVideoModal.tsx
    vendors/
      VendorDirectory.tsx
      VendorApplyModal.tsx
      VendorReviewModal.tsx
    technical/
      TechnicalInfo.tsx         # Gen sidebar, docs/maintenance/performance sections
      TechSubmitModal.tsx       # File upload to Supabase storage (tech-documents bucket)
    events/
      EventsCalendar.tsx
      SubmitEventModal.tsx
    members/
      MyProfile.tsx             # Logged-in user profile with tier badge
      PublicProfile.tsx
      GarageTab.tsx
      CarModal.tsx
      TierBadge.tsx             # BMW Roundel (T1) or M stripe (T2) SVG badge
    admin/
      AdminLayout.tsx           # Sidebar nav with pending count badges, auth guard
      ReviewCard.tsx            # Approve/reject card with expandable details

  lib/
    supabase.ts                 # Browser client only
    supabase-server.ts          # Server client only
    forum-config.ts             # Gen colors, subforum cats, engine lineups, regional subforums
    forum-data.ts               # Forum Supabase queries
    member-data.ts              # Profile/garage Supabase queries
    vendor-data.ts
    video-data.ts
    video-config.ts
    technical-data.ts
    technical-config.ts
    event-data.ts
    admin-data.ts               # Admin queries incl. tier management
    seo.ts                      # generatePageMetadata helper
    utils.ts                    # cn(), formatRelativeTime(), extractYouTubeId(), getYouTubeThumbnail()

  middleware.ts                 # Route protection — admin and member-only routes
  types/index.ts                # Generation, GENERATIONS, GENERATION_YEARS, GENERATION_TAGLINE
  styles/globals.css
```

---

## Database Schema (Supabase)

### profiles
- `id` uuid (FK → auth.users)
- `username` text unique
- `avatar_url`, `bio`, `location` text nullable
- `member_number` int auto-increment unique
- `post_count`, `build_count`, `video_count` int default 0
- `role` text default 'member' — CHECK: member | moderator | admin
- `tier` int default 1 — CHECK: 1 | 2
- `created_at` timestamptz

### forum_threads
- `id` uuid
- `title`, `body` text
- `author_id` uuid FK → profiles
- `generation` text nullable — CHECK: E34|E39|E60|F10|G30
- `category` text — engine|drivetrain|suspension|electrical|general|marketplace
- `engine` text nullable — engine code e.g. 'm54b30'
- `regional_subforum` text nullable
- `is_pinned`, `is_solved` bool default false
- `reply_count`, `view_count` int default 0
- `last_reply_at`, `created_at` timestamptz

### forum_posts
- `id` uuid
- `thread_id` uuid FK → forum_threads
- `author_id` uuid FK → profiles
- `body` text
- `image_urls` text[] nullable
- `youtube_url` text nullable
- `is_op` bool default false
- `created_at` timestamptz

### garage_cars
- `id` uuid
- `user_id` uuid FK → profiles
- `year` int, `model` text, `generation` text, `body_style` text
- `color_name`, `color_code`, `mileage`, `vin_last5` text nullable
- `is_primary` bool default false
- `build_id` uuid nullable

### vendors
- `id` uuid
- `name`, `type`, `description`, `location` text
- `website_url`, `instagram`, `contact_email` text nullable
- `generations` text[]
- `years_in_business` int nullable
- `approved`, `rejected` bool default false
- `rejection_reason` text nullable
- `average_rating` numeric default 0
- `review_count` int default 0

### vendor_reviews
- `id` uuid
- `vendor_id` uuid FK → vendors
- `author_id` uuid FK → profiles
- `rating` int CHECK 1-5
- `body` text

### videos
- `id` uuid
- `youtube_id`, `title`, `channel_name` text
- `category` text CHECK: diy|build-progress|reviews|track-performance
- `generation` text CHECK: E34|E39|E60|F10|G30
- `duration` text nullable
- `submitted_by` uuid FK → profiles
- `approved`, `rejected` bool default false
- `rejection_reason` text nullable
- `like_count` int default 0

### tech_documents
- `id` uuid
- `name`, `generation`, `category` text
- `file_url` text — real URL from Supabase storage (tech-documents bucket)
- `file_size_mb` numeric nullable
- `year_range` text nullable
- `verified`, `rejected` bool default false
- `rejection_reason` text nullable
- `submitted_by` uuid FK → profiles

### tech_articles
- `id` uuid
- `title`, `generation`, `section`, `system`, `content_type` text
- `body` text nullable (for guide type)
- `file_url` text nullable (for pdf type)
- `author_id` uuid FK → profiles
- `verified`, `rejected` bool default false
- `rejection_reason` text nullable
- `view_count` int default 0

### events
- `id` uuid
- `name`, `description`, `type`, `location` text
- `event_date` date
- `region` text nullable
- `organizer_id` uuid FK → profiles
- `attendee_count` int default 0

---

## Key Conventions

### TypeScript
- No `any` types — always define interfaces
- No unused imports or variables
- Use `Array.from(new Set(...))` not `[...new Set(...)]`
- Supabase profile joins return `T | T[]` — always handle both with `Array.isArray()`

### Next.js
- `useSearchParams()` always needs a `<Suspense>` boundary
- Server components use `src/lib/supabase-server.ts`
- Client components use `src/lib/supabase.ts`
- Dynamic params are `Promise<{...}>` in Next.js 15 — always `await params`
- Images from external URLs need to be in `next.config.js` remotePatterns

### Styling
- Dark theme: `#0f0f0f` background, white text
- Blue accent: `#0055b3`
- Generation colors defined in `forum-config.ts` GEN_COLORS
- Tailwind only — no CSS modules
- Buttons: `rounded-lg`, consistent padding `px-4 py-2`

### Auth & Roles
- `useAuth()` hook from AuthProvider exposes: `user`, `profile`, `loading`, `isTier2`, `isAdmin`, `isModerator`, `signOut`
- Tier 1 = view only (new signups), Tier 2 = full posting access (admin approved)
- TierBadge component: BMW Roundel SVG for T1, M stripe SVG for T2
- Admin routes protected by middleware + server-side role check in AdminLayout

---

## Supabase Storage Buckets
- `hero-images` — public — homepage M5 photos, background images, OG image
- `tech-documents` — public — uploaded tech docs and PDFs

### Hero image URLs
```
E34 M5: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E34%20M5.png
E39 M5: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E39%20M5.png
E60 M5: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E60%20M5.png
F10 M5: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/F10%20M5.png
G30 M5: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/G30%20M5.png
Background: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HOMEPAGE%20BACKGROUND.png?v=2
OG image: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/og-image.png
```

---

## Forum Structure

### Generation subforums (per gen: E34, E39, E60, F10, G30)
- **Engine** — expandable, reveals per-engine subforums (see GENERATION_ENGINES in forum-config.ts)
- **Drivetrain** — transmission, driveshaft, differential, clutch
- **Wheels, tires, suspension & brakes**
- **Electrical systems**
- **General discussion**
- **Marketplace**

Note: Build showcase subforum was removed — there is a dedicated /builds section.

### Engine subforums (nested under Engine per generation)
Each engine labeled as: `{ENGINE_CODE} — {models it was offered in}`
Full lineups defined in `GENERATION_ENGINES` in `forum-config.ts`.

### Regional subforums
Northeast US, Southeast US, Midwest US, Southwest US, West Coast US, Eastern Canada, Western Canada

### M5 chassis code note
The G30 generation's M5 uses chassis code **F90**, not G30 (BMW reused the prior letter for the M5 variant). The upcoming G60 generation's M5 will use **G90**. This is why the G30 hero background image is stored in Supabase as `F90 LIVE BACKGROUND.png` rather than `G30 LIVE BACKGROUND.png` — keep this in mind when adding or referencing per-generation M5 assets.

---

## Pending Work
- **Per-generation hero backgrounds** — user is creating custom artwork for each generation (E34–G30) to swap in as the hero background when that gen's car is hovered. URLs to be provided once uploaded to Supabase.
- **Build showcase** — waiting on finished build book PDF to develop the template and showcase page format
- **Rim fitment tool** — being developed in a separate Claude Code session at `/technical/fitment`

---

## Deployment Workflow
1. Make code changes in project folder
2. GitHub Desktop — commit with descriptive message → Push origin
3. Vercel auto-deploys from main branch
4. Check Vercel for build errors
5. Common errors: unused vars/imports, `any` types, missing Suspense for useSearchParams

---

## Admin Access
- Admin dashboard at `/admin` — only accessible to role=admin or role=moderator
- Your user ID: `a8c167c6-4f0e-4ba3-8485-9be951da2141`
- To set admin: `UPDATE public.profiles SET role = 'admin' WHERE id = 'a8c167c6-4f0e-4ba3-8485-9be951da2141';`

---

## Google Search Console
- Verified and sitemap submitted at `fiveserieshq.com/sitemap.xml`
- Status: Success
