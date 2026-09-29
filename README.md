# Lumina

Local **Movies & TV desktop app** (and optional browser mode).

## Run as a Windows desktop app (what you want)

Do this in **Windows**, not WSL.

### 1) Install Node.js for Windows

Download LTS from: https://nodejs.org  
Install it, then close and reopen terminals.

### 2) Copy the project to a Windows folder

In **PowerShell**:

```powershell
# Create/copy into your Windows user folder
cd $HOME
if (Test-Path .\stream-hub) { Remove-Item -Recurse -Force .\stream-hub }

# If you already have it in WSL, copy it out:
wsl -e bash -lc "cp -a ~/stream-hub /mnt/c/Users/$USERNAME/stream-hub"

cd $HOME\stream-hub
```

If copy fails, replace `$USERNAME` with your Windows username (folder under `C:\Users\`).

Or clone fresh with Origin/git into `C:\Users\YourName\stream-hub`.

### 3) Start the desktop app

**Easiest:** double-click:

`start-app.bat`

**Or in PowerShell:**

```powershell
cd $HOME\stream-hub
git pull
npm install
@"
TMDB_API_KEY=e568d7c77dd8fe416b1bb51b6f682466
"@ | Set-Content .env.local
npm run app
```

A Lumina window opens (not a browser tab). Close the window to quit.

## Browser mode (only if needed)

Still works with:

```bash
npm run dev
```

then open http://127.0.0.1:3847

## Why not WSL for the desktop app?

Electron needs Windows GUI + Windows Node. In WSL, npm often calls Windows `cmd.exe` and fails with `UNC paths are not supported`. Use PowerShell / `start-app.bat` on Windows instead.

## Features

- Big Movies / TV Series launcher
- Search by name (TMDB)
- Season/episode dropdowns
- Cast pages with other movies/shows
- Silent server failover for playback
- Player iframe sandbox (blocks popup ads); desktop app also filters known ad domains

### Ads in Firefox

Brave blocks many player ads by default. Firefox does not.

1. Lumina’s player iframe already blocks **popup** ads (`sandbox` without `allow-popups`).
2. For stronger blocking in Firefox, install **[uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/)**.
3. The desktop app (`npm run app`) adds extra network-level ad filtering.
