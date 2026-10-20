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

/** Current embed host. The iframe follows redirects, and commands use whatever origin talks back. */
export const EMBED_ORIGIN = "https://framextv.cc";

type EmbedMessage = Record<string, unknown>;
type EmbedTarget = {
  contentWindow?: { postMessage: (message: EmbedMessage, origin: string) => void } | null;
} | null;

let activeOrigin = EMBED_ORIGIN;
let lastCommand: EmbedMessage | null = null;

export function currentEmbedOrigin() {
  return activeOrigin;
}

export function postToEmbed(frame: EmbedTarget, message: EmbedMessage) {
  const target = frame?.contentWindow;
  if (!target) return;
  const action = message.action;
  if (action === "play" || action === "pause") lastCommand = message;
  target.postMessage(message, activeOrigin);
}

/** Remember the origin of a message that came from the player frame, and repeat a play or pause that was sent to the previous one. */
export function noteEmbedOrigin(origin: string, frame?: EmbedTarget) {
  if (!origin.startsWith("https://") || origin === activeOrigin) return;
  activeOrigin = origin;
  const command = lastCommand;
  lastCommand = null;
  if (command) frame?.contentWindow?.postMessage(command, activeOrigin);
}

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
