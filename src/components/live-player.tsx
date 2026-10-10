"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveChannel } from "@/lib/live-channels";

export function LivePlayer({ channel }: { channel: LiveChannel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let destroyed = false;
    let detach: (() => void) | null = null;

    void (async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.streamUrl;
        try {
          await video.play();
        } catch {
          // The controls stay available if autoplay is blocked.
        }
        return;
      }

      const { default: Hls } = await import("hls.js");
      if (destroyed) return;
      if (!Hls.isSupported()) {
        setError("This browser cannot play the live stream.");
        return;
      }

      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      detach = () => hls.destroy();
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        setError("This channel is not available right now.");
        hls.destroy();
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.loadSource(channel.streamUrl);
      hls.attachMedia(video);
    })();

    return () => {
      destroyed = true;
      detach?.();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel.streamUrl, attempt]);

  return (
    <div className="space-y-3">
      <div className="player-shell relative w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full"
          controls
          autoPlay
          muted
          playsInline
        />
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
            <p className="text-sm text-[var(--fg)]">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAttempt((value) => value + 1);
              }}
              className="rounded-md border border-[var(--line)] px-3 py-2 text-xs text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          {channel.region}
        </p>
        <h2 className="mt-1 text-2xl font-medium text-[var(--fg)]">{channel.name}</h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          {channel.description} Sound starts muted. Use the player controls to unmute.
        </p>
      </div>
    </div>
  );
}
