# Lumina

Local **Movies & TV desktop app** for Windows.

## Desktop app on Windows (do this)

### 1) Install Node.js for Windows
https://nodejs.org → install **LTS** → close all terminals → reopen.

### 2) Get a clean Windows copy (important)

Do **not** copy `node_modules` from WSL. Install fresh on Windows.

Open **Command Prompt** (`cmd`), not PowerShell:

```bat
cd %USERPROFILE%
if exist stream-hub rmdir /s /q stream-hub
mkdir stream-hub
cd stream-hub

REM Pull source from WSL without node_modules
wsl -e bash -lc "cd ~/stream-hub && git pull && rsync -a --delete --exclude node_modules --exclude .next --exclude .git ./ /mnt/c/Users/$USER/stream-hub/"

cd %USERPROFILE%\stream-hub
start-app.bat
```

Or, if Origin CLI / git works on Windows:

```bat
cd %USERPROFILE%
git clone https://origin.cursor.com/pavle-gagievi/stream-hub.git
cd stream-hub
start-app.bat
```

`start-app.bat` will:
1. write `.env.local` if missing
2. run `npm install`
3. build the app
4. open the Lumina desktop window

### If PowerShell blocks npm

Error: `npm.ps1 cannot be loaded because running scripts is disabled`

Fix (run once in PowerShell as your user):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Or just use **Command Prompt** / double-click `start-app.bat` (recommended).

## Browser mode (already working for you)

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

Brave blocks many player ads by default. Firefox does not.

1. Install **[uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/)** for Firefox.
2. The desktop app (`start-app.bat`) adds extra network-level ad filtering.
