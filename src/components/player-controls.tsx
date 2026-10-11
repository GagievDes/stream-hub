"use client";

import { Captions, Maximize, Minimize, Pause, Play, RectangleHorizontal, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

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
}) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

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
        if (typeof current === "number") setTime(current);
        if (typeof length === "number" && length > 0) setDuration(length);
        setPlaying(true);
      }
      if (name === "frameXTV:ended") setPlaying(false);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameRef, useVideo]);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [shellRef]);

  function togglePlay() {
    const video = videoRef.current;
    if (useVideo && video) {
      if (video.paused) void video.play().catch(() => {});
      else video.pause();
      return;
    }
    send(frameRef.current, { action: playing ? "pause" : "play" });
    setPlaying((value) => !value);
  }

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await shell.requestFullscreen();
  }

  return (
    <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3 py-2 text-white backdrop-blur">
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
        className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-white" />}
      </button>
      <span className="w-12 shrink-0 text-xs tabular-nums text-white/80">{clock(time)}</span>
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
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-white/80">
        {clock(duration)}
      </span>
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
      <label className="sr-only" htmlFor="player-subs">
        Subtitles
      </label>
      <span className="grid size-4 shrink-0 place-items-center text-white/70" aria-hidden="true">
        <Captions className="size-4" />
      </span>
      <select
        id="player-subs"
        aria-label="Subtitles"
        value={subtitleIndex == null ? "off" : String(subtitleIndex)}
        onChange={(event) => {
          const value = event.target.value;
          onSubtitle(value === "off" ? null : Number(value));
        }}
        className="max-w-28 rounded-full border border-white/15 bg-black px-2 py-1 text-xs"
      >
        <option value="off">Subs off</option>
        {subtitles.map((item) => (
          <option key={item.index} value={item.index}>
            {item.label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="player-quality">
        Quality
      </label>
      <select
        id="player-quality"
        aria-label="Quality"
        value={String(qualityIndex)}
        onChange={(event) => onQuality(Number(event.target.value))}
        className="max-w-24 rounded-full border border-white/15 bg-black px-2 py-1 text-xs"
      >
        {qualities.map((item) => (
          <option key={item.index} value={item.index}>
            {item.label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="player-server">
        Server
      </label>
      <select
        id="player-server"
        aria-label="Server"
        value={server}
        onChange={(event) => onServer(event.target.value as PlayerServer)}
        className="max-w-28 rounded-full border border-white/15 bg-black px-2 py-1 text-xs"
      >
        {SERVERS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
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
  );
}
