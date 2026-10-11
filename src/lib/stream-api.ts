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

  const response = await fetch(url);
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

export function toWebVtt(text: string) {
  const body = text.replace(/^\uFEFF/, "").replace(/\r+/g, "").trim();
  if (body.startsWith("WEBVTT")) return body;
  const cues = body.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${cues}\n`;
}
