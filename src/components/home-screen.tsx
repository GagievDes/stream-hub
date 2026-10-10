"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readContinueList } from "@/lib/continue-watching";
import { backdropUrl, getCatalog, getDetails } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

type Art = {
  live: string | null;
  tv: string | null;
  movie: string | null;
};

const EMPTY_ART: Art = { live: null, tv: null, movie: null };

function firstArt(items: MediaItem[], used: Set<string>) {
  const found = items.find(
    (item) => item.backdropPath && !used.has(item.backdropPath),
  );
  if (found?.backdropPath) used.add(found.backdropPath);
  return backdropUrl(found?.backdropPath ?? null, "w780");
}

function CardImage({ src }: { src: string | null }) {
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="home-card-art"
      src={src}
      alt=""
      onLoad={(event) => event.currentTarget.classList.add("is-shown")}
    />
  );
}

export function HomeScreen() {
  const [art, setArt] = useState<Art>(EMPTY_ART);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const latest = readContinueList()[0] ?? null;
      const [tvList, movieList, liveList, details] = await Promise.all([
        getCatalog("tv", "trending").catch(() => []),
        getCatalog("movie", "trending").catch(() => []),
        getCatalog("movie", "now_playing").catch(() => []),
        latest
          ? getDetails(latest.mediaType, latest.id).catch(() => null)
          : Promise.resolve(null),
      ]);
      if (cancelled) return;

      const used = new Set<string>();
      const next: Art = {
        tv: firstArt(tvList, used),
        movie: firstArt(movieList, used),
        live: firstArt(liveList, used),
      };
      const continued = backdropUrl(details?.backdropPath ?? null, "w780");
      if (latest && continued) {
        if (latest.mediaType === "tv") next.tv = continued;
        if (latest.mediaType === "movie") next.movie = continued;
      }
      setArt(next);
    }

    void load();
    window.addEventListener("strain-continue-updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("strain-continue-updated", load);
    };
  }, []);

  return (
    <main className="home-menu">
      <Link href="/live" className="home-card" data-kind="live">
        <CardImage src={art.live} />
        <span className="home-card-shade" aria-hidden="true" />
        <span className="home-card-label">
          Live
          <span className="live-pip" aria-hidden="true" />
        </span>
      </Link>
      <Link href="/tv" className="home-card is-focus" data-kind="tv">
        <CardImage src={art.tv} />
        <span className="home-card-shade" aria-hidden="true" />
        <span className="home-card-label">TV Series</span>
      </Link>
      <Link href="/movies" className="home-card" data-kind="movie">
        <CardImage src={art.movie} />
        <span className="home-card-shade" aria-hidden="true" />
        <span className="home-card-label">Movies</span>
      </Link>
    </main>
  );
}
