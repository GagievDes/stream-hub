import { Suspense } from "react";
import { BrowseCatalog } from "@/components/browse-catalog";
import { SearchBar } from "@/components/search-bar";
import { catalogShelves, type CatalogKey } from "@/lib/categories";
import { getCatalog, searchMedia } from "@/lib/tmdb";
import type { MediaItem, MediaType } from "@/lib/types";

export async function BrowsePage({
  mediaType,
  query,
}: {
  mediaType: MediaType;
  query: string;
}) {
  const label = mediaType === "movie" ? "Movies" : "TV Series";
  const shelves = catalogShelves(mediaType);
  const trimmed = query.trim();
  const searching = trimmed.length > 0;

  let searchItems: MediaItem[] = [];
  let catalogs = {} as Record<CatalogKey, MediaItem[]>;
  let error: string | null = null;

  try {
    if (searching) {
      searchItems = await searchMedia(mediaType, trimmed);
    } else {
      const entries = await Promise.all(
        shelves.map(async (shelf) => {
          const items = await getCatalog(mediaType, shelf.key);
          return [shelf.key, items] as const;
        }),
      );
      catalogs = Object.fromEntries(entries) as Record<CatalogKey, MediaItem[]>;
    }
  } catch (e) {
    searchItems = [];
    catalogs = {} as Record<CatalogKey, MediaItem[]>;
    error = e instanceof Error ? e.message : "Failed to load titles";
  }

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
        <Suspense
          fallback={
            <div className="h-12 animate-pulse rounded-md bg-[var(--surface)]" />
          }
        >
          <SearchBar mediaType={mediaType} initialQuery={query} />
        </Suspense>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
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
