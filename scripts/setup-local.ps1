# Careera — low-memory local setup (run in PowerShell)
# Usage: cd careera; .\scripts\setup-local.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

Write-Host "`n=== Careera local setup ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot`n"

# Limit Node memory so Windows does not freeze (8GB RAM laptops)
$env:NODE_OPTIONS = "--max-old-space-size=3072"

function Step($n, $title) {
  Write-Host "`n--- Step $n : $title ---" -ForegroundColor Yellow
}

Step 1 "Check Node.js"
$nodeVer = node -v
Write-Host "Node version: $nodeVer"
if (-not $nodeVer) {
  Write-Host "Install Node 22 LTS from https://nodejs.org" -ForegroundColor Red
  exit 1
}

Step 2 "Install dependencies (may take 3-8 min — close Chrome if PC is slow)"
if (-not (Test-Path "node_modules")) {
  npm install --no-audit --no-fund
} else {
  Write-Host "node_modules already exists — skipping npm install"
}

Step 3 "Environment file"
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
} else {
  Write-Host ".env already exists"
}

Step 4 "Database schema"
npm run db:push

Step 5 "Prisma client"
npm run db:generate

Step 6 "Seed opportunities (optional live sync — needs internet)"
$seed = Read-Host "Seed database now? (Y/n)"
if ($seed -ne "n" -and $seed -ne "N") {
  npm run db:seed
}

Write-Host "`n=== Setup complete ===" -ForegroundColor Green
Write-Host @"

Start the app (keep this window OPEN):

  `$env:NODE_OPTIONS = '--max-old-space-size=3072'
  npm run dev

Then open: http://localhost:3000

To stop the server: Ctrl+C

"@ -ForegroundColor White
