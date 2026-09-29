"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CachedPoster } from "@/components/cached-poster";
import {
  continueHref,
  continueSubtitle,
  readContinueList,
  removeContinueItem,
  type ContinueItem,
} from "@/lib/continue-watching";
import type { MediaType } from "@/lib/types";

export function ContinueWatchingRow({ mediaType }: { mediaType: MediaType }) {
  const [items, setItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      setItems(readContinueList().filter((item) => item.mediaType === mediaType));
    };
    refresh();
    window.addEventListener("strain-continue-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("strain-continue-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [mediaType]);

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
        <p className="text-lg text-[var(--fg)]">Nothing to continue yet</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Start watching a {mediaType === "movie" ? "movie" : "series"} and it
          will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item, index) => (
        <div
          key={`${item.mediaType}-${item.id}`}
          className="animate-rise relative"
          style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
        >
          <Link
            href={continueHref(item)}
            className="group media-card block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[var(--accent)]">
                  {continueSubtitle(item)}
                </p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            aria-label={`Remove ${item.title} from Continue watching`}
            onClick={() => removeContinueItem(item.mediaType, item.id)}
            className="absolute right-2 top-2 z-10 rounded-md border border-white/15 bg-black/70 p-1.5 text-white/90 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
