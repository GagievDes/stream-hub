"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WatchPage } from "@/components/watch-page";

function TvWatchInner() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const season = Math.max(1, Number(searchParams.get("s")) || 1);
  const episode = Math.max(1, Number(searchParams.get("e")) || 1);
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
