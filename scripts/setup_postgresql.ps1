# Install and start PostgreSQL on Windows (run PowerShell as Administrator).
# After success: set USE_SQLITE=false in .env, then run: python manage.py migrate

$ErrorActionPreference = "Stop"

Write-Host "Checking for PostgreSQL on port 5432..."
$listening = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "PostgreSQL is already listening on port 5432."
    exit 0
}

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pgService) {
    Write-Host "Starting service: $($pgService.Name)"
    Start-Service $pgService.Name
    Start-Sleep -Seconds 3
    exit 0
}

Write-Host "PostgreSQL not found. Installing via winget (Administrator required)..."
winget install -e --id PostgreSQL.PostgreSQL.17 --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "After install completes:"
Write-Host "  1. Open pgAdmin or psql and create database: techledger_db"
Write-Host "  2. Set DB_PASSWORD in .env to your postgres user password"
Write-Host "  3. Set USE_SQLITE=false in .env"
Write-Host "  4. Run: python manage.py migrate"
