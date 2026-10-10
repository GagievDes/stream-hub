import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveTvPage } from "@/components/live-tv-page";

export const metadata: Metadata = {
  title: "Live TV",
};

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
          <div className="h-12 animate-pulse rounded-md bg-[var(--surface)]" />
        </main>
      }
    >
      <LiveTvPage />
    </Suspense>
  );
}
