# Start Careera dev server (low memory)
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

$env:NODE_OPTIONS = "--max-old-space-size=3072"

Write-Host "Starting Careera at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop.`n"

npm run dev
