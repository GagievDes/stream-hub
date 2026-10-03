"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CastRow } from "@/components/cast-row";
import { PlayerEmbed } from "@/components/player-embed";
import {
  backdropUrl,
  getCast,
  getDetails,
  getTvSeasons,
  posterUrl,
  yearFromDate,
} from "@/lib/tmdb";
import type { CastMember, MediaDetails, MediaType, TvSeason } from "@/lib/types";

export function WatchPage({
  mediaType,
  id,
  season,
  episode,
}: {
  mediaType: MediaType;
  id: number;
  season?: number;
  episode?: number;
}) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [seasons, setSeasons] = useState<TvSeason[] | undefined>(undefined);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setStatus("error");
      return;
    }

    let active = true;
    setStatus("loading");
    setDetails(null);

    void (async () => {
      try {
        const nextDetails = await getDetails(mediaType, id);
        if (!active) return;
        if (!nextDetails) {
          setStatus("error");
          return;
        }
        const [nextSeasons, nextCast] = await Promise.all([
          mediaType === "tv" ? getTvSeasons(nextDetails.id) : Promise.resolve(undefined),
          getCast(mediaType, nextDetails.id),
        ]);
        if (!active) return;
        setDetails(nextDetails);
        setSeasons(nextSeasons);
        setCast(nextCast);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [mediaType, id]);

  const backHref = mediaType === "movie" ? "/movies" : "/tv";

  if (!Number.isFinite(id) || id <= 0 || status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 text-center">
        <p className="text-lg text-[var(--fg)]">Title not found</p>
        <Link
          href={backHref}
          className="mt-4 inline-flex text-sm text-[var(--accent)]"
        >
          Back to {mediaType === "movie" ? "Movies" : "TV Series"}
        </Link>
      </div>
    );
  }

  if (status === "loading" || !details) {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-16">
        <div className="h-40 animate-pulse rounded-md bg-[var(--surface)]" />
        <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-[var(--surface)]" />
        <div className="mt-3 h-20 animate-pulse rounded bg-[var(--surface)]" />
      </div>
    );
  }

  const backdrop = backdropUrl(details.backdropPath);
  const poster = posterUrl(details.posterPath, "w500");
  const year = yearFromDate(details.releaseDate);
  const typeLabel = mediaType === "movie" ? "Movie" : "TV Series";

  return (
    <div className="flex-1">
      <section className="relative isolate overflow-hidden">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--surface-2),var(--bg))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/40 via-[var(--bg)]/75 to-[var(--bg)]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-6">
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            <ArrowLeft className="size-4" />
            Back to {mediaType === "movie" ? "Movies" : "TV Series"}
          </Link>

          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {poster ? (
              <div className="relative mx-auto aspect-[2/3] w-40 shrink-0 overflow-hidden shadow-2xl shadow-black/50 md:mx-0 md:w-48">
                <Image
                  src={poster}
                  alt={details.title}
                  fill
                  className="object-cover"
                  sizes="192px"
                  priority
                />
              </div>
            ) : null}

            <div className="flex-1 animate-rise text-center md:text-left">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                {typeLabel}
                {year ? ` · ${year}` : ""}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--fg)] sm:text-5xl md:text-6xl">
                {details.title}
              </h1>
              {details.tagline ? (
                <p className="mt-3 text-lg italic text-[var(--muted)]">
                  {details.tagline}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--muted)] md:justify-start">
                {details.voteAverage > 0 ? (
                  <span>{details.voteAverage.toFixed(1)} rating</span>
                ) : null}
                {details.runtime ? <span>{details.runtime} min</span> : null}
                {details.numberOfSeasons ? (
                  <span>
                    {details.numberOfSeasons} season
                    {details.numberOfSeasons === 1 ? "" : "s"}
                  </span>
                ) : null}
                {details.genres.length > 0 ? (
                  <span>{details.genres.slice(0, 3).join(" · ")}</span>
                ) : null}
              </div>
              {details.overview ? (
                <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
                  {details.overview}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <CastRow cast={cast} />
        <div className="mt-10">
          <PlayerEmbed
            mediaType={mediaType}
            tmdbId={details.id}
            title={details.title}
            posterPath={details.posterPath}
            initialSeason={season}
            initialEpisode={episode}
            seasons={seasons}
          />
        </div>
      </section>
    </div>
  );
}
