"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [pending, startTransition] = useTransition();
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
    startTransition(() => {
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search for your favorite ${label}`}
          className="pl-10"
          aria-label={`Search for your favorite ${label}`}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
