import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PlayerEmbed } from "@/components/player-embed";
import {
  backdropUrl,
  getDetails,
  getTvSeasons,
  posterUrl,
  yearFromDate,
} from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

export async function WatchPage({
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
  if (!Number.isFinite(id) || id <= 0) notFound();

  const details = await getDetails(mediaType, id);
  if (!details) notFound();

  const seasons =
    mediaType === "tv" ? await getTvSeasons(details.id) : undefined;

  const backdrop = backdropUrl(details.backdropPath);
  const poster = posterUrl(details.posterPath, "w500");
  const year = yearFromDate(details.releaseDate);
  const backHref = mediaType === "movie" ? "/movies" : "/tv";
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

          <div className="flex flex-col gap-8 md:flex-row md:items-end">
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
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--fg)]">
            Watch
          </h2>
        </div>
        <PlayerEmbed
          mediaType={mediaType}
          tmdbId={details.id}
          title={details.title}
          initialSeason={season}
          initialEpisode={episode}
          seasons={seasons}
        />
      </section>
    </div>
  );
}
