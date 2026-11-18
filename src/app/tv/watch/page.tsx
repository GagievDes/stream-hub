"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WatchPage } from "@/components/watch-page";

function TvWatchInner() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const seasonRaw = searchParams.get("s");
  const episodeRaw = searchParams.get("e");
  const season = seasonRaw == null ? undefined : Math.max(1, Number(seasonRaw) || 1);
  const episode = episodeRaw == null ? undefined : Math.max(1, Number(episodeRaw) || 1);
  return (
    <WatchPage mediaType="tv" id={id} season={season} episode={episode} />
  );
}

export default function TvWatchRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-16">
          <div className="h-40 animate-pulse rounded-md bg-[var(--surface)]" />
        </div>
      }
    >
      <TvWatchInner />
    </Suspense>
  );
}
