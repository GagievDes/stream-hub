"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { MediaCard } from "@/components/media-card";
import { searchLiveChannels, LIVE_CATEGORIES, type LiveChannel } from "@/lib/live-channels";
import { searchAll } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const trimmed = query.trim();
  const [value, setValue] = useState(query);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    if (!trimmed) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    void searchAll(trimmed)
      .then((next) => {
        if (!active) return;
        setItems(next);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setItems([]);
        setError(reason instanceof Error ? reason.message : "Search failed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [trimmed]);

  const movies = items.filter((item) => item.mediaType === "movie");
  const series = items.filter((item) => item.mediaType === "tv");
  const channels = searchLiveChannels(trimmed);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = value.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <main className="search-page mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="library-title">Search</h1>
        <p className="library-lead">Movies, series, and live channels</p>
      </div>

      <form onSubmit={onSubmit} className="library-search mb-10 max-w-2xl" role="search">
        <Search className="size-4 shrink-0 text-white/55" />
        <input
          id="global-search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search everything"
          aria-label="Search everything"
          autoFocus
        />
      </form>

      {!trimmed ? null : error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] animate-pulse rounded-[18px] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : movies.length + series.length + channels.length === 0 ? (
        <div className="empty-panel px-6 py-16 text-center">
          <p className="text-lg text-[var(--fg)]">No results</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Nothing matched “{trimmed}”.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <ResultGroup title="Movies" items={movies} />
          <ResultGroup title="TV Series" items={series} />
          {channels.length > 0 ? <LiveResults channels={channels} /> : null}
        </div>
      )}
    </main>
  );
}

function ResultGroup({ title, items }: { title: string; items: MediaItem[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function LiveResults({ channels }: { channels: LiveChannel[] }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
        Live
      </h2>
      <ul className="side-panel divide-y divide-[var(--line)] overflow-hidden">
        {channels.map((channel) => {
          const category =
            LIVE_CATEGORIES.find((item) => item.id === channel.category)?.label ??
            "Live";
          return (
            <li key={channel.id}>
              <Link
                href={`/live?channel=${channel.id}`}
                className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-white/10"
              >
                <span className="font-medium text-[var(--fg)]">{channel.name}</span>
                <span className="shrink-0 text-xs text-[var(--muted)]">{category}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
