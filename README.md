# Lumina

A **local** Movies & TV app. Search titles by name via [TMDB](https://www.themoviedb.org/), watch through vidsrc embeds, and browse cast filmography.

## How it works

1. **Home** — big **Movies** / **TV Series** launcher
2. **Browse / search** — find titles by name
3. **Watch** — play with season/episode dropdowns (TV)
4. **Cast** — open an actor to see their other movies & shows

## Important (Windows + WSL)

If `npm install` fails with `UNC paths are not supported` or looks for files in `C:\Windows`, your WSL terminal is using **Windows Node**, not Linux Node.

Fix that first (run in WSL):

```bash
# Install Linux Node inside WSL (nvm)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Confirm you are NOT on a Windows path
which node
which npm
# Should look like: /home/davit/.nvm/versions/node/...
# NOT like: /mnt/c/Program Files/nodejs/...
```

Then continue below.

## Run locally (recommended)

```bash
cd ~/stream-hub
git pull
npm install
cp .env.example .env.local   # only if you don't have it yet
# Make sure .env.local contains: TMDB_API_KEY=your_key
npm run dev
```

Open in your Windows browser:

**http://127.0.0.1:3847**

Leave the WSL terminal open while you use the app. Stop with `Ctrl + C`.

## TMDB API key

In `.env.local`:

```bash
TMDB_API_KEY=your_key_here
```

Free key: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

## Optional desktop window (Electron)

Electron often breaks in WSL because it needs Windows GUI + Windows Node. Prefer `npm run dev` in the browser.

If you want a desktop window later, install Node on Windows, clone/copy the project to a Windows folder (for example `C:\Users\YourName\stream-hub`), then:

```bat
npm install
npm install --save-dev electron
npm run build
npx electron .
```

## Stack

- Next.js + TypeScript + Tailwind
- TMDB for titles, cast, and filmography
- vidsrc embeds for playback (auto server failover)
