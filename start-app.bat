@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo === Strain Stream Desktop App (Windows) ===
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Download LTS from https://nodejs.org then run this again.
  pause
  exit /b 1
)

REM Prefer npm.cmd so PowerShell script policy never blocks us
set "NPM=npm.cmd"
where npm.cmd >nul 2>nul
if errorlevel 1 set "NPM=npm"

if not exist ".env.local" (
  echo Creating .env.local ...
  > ".env.local" echo TMDB_API_KEY=e568d7c77dd8fe416b1bb51b6f682466
)

REM Never reuse a broken/partial install copied from WSL
if exist "node_modules" (
  echo Cleaning old node_modules ...
  rmdir /s /q "node_modules" 2>nul
)

echo Installing dependencies (this can take a few minutes)...
call %NPM% install
if errorlevel 1 (
  echo.
  echo npm install failed.
  pause
  exit /b 1
)

echo Building app...
call %NPM% run build
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo Opening Strain Stream window...
call %NPM% exec -- electron .
set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo.
  echo Electron failed to start. Error code: %ERR%
  pause
  exit /b %ERR%
)

endlocal
