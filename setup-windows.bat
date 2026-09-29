@echo off
setlocal EnableExtensions
REM Sync from WSL then launch. Prefer running sync in WSL first if this fails.

echo.
echo === Sync Strain Stream from WSL ===
echo.

wsl.exe -e bash -lc "cd ~/stream-hub && git pull && bash scripts/sync-to-windows.sh %USERNAME%"
if errorlevel 1 (
  echo.
  echo Sync failed. Try this in your WSL terminal instead:
  echo   cd ~/stream-hub
  echo   git pull
  echo   bash scripts/sync-to-windows.sh
  echo.
  pause
  exit /b 1
)

cd /d "%USERPROFILE%\stream-hub"
if not exist "start-app.bat" (
  echo start-app.bat not found at %USERPROFILE%\stream-hub
  pause
  exit /b 1
)

call start-app.bat
endlocal
