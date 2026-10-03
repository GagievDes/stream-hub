import type { MediaType } from "@/lib/types";

export function watchHref(
  mediaType: MediaType,
  id: number,
  season?: number,
  episode?: number,
): string {
  const qs = new URLSearchParams({ id: String(id) });
  if (mediaType === "tv") {
    if (season) qs.set("s", String(season));
    if (episode) qs.set("e", String(episode));
  }
  return mediaType === "movie"
    ? `/movies/watch?${qs.toString()}`
    : `/tv/watch?${qs.toString()}`;
}

export function personHref(id: number): string {
  return `/person/bio?id=${id}`;
}
