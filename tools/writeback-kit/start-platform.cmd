@echo off
setlocal
cd /d "%~dp0\..\.."
title Futu Banner Platform
echo Starting Futu Banner Platform...
if not exist "node_modules" (
  echo Installing dependencies for the first launch...
  call corepack pnpm install
  if errorlevel 1 goto :failed
)
start "" "http://localhost:3210"
call corepack pnpm --filter @futu/web dev
if errorlevel 1 (
  goto :failed
)
exit /b 0

:failed
echo.
echo Platform failed to start. Keep this window open and send a screenshot to the developer.
pause
