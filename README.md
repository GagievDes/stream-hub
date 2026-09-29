# Lumina

A **local** Movies & TV app. Search titles by name via [TMDB](https://www.themoviedb.org/), watch through vidsrc embeds, and browse cast filmography.

## How it works

1. **Home** — big **Movies** / **TV Series** launcher
2. **Browse / search** — find titles by name
3. **Watch** — play with season/episode dropdowns (TV)
4. **Cast** — open an actor to see their other movies & shows

## Run in the browser (simplest)

```bash
npm install
cp .env.example .env.local
# Add: TMDB_API_KEY=your_key
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

## Run as a local desktop app

This opens Lumina in its own window (Electron), not a normal browser tab.

```bash
npm install
cp .env.example .env.local
# Add your TMDB_API_KEY
npm run app
```

`npm run app` builds the project, starts the local server, and opens the Lumina window.

> On Windows: run these commands in **WSL** or a Node.js terminal where `npm` works. The desktop window needs a GUI (Windows desktop / WSLg).

### TMDB API key

```bash
TMDB_API_KEY=your_key_here
```

Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

## Stack

- Next.js + TypeScript + Tailwind
- TMDB for titles, cast, and filmography
- Electron optional shell for the local window
- vidsrc embeds for playback (auto server failover)
