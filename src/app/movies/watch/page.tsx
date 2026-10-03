"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WatchPage } from "@/components/watch-page";

function MovieWatchInner() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  return <WatchPage mediaType="movie" id={id} />;
}

export default function MovieWatchRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-16">
          <div className="h-40 animate-pulse rounded-md bg-[var(--surface)]" />
        </div>
      }
    >
      <MovieWatchInner />
    </Suspense>
  );
}
