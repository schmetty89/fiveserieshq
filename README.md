# FiveSeriesHQ

The definitive BMW 5 Series community — forums, builds, video library, technical docs, and trusted vendors across every generation (E34–G30).

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Database & auth:** Supabase (Postgres + Auth + Storage)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Language:** TypeScript

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/yourusername/fiveserieshq.git
cd fiveserieshq
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your project URL and anon key
3. In the Supabase SQL editor, run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── forums/             # Forum pages
│   ├── builds/             # Build showcase (under construction)
│   ├── videos/             # Video library
│   ├── vendors/            # Vendor directory
│   ├── events/             # Events calendar
│   ├── technical/          # Technical info database
│   └── members/            # Member profiles & garage
│
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── ui/                 # GenBadge, Button, etc.
│   ├── hero/               # HeroSection, HomeFeed
│   ├── forums/             # Forum components
│   ├── videos/             # Video library components
│   ├── vendors/            # Vendor directory components
│   ├── technical/          # Technical info components
│   └── members/            # Profile & garage components
│
├── lib/
│   ├── supabase.ts         # Supabase client (browser + server)
│   └── utils.ts            # Shared utilities
│
├── types/
│   └── index.ts            # All TypeScript types
│
└── styles/
    └── globals.css         # Global styles + CSS tokens

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Full database schema
```

---

## Deploying to Vercel

1. Push your repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add your environment variables in Vercel's project settings
4. Deploy — Vercel auto-deploys on every push to `main`

---

## Sections

| Section | Status |
|---|---|
| Homepage & hero | ✅ Complete |
| Forums | 🔨 In progress |
| Build showcase | 🚧 Under construction — awaiting build book template |
| Video library | 🔨 In progress |
| Vendor directory | 🔨 In progress |
| Events calendar | 🔨 In progress |
| Technical info | 🔨 In progress |
| Member profiles & garage | 🔨 In progress |

---

## Build showcase note

The build showcase is intentionally left as a placeholder until the standardized build book template is finalized. Once a real build book is uploaded and the template format is defined, the showcase page layout will be developed to match it exactly.
