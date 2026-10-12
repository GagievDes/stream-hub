"use client";

import { Captions, ListVideo, Maximize, Minimize, Pause, Play, RectangleHorizontal, Server, Settings, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { TvSeason } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMBED_ORIGIN = "https://framextv.xyz";

const SERVERS = [
  { id: "auto", label: "Auto" },
  { id: "miner", label: "Miner" },
  { id: "headhunter", label: "Headhunter" },
  { id: "hog_rider", label: "Hog Rider" },
  { id: "lavahound", label: "Lava Hound" },
  { id: "super_barbarian", label: "Super Barbarian" },
  { id: "bowler", label: "Bowler" },
  { id: "backup", label: "Backup" },
] as const;

export type PlayerServer = (typeof SERVERS)[number]["id"];

export type PlayerOption = {
  index: number;
  label: string;
};

function send(frame: HTMLIFrameElement | null, message: Record<string, unknown>) {
  frame?.contentWindow?.postMessage(message, EMBED_ORIGIN);
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

export function PlayerControls({
  frameRef,
  videoRef,
  shellRef,
  useVideo,
  subtitles,
  subtitleIndex,
  onSubtitle,
  qualities,
  qualityIndex,
  onQuality,
  server,
  onServer,
  theater,
  onTheater,
  onFullscreenIntent,
  mediaKey,
  episodes,
}: {
  frameRef: RefObject<HTMLIFrameElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  shellRef: RefObject<HTMLElement | null>;
  useVideo: boolean;
  subtitles: PlayerOption[];
  subtitleIndex: number | null;
  onSubtitle: (index: number | null) => void;
  qualities: PlayerOption[];
  qualityIndex: number;
  onQuality: (index: number) => void;
  server: PlayerServer;
  onServer: (id: PlayerServer) => void;
  theater: boolean;
  onTheater: () => void;
  onFullscreenIntent?: (active: boolean) => void;
  mediaKey?: string;
  episodes?: {
    seasons: TvSeason[];
    season: number;
    episode: number;
    onSelect: (season: number, episode: number) => void;
  } | null;
}) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [menu, setMenu] = useState<"subs" | "quality" | "server" | "episodes" | null>(null);
  const [shown, setShown] = useState(true);
  const [holding, setHolding] = useState(false);
  const [activity, setActivity] = useState(0);
  const [browseSeason, setBrowseSeason] = useState(episodes?.season ?? 1);
  const barRef = useRef<HTMLDivElement>(null);
  const lastNudge = useRef(0);
  const pausedByUser = useRef(false);
  const lastMediaTime = useRef(0);

  function nudge() {
    const now = Date.now();
    if (shown && now - lastNudge.current < 200) return;
    lastNudge.current = now;
    setShown(true);
    setActivity((value) => value + 1);
  }

  useEffect(() => {
    pausedByUser.current = false;
    lastMediaTime.current = 0;
    setTime(0);
    setDuration(0);
    setPlaying(true);
    setMenu(null);
    setShown(true);
  }, [mediaKey]);

  useEffect(() => {
    if (menu || !playing || holding) {
      setShown(true);
      return;
    }
    const timer = window.setTimeout(() => setShown(false), 2800);
    return () => window.clearTimeout(timer);
  }, [activity, holding, menu, playing]);

  useEffect(() => {
    if (!holding) return;
    function release() {
      setHolding(false);
    }
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [holding]);

  useEffect(() => {
    if (!menu) return;
    function onPointerDown(event: PointerEvent) {
      if (!barRef.current?.contains(event.target as Node)) setMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menu]);

  function toggleMenu(next: "subs" | "quality" | "server" | "episodes") {
    setMenu((current) => (current === next ? null : next));
  }

  const seasonList =
    episodes?.seasons.find((item) => item.seasonNumber === browseSeason) ??
    episodes?.seasons[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!useVideo || !video) return;

    const sync = () => {
      setTime(video.currentTime || 0);
      if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
      setPlaying(!video.paused);
      setMuted(video.muted || video.volume === 0);
      setVolume(video.volume);
    };
    sync();
    video.addEventListener("timeupdate", sync);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    video.addEventListener("durationchange", sync);
    video.addEventListener("volumechange", sync);
    return () => {
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
      video.removeEventListener("durationchange", sync);
      video.removeEventListener("volumechange", sync);
    };
  }, [useVideo, videoRef]);

  useEffect(() => {
    if (useVideo) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== EMBED_ORIGIN) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const name = "event" in data && typeof data.event === "string" ? data.event : "";
      if (name === "frameXTV:timeupdate") {
        const current = "currentTime" in data ? data.currentTime : null;
        const length = "duration" in data ? data.duration : null;
        if (typeof current === "number") {
          const previous = lastMediaTime.current;
          lastMediaTime.current = current;
          if (Math.floor(current) !== Math.floor(previous)) setTime(current);
          if (current > previous + 0.2 && !pausedByUser.current) setPlaying(true);
        }
        if (typeof length === "number" && length > 0) {
          setDuration((value) => (Math.abs(value - length) < 0.5 ? value : length));
        }
      }
      if (name === "frameXTV:ended") {
        pausedByUser.current = true;
        setPlaying(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameRef, useVideo]);

  useEffect(() => {
    const sync = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setFullscreen((document.fullscreenElement || doc.webkitFullscreenElement) === shellRef.current);
    };
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [shellRef]);

  function togglePlay() {
    const video = videoRef.current;
    if (useVideo && video) {
      if (video.paused) {
        pausedByUser.current = false;
        void video.play().catch(() => {});
      } else {
        pausedByUser.current = true;
        video.pause();
      }
      return;
    }
    const nextPlaying = !playing;
    pausedByUser.current = !nextPlaying;
    send(frameRef.current, { action: nextPlaying ? "play" : "pause" });
    setPlaying(nextPlaying);
  }

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const active = document.fullscreenElement || doc.webkitFullscreenElement;
    if (active) {
      onFullscreenIntent?.(false);
      if (document.exitFullscreen) await document.exitFullscreen();
      else doc.webkitExitFullscreen?.();
      return;
    }
    onFullscreenIntent?.(true);
    const target = shell as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    if (shell.requestFullscreen) {
      try {
        await shell.requestFullscreen();
        return;
      } catch {
        target.webkitRequestFullscreen?.();
      }
      return;
    }
    target.webkitRequestFullscreen?.();
  }

  return (
    <>
    <button
      type="button"
      aria-label="Toggle playback"
      onClick={togglePlay}
      className="absolute inset-0 z-10"
    />
    {!playing ? (
      <button
        type="button"
        aria-label="Play video"
        onClick={togglePlay}
        className="absolute left-1/2 top-[30%] z-[25] grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur touch-manipulation sm:top-1/2"
      >
        <Play className="size-7 fill-white" />
      </button>
    ) : null}
    <div className="absolute inset-x-0 bottom-0 z-20 h-16 sm:h-36" onPointerMove={nudge} onPointerDown={nudge} />
    <div
      ref={barRef}
      onPointerDown={() => setHolding(true)}
      className={cn(
        "absolute inset-x-2 bottom-2 z-30 flex flex-col gap-1 rounded-2xl border border-white/15 bg-black/80 px-2 py-1.5 text-white transition duration-200 touch-manipulation sm:inset-x-3 sm:bottom-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:px-3 sm:py-2",
        shown ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 sm:flex-1">
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
        className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-white" />}
      </button>
      <span className="w-10 shrink-0 text-[11px] tabular-nums text-white/80 sm:w-12 sm:text-xs">{clock(time)}</span>
      <input
        aria-label="Seek"
        type="range"
        min={0}
        max={Math.max(duration, 1)}
        step={1}
        value={Math.min(time, Math.max(duration, 1))}
        onChange={(event) => {
          const next = Number(event.target.value);
          setTime(next);
          const video = videoRef.current;
          if (useVideo && video) video.currentTime = next;
          else send(frameRef.current, { action: "seek", time: next });
        }}
        className="h-1 min-w-0 flex-1 accent-white"
      />
      <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/80 sm:w-12 sm:text-xs">
        {clock(duration)}
      </span>
      </div>
      <div className="flex items-center justify-between sm:contents">
      <button
        type="button"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => {
          const next = !muted;
          setMuted(next);
          const video = videoRef.current;
          if (useVideo && video) video.muted = next;
          else send(frameRef.current, { action: next ? "mute" : "unmute" });
        }}
        className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <input
        aria-label="Volume"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={muted ? 0 : volume}
        onChange={(event) => {
          const next = Number(event.target.value);
          setVolume(next);
          setMuted(next === 0);
          const video = videoRef.current;
          if (useVideo && video) {
            video.volume = next;
            video.muted = next === 0;
          } else {
            send(frameRef.current, { action: "setVolume", volume: next });
          }
        }}
        className="hidden h-1 w-16 accent-white sm:block"
      />
      {episodes ? (
        <IconMenu
          label="Episodes"
          open={menu === "episodes"}
          onOpen={() => {
            setBrowseSeason(episodes.season);
            toggleMenu("episodes");
          }}
          icon={<ListVideo className="size-4" />}
          panelClassName="flex w-72 max-h-[min(24rem,50vh)] flex-col overflow-hidden p-0"
        >
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-1">
            {episodes.seasons.map((item) => (
              <button
                key={item.seasonNumber}
                type="button"
                onClick={() => setBrowseSeason(item.seasonNumber)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs",
                  browseSeason === item.seasonNumber ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10",
                )}
              >
                S{item.seasonNumber}
              </button>
            ))}
          </div>
          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-1">
            {seasonList?.episodes.map((item) => {
              const selected =
                episodes.season === seasonList.seasonNumber && episodes.episode === item.episodeNumber;
              return (
                <MenuChoice
                  key={item.episodeNumber}
                  selected={selected}
                  onSelect={() => {
                    episodes.onSelect(seasonList.seasonNumber, item.episodeNumber);
                    setMenu(null);
                  }}
                >
                  {item.episodeNumber}. {item.name}
                </MenuChoice>
              );
            })}
          </div>
        </IconMenu>
      ) : null}
      <IconMenu
        label="Subtitles"
        open={menu === "subs"}
        active={subtitleIndex != null}
        onOpen={() => toggleMenu("subs")}
        icon={<Captions className="size-4" />}
      >
        <MenuChoice
          selected={subtitleIndex == null}
          onSelect={() => {
            onSubtitle(null);
            setMenu(null);
          }}
        >
          Off
        </MenuChoice>
        {subtitles.map((item) => (
          <MenuChoice
            key={item.index}
            selected={subtitleIndex === item.index}
            onSelect={() => {
              onSubtitle(item.index);
              setMenu(null);
            }}
          >
            {item.label}
          </MenuChoice>
        ))}
      </IconMenu>
      <IconMenu
        label="Quality"
        open={menu === "quality"}
        onOpen={() => toggleMenu("quality")}
        icon={<Settings className="size-4" />}
      >
        {qualities.map((item) => (
          <MenuChoice
            key={item.index}
            selected={qualityIndex === item.index}
            onSelect={() => {
              onQuality(item.index);
              setMenu(null);
            }}
          >
            {item.label}
          </MenuChoice>
        ))}
      </IconMenu>
      <IconMenu
        label="Server"
        open={menu === "server"}
        onOpen={() => toggleMenu("server")}
        icon={<Server className="size-4" />}
      >
        {SERVERS.map((item) => (
          <MenuChoice
            key={item.id}
            selected={server === item.id}
            onSelect={() => {
              onServer(item.id);
              setMenu(null);
            }}
          >
            {item.label}
          </MenuChoice>
        ))}
      </IconMenu>
      <button
        type="button"
        aria-label={theater ? "Exit theater" : "Theater"}
        aria-pressed={theater}
        onClick={onTheater}
        className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        <RectangleHorizontal className="size-4" />
      </button>
      <button
        type="button"
        aria-label={fullscreen ? "Exit full screen" : "Full screen"}
        onClick={() => void toggleFullscreen()}
        className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
      </button>
      </div>
    </div>
    </>
  );
}

function IconMenu({
  label,
  open,
  active = false,
  onOpen,
  icon,
  panelClassName,
  children,
}: {
  label: string;
  open: boolean;
  active?: boolean;
  onOpen: () => void;
  icon: ReactNode;
  panelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onOpen}
        className={cn(
          "grid size-8 place-items-center rounded-full hover:bg-white/10",
          active ? "text-white" : "text-white/80",
        )}
      >
        {icon}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute bottom-full right-0 z-30 mb-2 max-h-48 w-44 overflow-y-auto rounded-xl border border-white/15 bg-black/95 p-1 text-left shadow-lg",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuChoice({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white/10",
        selected ? "text-white" : "text-white/65",
      )}
    >
      {children}
    </button>
  );
}
