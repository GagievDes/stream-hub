import type { MediaType } from "./types";

export type EmbedSource = {
  id: string;
  label: string;
  buildUrl: (
    mediaType: MediaType,
    tmdbId: number,
    options?: { season?: number; episode?: number },
  ) => string;
};

/** Multiple mirrors — vidsrc domains rotate; users can switch if one fails. */
export const EMBED_SOURCES: EmbedSource[] = [
  {
    id: "vidsrc-io",
    label: "Vidsrc.io",
    buildUrl: (mediaType, tmdbId, options) =>
      buildPathEmbed("https://vidsrc.io/embed", mediaType, tmdbId, options),
  },
  {
    id: "vidsrc-me",
    label: "Vidsrc.me",
    buildUrl: (mediaType, tmdbId, options) =>
      buildPathEmbed("https://vidsrc.me/embed", mediaType, tmdbId, options),
  },
  {
    id: "vidsrc-pm",
    label: "Vidsrc.pm",
    buildUrl: (mediaType, tmdbId, options) =>
      buildPathEmbed("https://vidsrc.pm/embed", mediaType, tmdbId, options),
  },
  {
    id: "vidsrc-sh",
    label: "Vidsrc.sh",
    buildUrl: (mediaType, tmdbId, options) =>
      buildPathEmbed("https://vidsrc.sh/embed", mediaType, tmdbId, options),
  },
  {
    id: "2embed",
    label: "2Embed",
    buildUrl: (mediaType, tmdbId, options) => {
      if (mediaType === "movie") {
        return `https://www.2embed.cc/embed/${tmdbId}`;
      }
      const season = options?.season ?? 1;
      const episode = options?.episode ?? 1;
      return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
    },
  },
];

function buildPathEmbed(
  base: string,
  mediaType: MediaType,
  tmdbId: number,
  options?: { season?: number; episode?: number },
): string {
  if (mediaType === "movie") {
    return `${base}/movie/${tmdbId}`;
  }

  const { season, episode } = options ?? {};
  if (season != null && episode != null) {
    return `${base}/tv/${tmdbId}/${season}/${episode}`;
  }
  if (season != null) {
    return `${base}/tv/${tmdbId}/${season}`;
  }
  return `${base}/tv/${tmdbId}`;
}

export function getVidsrcEmbedUrl(
  mediaType: MediaType,
  tmdbId: number,
  options?: { season?: number; episode?: number },
  sourceId: string = "vidsrc-io",
): string {
  const source =
    EMBED_SOURCES.find((s) => s.id === sourceId) ?? EMBED_SOURCES[0];
  return source.buildUrl(mediaType, tmdbId, options);
}
