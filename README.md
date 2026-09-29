# Lumina

Local **Movies & TV desktop app** for Windows.

## Desktop app (simple path)

### 1) Install Node.js for Windows
https://nodejs.org → **LTS** → install → close and reopen terminals.

### 2) Sync the project (in WSL)

```bash
cd ~/stream-hub
git pull
bash scripts/sync-to-windows.sh
```

If it asks for a username, use your Windows folder name under `C:\Users\` (yours is likely `davit`):

```bash
bash scripts/sync-to-windows.sh davit
```

### 3) Start the app (on Windows)

Open File Explorer → `C:\Users\davit\stream-hub` → double-click **`start-app.bat`**.

That installs dependencies, builds, and opens the Lumina window.

Do **not** copy `node_modules` from WSL. Do **not** use PowerShell for `npm` (it blocks `npm.ps1`). Use the `.bat` file or Command Prompt with `npm.cmd`.

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
- Desktop app filters known ad / tracker domains

### Ads in Firefox

1. Install **[uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/)**.
2. Desktop app (`start-app.bat`) also filters many ad domains.
