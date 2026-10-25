"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, Play } from "lucide-react";
import { TvRow, TvRowSkeleton, mediaToTvCard, type TvCard } from "@/components/tv-row";
import {
  continueHref,
  continueSubtitle,
  readContinueList,
  removeContinueItem,
  type ContinueItem,
} from "@/lib/continue-watching";
import { watchHref } from "@/lib/paths";
import { TV_HOME_ROWS } from "@/lib/tv-rows";
import { backdropUrl, getCatalog, getDetails, yearFromDate } from "@/lib/tmdb";
import type { MediaDetails, MediaItem } from "@/lib/types";

function continueCards(items: ContinueItem[]): TvCard[] {
  return items.map((item) => ({
    key: `${item.mediaType}-${item.id}`,
    href: continueHref(item),
    title: item.title,
    posterPath: item.posterPath,
    subtitle: continueSubtitle(item),
    onRemove: () => removeContinueItem(item.mediaType, item.id),
  }));
}

function pickFeatured(groups: { key: string; items: MediaItem[] }[]): MediaItem | null {
  const preferred = ["trending-movies", "popular-movies", "trending-tv", "popular-tv"];
  for (const key of preferred) {
    const items = groups.find((group) => group.key === key)?.items ?? [];
    const found = items.find((item) => item.backdropPath && item.overview);
    if (found) return found;
  }
  for (const group of groups) {
    const found = group.items.find((item) => item.backdropPath) ?? group.items[0];
    if (found) return found;
  }
  return null;
}

export function TvHome() {
  const [groups, setGroups] = useState<{ key: string; title: string; items: MediaItem[] }[] | null>(
    null,
  );
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [continued, setContinued] = useState<ContinueItem[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const refresh = () => setContinued(readContinueList());
    refresh();
    window.addEventListener("strain-continue-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("strain-continue-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const loaded = await Promise.all(
        TV_HOME_ROWS.map(async (row) => {
          try {
            const items = await getCatalog(row.mediaType, row.catalog);
            return { key: row.key, title: row.title, items };
          } catch {
            return { key: row.key, title: row.title, items: [] as MediaItem[] };
          }
        }),
      );
      if (cancelled) return;
      setGroups(loaded);
      setFeatured(pickFeatured(loaded));
      setFailed(loaded.every((row) => row.items.length === 0));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!featured) return;
    let cancelled = false;
    void getDetails(featured.mediaType, featured.id).then((next) => {
      if (!cancelled) setDetails(next);
    });
    return () => {
      cancelled = true;
    };
  }, [featured]);

  const backdrop = backdropUrl(featured?.backdropPath ?? null, "w1280");
  const year = yearFromDate(featured?.releaseDate ?? null);
  const typeLabel = featured?.mediaType === "tv" ? "Series" : "Movie";
  const href = featured ? watchHref(featured.mediaType, featured.id) : "/";
  const meta = [
    year,
    featured ? typeLabel : "",
    featured && featured.voteAverage > 0 ? featured.voteAverage.toFixed(1) : "",
    details?.runtime ? `${details.runtime} min` : "",
    ...(details?.genres.slice(0, 3) ?? []),
  ].filter(Boolean);

  return (
    <main className="tv-home">
      {groups == null ? (
        <section className="tv-hero tv-hero-loading" aria-hidden="true">
          <div className="tv-hero-copy">
            <div className="tv-skel tv-skel-kicker" />
            <div className="tv-skel tv-skel-title" />
            <div className="tv-skel tv-skel-text" />
            <div className="tv-skel tv-skel-buttons" />
          </div>
        </section>
      ) : featured ? (
        <section className="tv-hero" aria-label="Featured">
          {backdrop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tv-hero-art" src={backdrop} alt="" />
          ) : null}
          <div className="tv-hero-shade" />
          <div className="tv-hero-copy">
            <p className="tv-hero-kicker">Featured</p>
            <h1 className="tv-hero-title">{featured.title}</h1>
            {meta.length > 0 ? <p className="tv-hero-meta">{meta.join("  ·  ")}</p> : null}
            {featured.overview ? <p className="tv-hero-overview">{featured.overview}</p> : null}
            <div className="tv-hero-actions">
              <Link href={`${href}#watch`} className="tv-btn tv-btn-play">
                <Play aria-hidden="true" />
                Play
              </Link>
              <Link href={`${href}#about`} className="tv-btn tv-btn-info">
                <Info aria-hidden="true" />
                More info
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="tv-hero tv-hero-loading">
          <div className="tv-hero-copy">
            <h1 className="tv-hero-title">Nothing to feature right now</h1>
            <p className="tv-hero-overview">
              {failed ? "Titles could not be loaded. Check the connection and try again." : ""}
            </p>
          </div>
        </section>
      )}

      <div className="tv-rows">
        <TvRow title="Continue Watching" cards={continueCards(continued)} />
        {groups == null ? (
          <>
            <TvRowSkeleton />
            <TvRowSkeleton />
            <TvRowSkeleton />
          </>
        ) : (
          groups.map((group) => (
            <TvRow
              key={group.key}
              title={group.title}
              cards={group.items.map(mediaToTvCard)}
            />
          ))
        )}
      </div>
    </main>
  );
}
