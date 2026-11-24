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

/** Current embed host. A new host is tried only before a picture has started. */
export const EMBED_ORIGIN = "https://framextv.cc";

type EmbedMessage = Record<string, unknown>;
type EmbedTarget = {
  contentWindow?: { postMessage: (message: EmbedMessage, origin: string) => void } | null;
} | null;

let activeOrigin = EMBED_ORIGIN;
let pendingPlay: EmbedMessage | null = null;

export function currentEmbedOrigin() {
  return activeOrigin;
}

export function playNeedsRecovery() {
  return pendingPlay !== null;
}

export function notePlaybackStarted() {
  pendingPlay = null;
}

export function postToEmbed(frame: EmbedTarget, message: EmbedMessage) {
  const target = frame?.contentWindow;
  if (!target) return;
  if (message.action === "play") pendingPlay = message;
  if (message.action === "pause") pendingPlay = null;
  target.postMessage(message, activeOrigin);
}

/** Switch hosts only while a play command is still waiting, then send that play once. */
export function recoverEmbedOrigin(origin: string, frame?: EmbedTarget) {
  if (!pendingPlay || !origin.startsWith("https://") || origin === activeOrigin) return;
  activeOrigin = origin;
  const command = pendingPlay;
  pendingPlay = null;
  frame?.contentWindow?.postMessage(command, activeOrigin);
}

/**
 * Order is time-to-first-frame, fastest first. Auto lets the embed probe
 * several hosts before it shows a picture, so it is the last resort.
 * A host that has already started playing is never swapped on a stall.
 */
export const EMBED_SOURCES: EmbedSource[] = [
  {
    id: "hog_rider",
    label: "Hog Rider",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "hog_rider"),
  },
  {
    id: "lavahound",
    label: "Lava Hound",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "lavahound"),
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
  {
    id: "super_barbarian",
    label: "Barbarian",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "super_barbarian"),
  },
  {
    id: "bowler",
    label: "Bowler",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "bowler"),
  },
  {
    id: "backup",
    label: "Backup",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options, "backup"),
  },
  {
    id: "auto",
    label: "Auto",
    buildUrl: (mediaType, tmdbId, options) =>
      buildFrameEmbed(mediaType, tmdbId, options),
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
    controls: "0",
    // Their player adds a third-party ad script only when this page is
    // embedded on another site. no_ads is the switch that player already checks.
    no_ads: "1",
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
