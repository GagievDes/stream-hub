"use client";

import { useEffect, useState } from "react";
import { getVidsrcEmbedUrl } from "@/lib/vidsrc";
import type { MediaType } from "@/lib/types";

export function PlayerEmbed({
  mediaType,
  tmdbId,
  title,
}: {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = getVidsrcEmbedUrl(mediaType, tmdbId);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 8000);
    return () => window.clearTimeout(timer);
  }, [src]);

  return (
    <div className="space-y-3">
      <div className="player-shell relative w-full overflow-hidden bg-black">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface)]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
              <p className="text-sm text-[var(--muted)]">Loading player…</p>
            </div>
          </div>
        )}
        <iframe
          src={src}
          title={`${title} player`}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full border-0"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <p className="text-xs text-[var(--muted)]">
        Player not loading?{" "}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Open on vidsrc.io
        </a>
      </p>
    </div>
  );
}
