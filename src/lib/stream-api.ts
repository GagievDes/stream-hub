export type StreamSubtitle = {
  index: number;
  label: string;
  url: string;
};

export type StreamSource = {
  url: string;
  quality: string;
};

const STREAM_API = "https://api.framextv.tech/api/stream";

function subtitleLabel(raw: string, index: number) {
  const cleaned = raw.replace(/^subtitles\s*[•·|-]\s*/i, "").trim();
  return cleaned || `Subtitle ${index + 1}`;
}

export async function fetchStream(input: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  provider?: string;
  signal?: AbortSignal;
}): Promise<{ sources: StreamSource[]; subtitles: StreamSubtitle[] }> {
  const url = new URL(STREAM_API);
  url.searchParams.set("type", input.mediaType === "tv" ? "tv" : "movie");
  url.searchParams.set("id", String(input.tmdbId));
  if (input.mediaType === "tv") {
    url.searchParams.set("season", String(input.season ?? 1));
    url.searchParams.set("episode", String(input.episode ?? 1));
  }
  if (input.provider && input.provider !== "auto") {
    url.searchParams.set("provider", input.provider);
  }

  const response = await fetch(url, { signal: input.signal });
  if (!response.ok) {
    throw new Error(`Stream request failed (${response.status})`);
  }
  const data = (await response.json()) as {
    sources?: { url?: string; quality?: string }[];
    subtitles?: { url?: string; label?: string; lang?: string }[];
  };

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

export function isPlaylistUrl(url: string) {
  let path = url;
  try {
    path = decodeURIComponent(url);
  } catch {
    path = url;
  }
  path = path.split("?")[0].toLowerCase();
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
