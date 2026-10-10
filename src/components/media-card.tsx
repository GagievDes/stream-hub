"use client";

import Link from "next/link";
import { CachedPoster } from "@/components/cached-poster";
import { watchHref } from "@/lib/paths";
import { yearFromDate } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export function MediaCard({ item }: { item: MediaItem }) {
  const href = watchHref(item.mediaType, item.id);
  const year = yearFromDate(item.releaseDate);

  return (
    <Link
      href={href}
      className="group media-card block focus-visible:outline-none"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[var(--surface-2)]">
        {item.posterPath ? (
          <CachedPoster
            posterPath={item.posterPath}
            alt={item.title}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="font-[family-name:var(--font-display)] text-5xl text-[var(--line)]">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
            {item.title}
          </p>
          <p className="mt-1 text-xs text-white/70">
            {year}
            {item.voteAverage > 0 ? ` · ${item.voteAverage.toFixed(1)}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
