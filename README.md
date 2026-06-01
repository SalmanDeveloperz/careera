# Careera

**A comprehensive career development platform for Computer Science students and professionals.**

Careera consolidates the tools students need: real-time opportunity tracking across major initiatives (GSoC, LFX, Outreachy), interactive skill roadmaps across domains, a functional code playground with execution capabilities, curated learning resources, and a career advisory system — all integrated into a single, cohesive application.

📦 **Repository:** https://github.com/SalmanDeveloperz/careera

---

## Features

| Feature | Description |
| --- | --- |
| **Opportunities** | Real-time open-source and professional opportunities (GSoC, LFX, Outreachy, internships, jobs) with live status tracking (Open / Closed / Rolling) and source citations. Status information is scraped from official sources for accuracy and verification. |
| **Auto-refresh mechanism** | A scheduled background service refreshes opportunity statuses and maintains a detailed log of all changes. |
| **Interactive roadmaps** | Structured, expandable learning paths across multiple domains: Data Science, DevOps, Data Architecture, Frontend, Backend, and others. Roadmaps are designed to guide progression from fundamentals to advanced concepts. |
| **Personalized learning paths** | Generates tailored roadmaps based on current skill assessment and target role, with resource recommendations adapted accordingly. |
| **Learning resources** | Curated collection of free, high-quality resources (tutorials, documentation, courses) mapped to specific roadmap nodes. |
| **Code execution environment** | Monaco Editor-based sandbox supporting multiple programming languages with compilation, execution, test case validation, and performance metrics (runtime, memory usage). |
| **Career guidance system** | Conversational interface for career-related questions with persistent session history for continuity across sessions. |

---

## Technology Stack

- **Framework:** TanStack Start (React 19 with server-side rendering, file-based routing)
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 with shadcn/ui component library
- **Animation:** Motion (Framer Motion)
- **Database & Auth:** Supabase (PostgreSQL, authentication, object storage)
- **Backend services:** Node.js server functions for business logic
- **Web scraping:** Firecrawl API (opportunity aggregation and status verification)
- **Code execution:** Paiza.io sandbox API
- **Code editor:** Monaco Editor
- **Data visualization:** Recharts for charts, custom implementation for graph roadmaps
- **Language:** TypeScript with strict mode enabled

---

## Prerequisites

- **Node.js** `>= 20` with npm (tested and verified working)
- **Git**
- A code editor (VS Code recommended)

> **Note:** Bun is the original package manager for this project, but npm works reliably as demonstrated in local testing.

---

## Quick Start (Local Setup)

### 1. Clone the repository

```bash
git clone https://github.com/SalmanDeveloperz/careera.git
cd careera
```

### 2. Install dependencies

Install all required npm packages:

```bash
npm install --no-audit --no-fund
```

The installation may take several minutes on first run. All 623 dependencies will be installed, including development tools, UI components, and build utilities.

### 3. Configure environment variables

Create a `.env` file in the project root (copy from `.env.example` if available, or create manually).

Add your Supabase credentials as shown in the [Environment Variables](#environment-variables) section below. Without Supabase configuration, the app will display connection warnings but the UI will still load and be fully interactive.

### 4. Start the development server

Launch the development server with hot reload:

```bash
npm run dev
```

The Vite development server will initialize and be ready in approximately 5 seconds. Access the application at:

- **Local:** http://localhost:8080/
- **Network:** http://192.168.x.x:8080/ (for access from other devices on your network)

Press `h + Enter` in the terminal for additional Vite help and options.

---

## Environment Variables

Create a `.env` file in the project root with the following configuration.

### Client & database (optional but recommended)

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"

# Server-side (same values)
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
```

### Server-only credentials (optional for enhanced features)

```env
# Service role key for backend operations — keep private, never expose to client
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Web scraping and data aggregation
FIRECRAWL_API_KEY="your-firecrawl-key"

# AI-powered features (Career Advisor)
# Free tier: 15 requests/minute, 1M tokens/day
# Perfect for development and testing
# Get your free API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY="your-free-google-api-key"
```

### Setting up AI Features (Career Advisor)

The career advisor and AI-powered features require a **free Google Generative AI API key**:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"** and create a new key
3. Copy the API key
4. Add it to your `.env` file as `GOOGLE_API_KEY="your-key-here"`
5. Restart the dev server: `npm run dev`

**Free tier limits:**
- 15 requests per minute
- 1 million tokens per day
- Perfect for development, testing, and moderate usage
- No credit card required (though Google may request one for verification)

**Switching to a different AI provider:**

The AI module (`src/lib/ai.server.ts`) is designed to be provider-agnostic. To switch to OpenAI, Anthropic, or another provider:

1. Install the provider's SDK
2. Update `src/lib/ai.server.ts` with the new provider's API calls
3. Update the `.env` file with the new API key

### Notes

- The application **runs fully without any environment variables configured**. The UI and interactive features (roadmaps, code playground, opportunities list, resources) work perfectly out of the box.
- **AI features specifically** require the `GOOGLE_API_KEY`. Without it, you'll see an error when trying to use the Career Advisor feature, but other features remain fully functional.
- Environment variables prefixed with `VITE_` are embedded in the client-side bundle at build time; only include public values.
- Server-only variables are read from `process.env` in backend functions and must not be prefixed with `VITE_`.
- Without Supabase configured, database features will log warnings but will not prevent the app from running.
- Obtain a free Firecrawl API key at [firecrawl.dev](https://firecrawl.dev).

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with hot reload on http://localhost:8080 |
| `npm run build` | Create optimized production build |
| `npm run build:dev` | Development build (useful for debugging SSR issues) |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Format code with Prettier |

---

## Project Structure

```text
careera/
├── public/                     Static assets (robots.txt, llms.txt)
├── src/
│   ├── components/             Reusable UI components
│   │   ├── ui/                 shadcn/ui primitive components
│   │   ├── AppSidebar.tsx      Navigation sidebar
│   │   ├── CodeEditor.tsx      Monaco editor wrapper
│   │   ├── RoadmapGraph.tsx    Interactive roadmap visualization
│   │   └── OpportunityCard.tsx Opportunity display with status and citations
│   ├── data/                   Static data and datasets
│   │   ├── careerData.ts       Opportunity and career information
│   │   ├── graphData.ts        Roadmap graph structure (nodes/edges)
│   │   └── problems.ts         Code execution test cases and problems
│   ├── integrations/           Third-party integrations
│   │   └── supabase/           Auto-generated Supabase client (do not edit)
│   ├── lib/                    Backend functions and utilities
│   │   ├── ai.server.ts        Career guidance logic
│   │   ├── firecrawl.server.ts Web scraping integration
│   │   ├── judge.server.ts     Code execution orchestration
│   │   ├── status-refresh.server.ts Opportunity status update service
│   │   ├── career.functions.ts Career-related server functions
│   │   └── chatHistory.ts      Session persistence utilities
│   ├── routes/                 Page components and API routes
│   │   ├── __root.tsx          Root layout
│   │   ├── index.tsx           Home page
│   │   ├── opportunities.tsx   Opportunities listing
│   │   ├── roadmaps.tsx        Roadmaps directory
│   │   ├── graph.tsx           Interactive graph viewer
│   │   ├── resources.tsx       Learning resources
│   │   ├── playground.tsx      Code execution environment
│   │   ├── advisor.tsx         Career guidance interface
│   │   └── api/                Server API routes and webhooks
│   ├── router.tsx              Router configuration
│   └── styles.css              Tailwind CSS theme and design tokens
├── supabase/                   Database migrations and configuration
├── vite.config.ts              Build configuration
└── package.json                Project manifest
```

---

## Backend & Database

Careera uses **Supabase** (PostgreSQL + Auth + Storage) for:

- **Persistent storage** — opportunity metadata, status change logs
- **User authentication** — email and OAuth integrations
- **Backend execution** — server functions for data processing and integration

Database schemas are defined in `supabase/migrations/`. When deploying to your own Supabase project, execute the migrations to set up the schema, then regenerate types via `supabase gen types typescript --local > src/integrations/supabase/types.ts`.

---

## Deployment

Careera is a server-side rendered application and requires a host that supports Node.js or edge runtime. Static hosts are not suitable.

### Option A — Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository into [Vercel](https://vercel.com)
3. Add all environment variables from the [Environment Variables](#environment-variables) section
4. Deploy

### Option B — Netlify

Similar setup to Vercel. Connect the repository, add environment variables, and deploy.

> **Note:** Some features may work better on Vercel due to superior SSR support.

---

## Version Control

```bash
git remote add origin https://github.com/SalmanDeveloperz/careera.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## Contributing

Contributions are welcome. Please follow this process:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Submit a pull request

Before submitting, ensure code quality by running:

```bash
npm run lint
npm run format
```

---

## License

This project is open source. A `LICENSE` file should be added (e.g., [MIT](https://choosealicense.com/licenses/mit/)) to specify terms of use.

---

## References & Attribution

This project builds on established conventions and technologies:

- Frontend framework and tooling: [TanStack](https://tanstack.com), [Vite](https://vitejs.dev), [React](https://react.dev)
- UI components: [shadcn/ui](https://ui.shadcn.com), [Tailwind CSS](https://tailwindcss.com)
- Backend infrastructure: [Supabase](https://supabase.io)
- Data aggregation: [Firecrawl](https://firecrawl.dev)
- Code execution: [Paiza.io](https://paiza.io)
- Roadmap design patterns inspired by [NeetCode](https://neetcode.io) and [roadmap.sh](https://roadmap.sh)
