# CLAUDE.md — FiveSeriesHQ Project Handover

## What this is
FiveSeriesHQ (fiveserieshq.com) — a BMW 5 Series community site. Next.js 15.3.6 / TypeScript /
Tailwind / Supabase / Vercel. GitHub repo `schmetty89/fiveserieshq`.

## Working environment & workflow (IMPORTANT)
- Repo lives on Windows at `G:/My Drive/Fiveserieshq/fiveserieshq` (Git Bash path
  `/g/My Drive/Fiveserieshq/fiveserieshq`).
- The space in "My Drive" BREAKS local `npm run build` and `npm install` (tar write errors via
  Google Drive sync). **Do NOT run `npm run build` locally.** The build gate is the Vercel
  preview + GitHub Actions CI, NOT local builds.
- If you ever need to regenerate `package-lock.json`, do it OUTSIDE the Drive folder:
  `cp package.json /tmp/x/ && cd /tmp/x && npm install --package-lock-only`, then copy the lock
  file back. (This is how the committed lockfile was created.)
- **Edit/commit workflow:** Assistant writes a `.md` prompt file → user drops it in repo root →
  tells Claude Code "Read X.md in the repo root and carry it out" → Claude Code edits files only
  (NO commit/push — that session has no git push auth) → user commits/pushes via GitHub Desktop
  with an assistant-provided commit summary → tests on Vercel preview → merges via PR.
- **Prompt files are gitignored** via the pattern `*-prompt.md` in `.gitignore`, so they never get
  committed. Name every Claude Code prompt file `something-prompt.md`.
- **Branch protection is ON** for `main` (GitHub ruleset, enforced because the repo is PUBLIC):
  requires a PR + the `check` CI status to pass before merge. So: feature branch → PR → green CI →
  merge. Required approvals = 0 (solo dev). Future: badge-based moderator system may change this.
- **CI:** `.github/workflows/ci.yml` runs `npm ci` + `npm run lint` + `npm run typecheck` on
  ubuntu on every PR to main and every push to non-main branches. `typecheck` script =
  `tsc --noEmit`. Lint = `next lint`. This is the real error gate (catches what the broken local
  build can't).
- Vercel quirk: sometimes a push doesn't trigger a deploy. Fixes: in GitHub Desktop ensure you
  actually **published/pushed** the branch (commit ≠ push); or empty-commit kick:
  `git commit --allow-empty -m "trigger" && git push`.
- Common branch gotcha: new feature branches cut from an older `main` will be MISSING recently
  merged work. Symptom: "module has no exported member X" or "file doesn't exist". Fix:
  `git checkout main && git pull && git checkout <branch> && git merge main`. (Hit this twice this
  session — for TechSubmitForm and ENGINES_BY_GENERATION.)

## Admin / accounts
- Admin user id: `a8c167c6-4f0e-4ba3-8485-9be951da2141`.
- Supabase project: `fiveserieshq`, project_id `xgfvrlrbeymronphmpii`, region us-west-2, Postgres 17.
- Supabase plan: FREE (so no dev branches — branching needs paid; migrations applied
  production-direct after careful review).
- `profiles` table columns: id (uuid), username, avatar_url, bio, location, member_number,
  post_count, build_count (int — intended for showcase, increment on verify later), video_count,
  created_at, role (text: 'member'|'moderator'|'admin'), tier (int, 1/2).

## Supabase storage buckets (all public)
`article-images`, `hero-images`, `tech-documents`, `build-media` (new — for showcase).

---

## FEATURE: Technical guides (DONE, live)
- Sections in `tech_articles.section`: EXACTLY `maintenance` | `performance` | `diagnosis`.
  "Technical documents" is a separate `tech_documents` table. "Apps" is static.
- Submit form: `src/components/technical/TechSubmitForm.tsx` (extracted from the old
  `TechSubmitModal.tsx`, which still exists on disk but is UNUSED). Lives at its own page
  `src/app/technical/submit/page.tsx` (route `/technical/submit?gen=&section=`).
  `TechnicalInfo.tsx` "Submit" buttons link to it.
- Structured guide fields: `src/lib/article-fields.ts` — `GUIDE_FIELDS` per section,
  `composeGuideBody()` composes fields into the plain-text `body`. Field types: text / textarea /
  select / wrench (1–5 🔧 difficulty) / checklist (grouped tool checklist).
- Tool checklist supports multi-drive sockets w/ per-drive variants. Socket categories:
  Metric, E-Torx, Torx, Allen Sockets. Drive picker shows when 2+ ratchets selected; Torque Wrench
  has its own drive picker. Variant profiles: Metric/E-Torx = standard/deep/impact/deep impact;
  Torx/Allen = standard/deep. `validateChecklist()` blocks a drive with no variant.
- Maintenance & performance field order matched: Difficulty, Tools, Coding, Parts, (Cost),
  Procedure, (Notes/Tips). Coding field exists on both.
- Engine config: `ENGINES_BY_GENERATION` + `ALL_ENGINES` + `EngineEntry` type + `variantsFor()`
  live in `src/lib/technical-config.ts`. US-market gas engines + M-cars, verified by user.
  Engine field on guide form is OPTIONAL, top of form, reads `ENGINES_BY_GENERATION[gen]`,
  composes an "Engine: <fullcode>" line into body.

### Verified engine mapping (US-market gas + M, by generation → model → engine)
- E39: 525i M54B25(01-03); 528i M52B28(95-98)+M52TUB28(98-01); 530i M54B30(01-03);
  540i M62B44(97-98)+M62TUB44(99-03); M5 S62B50(00-03). (NO 535i — Euro only.)
- E60: 525i M54B25(04)+N52B30(05-07); 528i N52B30(08-10); 530i M54B30(04-05)+N52B30(06-07);
  535i N54B30(08-10); 545i N62B44(04-05); 550i N62B48(06-10); M5 S85B50(06-10).
  (NO N53 — Euro only; US stayed N52.)
- F10: 528i N52B30(11)+N20B20(12-16); 535i N55B30; 550i N63B44; M5 S63B44(13-16).
- G30: 530i B48B20; 540i B58B30; 550i N63B44(17-19); M5 S63B44 (F90).

## FEATURE: Parts pricing (DESIGNED, not built — parked)
- Decision history: no clean public BMW parts/pricing API exists. RealOEM is scrape-only +
  unreliable prices. Retailer auto-search = scraping (ToS + bot-blocking) = NO-GO.
- AGREED v1 design (not yet built): author types generic part name → form shows buttons that OPEN
  FCP Euro + Turner search in a new tab (pre-filled w/ part name + engine context) → author finds
  the part, pastes back part number / product URL → article shows part number + multi-retailer
  links (generated from the part number via each retailer's search URL — the forum-proven trick).
  Reader picks where to buy. DB-free for v1; optionally persist picks to a parts table later.
- LONG-TERM: retailers DO have internal APIs but they're partner/affiliate-gated, not public. The
  real path is pursuing FCP/Turner affiliate API access once the site has traffic (also monetizes
  via commission). "Doesn't exist" vs "behind a partnership paywall" — it's the latter.
- The engine field (already built on the guide form) is the context-provider for these searches.

---

## FEATURE: Build Showcase (IN PROGRESS — Stage 1 DONE & merged to main/live)

### Spec
From user's ChatGPT-authored spec PDF: members document BMW 5 Series builds. Vehicle info, build
overview, components across ~8 sections (exterior, interior, electronics, powertrain, drivetrain,
suspension, wheels_tires, brakes), photo galleries, documentation uploads, cost rollups, progress
%, search filters. Mobile-first. Living build journal.

### DATABASE (LIVE on production — applied via Supabase tools, NOT dev-branched since free plan)
Three tables, all RLS-enabled. Migration files committed in `supabase/migrations/`:
`20260619_create_build_showcase_tables.sql`, `..._fix_showcase_member_visibility_policies.sql`,
`..._build_media_storage_policies.sql`. (These mirror what's already applied — committing them is
repo-sync only, they don't re-run.)

- **`builds`**: id, user_id→profiles(id), year, generation, model, engine, transmission,
  exterior_color, interior_color, mileage, vin (PRIVATE), production_date, factory_options,
  build_name (NOT NULL), build_description, build_goals, inspiration, moderation_status, build_status,
  admin_notes, verified_at, created_at, updated_at.
- **`build_components`**: id, build_id→builds(cascade), section (8-value check), category, name
  (NOT NULL), manufacturer, supplier, part_number, cost numeric(10,2), quantity, status
  (planned/ordered/installed/removed), installed_date, description, sort_order, created_at.
  ONE flexible table for ALL sections (section + category columns), NOT a table per section.
- **`build_photos`**: id, build_id→builds(cascade), component_id→build_components(set null), url,
  media_type (photo/document), gallery_category (6-value check), caption, sort_order, created_at.

### TWO status axes (kept SEPARATE on purpose)
- `moderation_status`: draft → pending_initial → (admin approves → author picks `in_progress_shared`
  OR `proofreading`) → pending_final → verified → also `rejected` (with admin_notes). TWO admin
  gates (entry + final) — intentional, ties into the FUTURE badge-based moderator system.
- `build_status` (real-world car state): planning / in_progress / complete / sold / retired.
  Independent of moderation (e.g. a verified-locked build can still flip to "sold").

### Visibility / RLS (behavior-tested, working)
- Public (logged-out): sees only `verified` builds.
- Logged-in members: see `verified` + `in_progress_shared` (NOT drafts/proofreading of others).
- Owner: sees all their own. Admin/moderator (`profiles.role in ('admin','moderator')`): sees all.
- INSERT: owner only, must be `moderation_status='draft'`.
- UPDATE: owner only AND not `verified` (the LOCK); admins always. So verified = frozen/locked.
- DELETE: owner only for draft/rejected; admins always.
- Components & photos inherit visibility via parent build; write requires owning a non-verified build.
- NOTE: SELECT policies use `auth.uid() is not null` for the member tier (NOT `auth.role()` —
  that was the original bug, fixed in the visibility-fix migration; auth.role() is null in some
  contexts and broke member visibility).

### Storage (build-media bucket, public)
- Public bucket (chosen: build photos aren't sensitive; URLs are unguessable; discoverability via
  the builds RLS is the real gate). Reads open; writes (insert/update/delete on storage.objects)
  restricted to the build's OWNER, scoped by path, and blocked once build is verified.
- **CRITICAL upload path convention:** files MUST be uploaded as `{build_id}/...` (build id as the
  FIRST folder). The storage policies check `(storage.foldername(name))[1]` = a build the user owns.
  Stage 3 upload code MUST follow this or uploads get denied.

### Frontend — Stage 1 (DONE, merged, live)
- `src/components/showcase/BuildSubmitForm.tsx` + page at `src/app/builds/submit/page.tsx`
  (route `/builds/submit` — moved from `/showcase/submit` to match the existing `/builds` nav).
- Save-as-you-go: no id → empty form, on save INSERT draft + redirect to `/builds/submit?id={id}`;
  with id → load + UPDATE. URL carries the draft id (survives refresh, no dupes).
- Covers Vehicle Information + Build Overview only. Required to save: build_name, year, generation,
  model. Engine field = `ENGINES_BY_GENERATION[gen]` dropdown + custom-text override (for swaps).
  Verified builds load read-only.
- VERIFIED WORKING: test draft "joker build" (F10 535i / N55B30) inserted correctly via live RLS,
  owner + moderation_status='draft' + build_status='planning' all correct.
- NOTE: there's an existing "Under construction" placeholder at `/builds` (the showcase landing).
  Stage 4 display will replace it.

### Build Showcase — REMAINING STAGES (build in order, each its own branch/PR)
- **Stage 2 — Components:** repeatable component blocks writing `build_components`, attached to a
  draft by its id. Start with a few core sections (e.g. powertrain, suspension, wheels_tires).
  Shared component schema (name, manufacturer, supplier, part_number, cost, quantity, status, etc.).
- **Stage 3 — Media:** photo/doc upload to `build-media` using the `{build_id}/...` path, writing
  `build_photos`. Public bucket so plain public URLs are fine for display.
- **Stage 4 — Moderation flow + display:** submit-for-review transitions, admin review queue,
  public/member showcase grid + per-build pages (replaces the `/builds` placeholder), search
  filters, cost rollups (computed from build_components), progress % (status→percent avg).

## NEXT-UP / PARKED IDEAS (user's own list, roughly prioritized)
1. Build Showcase Stage 2 (components) — the immediate next build.
2. Badge-based member system granting moderation/review authority (instead of many member tiers).
   Relevant to the two-gate showcase moderation + relaxing the verified-edit lock later.
3. Parts pricing v1 (author-opens-search design above).
4. Rename "Performance" section → "Mods & Retrofits" (engine options there should allow the full
   cross-generation list via ALL_ENGINES, for swap guides).
5. Estimated-cost autofill on guides (pull from parts/part# data) — depends on parts pricing.
6. Playwright E2E test suite (E2E_TESTS_PROMPT.md exists as a reference draft).
7. Estimated cost field currently free-text on performance guides.

## Assistant working notes / tone
- User works in Claude Code (Git Bash) + commits via GitHub Desktop. Provide a commit summary every
  time. Generate edits as `*-prompt.md` drop-in files (gitignored), not terminal pastes.
- User has deep BMW domain knowledge — defer to them on car facts, but DO flag likely errors
  (caught the Euro-only E39 535i and E60 N53 this way).
- Use ask-the-user multiple-choice for design forks; design DB changes on paper first, show exact
  SQL, get explicit approval before applying. Free plan = production-direct (new isolated tables are
  low risk); always verify with read-only queries after.
- Build big features in staged, individually-mergeable increments.
