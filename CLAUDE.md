# FiveSeriesHQ — Claude Code Context

## Project overview
FiveSeriesHQ (fiveserieshq.com) is a BMW 5 Series enthusiast community site. Stack: Next.js 15.3.6 / TypeScript / Tailwind CSS / Supabase / Vercel. Repo: schmetty89/fiveserieshq (public GitHub).

## Critical workflow rules
- Repo path: `G:/My Drive/Fiveserieshq/fiveserieshq` — the space in "My Drive" breaks local `npm run build` and `npm install`. NEVER run these locally.
- All builds go through Vercel preview + GitHub Actions CI (lint + tsc --noEmit).
- Claude Code edits only — commits and pushes via GitHub Desktop.
- Prompt files named `*-prompt.md` are dropped in repo root and gitignored.
- `main` is branch-protected: feature branch → PR → green CI → merge.
- If you see "module has no exported member" or missing file errors: `git checkout main && git pull && git checkout <branch> && git merge main`.
- Next.js 15: `params` in dynamic routes is a Promise — always use `async function Page({ params }: { params: Promise<{ id: string }> })` and `const { id } = await params`.

## Supabase
- Project: fiveserieshq, id: xgfvrlrbeymronphmpii
- Admin user id: a8c167c6-4f0e-4ba3-8485-9be951da2141
- Free plan — no dev branches, all migrations go to production
- Always verify migrations with read-only queries after applying
- RLS: use `auth.uid() is not null` not `auth.role() = 'authenticated'`
- Public storage buckets: article-images, hero-images, tech-documents, build-media
- build-media path convention: `{buildId}/{filename}` — enforced by RLS, uploads will fail if not followed

## Database tables (all live)
- `profiles` — user profiles, role ('member'/'moderator'/'admin'), tier (int)
- `builds` — build showcase submissions (moderation_status, build_status)
- `build_components` — components per build (section, name, manufacturer, supplier, part_number, cost, quantity, status, installed_date, sort_order)
- `build_photos` — photos per build (url, caption, is_cover, sort_order, media_type) — partial unique index ensures one cover per build
- `articles` — technical guides
- `videos` — video library (platform: 'youtube'|'instagram', youtube_id nullable, instagram_url nullable, approved, rejected)
- `awards` — 70 award definitions across 10 chains (hardcoded config)
- `member_awards` — junction table (user_id, award_id, earned_at, displayed_profile, displayed_posts)
- `threads` — forum threads (generation, region_id, category, is_deleted, reply_count, last_reply_at)
- `thread_posts` — forum replies (is_deleted, soft delete)
- `thread_reactions` — likes on threads or posts

## What's built and live (merged to main)
- Navbar logo + favicon (navbar-logo.png, favicon assets in public/)
- Hero section: crossfading gen backgrounds, license-plate hotspots, gen selector strip
- Mobile hero: portrait backgrounds (HOMEPAGE-BACKGROUND-MOBILE.png, HERO CAR WALLPAPER MOBILE.png), plate wall for all gens on mobile, mobile hotspot coordinates (Forums top:27 h:10, Builds top:47 h:10, Tech top:66 h:10), model pills hidden on mobile, hero copy hidden on mobile
- Build Showcase Stage 1: draft create/edit form at /builds/submit (BuildSubmitForm.tsx with 3 tabs)
- Build Showcase Stage 2: Components tab (BuildComponents.tsx) — flat list, section badges, color-coded status, running total
- Build Showcase Stage 3: Photos tab (BuildPhotos.tsx) — multi-upload, drag-to-reorder, cover photo, captions, 50MB limit, 20 photo max
- Build Showcase Stage 4: Public listing at /builds (BuildsListing.tsx) — grid/list toggle, gen + status filters, sort; individual build at /builds/[id] (BuildDetail.tsx) — tabs, progress bar, moderation banner, submit for review button; admin moderation at /admin/builds
- Forum DB schema: threads, thread_posts, thread_reactions — RLS, soft deletes, reply_count trigger
- Forum live thread counts: ForumIndex.tsx queries real counts, shows 0 honestly
- Video library: YouTube + Instagram Reels support, platform toggle, SubmitVideoModal with platform toggle
- Technical guides: structured submit form at /technical/submit, fields config in src/lib/article-fields.ts
- Rim fitment tool: /technical/fitment, listed under Apps section in TechnicalInfo.tsx, driven from APPS_SYSTEMS in technical-config.ts
- Awards system DB: awards table (70 rows, 10 chains × 7 tiers including gold/platinum prestige) + member_awards table with display limits (20 profile, 5 posts), enforce_display_limits trigger
- Admin panel: /admin with overview cards (Pending vendors, videos, tech, forums, builds), sidebar nav

## Awards system — 10 chains, 70 awards
Chains: posts, tech_forum, tech_docs, video_diy, video_build, video_reviews, video_track, garage, events, tech_guides
Each chain: 5 tiers + gold (5× tier 5 trigger) + platinum (10× tier 5 trigger)
Prestige awards have distinct names and messages — NOT just image overlays
Front end NOT yet built — waiting on badge artwork from OpenArt

## Build showcase moderation flow
draft → pending_initial → in_progress_shared → proofreading → pending_final → verified + rejected
Visibility: public sees verified only; members also see in_progress_shared; owner sees own; admin sees all
Verified builds are locked — no owner edits

## Key file locations
- Hero: src/components/hero/HeroSection.tsx
- Forum index: src/components/forums/ForumIndex.tsx
- Forum config: src/lib/forum-config.ts
- Technical config: src/lib/technical-config.ts
- Technical fields: src/lib/article-fields.ts
- Engine config: src/lib/technical-config.ts (ENGINES_BY_GENERATION, ALL_ENGINES — US-market only)
- Video library: src/components/videos/VideoLibrary.tsx, SubmitVideoModal.tsx
- Build components: src/components/showcase/ (BuildSubmitForm, BuildComponents, BuildPhotos, BuildsListing, BuildDetail)
- Admin: src/app/admin/ (page, builds, forums, members, technical, vendors, videos)
- Admin layout: src/components/admin/AdminLayout.tsx
- Admin components: src/components/admin/ (AdminArticleQueue, AdminLayout, ReviewCard)

## Pending work
- Awards front end (profile display grid, hover behavior, post/comment badges, selection UI) — blocked on badge artwork
- Moderator badges system (similar to awards but requires admin approval)
- Article/guide prompt templates for common tasks
- HomeFeed component exists (src/components/hero/HomeFeed.tsx) but is NOT mounted — all data is static placeholder, needs live Supabase queries before mounting

## Key learnings
- No public BMW parts/pricing API exists — RealOEM is scrape-only
- Gen-specific live backgrounds incompatible with mobile portrait — use plate wall image instead
- build-media storage bucket path MUST be {buildId}/... or RLS rejects uploads
- US-market engine config only in ENGINES_BY_GENERATION (no Euro-only variants)
- TypeScript target doesn't support Array.entries() iterator — use index-based for loop instead
- Supabase returns profiles as array in joins — cast via `as unknown as Type[]` to avoid TS errors
