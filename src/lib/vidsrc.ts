import type { MediaType } from "./types";

const VIDSRC_BASE = "https://vidsrc.io/embed";

/** Build a vidsrc.io embed URL from a TMDB numeric ID. */
export function getVidsrcEmbedUrl(
  mediaType: MediaType,
  tmdbId: number,
  options?: { season?: number; episode?: number },
): string {
  if (mediaType === "movie") {
    return `${VIDSRC_BASE}/movie/${tmdbId}`;
  }

  const { season, episode } = options ?? {};
  if (season != null && episode != null) {
    return `${VIDSRC_BASE}/tv/${tmdbId}/${season}/${episode}`;
  }
  if (season != null) {
    return `${VIDSRC_BASE}/tv/${tmdbId}/${season}`;
  }

  // Series-only URL opens vidsrc's built-in season/episode picker
  return `${VIDSRC_BASE}/tv/${tmdbId}`;
}
