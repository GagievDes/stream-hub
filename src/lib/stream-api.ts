export type StreamSubtitle = {
  index: number;
  label: string;
  url: string;
};

export type StreamSource = {
  url: string;
  quality: string;
};

/** Hosts the embed uses. `.tech` answers with a Cloudflare block, so it is not here. */
const STREAM_ENDPOINTS = [
  "https://api.framextv.cc/api/stream",
  "https://api.framextv.pro/api/stream",
];
/**
 * GitHub Pages is not on the API allowlist (localhost and the player hosts are).
 * This is the same worker the player already uses for media, and it answers
 * with Access-Control-Allow-Origin: *.
 */
const CATALOG_PROXY = "https://crap.hybrows.workers.dev/";

function subtitleLabel(raw: string, index: number) {
  const cleaned = raw.replace(/^subtitles\s*[•·|-]\s*/i, "").trim();
  return cleaned || `Subtitle ${index + 1}`;
}

function isAbort(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function catalogUrl(endpoint: string, input: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  provider?: string;
}) {
  const url = new URL(endpoint);
  url.searchParams.set("type", input.mediaType === "tv" ? "tv" : "movie");
  url.searchParams.set("id", String(input.tmdbId));
  if (input.mediaType === "tv") {
    url.searchParams.set("season", String(input.season ?? 1));
    url.searchParams.set("episode", String(input.episode ?? 1));
  }
  if (input.provider && input.provider !== "auto") {
    url.searchParams.set("provider", input.provider);
  }
  return url;
}

async function readCatalog(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Stream request failed (${response.status})`);
  return (await response.json()) as {
    success?: boolean;
    sources?: { url?: string; quality?: string }[];
    subtitles?: { url?: string; label?: string; lang?: string }[];
  };
}

async function readCatalogFromPage(url: string, signal?: AbortSignal) {
  try {
    return await readCatalog(url, signal);
  } catch (error) {
    if (isAbort(error)) throw error;
    const proxy = new URL(CATALOG_PROXY);
    proxy.searchParams.set("url", url);
    return readCatalog(proxy.toString(), signal);
  }
}

export async function fetchStream(input: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  provider?: string;
  signal?: AbortSignal;
}): Promise<{ sources: StreamSource[]; subtitles: StreamSubtitle[] }> {
  let lastError: unknown = new Error("Stream request failed");
  let data: Awaited<ReturnType<typeof readCatalog>> | null = null;
  for (const endpoint of STREAM_ENDPOINTS) {
    try {
      data = await readCatalogFromPage(catalogUrl(endpoint, input).toString(), input.signal);
      break;
    } catch (error) {
      if (isAbort(error)) throw error;
      lastError = error;
    }
  }
  if (!data) throw lastError instanceof Error ? lastError : new Error("Stream request failed");

  const sources = (data.sources ?? [])
    .filter((source) => source.url)
    .map((source) => ({
      url: source.url as string,
      quality: source.quality?.trim() || "Auto",
    }));

  const subtitles = (data.subtitles ?? [])
    .filter((track) => track.url)
    .map((track, index) => ({
      index,
      url: track.url as string,
      label: subtitleLabel(track.label || track.lang || "", index),
    }));

  return { sources, subtitles };
}

/** Menu rows for sources that name a real quality. "Auto" stays the embed. */
export function qualityChoices(sources: StreamSource[]) {
  const seen = new Set<string>();
  const choices: { index: number; label: string; height: number; url: string }[] = [];
  for (const source of sources) {
    const label = source.quality.trim();
    if (!source.url || !label || /^(auto|default)$/i.test(label)) continue;
    if (seen.has(label)) continue;
    seen.add(label);
    choices.push({
      index: choices.length,
      label,
      height: Number(label.match(/(\d{3,4})/)?.[1] ?? 0),
      url: source.url,
    });
  }
  return choices;
}

function mediaTarget(url: string) {
  try {
    const nested = new URL(url).searchParams.get("url");
    if (nested && /^https?:\/\//i.test(nested)) return nested;
  } catch {
    // Relative or malformed urls are judged on their own path.
  }
  return url;
}

export function isPlaylistUrl(url: string) {
  let path = mediaTarget(url);
  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep the raw path when it is not percent-encoded.
  }
  path = path.split("?")[0].split("#")[0].toLowerCase();
  return path.endsWith(".m3u8") || path.endsWith(".m3u");
}

export async function fetchQualities(
  masterUrl: string,
): Promise<{ index: number; label: string; height: number }[]> {
  if (!isPlaylistUrl(masterUrl)) return [];
  const response = await fetch(masterUrl, { headers: { Range: "bytes=0-65535" } });
  const type = (response.headers.get("content-type") || "").toLowerCase();
  const length = Number(response.headers.get("content-length") || 0);
  if (!response.ok && response.status !== 206) {
    await response.body?.cancel();
    return [];
  }
  if (type.startsWith("video/") || (length > 200_000 && !type.includes("mpegurl") && !type.includes("m3u"))) {
    await response.body?.cancel();
    return [];
  }
  const text = await response.text();
  if (!text.includes("#EXTM3U")) return [];
  const levels: { index: number; label: string; height: number }[] = [];
  let index = 0;
  for (const line of text.split("\n")) {
    const match = line.match(/RESOLUTION=\d+x(\d+)/);
    if (!match) continue;
    const height = Number(match[1]);
    levels.push({ index, label: `${height}p`, height });
    index += 1;
  }
  return levels.sort((a, b) => b.height - a.height);
}

export function toWebVtt(text: string) {
  const body = text.replace(/^\uFEFF/, "").replace(/\r+/g, "").trim();
  if (body.startsWith("WEBVTT")) return body;
  const cues = body.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${cues}\n`;
}
