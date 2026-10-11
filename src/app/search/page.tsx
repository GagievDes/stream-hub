import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/components/search-page";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchRoute() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
          <div className="h-12 animate-pulse rounded-md bg-[var(--surface)]" />
        </main>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
