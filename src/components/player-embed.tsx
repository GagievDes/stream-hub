"use client";

import { useState } from "react";
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

  return (
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
  );
}
