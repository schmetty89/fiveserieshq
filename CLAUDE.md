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
- `member_awards` — junction table (user_id, award_id, earned_at, displayed_profile bool, displayed_posts bool)
- `threads` — forum threads (generation, region_id, community_category, is_deleted, reply_count, last_reply_at) — threads_single_context constraint ensures exactly one of generation/region_id/community_category is set
- `thread_posts` — forum replies (is_deleted, soft delete)
- `thread_reactions` — likes on threads or posts
- `moderator_eligible` — members auto-flagged when they earn a tier 5 award (status: pending/approved/dismissed)
- `moderator_badges` — granted moderator status per chain (trigger: tier_5_earned/admin_nomination, is_active bool)
- `moderation_reports` — moderator reports on threads/posts — 3 reports from same-chain moderators triggers auto soft delete via council_deletion_check trigger

## What's built and live (merged to main)
- Navbar logo + favicon (navbar-logo.png, favicon assets in public/)
- Hero section: crossfading gen backgrounds, license-plate hotspots, gen selector strip
- Mobile hero: portrait backgrounds (HOMEPAGE-BACKGROUND-MOBILE.png, HERO CAR WALLPAPER MOBILE.png in hero-images bucket), plate wall image used for all gens on mobile, mobile hotspot coordinates (Forums top:27 h:10, Builds top:47 h:10, Tech top:66 h:10), model pills hidden on mobile (`hidden sm:flex`), hero copy hidden on mobile (`hidden sm:block`), gen overlay text uses `top-4 sm:top-14`
- Build Showcase Stage 1: draft create/edit form at /builds/submit (BuildSubmitForm.tsx with 3 tabs)
- Build Showcase Stage 2: Components tab (BuildComponents.tsx) — flat list, section badges, color-coded status, running total
- Build Showcase Stage 3: Photos tab (BuildPhotos.tsx) — multi-upload, drag-to-reorder, cover photo, captions, 50MB limit, 20 photo max
- Build Showcase Stage 4: Public listing at /builds (BuildsListing.tsx) — grid/list toggle, gen + status filters, sort; individual build at /builds/[id] (BuildDetail.tsx) — tabs, progress bar, moderation banner, submit for review button; admin moderation at /admin/builds
- Forum DB schema: threads, thread_posts, thread_reactions — RLS, soft deletes, reply_count trigger
- Forum live thread counts: ForumIndex.tsx queries real counts per generation, regional, and community
- Community forums: 6 subforums (introductions, general_bmw, lounge, site_feedback, marketplace, events_meetups) — community_category column on threads, Community section in ForumIndex above generation forums, community filter pill
- Video library: YouTube + Instagram Reels support, platform toggle in library and submit modal
- Technical guides: structured submit form at /technical/submit, fields config in src/lib/article-fields.ts
- Guide templates: 10 maintenance templates in src/lib/guide-templates.ts, "Start from template" button on submit page, two-step TemplatePickerModal (template then generation), pre-fills title/section/system/generation/procedure in TechSubmitForm
- Rim fitment tool: /technical/fitment, listed under Apps in TechnicalInfo.tsx, driven from APPS_SYSTEMS in technical-config.ts
- Awards system DB: awards table (70 rows, 10 chains x 7 tiers including gold/platinum prestige) + member_awards table with display limits (20 profile, 5 posts), enforce_display_limits trigger
- Moderator system DB: moderator_eligible (auto-flagged on tier 5 earn via trigger), moderator_badges (granted per chain by admin), moderation_reports (3 same-chain reports = council auto soft delete)
- Admin panel: /admin with overview cards (Pending vendors, videos, tech, forums, builds), sidebar nav including Builds

## Awards system — 10 chains, 70 awards
Chains: posts, tech_forum, tech_docs, video_diy, video_build, video_reviews, video_track, garage, events, tech_guides
Each chain: 5 tiers + gold (5x tier 5 trigger) + platinum (10x tier 5 trigger)
Prestige awards have distinct standalone names and messages — NOT just image overlays
Front end NOT yet built — waiting on badge artwork from OpenArt

## Moderator badge system
- Earning tier 5 of any chain auto-flags member in moderator_eligible (status: pending)
- Admin can approve/dismiss from admin panel (UI not yet built)
- Admin can also nominate members directly regardless of tier
- Granted via moderator_badges table (one badge per chain per member)
- Scope of authority matches the chain (tech_forum = technical forums, posts = community/regional forums, etc.)
- Moderators can: pin/lock threads, report content for deletion, approve content within their chain scope
- 3 reports from same-chain active moderators = council auto soft delete (reversible by admin)
- One-time "welcome to the council" notification on grant (not yet built)
- Front end NOT yet built

## Build showcase moderation flow
draft > pending_initial > in_progress_shared > proofreading > pending_final > verified + rejected
Visibility: public sees verified only; members also see in_progress_shared; owner sees own; admin sees all
Verified builds are locked — no owner edits

## Key file locations
- Hero: src/components/hero/HeroSection.tsx
- Forum index: src/components/forums/ForumIndex.tsx
- Forum config: src/lib/forum-config.ts (includes COMMUNITY_SUBFORUMS)
- Technical config: src/lib/technical-config.ts (ENGINES_BY_GENERATION US-market only, APPS_SYSTEMS)
- Technical fields: src/lib/article-fields.ts (GUIDE_FIELDS — procedure key for maintenance steps)
- Guide templates: src/lib/guide-templates.ts (GUIDE_TEMPLATES, 10 maintenance templates)
- Template modal: src/components/technical/TemplatePickerModal.tsx
- Video library: src/components/videos/VideoLibrary.tsx, SubmitVideoModal.tsx
- Build components: src/components/showcase/ (BuildSubmitForm, BuildComponents, BuildPhotos, BuildsListing, BuildDetail)
- Admin: src/app/admin/ (page, builds, forums, members, technical, vendors, videos)
- Admin layout: src/components/admin/AdminLayout.tsx
- Admin components: src/components/admin/ (AdminArticleQueue, AdminLayout, ReviewCard)

## Pending work
- Awards front end (profile display grid, hover behavior, post/comment badges, selection UI) — blocked on badge artwork from OpenArt
- Moderator badges front end (admin eligible queue, grant/revoke UI, member-facing badge display, report button on threads/posts)
- HomeFeed.tsx was deleted — do not recreate

## Key learnings
- No public BMW parts/pricing API exists — RealOEM is scrape-only
- Gen-specific live backgrounds incompatible with mobile portrait — use plate wall image instead
- build-media storage bucket path MUST be {buildId}/... or RLS rejects uploads
- US-market engine config only in ENGINES_BY_GENERATION (no Euro-only variants)
- TypeScript target does not support Array.entries() iterator — use index-based for loop instead
- Supabase returns profiles as array in joins — cast via `as unknown as Type[]` to avoid TS errors
- Guide template steps pre-fill into guide.procedure not guide.steps — maintenance section uses procedure key
- Next.js 15 params is a Promise in dynamic routes — always await it
- Apostrophes in JSX must be escaped as &apos; to pass ESLint
