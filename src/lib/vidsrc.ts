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

/** framextv.tech redirects here. Auto lets their player pick a provider. */
const EMBED_ORIGIN = "https://framextv.xyz";

export const EMBED_SOURCES: EmbedSource[] = [
  {
    id: "auto",
    label: "Auto",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options),
  },
  {
    id: "super_barbarian",
    label: "Barbarian",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "super_barbarian"),
  },
  {
    id: "miner",
    label: "Miner",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "miner"),
  },
  {
    id: "headhunter",
    label: "Headhunter",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "headhunter"),
  },
];

function buildFrameEmbed(
  mediaType: MediaType,
  tmdbId: number,
  options?: { season?: number; episode?: number },
  server?: string,
): string {
  const path =
    mediaType === "movie"
      ? `/embed/${tmdbId}`
      : `/embed/${tmdbId}/${options?.season ?? 1}/${options?.episode ?? 1}`;
  const params = new URLSearchParams({
    autoplay: "1",
    muted: "0",
  });
  if (server) params.set("server", server);
  return `${EMBED_ORIGIN}${path}?${params.toString()}`;
}

export function getEmbedUrl(
  mediaType: MediaType,
  tmdbId: number,
  options?: { season?: number; episode?: number },
  sourceId: string = "auto",
): string {
  const source =
    EMBED_SOURCES.find((item) => item.id === sourceId) ?? EMBED_SOURCES[0];
  return source.buildUrl(mediaType, tmdbId, options);
}
