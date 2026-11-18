import { upsertContinueItem, readContinueList } from "@/lib/continue-watching";
import { nextTvSlot } from "@/lib/episode-advance";
import type { MediaType, TvSeason } from "@/lib/types";

export const PROGRESS_STORAGE_KEY = "strain-stream-progress";

/** Ignore a few seconds at the start so a mis-click does not become "Resume". */
export const MIN_RESUME_SECONDS = 15;
/** Past this fraction the episode counts as finished and Continue moves on. */
export const COMPLETE_RATIO = 0.9;

export type ProgressEntry = {
  position: number;
  duration: number;
  updatedAt: number;
};

export type SeriesResume = {
  season: number;
  episode: number;
  position: number;
  label: string;
  resumable: boolean;
};

type ProgressMap = Record<string, ProgressEntry>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function progressKey(
  mediaType: MediaType,
  id: number,
  season?: number,
  episode?: number,
) {
  if (mediaType === "tv") return `tv:${id}:${season ?? 1}:${episode ?? 1}`;
  return `movie:${id}`;
}

export function readProgressMap(): ProgressMap {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeProgressMap(map: ProgressMap) {
  if (!canUseStorage()) return;
  const entries = Object.entries(map)
    .filter(([, entry]) => entry && typeof entry.position === "number")
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .slice(0, 400);
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
}

export function readProgressEntry(
  mediaType: MediaType,
  id: number,
  season?: number,
  episode?: number,
): ProgressEntry | null {
  const entry = readProgressMap()[progressKey(mediaType, id, season, episode)];
  if (!entry || typeof entry.position !== "number") return null;
  return entry;
}

export function isResumable(position: number, duration: number) {
  if (!Number.isFinite(position) || position < MIN_RESUME_SECONDS) return false;
  if (duration > 60 && position / duration >= COMPLETE_RATIO) return false;
  return true;
}

export function isFinished(position: number, duration: number) {
  return duration > 60 && position / duration >= COMPLETE_RATIO;
}

/** 0–1 for a progress bar. Finished episodes stay full. */
export function watchedFraction(position: number, duration: number) {
  if (isFinished(position, duration)) return 1;
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0 || position <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, position / duration));
}

export function movieResume(id: number): { label: string; position: number; resumable: boolean } {
  const entry = readProgressEntry("movie", id);
  if (entry && isResumable(entry.position, entry.duration)) {
    return { label: "Resume", position: entry.position, resumable: true };
  }
  return { label: "Play", position: 0, resumable: false };
}

function firstSlot(seasons: TvSeason[]) {
  const season = seasons[0];
  return {
    season: season?.seasonNumber ?? 1,
    episode: season?.episodes[0]?.episodeNumber ?? 1,
  };
}

export function seriesResume(id: number, seasons: TvSeason[]): SeriesResume {
  const first = firstSlot(seasons);
  const play: SeriesResume = {
    ...first,
    position: 0,
    label: "Play",
    resumable: false,
  };
  const item = readContinueList().find((entry) => entry.mediaType === "tv" && entry.id === id);
  if (!item?.season || !item.episode) return play;

  const stored = readProgressEntry("tv", id, item.season, item.episode);
  const position = stored?.position ?? item.position ?? 0;
  const duration = stored?.duration ?? item.duration ?? 0;

  if (isResumable(position, duration)) {
    return {
      season: item.season,
      episode: item.episode,
      position,
      label: `Continue S${item.season}:E${item.episode}`,
      resumable: true,
    };
  }

  if (isFinished(position, duration)) {
    const next = nextTvSlot(seasons, item.season, item.episode);
    if (next) {
      return {
        season: next.season,
        episode: next.episode,
        position: 0,
        label: `Continue S${next.season}:E${next.episode}`,
        resumable: false,
      };
    }
    return play;
  }

  return {
    season: item.season,
    episode: item.episode,
    position: 0,
    label: `Continue S${item.season}:E${item.episode}`,
    resumable: false,
  };
}

export function openingRequest(
  mediaType: MediaType,
  id: number,
  seasons: TvSeason[],
  explicitSeason?: number,
  explicitEpisode?: number,
) {
  if (mediaType === "movie") {
    return { season: 1, episode: 1, startAt: movieResume(id).position };
  }
  const resume = seriesResume(id, seasons);
  if (explicitSeason == null && explicitEpisode == null) {
    return { season: resume.season, episode: resume.episode, startAt: resume.position };
  }
  const season = explicitSeason ?? resume.season;
  const episode = explicitEpisode ?? resume.episode;
  return { season, episode, startAt: episodeStartAt(id, season, episode) };
}

export function episodeStartAt(id: number, season: number, episode: number) {
  const entry = readProgressEntry("tv", id, season, episode);
  if (!entry || !isResumable(entry.position, entry.duration)) return 0;
  return entry.position;
}

/**
 * Remember where playback is, and point Continue at the next episode once
 * this one is finished. Called from the player, not from merely opening a title.
 */
export function saveWatchProgress(input: {
  mediaType: MediaType;
  id: number;
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  seasons?: TvSeason[];
}) {
  if (!Number.isFinite(input.position) || input.position < 0) return;
  const position = Math.floor(input.position);
  const duration =
    Number.isFinite(input.duration) && input.duration > 0 ? Math.floor(input.duration) : 0;

  const map = readProgressMap();
  map[progressKey(input.mediaType, input.id, input.season, input.episode)] = {
    position,
    duration,
    updatedAt: Date.now(),
  };
  writeProgressMap(map);

  let season = input.season;
  let episode = input.episode;
  let continuePosition = position;
  let continueDuration = duration;

  if (
    input.mediaType === "tv" &&
    season != null &&
    episode != null &&
    isFinished(position, duration)
  ) {
    const next = nextTvSlot(input.seasons ?? [], season, episode);
    if (next) {
      season = next.season;
      episode = next.episode;
      continuePosition = 0;
      continueDuration = 0;
    }
  }

  upsertContinueItem({
    mediaType: input.mediaType,
    id: input.id,
    title: input.title,
    posterPath: input.posterPath,
    ...(input.mediaType === "tv" ? { season, episode } : {}),
    position: continuePosition,
    duration: continueDuration,
  });
}
