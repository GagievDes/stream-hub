@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Lumina Desktop App ===
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed for Windows.
  echo Install from https://nodejs.org then reopen this file.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo Creating .env.local ...
  echo TMDB_API_KEY=e568d7c77dd8fe416b1bb51b6f682466> .env.local
)

echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

echo Building app...
call npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo Opening Lumina window...
call npx electron .
endlocal
