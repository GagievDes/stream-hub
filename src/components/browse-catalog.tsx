"use client";

import { useEffect, useState } from "react";
import { ContinueWatchingRow } from "@/components/continue-watching-row";
import { MediaCard } from "@/components/media-card";
import { POPULAR_WINDOWS, type CatalogKey, type CatalogShelf, type PopularWindow } from "@/lib/categories";
import { readContinueList } from "@/lib/continue-watching";
import { syncCatalogPosters } from "@/lib/poster-cache";
import { discoverByGenre, getGenres, type Genre } from "@/lib/tmdb";
import type { MediaItem, MediaType } from "@/lib/types";

type BrowseCatalogProps = {
  mediaType: MediaType;
  shelves: CatalogShelf[];
  catalogs: Record<CatalogKey, MediaItem[]>;
  searching: boolean;
  searchItems: MediaItem[];
  query: string;
};

export function BrowseCatalog({
  mediaType,
  shelves,
  catalogs,
  searching,
  searchItems,
  query,
}: BrowseCatalogProps) {
  const [tab, setTab] = useState<string>("popular");
  const [continueCount, setContinueCount] = useState(0);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [genreWindow, setGenreWindow] = useState<PopularWindow>("now");
  const [genreItems, setGenreItems] = useState<MediaItem[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setContinueCount(
        readContinueList().filter((item) => item.mediaType === mediaType).length,
      );
    };
    refresh();
    window.addEventListener("strain-continue-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("strain-continue-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [mediaType]);

  useEffect(() => {
    if (tab !== "categories") return;
    let active = true;
    setGenreId(null);
    setGenres([]);
    void getGenres(mediaType)
      .then((list) => {
        if (!active) return;
        setGenres(list);
        setGenreId(list[0]?.id ?? null);
      })
      .catch(() => {
        if (active) setGenreError("Could not load categories");
      });
    return () => {
      active = false;
    };
  }, [mediaType, tab]);

  useEffect(() => {
    if (tab !== "categories" || genreId == null) return;
    let active = true;
    setGenreLoading(true);
    setGenreError(null);
    void discoverByGenre(mediaType, genreId, genreWindow)
      .then((items) => {
        if (!active) return;
        setGenreItems(items);
      })
      .catch(() => {
        if (!active) return;
        setGenreItems([]);
        setGenreError("Could not load this category");
      })
      .finally(() => {
        if (active) setGenreLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mediaType, tab, genreId, genreWindow]);

  useEffect(() => {
    if (searching) return;
    const paths = [
      ...shelves.flatMap((shelf) =>
        (catalogs[shelf.key] ?? []).map((item) => item.posterPath),
      ),
      ...readContinueList()
        .filter((item) => item.mediaType === mediaType)
        .map((item) => item.posterPath),
    ];
    void syncCatalogPosters(mediaType, paths);
  }, [mediaType, shelves, catalogs, searching]);

  if (searching) {
    if (searchItems.length === 0) {
      return (
        <div className="empty-panel px-6 py-16 text-center">
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
      );
    }

    return (
      <>
        <p className="mb-4 text-sm text-[var(--muted)]">
          {searchItems.length} result{searchItems.length === 1 ? "" : "s"} for “
          {query}”
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {searchItems.map((item, index) => (
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
    );
  }

  const activeShelf = shelves.find((shelf) => shelf.key === tab);

  return (
    <div>
      <div className="shelf-tabs" role="tablist" aria-label="Shelves">
        <TabButton
          active={tab === "continue"}
          onClick={() => setTab("continue")}
          label={
            continueCount > 0
              ? `Continue watching (${continueCount})`
              : "Continue watching"
          }
        />
        {shelves.map((shelf) => (
          <TabButton
            key={shelf.key}
            active={tab === shelf.key}
            onClick={() => setTab(shelf.key)}
            label={shelf.title}
          />
        ))}
        <TabButton
          active={tab === "categories"}
          onClick={() => setTab("categories")}
          label="Categories"
        />
      </div>

      {tab === "categories" ? (
        <CategoryBrowser
          genres={genres}
          genreId={genreId}
          window={genreWindow}
          items={genreItems}
          loading={genreLoading}
          error={genreError}
          onGenre={setGenreId}
          onWindow={setGenreWindow}
        />
      ) : tab === "continue" ? (
        <ContinueWatchingRow mediaType={mediaType} />
      ) : activeShelf ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(catalogs[activeShelf.key] ?? []).map((item, index) => (
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
      ) : null}
    </div>
  );
}

function CategoryBrowser({
  genres,
  genreId,
  window,
  items,
  loading,
  error,
  onGenre,
  onWindow,
}: {
  genres: Genre[];
  genreId: number | null;
  window: PopularWindow;
  items: MediaItem[];
  loading: boolean;
  error: string | null;
  onGenre: (id: number) => void;
  onWindow: (window: PopularWindow) => void;
}) {
  return (
    <div>
      <div className="shelf-tabs" role="tablist" aria-label="Categories">
        {genres.map((genre) => (
          <TabButton
            key={genre.id}
            active={genreId === genre.id}
            onClick={() => onGenre(genre.id)}
            label={genre.name}
          />
        ))}
      </div>
      <div className="shelf-tabs" role="tablist" aria-label="Sort category">
        {POPULAR_WINDOWS.map((option) => (
          <TabButton
            key={option.key}
            active={window === option.key}
            onClick={() => onWindow(option.key)}
            label={option.title}
          />
        ))}
      </div>
      {error ? (
        <p className="text-sm text-red-200">{error}</p>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-[18px] bg-[var(--surface)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-panel px-6 py-16 text-center">
          <p className="text-lg text-[var(--fg)]">Nothing in this category for that period</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={active ? "on" : undefined}
    >
      {label}
    </button>
  );
}
