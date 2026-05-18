# Careera 🧑🏻‍💻

**A GenAI-intelligent career guidance platform** — surfacing real-time opportunities (GSoC, LFX, ICPC, open source, hackathons, internships) that most students never hear about.

## What’s built (MVP)

- **Curated program catalog** — 20+ high-value programs (GSoC, Outreachy, LFX, ICPC, etc.)
- **Live ingestion** — Remote OK API, Devpost RSS, Hacker News hiring RSS
- **Discover UI** — filter by type, search, featured programs
- **Matching API** — rank feed by skills/interests (`/api/opportunities/feed`)
- **Full ER schema** — User, Profile, Assessment, CareerPath, Notifications, etc. (ready for Phase 2)

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 16 + React 19 + Tailwind 4 | Full-stack, fast UI, SSR |
| Database | SQLite (dev) → PostgreSQL (prod) | Matches your ER model; easy Prisma migration |
| ORM | Prisma 7 | Type-safe, matches FYP entities |
| Ingestion | RSS Parser + fetch APIs | Real-time without heavy infra |
| Phase 2 AI | OpenAI / local LLM | Explain *why* an opportunity fits |

## Brand assets

| File | Use |
|------|-----|
| `public/brand/logo-icon.svg` | App icon, favicon, slides |
| `public/brand/logo-full.svg` | Posters, documentation cover |
| `src/components/Logo.tsx` | Header & UI (icon + **Care**<span style="color:#4F46E5">era</span> wordmark) |

To change the logo later, edit the SVG files or swap images in `public/brand/` and refresh the browser.

---

## Setup & testing (step-by-step)

### Prerequisites

- **Node.js 20+** — check with `node -v`
- **npm** — check with `npm -v`
- Internet — needed for live sync (Remote OK, RSS)

### 1. First-time setup

Open PowerShell or Terminal:

```powershell
cd c:\Users\chsal\OneDrive\Desktop\fyp2\careera
npm install
```

Copy environment file (if `.env` is missing):

```powershell
copy .env.example .env
```

Initialize the database:

```powershell
npm run db:push
npm run db:generate
npm run db:seed
```

You should see something like `Total opportunities in DB: 70+`.

### 2. Run the app

```powershell
npm run dev
```

Open **http://localhost:3000** in Chrome or Edge.

**What to check:**

| Page | What you should see |
|------|---------------------|
| Home `/` | Careera logo, hero text, featured program cards |
| Discover `/discover` | Grid of opportunities, filters, **Refresh live data** button |
| Browser tab | Careera icon (indigo compass logo) |

### 3. Test live data sync

1. Go to **Discover**.
2. Click **Refresh live data** (wait ~30–60 seconds).
3. Confirm the count at the top increases or “last sync” time updates.

Or test the API directly:

```powershell
curl http://localhost:3000/api/opportunities/sync -Method POST
```

### 4. Test search & filters

- Open `http://localhost:3000/discover?type=OPEN_SOURCE`
- Search for `gsoc` or `icpc`
- Open `http://localhost:3000/discover?featured=true`

### 5. Test personalized feed API

```powershell
curl "http://localhost:3000/api/opportunities/feed?skills=python,git&interests=open-source&limit=5"
```

Each item should include a `matchScore`.

### 6. Production build test (before demo / deploy)

```powershell
npm run build
npm run start
```

Open http://localhost:3000 again. If build passes, you are ready to deploy.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module '@/generated/prisma/client'` | Run `npm run db:generate` |
| Empty Discover page | Run `npm run db:seed` |
| Sync fails / 403 on some sources | Normal for blocked RSS; curated programs still work |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Logo not updating | Hard refresh: `Ctrl+Shift+R` |
| `NODE_MODULE_VERSION` / `better_sqlite3.node` error | Run `npm install` again in `careera` folder (project uses LibSQL, not native SQLite). Use one Node version: `node -v` should match when you run `npm install` |
| `localhost refused to connect` | Dev server stopped — run `npm run dev` again and keep that terminal open |

---

## Quick start

```bash
cd careera
npm install
npm run db:push
npm run db:generate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Discover** → **Refresh live data**.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/opportunities` | GET | List with `?type=&q=&remote=&featured=` |
| `/api/opportunities/sync` | POST | Pull curated + live sources |
| `/api/opportunities/feed` | GET | Personalized rank `?skills=git,python&interests=open-source` |

## Roadmap (recommended FYP phases)

### Phase 1 — Real-time engine (current)
- [x] Opportunity model + sources
- [x] Curated CS programs
- [x] RSS/API sync
- [ ] Cron job (Vercel Cron / GitHub Actions every 6h)
- [ ] Deadline scrapers for GSoC/LFX (Playwright)

### Phase 2 — User accounts & profiles
- NextAuth / Clerk authentication
- Profile wizard (skills, university, interests)
- Personalized home feed using `scoreOpportunity`

### Phase 3 — GenAI layer
- Chatbot: “I’m a 2nd year CS student in Pakistan — what should I apply to?”
- RAG over opportunity DB + resource library
- Human counsellor escalation queue

### Phase 4 — Learning & roadmaps
- CareerPath + LearningRoadmap entities
- Skill gap analysis after assessments
- Resource library with quality scores

### Phase 5 — Notifications
- Email (Resend) + in-app
- Deadline reminders for saved opportunities

## Adding new data sources

Edit `src/lib/opportunities/sources.ts` and implement a fetcher in `ingest.ts`:

```ts
// Example: GitHub Events API, university boards, Discord webhooks
{ slug: "my-source", name: "...", type: "rss", feedUrl: "https://..." }
```

## Production

1. Set `DATABASE_URL` to PostgreSQL on Railway/Supabase/AWS RDS.
2. Run `prisma migrate deploy`.
3. Deploy to Vercel; add cron hitting `/api/opportunities/sync` with `SYNC_SECRET` header.
4. Add Redis (Upstash) for rate limiting and job queues when scale grows.

## Project structure

```
careera/
├── prisma/schema.prisma    # Full ER model
├── prisma/seed.ts          # Initial data load
├── src/lib/opportunities/  # Ingestion, curated programs, matching
├── src/app/api/            # REST endpoints
├── src/app/discover/       # Opportunity browser
└── src/components/         # UI
```

Built for **FYP — Careera: A GenAI-Intelligent Career Guidance Platform**.
