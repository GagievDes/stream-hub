"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { CastRow } from "@/components/cast-row";
import { PlayerEmbed } from "@/components/player-embed";
import { backdropUrl, posterUrl, yearFromDate } from "@/lib/tmdb";
import type { CastMember, MediaDetails, MediaType, TvSeason } from "@/lib/types";
import {
  episodeStartAt,
  movieResume,
  openingRequest,
  progressKey,
  readProgressMap,
  seriesResume,
  watchedFraction,
} from "@/lib/watch-progress";

type PlayRequest = {
  season: number;
  episode: number;
  startAt: number;
  token: number;
};

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readWatchOpen() {
  return window.location.hash === "#watch";
}

function useWatchOpen() {
  return useSyncExternalStore(subscribeHash, readWatchOpen, () => false);
}

function runtimeLabel(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "";
  return `${minutes}m`;
}

export function TvDetail({
  mediaType,
  id,
  details,
  cast,
  seasons,
  explicitSeason,
  explicitEpisode,
  backHref,
}: {
  mediaType: MediaType;
  id: number;
  details: MediaDetails;
  cast: CastMember[];
  seasons: TvSeason[];
  explicitSeason?: number;
  explicitEpisode?: number;
  backHref: string;
}) {
  const open = useWatchOpen();
  const [revision, setRevision] = useState(0);
  const [request, setRequest] = useState<PlayRequest | null>(() => {
    if (typeof window === "undefined" || window.location.hash !== "#watch") return null;
    const opening = openingRequest(mediaType, id, seasons, explicitSeason, explicitEpisode);
    return { ...opening, token: 1 };
  });

  useEffect(() => {
    const bump = () => setRevision((value) => value + 1);
    window.addEventListener("strain-continue-updated", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("strain-continue-updated", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const resume = useMemo(() => {
    void revision;
    if (mediaType === "movie") {
      const movie = movieResume(id);
      return {
        season: 1,
        episode: 1,
        position: movie.position,
        label: movie.label,
        resumable: movie.resumable,
      };
    }
    return seriesResume(id, seasons);
  }, [revision, mediaType, id, seasons]);

  const [browseSeason, setBrowseSeason] = useState(
    () => explicitSeason ?? (mediaType === "tv" ? seriesResume(id, seasons).season : 1),
  );

  useEffect(() => {
    if (mediaType !== "tv") return;
    const onHash = () => {
      if (window.location.hash === "#watch") return;
      setBrowseSeason(seriesResume(id, seasons).season);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [id, mediaType, seasons]);

  function openPlayer(season: number, episode: number, startAt: number) {
    setRequest({ season, episode, startAt, token: Date.now() });
    const url = new URL(window.location.href);
    url.hash = "watch";
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  const progress = useMemo(() => {
    void revision;
    return readProgressMap();
  }, [revision]);

  const art = backdropUrl(details.backdropPath, "w1280");
  const year = yearFromDate(details.releaseDate);
  const seasonList =
    seasons.find((item) => item.seasonNumber === browseSeason) ?? seasons[0];
  const meta = [
    year,
    mediaType === "tv" ? "Series" : "Movie",
    details.voteAverage > 0 ? details.voteAverage.toFixed(1) : "",
    runtimeLabel(details.runtime),
    details.numberOfSeasons
      ? `${details.numberOfSeasons} season${details.numberOfSeasons === 1 ? "" : "s"}`
      : "",
    ...details.genres.slice(0, 3),
  ].filter(Boolean);

  return (
    <div className="tv-detail">
      <section className="tv-detail-hero" aria-label={details.title}>
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tv-hero-art" src={art} alt="" />
        ) : null}
        <div className="tv-hero-shade" />
        <div className="tv-detail-copy">
          <Link href={backHref} className="back-link tv-detail-back">
            <ArrowLeft aria-hidden="true" />
            Back
          </Link>
          <p className="tv-hero-kicker">{mediaType === "tv" ? "Series" : "Movie"}</p>
          <h1 className="tv-hero-title">{details.title}</h1>
          {meta.length > 0 ? <p className="tv-hero-meta">{meta.join("  ·  ")}</p> : null}
          {details.overview ? <p className="tv-hero-overview">{details.overview}</p> : null}
          <div className="tv-detail-actions tv-hero-actions">
            <button
              type="button"
              className="tv-btn tv-btn-play"
              data-play-label={resume.label}
              onClick={() => openPlayer(resume.season, resume.episode, resume.position)}
            >
              <Play aria-hidden="true" />
              {resume.label}
            </button>
            {resume.resumable ? (
              <button
                type="button"
                className="tv-btn tv-btn-info"
                onClick={() => openPlayer(resume.season, resume.episode, 0)}
              >
                Play from start
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {mediaType === "tv" && seasons.length > 0 ? (
        <>
          <div className="tv-season-row" role="list" aria-label="Seasons">
            {seasons.map((item) => {
              const selected = item.seasonNumber === (seasonList?.seasonNumber ?? browseSeason);
              return (
                <button
                  key={item.seasonNumber}
                  type="button"
                  className="tv-season"
                  aria-pressed={selected}
                  onClick={() => setBrowseSeason(item.seasonNumber)}
                >
                  {item.name || `Season ${item.seasonNumber}`}
                </button>
              );
            })}
          </div>
          <ul className="tv-episode-list" aria-label={seasonList?.name ?? "Episodes"}>
            {(seasonList?.episodes ?? []).map((episode) => {
              const entry =
                progress[progressKey("tv", id, seasonList?.seasonNumber ?? browseSeason, episode.episodeNumber)];
              const fraction = entry ? watchedFraction(entry.position, entry.duration) : 0;
              const still = posterUrl(episode.stillPath ?? null, "w500");
              const seasonNumber = seasonList?.seasonNumber ?? browseSeason;
              return (
                <li key={episode.episodeNumber}>
                  <button
                    type="button"
                    className="tv-episode"
                    onClick={() =>
                      openPlayer(
                        seasonNumber,
                        episode.episodeNumber,
                        episodeStartAt(id, seasonNumber, episode.episodeNumber),
                      )
                    }
                  >
                    <span className="tv-episode-still">
                      {still ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={still} alt="" />
                      ) : (
                        <span className="tv-episode-fallback">{episode.episodeNumber}</span>
                      )}
                      {fraction > 0.02 ? (
                        <span className="tv-episode-progress" aria-hidden="true">
                          <span style={{ width: `${Math.round(fraction * 100)}%` }} />
                        </span>
                      ) : null}
                    </span>
                    <span className="tv-episode-copy">
                      <span className="tv-episode-topline">
                        <span className="tv-episode-name">
                          {episode.episodeNumber}. {episode.name}
                        </span>
                        {runtimeLabel(episode.runtime) ? (
                          <span className="tv-episode-runtime">{runtimeLabel(episode.runtime)}</span>
                        ) : null}
                      </span>
                      {episode.overview ? (
                        <span className="tv-episode-overview">{episode.overview}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <div className="tv-detail-cast">
        <CastRow cast={cast} scroll />
      </div>

      {open && request ? (
        <PlayerEmbed
          key={request.token}
          mediaType={mediaType}
          tmdbId={details.id}
          title={details.title}
          posterPath={details.posterPath}
          initialSeason={request.season}
          initialEpisode={request.episode}
          startAt={request.startAt}
          seasons={seasons}
        />
      ) : null}
    </div>
  );
}
