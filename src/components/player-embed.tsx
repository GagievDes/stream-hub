"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EMBED_SOURCES, getVidsrcEmbedUrl } from "@/lib/vidsrc";
import type { MediaType, TvSeason } from "@/lib/types";
import { cn } from "@/lib/utils";

const LOAD_TIMEOUT_MS = 9000;

type PlayerEmbedProps = {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  initialSeason?: number;
  initialEpisode?: number;
  seasons?: TvSeason[];
};

export function PlayerEmbed({
  mediaType,
  tmdbId,
  title,
  initialSeason = 1,
  initialEpisode = 1,
  seasons = [],
}: PlayerEmbedProps) {
  const router = useRouter();
  const pathname = usePathname();

  const seasonOptions = useMemo<TvSeason[]>(() => {
    if (seasons.length > 0) return seasons;
    return [
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 1,
        episodes: [{ episodeNumber: 1, name: "Episode 1" }],
      },
    ];
  }, [seasons]);

  const [season, setSeason] = useState(() => {
    const match = seasonOptions.find((s) => s.seasonNumber === initialSeason);
    return match?.seasonNumber ?? seasonOptions[0].seasonNumber;
  });

  const episodes = useMemo(() => {
    const current =
      seasonOptions.find((s) => s.seasonNumber === season) ?? seasonOptions[0];
    return current.episodes;
  }, [season, seasonOptions]);

  const [episode, setEpisode] = useState(() => {
    const seasonMatch =
      seasonOptions.find((s) => s.seasonNumber === initialSeason) ??
      seasonOptions[0];
    const epMatch = seasonMatch.episodes.find(
      (e) => e.episodeNumber === initialEpisode,
    );
    return epMatch?.episodeNumber ?? seasonMatch.episodes[0]?.episodeNumber ?? 1;
  });

  const [sourceIndex, setSourceIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "switching">(
    "loading",
  );
  const loadedRef = useRef(false);

  // Keep episode valid when season changes
  useEffect(() => {
    if (!episodes.some((e) => e.episodeNumber === episode)) {
      setEpisode(episodes[0]?.episodeNumber ?? 1);
    }
  }, [episodes, episode]);

  const src = useMemo(() => {
    const sourceId = EMBED_SOURCES[sourceIndex]?.id ?? EMBED_SOURCES[0].id;
    if (mediaType === "tv") {
      return getVidsrcEmbedUrl(
        mediaType,
        tmdbId,
        { season, episode },
        sourceId,
      );
    }
    return getVidsrcEmbedUrl(mediaType, tmdbId, undefined, sourceId);
  }, [mediaType, tmdbId, season, episode, sourceIndex]);

  // Sync season/episode into the URL (no source names exposed)
  useEffect(() => {
    if (mediaType !== "tv") return;
    const params = new URLSearchParams();
    params.set("s", String(season));
    params.set("e", String(episode));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [mediaType, season, episode, pathname, router]);

  // Auto-failover: if iframe never loads, advance to the next hidden source
  useEffect(() => {
    loadedRef.current = false;
    setStatus("loading");

    const timer = window.setTimeout(() => {
      if (loadedRef.current) return;

      setSourceIndex((current) => {
        const next = current + 1;
        if (next >= EMBED_SOURCES.length) {
          setStatus("ready");
          return current;
        }
        setStatus("switching");
        return next;
      });
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [src]);

  function onSeasonChange(nextSeason: number) {
    setSeason(nextSeason);
    setSourceIndex(0);
    const nextEpisodes =
      seasonOptions.find((s) => s.seasonNumber === nextSeason)?.episodes ?? [];
    setEpisode(nextEpisodes[0]?.episodeNumber ?? 1);
  }

  function onEpisodeChange(nextEpisode: number) {
    setEpisode(nextEpisode);
    setSourceIndex(0);
  }

  function tryNextServer() {
    setSourceIndex((current) => {
      const next = (current + 1) % EMBED_SOURCES.length;
      setStatus("switching");
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {mediaType === "tv" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Season
            </span>
            <select
              value={season}
              onChange={(e) => onSeasonChange(Number(e.target.value))}
              className={selectClassName}
            >
              {seasonOptions.map((s) => (
                <option key={s.seasonNumber} value={s.seasonNumber}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Episode
            </span>
            <select
              value={episode}
              onChange={(e) => onEpisodeChange(Number(e.target.value))}
              className={selectClassName}
            >
              {episodes.map((ep) => (
                <option key={ep.episodeNumber} value={ep.episodeNumber}>
                  {ep.episodeNumber}. {ep.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="player-shell relative w-full overflow-hidden bg-black">
        {(status === "loading" || status === "switching") && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
            <span className="rounded-md bg-black/70 px-3 py-1 text-xs text-[var(--muted)]">
              {status === "switching"
                ? "Trying another server…"
                : "Starting playback…"}
            </span>
          </div>
        )}
        <iframe
          key={src}
          src={src}
          title={`${title} player`}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          // No allow-popups: blocks most embed popup/redirect ads (Brave does this by default)
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full border-0"
          onLoad={() => {
            loadedRef.current = true;
            setStatus("ready");
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-[var(--muted)]">
          {mediaType === "tv"
            ? "Choose a season and episode, then watch below."
            : "Playback starts automatically."}
        </p>
        <button
          type="button"
          onClick={tryNextServer}
          className={cn(
            "rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]",
          )}
        >
          Still not playing? Try another server
        </button>
      </div>
    </div>
  );
}

const selectClassName =
  "episode-select h-11 w-full appearance-none rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 pr-10 text-[var(--fg)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat";
