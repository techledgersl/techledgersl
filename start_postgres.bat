@echo off
REM ─── TechLedger – Start PostgreSQL ──────────────────────────────────────────
REM Run this any time you want to start the PostgreSQL server before launching
REM the Django development server. Double-click or run from a terminal.
REM
REM To register PostgreSQL as an auto-start Windows service (run ONCE as Admin):
REM   pg_ctl register -N "PostgreSQL-TechLedger" -D "C:\pgdata" -S auto
REM ────────────────────────────────────────────────────────────────────────────

set PG_BIN=C:\Program Files\PostgreSQL\18\bin
set PG_DATA=C:\pgdata

echo Starting PostgreSQL 18 on localhost:5432 ...
"%PG_BIN%\pg_ctl.exe" start -D "%PG_DATA%" -l "%PG_DATA%\server.log" -w

if %ERRORLEVEL% == 0 (
    echo PostgreSQL started successfully.
) else (
    echo PostgreSQL may already be running or failed to start.
    echo Check logs at: %PG_DATA%\server.log
)
pause
