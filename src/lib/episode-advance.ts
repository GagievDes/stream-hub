import type { TvSeason } from "@/lib/types";

export type TvSlot = {
  season: number;
  episode: number;
};

export type PlaybackSignal =
  | { kind: "progress" }
  | { kind: "ended"; season: number | null; episode: number | null };

const END_STATUSES = new Set([
  "ended",
  "complete",
  "completed",
  "finish",
  "finished",
]);

const PROGRESS_STATUSES = new Set([
  "play",
  "playing",
  "time",
  "timeupdate",
  "seeked",
  "pause",
  "paused",
]);

/** Next episode in the current season, or episode 1 of the following season. */
export function nextTvSlot(
  seasons: TvSeason[],
  season: number,
  episode: number,
): TvSlot | null {
  const seasonIndex = seasons.findIndex((item) => item.seasonNumber === season);
  if (seasonIndex < 0) return null;

  const episodes = seasons[seasonIndex]?.episodes ?? [];
  const episodeIndex = episodes.findIndex(
    (item) => item.episodeNumber === episode,
  );
  if (episodeIndex >= 0 && episodeIndex < episodes.length - 1) {
    return {
      season,
      episode: episodes[episodeIndex + 1].episodeNumber,
    };
  }

  for (let index = seasonIndex + 1; index < seasons.length; index += 1) {
    const first = seasons[index]?.episodes[0];
    if (first) {
      return {
        season: seasons[index].seasonNumber,
        episode: first.episodeNumber,
      };
    }
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asStatus(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function readRecord(data: unknown): Record<string, unknown> | null {
  if (typeof data === "string") {
    try {
      return asRecord(JSON.parse(data));
    } catch {
      return null;
    }
  }
  return asRecord(data);
}

/** Reads end-of-episode and playback messages posted by the embed player. */
export function readPlaybackSignal(data: unknown): PlaybackSignal | null {
  const root = readRecord(data);
  if (!root) return null;

  const nested = asRecord(root.data) ?? root;
  const info = asRecord(nested.player_info) ?? asRecord(root.player_info);
  const rawStatus = asStatus(
    nested.player_status ?? nested.event ?? root.event ?? nested.type,
  );
  const status =
    rawStatus === "player_event" || rawStatus === "media_data" ? "" : rawStatus;
  const season = asNumber(info?.season ?? nested.season ?? root.season);
  const episode = asNumber(info?.episode ?? nested.episode ?? root.episode);

  if (END_STATUSES.has(status)) {
    return { kind: "ended", season, episode };
  }

  const currentTime = asNumber(
    nested.currentTime ?? nested.current_time ?? root.currentTime,
  );
  const duration = asNumber(nested.duration ?? root.duration);
  if (
    duration != null &&
    duration > 60 &&
    currentTime != null &&
    currentTime >= duration - 1.5
  ) {
    return { kind: "ended", season, episode };
  }

  if (PROGRESS_STATUSES.has(status) || currentTime != null) {
    return { kind: "progress" };
  }

  return null;
}

export function shouldAdvanceEpisode(input: {
  signal: PlaybackSignal;
  slot: TvSlot;
  sawPlayback: boolean;
  loadedForMs: number;
}): boolean {
  if (input.signal.kind !== "ended") return false;
  if (input.signal.season != null && input.signal.season !== input.slot.season) {
    return false;
  }
  if (
    input.signal.episode != null &&
    input.signal.episode !== input.slot.episode
  ) {
    return false;
  }
  const identified = input.signal.season != null || input.signal.episode != null;
  if (!identified && !input.sawPlayback && input.loadedForMs < 15_000) {
    return false;
  }
  return true;
}
