"use client";

import { useEffect, useState } from "react";
import { ensurePosterCached } from "@/lib/poster-cache";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type CachedPosterProps = {
  posterPath: string | null;
  alt: string;
  className?: string;
  size?: "w342" | "w500";
  sizes?: string;
  priority?: boolean;
};

export function CachedPoster({
  posterPath,
  alt,
  className,
  size = "w500",
  priority = false,
}: CachedPosterProps) {
  const remote = posterUrl(posterPath, size);
  const [src, setSrc] = useState<string | null>(remote);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!posterPath) {
      setSrc(null);
      return;
    }

    setSrc(remote);

    void ensurePosterCached(posterPath, size).then((cached) => {
      if (!active || !cached) return;
      if (cached.startsWith("blob:")) objectUrl = cached;
      setSrc(cached);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [posterPath, size, remote]);

  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
