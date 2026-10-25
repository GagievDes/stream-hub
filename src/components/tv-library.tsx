"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { TvRow, TvRowSkeleton, mediaToTvCard, type TvCard } from "@/components/tv-row";
import {
  continueHref,
  continueSubtitle,
  readContinueList,
  removeContinueItem,
  type ContinueItem,
} from "@/lib/continue-watching";
import type { CatalogKey, CatalogShelf } from "@/lib/categories";
import type { MediaItem, MediaType } from "@/lib/types";

export function TvLibrary({
  mediaType,
  label,
  query,
  trimmed,
  searching,
  shelves,
  catalogs,
  searchItems,
  error,
  loading,
}: {
  mediaType: MediaType;
  label: string;
  query: string;
  trimmed: string;
  searching: boolean;
  shelves: CatalogShelf[];
  catalogs: Record<CatalogKey, MediaItem[]>;
  searchItems: MediaItem[];
  error: string | null;
  loading: boolean;
}) {
  const [continued, setContinued] = useState<ContinueItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      setContinued(readContinueList().filter((item) => item.mediaType === mediaType));
    };
    refresh();
    window.addEventListener("strain-continue-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("strain-continue-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [mediaType]);

  const continueCards: TvCard[] = continued.map((item) => ({
    key: `${item.mediaType}-${item.id}`,
    href: continueHref(item),
    title: item.title,
    posterPath: item.posterPath,
    subtitle: continueSubtitle(item),
    onRemove: () => removeContinueItem(item.mediaType, item.id),
  }));

  return (
    <main className="tv-library">
      <header className="tv-library-head">
        <h1>{label}</h1>
        <p>Search for your favorite {label.toLowerCase()}</p>
        <SearchBar mediaType={mediaType} initialQuery={query} />
      </header>

      {error ? <p className="tv-message">{error}</p> : null}

      {loading ? (
        <>
          <TvRowSkeleton />
          <TvRowSkeleton />
        </>
      ) : searching ? (
        searchItems.length === 0 ? (
          <p className="tv-message">
            No titles found
            {trimmed ? ` for “${trimmed}”` : ""}.
          </p>
        ) : (
          <TvRow title="Results" cards={searchItems.map(mediaToTvCard)} />
        )
      ) : (
        <>
          <TvRow title="Continue Watching" cards={continueCards} />
          {shelves.map((shelf) => (
            <TvRow
              key={shelf.key}
              title={shelf.title}
              cards={(catalogs[shelf.key] ?? []).map(mediaToTvCard)}
            />
          ))}
        </>
      )}
    </main>
  );
}
