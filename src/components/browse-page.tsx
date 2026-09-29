import { Suspense } from "react";
import { MediaCard } from "@/components/media-card";
import { SearchBar } from "@/components/search-bar";
import { searchMedia } from "@/lib/tmdb";
import type { MediaItem, MediaType } from "@/lib/types";

export async function BrowsePage({
  mediaType,
  query,
}: {
  mediaType: MediaType;
  query: string;
}) {
  const label = mediaType === "movie" ? "Movies" : "TV Series";
  let items: MediaItem[] = [];
  let error: string | null = null;

  try {
    items = await searchMedia(mediaType, query);
  } catch (e) {
    items = [];
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
          Search TMDB for titles, then open any result to play via vidsrc using
          its TMDB ID — without ever typing an ID yourself.
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
      ) : items.length === 0 ? (
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
          <p className="text-lg text-[var(--fg)]">No titles found</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Try another name
            {query ? (
              <>
                {" "}
                — nothing matched &ldquo;{query}&rdquo;
              </>
            ) : null}
            .
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">
            {query
              ? `${items.length} result${items.length === 1 ? "" : "s"} for “${query}”`
              : "Popular right now"}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
              >
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
