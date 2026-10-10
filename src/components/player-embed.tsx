"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  getExpandedSeason,
  setExpandedSeason,
  upsertContinueItem,
} from "@/lib/continue-watching";
import {
  nextTvSlot,
  readPlaybackSignal,
  shouldAdvanceEpisode,
} from "@/lib/episode-advance";
import { EMBED_SOURCES, getVidsrcEmbedUrl } from "@/lib/vidsrc";
import type { MediaType, TvSeason } from "@/lib/types";
import { cn } from "@/lib/utils";

const LOAD_TIMEOUT_MS = 9000;

type PlayerEmbedProps = {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  initialSeason?: number;
  initialEpisode?: number;
  seasons?: TvSeason[];
};

export function PlayerEmbed({
  mediaType,
  tmdbId,
  title,
  posterPath = null,
  initialSeason = 1,
  initialEpisode = 1,
  seasons = [],
}: PlayerEmbedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const defaultExpanded =
    seasonOptions.find((s) => s.seasonNumber === initialSeason)?.seasonNumber ??
    seasonOptions[0].seasonNumber;
  const [expandedSeason, setExpandedSeasonState] = useState(defaultExpanded);

  useEffect(() => {
    setExpandedSeasonState(getExpandedSeason(tmdbId, defaultExpanded));
  }, [tmdbId, defaultExpanded]);

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
  const [notice, setNotice] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const sawPlaybackRef = useRef(false);
  const loadedAtRef = useRef(0);
  const advancingRef = useRef(false);

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

  useEffect(() => {
    if (mediaType !== "tv") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("s", String(season));
    params.set("e", String(episode));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [mediaType, season, episode, pathname, router, searchParams]);

  useEffect(() => {
    upsertContinueItem({
      mediaType,
      id: tmdbId,
      title,
      posterPath,
      ...(mediaType === "tv" ? { season, episode } : {}),
    });
  }, [mediaType, tmdbId, title, posterPath, season, episode]);

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

  function toggleSeason(nextSeason: number) {
    const next = expandedSeason === nextSeason ? -1 : nextSeason;
    setExpandedSeasonState(next);
    if (next > 0) setExpandedSeason(tmdbId, next);
  }

  function onEpisodeSelect(nextSeason: number, nextEpisode: number) {
    setNotice(null);
    setSeason(nextSeason);
    setEpisode(nextEpisode);
    setSourceIndex(0);
    setExpandedSeasonState(nextSeason);
    setExpandedSeason(tmdbId, nextSeason);
  }

  const upcoming =
    mediaType === "tv" ? nextTvSlot(seasonOptions, season, episode) : null;

  useEffect(() => {
    if (mediaType !== "tv") return;
    sawPlaybackRef.current = false;
    loadedAtRef.current = 0;
    advancingRef.current = false;

    function onMessage(event: MessageEvent) {
      const signal = readPlaybackSignal(event.data);
      if (!signal) return;
      if (signal.kind === "progress") {
        sawPlaybackRef.current = true;
        return;
      }
      if (advancingRef.current) return;
      if (
        !shouldAdvanceEpisode({
          signal,
          slot: { season, episode },
          sawPlayback: sawPlaybackRef.current,
          loadedForMs: loadedAtRef.current
            ? Date.now() - loadedAtRef.current
            : 0,
        })
      ) {
        return;
      }

      const next = nextTvSlot(seasonOptions, season, episode);
      advancingRef.current = true;
      if (!next) {
        setNotice("That was the last episode.");
        return;
      }

      const seasonMeta = seasonOptions.find(
        (item) => item.seasonNumber === next.season,
      );
      const episodeMeta = seasonMeta?.episodes.find(
        (item) => item.episodeNumber === next.episode,
      );
      setNotice(
        `Up next · ${seasonMeta?.name ?? `Season ${next.season}`} · ${
          episodeMeta
            ? `${episodeMeta.episodeNumber}. ${episodeMeta.name}`
            : `Episode ${next.episode}`
        }`,
      );
      setSeason(next.season);
      setEpisode(next.episode);
      setSourceIndex(0);
      setExpandedSeasonState(next.season);
      setExpandedSeason(tmdbId, next.season);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mediaType, season, episode, seasonOptions, tmdbId]);

  function tryNextServer() {
    setSourceIndex((current) => {
      const next = (current + 1) % EMBED_SOURCES.length;
      setStatus("switching");
      return next;
    });
  }

  const player = (
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
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full border-0"
        onLoad={() => {
          loadedRef.current = true;
          loadedAtRef.current = Date.now();
          sawPlaybackRef.current = false;
          setStatus("ready");
        }}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {mediaType === "tv" ? (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="flex max-h-[50vh] flex-col overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface)] lg:h-0 lg:max-h-none lg:min-h-full">
            <div className="shrink-0 border-b border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                Seasons & episodes
              </p>
            </div>
            <div className="scroll-panel min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="divide-y divide-[var(--line)]">
                {seasonOptions.map((s) => {
                  const open = expandedSeason === s.seasonNumber;
                  return (
                    <div key={s.seasonNumber}>
                      <button
                        type="button"
                        onClick={() => toggleSeason(s.seasonNumber)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm transition-colors hover:bg-[var(--surface-2)]",
                          open || season === s.seasonNumber
                            ? "text-[var(--fg)]"
                            : "text-[var(--muted)]",
                        )}
                      >
                        <span className="font-medium">{s.name}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 transition-transform",
                            open && "rotate-180 text-[var(--accent)]",
                          )}
                        />
                      </button>
                      {open ? (
                        <ul className="bg-[var(--bg)]/40 px-2 pb-2">
                          {s.episodes.map((ep) => {
                            const active =
                              season === s.seasonNumber &&
                              episode === ep.episodeNumber;
                            return (
                              <li key={ep.episodeNumber}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onEpisodeSelect(
                                      s.seasonNumber,
                                      ep.episodeNumber,
                                    )
                                  }
                                  className={cn(
                                    "mb-1 w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                                    active
                                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                                      : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]",
                                  )}
                                >
                                  <span className="font-medium">
                                    {ep.episodeNumber}.
                                  </span>{" "}
                                  <span className="line-clamp-2">{ep.name}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
          <div className="min-w-0">{player}</div>
        </div>
      ) : (
        player
      )}

      {mediaType === "tv" ? (
        <p className="text-sm text-[var(--muted)]">
          {notice ??
            (upcoming
              ? "The next episode starts when this one ends. A finished season continues at episode 1."
              : "This is the last episode.")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
        {upcoming ? (
          <button
            type="button"
            onClick={() => onEpisodeSelect(upcoming.season, upcoming.episode)}
            className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Next episode
          </button>
        ) : null}
        <button
          type="button"
          onClick={tryNextServer}
          className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Still not playing? Try another server
        </button>
      </div>
    </div>
  );
}
