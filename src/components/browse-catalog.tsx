"use client";

import { useEffect, useState } from "react";
import { ContinueWatchingRow } from "@/components/continue-watching-row";
import { MediaCard } from "@/components/media-card";
import { readContinueList } from "@/lib/continue-watching";
import type { CatalogKey, CatalogShelf } from "@/lib/categories";
import type { MediaItem, MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  if (searching) {
    if (searchItems.length === 0) {
      return (
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
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
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
      </div>

      {tab === "continue" ? (
        <ContinueWatchingRow mediaType={mediaType} />
      ) : activeShelf ? (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">{activeShelf.title}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
      className={cn(
        "shrink-0 rounded-md border px-3 py-2 text-sm transition-colors",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--fg)]",
      )}
    >
      {label}
    </button>
  );
}
