import { posterUrl } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

const DB_NAME = "strain-stream-poster-cache";
const DB_VERSION = 1;
const STORE = "posters";
const KEEP_KEY = "strain-stream-poster-keep-v1";

type PosterRecord = {
  key: string;
  blob: Blob;
  updatedAt: number;
};

type KeepMap = Partial<Record<MediaType, string[]>>;

function canUseIdb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IDB open failed"));
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IDB request failed"));
  });
}

export function posterCacheKey(posterPath: string, size: "w342" | "w500" = "w500") {
  return `${size}:${posterPath}`;
}

function readKeepMap(): KeepMap {
  try {
    const raw = window.localStorage.getItem(KEEP_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as KeepMap;
  } catch {
    return {};
  }
}

function writeKeepMap(map: KeepMap) {
  try {
    window.localStorage.setItem(KEEP_KEY, JSON.stringify(map));
  } catch {
    // ignore quota issues
  }
}

export async function readCachedPoster(
  posterPath: string,
  size: "w342" | "w500" = "w500",
): Promise<string | null> {
  if (!canUseIdb() || !posterPath) return null;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const record = await idbRequest<PosterRecord | undefined>(
      tx.objectStore(STORE).get(posterCacheKey(posterPath, size)),
    );
    db.close();
    if (!record?.blob) return null;
    return URL.createObjectURL(record.blob);
  } catch {
    return null;
  }
}

async function writeCachedPoster(
  posterPath: string,
  blob: Blob,
  size: "w342" | "w500" = "w500",
) {
  if (!canUseIdb() || !posterPath) return;
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await idbRequest(
    tx.objectStore(STORE).put({
      key: posterCacheKey(posterPath, size),
      blob,
      updatedAt: Date.now(),
    } satisfies PosterRecord),
  );
  db.close();
}

export async function ensurePosterCached(
  posterPath: string | null | undefined,
  size: "w342" | "w500" = "w500",
): Promise<string | null> {
  if (!posterPath) return null;

  const cached = await readCachedPoster(posterPath, size);
  if (cached) return cached;

  const remote = posterUrl(posterPath, size);
  if (!remote) return null;

  try {
    const proxied = await fetch(
      `/api/poster?path=${encodeURIComponent(posterPath)}&size=${size}`,
    );
    const response = proxied.ok ? proxied : await fetch(remote);
    if (!response.ok) return remote;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return remote;
    await writeCachedPoster(posterPath, blob, size);
    return URL.createObjectURL(blob);
  } catch {
    try {
      const response = await fetch(remote);
      if (!response.ok) return remote;
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) return remote;
      await writeCachedPoster(posterPath, blob, size);
      return URL.createObjectURL(blob);
    } catch {
      return remote;
    }
  }
}

async function pruneUnusedPosters(keepKeys: Set<string>) {
  if (!canUseIdb()) return;

  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const allKeys = await idbRequest<IDBValidKey[]>(store.getAllKeys());
    await Promise.all(
      allKeys.map(async (key) => {
        if (!keepKeys.has(String(key))) {
          await idbRequest(store.delete(key));
        }
      }),
    );
    db.close();
  } catch {
    // ignore prune failures
  }
}

/** Download missing catalog posters and drop thumbnails no longer referenced. */
export async function syncCatalogPosters(
  mediaType: MediaType,
  posterPaths: Array<string | null | undefined>,
  size: "w342" | "w500" = "w500",
) {
  if (!canUseIdb()) return;

  const unique = [
    ...new Set(
      posterPaths.filter((path): path is string => Boolean(path && path.startsWith("/"))),
    ),
  ];
  const typeKeys = unique.map((path) => posterCacheKey(path, size));

  const keepMap = readKeepMap();
  keepMap[mediaType] = typeKeys;
  writeKeepMap(keepMap);

  const keepKeys = new Set([
    ...(keepMap.movie ?? []),
    ...(keepMap.tv ?? []),
  ]);

  const concurrency = 4;
  for (let i = 0; i < unique.length; i += concurrency) {
    const batch = unique.slice(i, i + concurrency);
    await Promise.all(batch.map((path) => ensurePosterCached(path, size)));
  }

  await pruneUnusedPosters(keepKeys);
}
