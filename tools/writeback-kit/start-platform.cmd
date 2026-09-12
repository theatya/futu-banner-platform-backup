@echo off
cd /d "%~dp0"
title Futu Banner Platform
echo Starting Futu Banner Platform...
corepack pnpm --filter @futu/web dev
if errorlevel 1 (
  echo.
  echo Platform failed to start. Keep this window open and send a screenshot to the developer.
  pause
)
