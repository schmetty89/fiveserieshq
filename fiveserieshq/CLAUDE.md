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
  app/
    page.tsx                    # Homepage with hero
    layout.tsx                  # Root layout with AuthProvider, full SEO metadata
    sitemap.ts                  # Auto-generated sitemap
    robots.ts                   # robots.txt
    about/page.tsx
    auth/
      join/page.tsx
      login/page.tsx + LoginForm.tsx
      verify/page.tsx
      reset-password/page.tsx
      callback/route.ts
    forums/
      page.tsx                  # Forum index
      subforum/page.tsx         # Thread list (?gen, ?cat, ?region, ?engine, ?transmission)
      thread/[id]/page.tsx
      new/page.tsx
    videos/page.tsx
    vendors/page.tsx
    technical/page.tsx          # Gen/section persisted in URL (?gen=F10&section=documents)
    events/page.tsx
    builds/page.tsx             # Under construction placeholder
    members/
      me/page.tsx
      [username]/page.tsx
    admin/
      page.tsx
      vendors/page.tsx
      videos/page.tsx
      technical/page.tsx
      forums/page.tsx
      members/page.tsx
    terms/page.tsx
    api/og/route.ts

  components/
    layout/
      Navbar.tsx                # M stripe SVG logo, auth state, dropdown
      Footer.tsx                # Streamlined — no Generations section, no Member Garage link
    hero/
      HeroSection.tsx           # Dynamic hero — see Hero section below
    auth/
      AuthProvider.tsx          # user, profile, isTier2, isAdmin, isModerator, signOut
    forums/
      ForumIndex.tsx
      SubforumView.tsx          # Has collapsible forum info callout box at top
      ThreadView.tsx
      NewThreadForm.tsx
    videos/
      VideoLibrary.tsx
      SubmitVideoModal.tsx
    vendors/
      VendorDirectory.tsx
      VendorApplyModal.tsx
      VendorReviewModal.tsx
    technical/
      TechnicalInfo.tsx
      TechSubmitModal.tsx
    events/
      EventsCalendar.tsx
      SubmitEventModal.tsx
    members/
      MyProfile.tsx
      PublicProfile.tsx
      GarageTab.tsx
      CarModal.tsx
      TierBadge.tsx             # BMW Roundel SVG (T1) or M stripe SVG (T2)
    admin/
      AdminLayout.tsx
      ReviewCard.tsx

  lib/
    supabase.ts                 # Browser client only
    supabase-server.ts          # Server client only
    forum-config.ts             # Gen colors, subforum cats, engine lineups, transmission lineups, regional
    forum-data.ts
    member-data.ts
    vendor-data.ts
    video-data.ts
    video-config.ts
    technical-data.ts
    technical-config.ts
    event-data.ts
    admin-data.ts
    seo.ts
    utils.ts                    # cn(), formatRelativeTime(), extractYouTubeId(), getYouTubeThumbnail()

  middleware.ts
  types/index.ts                # Generation, GENERATIONS, GENERATION_YEARS, GENERATION_TAGLINE
  styles/globals.css
```

---

## Hero Section (HeroSection.tsx)

### Current behavior
- Default state: Nürburgring background image, headline + subline text, generation selector strip at bottom
- Clicking a generation: background crossfades to that generation's 3-car image (Forums/Builds/Tech license plates), locks in until user clicks outside the hero section
- Hovering gen labels: glow in generation color
- Plate hotspots: invisible clickable zones over license plates, glow on hover
- FORUMS plate links to /forums?gen={activeGen} (generation-specific forum)
- BUILDS plate links to /builds
- TECH plate links to /technical
- No black banner panel — was removed entirely

### Generation colors (for glow effects)
- E34: #993C1D, E39: #185FA5, E60: #534AB7, F10: #0F6E56, G30: #854F0B

### Background image URLs
```
Default: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/HOMEPAGE%20BACKGROUND.png?v=2
E34: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E34%20LIVE%20BACKGROUND.png
E39: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E39%20LIVE%20BACKGROUND.png
E60: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E60%20LIVE%20BACKGROUND.png
F10: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/F10%20LIVE%20BACKGROUND.png
G30: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/F90%20LIVE%20BACKGROUND.png
OG image: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/og-image.png
Per-gen M5 cars: https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/E34%20M5.png (same pattern for E39-G30)
```

Note: G30 M5 uses chassis code F90 (not G30) — BMW changed the M5 chassis code starting with this generation. G60 M5 uses G90. The hero background is stored as F90_LIVE_BACKGROUND.png for this reason.

### Plate hotspot positions (percentage-based, relative to hero section)
E34 is fully calibrated. E39, E60, F10, G30 still need calibration.
All images are the same composition so positions should be very similar across generations.

### Hero text
- Headline: "Five Generations. One Community." — font-variant-caps: small-caps, positioned above generation selector strip
- Subline: "The BMW 5 Series has had five generations, countless variants, and millions of passionate owners. It&apos;s never had a hub. Until now." — same styling, larger font size

---

## Database Schema (Supabase)

### profiles
- id, username, avatar_url, bio, location
- member_number (auto-increment unique)
- post_count, build_count, video_count (int default 0)
- role: 'member' | 'moderator' | 'admin' (default 'member')
- tier: 1 | 2 (default 1) — Tier 1 = view only, Tier 2 = full posting (admin approved)
- created_at

### forum_threads
- id, title, body, author_id (FK profiles)
- generation: E34|E39|E60|F10|G30 (nullable)
- category: engine|drivetrain|suspension|electrical|general|marketplace
- engine: text nullable — engine code e.g. 'm54b30'
- transmission: text nullable — transmission id e.g. 'zf-5hp24'
- regional_subforum: text nullable
- is_pinned, is_solved (bool)
- reply_count, view_count, last_reply_at, created_at

### forum_posts
- id, thread_id, author_id, body
- image_urls (text[]), youtube_url, is_op
- created_at

### garage_cars
- id, user_id, year, model, generation, body_style
- color_name, color_code, mileage, vin_last5
- is_primary, build_id

### vendors
- id, name, type, description, location
- website_url, instagram, contact_email
- generations (text[]), years_in_business
- approved, rejected, rejection_reason
- average_rating, review_count

### vendor_reviews
- id, vendor_id, author_id, rating (1-5), body

### videos
- id, youtube_id, title, channel_name
- category: diy|build-progress|reviews|track-performance
- generation, duration, submitted_by
- approved, rejected, rejection_reason, like_count

### tech_documents
- id, name, generation, category, file_url (Supabase storage)
- file_size_mb, year_range
- verified, rejected, rejection_reason, submitted_by

### tech_articles
- id, title, generation
- section: 'documents'|'maintenance'|'diagnosis'|'modifications'
- system: text (subsystem id)
- content_type: 'guide'|'pdf'
- body (nullable), file_url (nullable)
- author_id, verified, rejected, rejection_reason, view_count

### events
- id, name, description, type, location
- event_date, region, organizer_id, attendee_count

---

## Forum Structure

### Generation subforums (per gen: E34, E39, E60, F10, G30)
- **Engine** — expandable, reveals per-engine subforums (see GENERATION_ENGINES in forum-config.ts)
- **Drivetrain** — expandable, reveals Manual and Automatic groups, each with transmission subforums (see GENERATION_TRANSMISSIONS in forum-config.ts)
- **Wheels, tires, suspension & brakes**
- **Electrical systems**
- **General discussion**
- **Marketplace**

Note: Build showcase subforum was removed — there is a dedicated /builds section.

### Engine subforums
Each labeled: {ENGINE_CODE} — {models offered}
Full lineups in GENERATION_ENGINES in forum-config.ts.

### Transmission subforums
Nested under Drivetrain with two groups — Manual and Automatic.
Each labeled: {TRANSMISSION_NAME} — {models offered}
Full lineups in GENERATION_TRANSMISSIONS in forum-config.ts.

### Regional subforums
Northeast US, Southeast US, Midwest US, Southwest US, West Coast US, Eastern Canada, Western Canada

### Forum info callout
SubforumView.tsx has a collapsible info callout box shown at the top of gen+category subforum views.
It explains the purpose of forums vs technical library vs build showcase and encourages members to submit technical articles after getting answers.

---

## Technical Section Structure

### Sections
- **Technical Documents** (id: 'documents') — factory manuals, wiring diagrams, OEM references
- **Maintenance** (id: 'maintenance') — service procedures, fluid specs, wear items
- **Fault Diagnosis** (id: 'diagnosis') — NEW — DME, BMW Coding, Fault Codes, Mechanical Faults
- **Modifications & Retrofits** (id: 'modifications') — renamed from 'performance' — installs, upgrades, coding, retrofits

### Fault Diagnosis subsystems
- DME — Digital Motor Electronics, ECU faults, programming
- BMW Coding — BimmerCode, NCS Expert, E-sys, feature unlocks
- Fault Codes — OBD2 and BMW-specific fault codes
- Mechanical Faults — physical symptoms, noises, leaks not tied to a fault code

### Pending technical work
- Apply Fault Diagnosis section to TechnicalInfo.tsx and TechSubmitModal.tsx (technical-config.ts already updated)
- Update admin technical page references from 'performance' to 'modifications'
- Build standardized technical article submission form with structured fields per article type

---

## Member Tiers
- **Tier 1** — view only, assigned on signup, shown with BMW Roundel badge
- **Tier 2** — full posting access, admin approved, shown with M stripe badge
- New signups appear in Admin → Members → Tier 2 approvals tab
- All existing members were grandfathered into Tier 2

---

## Auth & Roles
- useAuth() exposes: user, profile, loading, isTier2, isAdmin, isModerator, signOut
- role: member | moderator | admin
- Admin dashboard at /admin — protected by middleware + AdminLayout role check

---

## Supabase Storage Buckets
- `hero-images` — public — homepage backgrounds, M5 car images, OG image
- `tech-documents` — public — uploaded tech docs and PDFs

---

## Key Conventions
- No `any` types — always define interfaces
- No unused imports or variables
- Use `Array.from(new Set(...))` not `[...new Set(...)]`
- Supabase profile joins return `T | T[]` — always handle both with `Array.isArray()`
- `useSearchParams()` always needs a `<Suspense>` boundary
- Server components use supabase-server.ts, client components use supabase.ts
- Dynamic params are `Promise<{...}>` in Next.js 15 — always `await params`
- Images from external URLs need to be in next.config.js remotePatterns

---

## Deployment Workflow
1. Make changes via Claude Code
2. GitHub Desktop — commit → Push origin
3. Vercel auto-deploys from main branch
4. Claude Code runs npm run build before committing to catch errors early

---

## Admin Access
- Your user ID: `a8c167c6-4f0e-4ba3-8485-9be951da2141`
- To set admin in Supabase SQL: `UPDATE public.profiles SET role = 'admin' WHERE id = 'a8c167c6-4f0e-4ba3-8485-9be951da2141';`

---

## Pending Work
1. **Hero plate hotspots** — E34 calibrated, need to calibrate E39, E60, F10, G30
2. **Fault Diagnosis** — apply to TechnicalInfo.tsx and TechSubmitModal.tsx
3. **Admin technical page** — update 'performance' references to 'modifications'
4. **Standardized technical article form** — structured fields per type (maintenance, fault diagnosis, modifications & retrofits)
5. **Build showcase** — waiting on finished build book to develop template and page format
6. **Rim fitment tool** — being developed separately at /technical/fitment
