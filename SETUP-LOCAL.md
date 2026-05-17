# Careera — Local setup (8GB RAM friendly)

Follow **one step at a time**. Wait for each command to finish before running the next.  
If your laptop freezes or restarts, close Chrome/Edge and other apps first.

---

## Before you start

1. **Close** heavy apps: Chrome, games, extra VS Code/Cursor windows.
2. **Pause OneDrive sync** (your project is under OneDrive — sync + npm can overload disk/RAM).
3. Use **Node.js 22 LTS** — check: `node -v` (should show `v22.x.x`).

---

## Option A — Automatic script (recommended)

Open **PowerShell** (not CMD):

```powershell
cd C:\Users\chsal\OneDrive\Desktop\fyp2\careera
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup-local.ps1
```

When setup finishes, start the server:

```powershell
.\scripts\start-dev.ps1
```

Open **http://localhost:3000** in the browser.

---

## Option B — Manual steps (if script fails)

Run these **one by one** in PowerShell:

### Step 1 — Go to project

```powershell
cd C:\Users\chsal\OneDrive\Desktop\fyp2\careera
```

### Step 2 — Limit Node memory (important on 8GB RAM)

```powershell
$env:NODE_OPTIONS = "--max-old-space-size=3072"
```

### Step 3 — Install packages (only if `node_modules` is missing)

```powershell
npm install --no-audit --no-fund
```

Wait until it finishes. Do **not** run other commands at the same time.

### Step 4 — Environment file

```powershell
copy .env.example .env
```

### Step 5 — Database

```powershell
npm run db:push
npm run db:generate
```

### Step 6 — Seed data (fills opportunities)

```powershell
npm run db:seed
```

You should see: `Total opportunities in DB: 70+`

### Step 7 — Start app (keep terminal open)

```powershell
npm run dev
```

Wait for: `✓ Ready` and `Local: http://localhost:3000`

Open **http://localhost:3000** in your browser.

**Do not close** the PowerShell window while testing — closing it stops the server (`ERR_CONNECTION_REFUSED`).

---

## How to test

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Open http://localhost:3000 | Home page with Careera logo |
| 2 | Click **Discover** | List of opportunity cards |
| 3 | Click **Refresh live data** | Message about sync (wait ~1 min) |
| 4 | Filter: Open Source | GSoC, Outreachy, etc. |
| 5 | Search `gsoc` | GSoC card appears |

### Stop the server

In the terminal where `npm run dev` is running: press **Ctrl + C**.

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| Laptop restarts / freezes | Close other apps; run only one npm command; use `$env:NODE_OPTIONS = "--max-old-space-size=3072"` |
| `localhost refused to connect` | Run `npm run dev` again and **leave terminal open** |
| Empty Discover page | Run `npm run db:seed` |
| `Prisma` / database errors | Run `npm run db:push` then `npm run db:generate` |
| Script blocked | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| Very slow install | Normal on 8GB RAM; wait 5–10 minutes |

---

## Daily workflow (after first setup)

```powershell
cd C:\Users\chsal\OneDrive\Desktop\fyp2\careera
$env:NODE_OPTIONS = "--max-old-space-size=3072"
npm run dev
```

Browser: http://localhost:3000
