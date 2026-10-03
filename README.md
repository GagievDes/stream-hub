# Strain Stream

Local **Movies & TV app** for Windows and Android.

## Portable EXE (Windows)

Build this **on Windows** (with Node.js LTS installed):

```bat
cd %USERPROFILE%\stream-hub
npm.cmd install
npm.cmd run dist
```

When it finishes, get:

`dist\Strain-Stream-Portable.exe`

Copy that single file anywhere (USB, Desktop) and double-click. No install, no browser.

> First launch may unpack briefly into a temp folder — that’s normal.

### Sync latest code from WSL first (if needed)

```bash
cd ~/stream-hub
git pull
bash scripts/sync-to-windows.sh davit
```

Then run the `npm.cmd run dist` commands above in **Command Prompt** inside `C:\Users\davit\stream-hub`.

## Android APK

The phone app is a Capacitor wrapper around the same UI. You need:

1. [Node.js LTS](https://nodejs.org)
2. [Android Studio](https://developer.android.com/studio) (installs the Android SDK)

On Windows:

```bat
cd %USERPROFILE%\stream-hub
npm.cmd install
npm.cmd run apk
```

Or double-click `build-apk.bat`.

When it finishes, get:

`dist\Strain-Stream.apk`

Copy that file to the phone. On the phone: **Settings → Security → Install unknown apps** (or “Allow from this source” when you open the APK), then tap `Strain-Stream.apk`.

This is a **debug APK** for testing (not Play Store signed). First install may warn that it is for internal testing — that’s expected.

## Dev desktop window (no packaging)

Double-click `start-app.bat`, or:

```bat
npm.cmd run app
```

## Browser mode

```bash
npm run dev
```

Open http://127.0.0.1:3847

## Features

- Strain Stream home with Movies / TV Series launcher
- Search by name (TMDB)
- Browse shelves: Popular, Trending, Top rated, Now playing / On the air
- Continue watching (local) with remove option
- Expandable season/episode list beside the player
- Cast under the description
- Silent server failover for playback
- Desktop / portable app blocks popup ads and many ad domains

### Ads in Firefox

Install **[uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/)**. The portable/desktop app already blocks popups.
