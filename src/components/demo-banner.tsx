import { isUsingMockData } from "@/lib/tmdb";

export function DemoBanner() {
  if (!isUsingMockData()) return null;

  return (
    <div className="border-b border-[var(--accent)]/30 bg-[var(--accent)]/10 px-5 py-2.5 text-center text-sm text-[var(--accent)]">
      Demo mode — curated titles only. Add a free{" "}
      <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">TMDB_API_KEY</code>{" "}
      in <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
      for full search.
    </div>
  );
}
