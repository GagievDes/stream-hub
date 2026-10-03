"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { BrowseCatalog } from "@/components/browse-catalog";
import { catalogShelves, type CatalogKey } from "@/lib/categories";
import { getCatalog, searchMedia } from "@/lib/tmdb";
import type { MediaItem, MediaType } from "@/lib/types";

export function BrowsePage({ mediaType }: { mediaType: MediaType }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
          <div className="h-12 animate-pulse rounded-md bg-[var(--surface)]" />
        </div>
      }
    >
      <BrowsePageInner mediaType={mediaType} />
    </Suspense>
  );
}

function BrowsePageInner({ mediaType }: { mediaType: MediaType }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const label = mediaType === "movie" ? "Movies" : "TV Series";
  const shelves = useMemo(() => catalogShelves(mediaType), [mediaType]);
  const trimmed = query.trim();
  const searching = trimmed.length > 0;

  const [searchItems, setSearchItems] = useState<MediaItem[]>([]);
  const [catalogs, setCatalogs] = useState<Record<CatalogKey, MediaItem[]>>(
    {} as Record<CatalogKey, MediaItem[]>,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        if (searching) {
          const items = await searchMedia(mediaType, trimmed);
          if (!active) return;
          setSearchItems(items);
          setCatalogs({} as Record<CatalogKey, MediaItem[]>);
        } else {
          const entries = await Promise.all(
            shelves.map(async (shelf) => {
              const items = await getCatalog(mediaType, shelf.key);
              return [shelf.key, items] as const;
            }),
          );
          if (!active) return;
          setSearchItems([]);
          setCatalogs(
            Object.fromEntries(entries) as Record<CatalogKey, MediaItem[]>,
          );
        }
      } catch (e) {
        if (!active) return;
        setSearchItems([]);
        setCatalogs({} as Record<CatalogKey, MediaItem[]>);
        setError(e instanceof Error ? e.message : "Failed to load titles");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [mediaType, searching, trimmed, shelves]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <div className="mb-8 max-w-2xl animate-rise">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          {label}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--fg)] sm:text-5xl">
          Find by name
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Search for your favorite {label}
        </p>
      </div>

      <div className="mb-8 max-w-2xl animate-rise-delay">
        <SearchBar mediaType={mediaType} initialQuery={query} />
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-md bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : (
        <BrowseCatalog
          mediaType={mediaType}
          shelves={shelves}
          catalogs={catalogs}
          searching={searching}
          searchItems={searchItems}
          query={trimmed}
        />
      )}
    </div>
  );
}
