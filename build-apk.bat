@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo === Build Strain Stream APK ===
echo You need Android Studio (or Android SDK) installed.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  pause
  exit /b 1
)

if not defined ANDROID_HOME (
  if exist "%LOCALAPPDATA%\Android\Sdk" set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)
if not defined ANDROID_SDK_ROOT if defined ANDROID_HOME set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

call npm.cmd install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

call npm.cmd run apk
set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo.
  echo APK build failed. Install Android Studio, then open this folder's android\ project once.
  pause
  exit /b %ERR%
)

echo.
echo APK: %cd%\dist\Strain-Stream.apk
pause
endlocal
