# Lumina

Local **Movies & TV desktop app** for Windows.

## Portable EXE (one file)

Build this **on Windows** (with Node.js LTS installed):

```bat
cd %USERPROFILE%\stream-hub
npm.cmd install
npm.cmd run dist
```

When it finishes, get:

`dist\Lumina-Portable.exe`

Copy that single file anywhere (USB, Desktop) and double-click. No install, no browser.

> It’s a real Electron desktop app packed as a portable EXE (same idea as portable Discord/apps). First launch may unpack briefly into a temp folder — that’s normal.

### Sync latest code from WSL first (if needed)

```bash
cd ~/stream-hub
git pull
bash scripts/sync-to-windows.sh davit
```

Then run the `npm.cmd run dist` commands above in **Command Prompt** inside `C:\Users\davit\stream-hub`.

## Dev desktop window (no packaging)

Double-click `start-app.bat`, or:

```bat
npm.cmd run app
```

## Browser mode

In WSL:

```bash
cd ~/stream-hub
git pull
npm run dev
```

Open http://127.0.0.1:3847

## Features

- Big Movies / TV Series launcher
- Search by name (TMDB)
- Season/episode dropdowns
- Cast pages with other movies/shows
- Silent server failover for playback
- Desktop / portable app blocks popup ads and many ad domains

### Ads in Firefox

Install **[uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/)**. The portable/desktop app already blocks popups.
