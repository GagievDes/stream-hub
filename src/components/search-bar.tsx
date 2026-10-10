"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import type { MediaType } from "@/lib/types";

export function SearchBar({
  mediaType,
  initialQuery = "",
}: {
  mediaType: MediaType;
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const basePath = mediaType === "movie" ? "/movies" : "/tv";
  const label = mediaType === "movie" ? "Movies" : "TV Series";

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <form onSubmit={onSubmit} className="library-search" role="search">
      <Search className="size-4 shrink-0 text-white/55" />
      <input
        id="library-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label}`}
        aria-label={`Search ${label}`}
      />
    </form>
  );
}
