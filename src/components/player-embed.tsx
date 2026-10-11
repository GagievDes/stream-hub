"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PlayerControls, type PlayerServer } from "@/components/player-controls";
import { fetchQualities, fetchStream, toWebVtt, type StreamSubtitle } from "@/lib/stream-api";
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
import { EMBED_SOURCES, getEmbedUrl } from "@/lib/vidsrc";
import type { MediaType, TvSeason } from "@/lib/types";
import { cn } from "@/lib/utils";

const LOAD_TIMEOUT_MS = 9000;
const EMBED_ORIGIN = "https://framextv.xyz";

function applySubtitle(video: HTMLVideoElement, index: number | null) {
  const elements = [...video.querySelectorAll("track")];
  for (let i = 0; i < video.textTracks.length; i += 1) {
    const wanted = elements[i]?.dataset.index;
    video.textTracks[i].mode = index != null && wanted === String(index) ? "showing" : "disabled";
  }
}

function sendSubtitle(frame: HTMLIFrameElement | null, index: number | null) {
  frame?.contentWindow?.postMessage(
    { action: "setSubtitle", index: index ?? 1000 },
    EMBED_ORIGIN,
  );
}

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
  const [server, setServer] = useState<PlayerServer>("auto");
  const [nativeReady, setNativeReady] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<StreamSubtitle[]>([]);
  const [subtitleIndex, setSubtitleIndex] = useState<number | null>(null);
  const [qualities, setQualities] = useState([{ index: -1, label: "Auto", height: 0 }]);
  const [qualityIndex, setQualityIndex] = useState(-1);
  const [theater, setTheater] = useState(false);

  useEffect(() => {
    if (!theater) return;
    const root = document.documentElement;
    const prevBody = document.body.style.overflow;
    const prevRoot = root.style.overflow;
    const prevScroll = root.scrollTop;
    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    root.scrollTop = 0;
    return () => {
      document.body.style.overflow = prevBody;
      root.style.overflow = prevRoot;
      root.scrollTop = prevScroll;
    };
  }, [theater]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<{ currentLevel: number; destroy: () => void } | null>(null);
  const playbackTimeRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const sawPlaybackRef = useRef(false);
  const loadedAtRef = useRef(0);
  const advancingRef = useRef(false);
  const stickFullscreen = useRef(false);
  const pinScroll = useRef<number | null>(null);

  function shellIsFullscreen() {
    const shell = shellRef.current;
    if (!shell) return false;
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    return document.fullscreenElement === shell || doc.webkitFullscreenElement === shell;
  }

  function scrollToPinned() {
    const y = pinScroll.current;
    if (y == null || Math.abs(window.scrollY - y) <= 1) return;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, y);
    root.style.scrollBehavior = previous;
  }

  function restoreFullscreen() {
    const shell = shellRef.current;
    if (!shell || !stickFullscreen.current || shellIsFullscreen()) return;
    const target = shell as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    if (!shell.requestFullscreen) {
      target.webkitRequestFullscreen?.();
      return;
    }
    void shell.requestFullscreen().catch(() => {});
  }

  function keepView(update: () => void) {
    pinScroll.current = window.scrollY;
    if (shellIsFullscreen()) stickFullscreen.current = true;
    update();
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stickFullscreen.current = false;
    };
    const onChange = () => {
      if (shellIsFullscreen()) stickFullscreen.current = true;
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    if (!episodes.some((e) => e.episodeNumber === episode)) {
      setEpisode(episodes[0]?.episodeNumber ?? 1);
    }
  }, [episodes, episode]);

  const src = useMemo(() => {
    const sourceId = EMBED_SOURCES[sourceIndex]?.id ?? EMBED_SOURCES[0].id;
    if (mediaType === "tv") {
      return getEmbedUrl(mediaType, tmdbId, { season, episode }, sourceId);
    }
    return getEmbedUrl(mediaType, tmdbId, undefined, sourceId);
  }, [mediaType, tmdbId, season, episode, sourceIndex]);

  useEffect(() => {
    if (mediaType !== "tv") return;
    const matches =
      searchParams.get("s") === String(season) && searchParams.get("e") === String(episode);
    if (!matches) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("s", String(season));
      params.set("e", String(episode));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    if (pinScroll.current == null) return;
    const restore = () => scrollToPinned();
    const frame = requestAnimationFrame(restore);
    const timer = window.setTimeout(restore, 50);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [mediaType, season, episode, pathname, router, searchParams]);

  useLayoutEffect(() => {
    scrollToPinned();
    restoreFullscreen();
  }, [src]);

  useEffect(() => {
    if (!stickFullscreen.current) return;
    const onChange = () => {
      if (!stickFullscreen.current || shellIsFullscreen()) return;
      stickFullscreen.current = false;
      const shell = shellRef.current;
      if (!shell?.requestFullscreen) return;
      void shell.requestFullscreen().then(() => {
        stickFullscreen.current = true;
      }).catch(() => {});
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    const timer = window.setTimeout(() => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    }, 1500);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [src]);

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

  useEffect(() => {
    let cancelled = false;
    setNativeReady(false);
    setStreamUrl(null);
    setSubtitles([]);
    setSubtitleIndex(null);
    setQualities([{ index: -1, label: "Auto", height: 0 }]);
    setQualityIndex(-1);

    void fetchStream({
      mediaType,
      tmdbId,
      season,
      episode,
      provider: server,
    })
      .then(async (stream) => {
        if (cancelled) return;
        setSubtitles(stream.subtitles);
        const url = stream.sources[0]?.url ?? null;
        setStreamUrl(url);
        if (!url) return;
        const levels = await fetchQualities(url).catch(() => []);
        if (!cancelled && levels.length > 0) {
          setQualities([{ index: -1, label: "Auto", height: 0 }, ...levels]);
        }
      })
      .catch(() => {
        if (!cancelled) setStreamUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [mediaType, tmdbId, season, episode, server]);

  useEffect(() => {
    playbackTimeRef.current = 0;
  }, [src]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== EMBED_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object" || !("event" in data)) return;
      if (data.event !== "frameXTV:timeupdate") return;
      if ("currentTime" in data && typeof data.currentTime === "number") {
        playbackTimeRef.current = data.currentTime;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (qualityIndex < 0 || !streamUrl) {
      setNativeReady(false);
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let detach: (() => void) | null = null;

    void (async () => {
      try {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        if (!Hls.isSupported()) {
          setQualityIndex(-1);
          return;
        }

        const height = qualities.find((item) => item.index === qualityIndex)?.height ?? 0;
        const sortedHeights = qualities
          .map((item) => item.height)
          .filter((value) => value > 0)
          .sort((a, b) => a - b);
        const startLevel = sortedHeights.indexOf(height);
        const hls = new Hls({ startLevel: startLevel >= 0 ? startLevel : 0 });
        hlsRef.current = hls;
        detach = () => {
          hls.destroy();
          if (hlsRef.current === hls) hlsRef.current = null;
        };
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const match = hls.levels.findIndex((level) => level.height === height);
          if (match < 0) {
            if (!cancelled) setQualityIndex(-1);
            return;
          }
          hls.currentLevel = match;
          const resumeAt = playbackTimeRef.current;
          if (resumeAt > 1) video.currentTime = resumeAt;
          frameRef.current?.contentWindow?.postMessage({ action: "pause" }, EMBED_ORIGIN);
          void video.play().then(() => {
            if (!cancelled) setNativeReady(true);
          }).catch(() => {
            if (!cancelled) setQualityIndex(-1);
          });
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || cancelled) return;
          setNativeReady(false);
          setQualityIndex(-1);
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } catch {
        if (!cancelled) setQualityIndex(-1);
      }
    })();

    return () => {
      cancelled = true;
      const at = video.currentTime;
      detach?.();
      setNativeReady(false);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (at > 1) {
        playbackTimeRef.current = at;
        frameRef.current?.contentWindow?.postMessage(
          { action: "seek", time: at },
          EMBED_ORIGIN,
        );
        frameRef.current?.contentWindow?.postMessage({ action: "play" }, EMBED_ORIGIN);
      }
    };
  }, [qualityIndex, streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!nativeReady || !video || subtitleIndex == null) {
      if (!nativeReady) sendSubtitle(frameRef.current, subtitleIndex);
      if (video) {
        for (const node of video.querySelectorAll("track")) node.remove();
        applySubtitle(video, null);
      }
      return;
    }

    const track = subtitles.find((item) => item.index === subtitleIndex);
    if (!track) return;

    let cancelled = false;
    const urls: string[] = [];
    for (const node of video.querySelectorAll("track")) node.remove();

    void (async () => {
      try {
        const response = await fetch(track.url);
        if (!response.ok || cancelled) return;
        const vtt = toWebVtt(await response.text());
        if (cancelled) return;
        const url = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        urls.push(url);
        const element = document.createElement("track");
        element.kind = "subtitles";
        element.label = track.label;
        element.src = url;
        element.dataset.index = String(track.index);
        element.addEventListener("load", () => applySubtitle(video, subtitleIndex));
        video.appendChild(element);
        applySubtitle(video, subtitleIndex);
      } catch {
        // The embed captions stay available if this file cannot be read.
      }
    })();

    return () => {
      cancelled = true;
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [nativeReady, subtitleIndex, subtitles, src]);

  useLayoutEffect(() => {
    if (theater || shellIsFullscreen()) return;
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>("[data-active='true']");
    if (!active) return;
    const delta = active.getBoundingClientRect().top - list.getBoundingClientRect().top;
    const hidden = delta < 0 || delta + active.offsetHeight > list.clientHeight;
    if (hidden) list.scrollTop += delta - 36;
  }, [season, episode, expandedSeason, theater]);

  function toggleSeason(nextSeason: number) {
    const next = expandedSeason === nextSeason ? -1 : nextSeason;
    setExpandedSeasonState(next);
    if (next > 0) setExpandedSeason(tmdbId, next);
  }

  function onEpisodeSelect(nextSeason: number, nextEpisode: number) {
    keepView(() => {
      setNotice(null);
      setSeason(nextSeason);
      setEpisode(nextEpisode);
      setSourceIndex(0);
      setExpandedSeasonState(nextSeason);
      setExpandedSeason(tmdbId, nextSeason);
    });
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
      keepView(() => {
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
      });
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
    <div
      ref={shellRef}
      className={cn("player-shell relative w-full overflow-hidden bg-black", theater && "is-theater")}
    >
      {(status === "loading" || status === "switching") && !nativeReady && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
          <span className="rounded-md bg-black/70 px-3 py-1 text-xs text-[var(--muted)]">
            {status === "switching"
              ? "Trying another server…"
              : "Starting playback…"}
          </span>
        </div>
      )}
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full bg-black",
          nativeReady ? "z-[1]" : "invisible pointer-events-none",
        )}
        playsInline
        onEnded={() => {
          if (!nativeReady || mediaType !== "tv") return;
          const next = nextTvSlot(seasonOptions, season, episode);
          if (!next) {
            setNotice("That was the last episode.");
            return;
          }
          onEpisodeSelect(next.season, next.episode);
        }}
      />
      <iframe
        ref={frameRef}
        src={src}
        title={`${title} player`}
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full border-0",
          nativeReady && "invisible",
        )}
        onLoad={() => {
          loadedRef.current = true;
          loadedAtRef.current = Date.now();
          sawPlaybackRef.current = false;
          setStatus("ready");
          if (!nativeReady) sendSubtitle(frameRef.current, subtitleIndex);
        }}
      />
      <PlayerControls
        mediaKey={src}
        frameRef={frameRef}
        videoRef={videoRef}
        shellRef={shellRef}
        useVideo={nativeReady}
        subtitles={subtitles}
        subtitleIndex={subtitleIndex}
        onSubtitle={setSubtitleIndex}
        qualities={qualities}
        qualityIndex={qualityIndex}
        onQuality={setQualityIndex}
        server={server}
        onServer={(next) => {
          setServer(next);
          if (next !== "auto") {
            frameRef.current?.contentWindow?.postMessage(
              { action: "setProvider", provider: next },
              EMBED_ORIGIN,
            );
          }
        }}
        theater={theater}
        onTheater={() => setTheater((value) => !value)}
        onFullscreenIntent={(active) => {
          stickFullscreen.current = active;
        }}
        episodes={
          mediaType === "tv"
            ? {
                seasons: seasonOptions,
                season,
                episode,
                onSelect: onEpisodeSelect,
              }
            : null
        }
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {mediaType === "tv" ? (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="side-panel flex max-h-[50vh] flex-col overflow-hidden lg:h-0 lg:max-h-none lg:min-h-full">
            <div className="shrink-0 border-b border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                Seasons & episodes
              </p>
            </div>
            <div
              ref={listRef}
              className="scroll-panel min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
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
                                  data-active={active ? "true" : "false"}
                                  className={cn(
                                    "mb-1 w-full rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                                    active
                                      ? "bg-white/15 text-white"
                                      : "text-white/55 hover:bg-white/10 hover:text-white",
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
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:border-white hover:bg-white/15"
          >
            Next episode
          </button>
        ) : null}
        <button
          type="button"
          onClick={tryNextServer}
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:border-white hover:bg-white/15"
        >
          Still not playing? Try {EMBED_SOURCES[(sourceIndex + 1) % EMBED_SOURCES.length]?.label ?? "another server"}
        </button>
      </div>
    </div>
  );
}
