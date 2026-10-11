"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
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
}: {
  frameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [server, setServer] = useState<(typeof SERVERS)[number]["id"]>("auto");

  useEffect(() => {
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
  }, [frameRef]);

  return (
    <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3 py-2 text-white backdrop-blur">
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => {
          send(frameRef.current, { action: playing ? "pause" : "play" });
          setPlaying((value) => !value);
        }}
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
          send(frameRef.current, { action: "seek", time: next });
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
          send(frameRef.current, { action: next ? "mute" : "unmute" });
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
          send(frameRef.current, { action: "setVolume", volume: next });
        }}
        className="hidden h-1 w-16 accent-white sm:block"
      />
      <label className="sr-only" htmlFor="player-server">
        Server
      </label>
      <select
        id="player-server"
        value={server}
        onChange={(event) => {
          const next = event.target.value as (typeof SERVERS)[number]["id"];
          setServer(next);
          if (next === "auto") return;
          send(frameRef.current, { action: "setProvider", provider: next });
        }}
        className="max-w-28 rounded-full border border-white/15 bg-black px-2 py-1 text-xs"
      >
        {SERVERS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
