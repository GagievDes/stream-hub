import type { MediaType } from "@/lib/types";

export const CONTINUE_STORAGE_KEY = "strain-stream-continue";
export const EXPANDED_SEASON_KEY = "strain-stream-expanded-season";

export type ContinueItem = {
  mediaType: MediaType;
  id: number;
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
  updatedAt: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readContinueList(): ContinueItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(CONTINUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContinueItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === "number" && item.title)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function writeContinueList(items: ContinueItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(items.slice(0, 40)));
  window.dispatchEvent(new Event("strain-continue-updated"));
}

export function upsertContinueItem(item: Omit<ContinueItem, "updatedAt">) {
  const list = readContinueList().filter(
    (entry) => !(entry.mediaType === item.mediaType && entry.id === item.id),
  );
  list.unshift({ ...item, updatedAt: Date.now() });
  writeContinueList(list);
}

export function removeContinueItem(mediaType: MediaType, id: number) {
  writeContinueList(
    readContinueList().filter(
      (entry) => !(entry.mediaType === mediaType && entry.id === id),
    ),
  );
}

export function getExpandedSeason(showId: number, fallback: number): number {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(`${EXPANDED_SEASON_KEY}:${showId}`);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

export function setExpandedSeason(showId: number, season: number) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(`${EXPANDED_SEASON_KEY}:${showId}`, String(season));
}

export function continueHref(item: ContinueItem): string {
  if (item.mediaType === "tv") {
    const s = item.season ?? 1;
    const e = item.episode ?? 1;
    return `/tv/${item.id}?s=${s}&e=${e}`;
  }
  return `/movies/${item.id}`;
}

export function continueSubtitle(item: ContinueItem): string {
  if (item.mediaType === "tv") {
    return `S${item.season ?? 1} · E${item.episode ?? 1}`;
  }
  return "Resume movie";
}
