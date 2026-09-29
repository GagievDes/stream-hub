# Lumina

Browse **movies** and **TV series** by name using [The Movie Database (TMDB)](https://www.themoviedb.org/), then play them through [vidsrc.io](https://vidsrc.io/) embeds. You never type TMDB IDs — names are shown in the UI; IDs are used only under the hood.

## How it works

1. **Home** — choose **Movies** or **TV Series**
2. **Browse / search** — popular titles load from TMDB; search by name
3. **Watch** — open a title; the page embeds `vidsrc.io` with that title’s TMDB ID  
   - Movie: `https://vidsrc.io/embed/movie/{tmdbId}`  
   - TV: `https://vidsrc.io/embed/tv/{tmdbId}` (built-in season/episode picker)

## Run locally

```bash
npm install
cp .env.example .env.local
# Put your TMDB API key in .env.local (required for full search)
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

### TMDB API key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup)
2. Request an API key under **Settings → API**
3. In `.env.local`:

```bash
TMDB_API_KEY=your_key_here
```

Without a key, the app runs in **demo mode** with a curated list so the flow still works. With a key, search hits the live TMDB API.

### Player tips

TV pages use season/episode dropdowns. Embed sources are tried automatically in the background if one fails — no source names are shown. Use **Still not playing? Try another server** if needed.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- TMDB API for names, posters, and IDs
- vidsrc.io iframe embeds for playback
