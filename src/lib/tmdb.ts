import {
  isUsingMockData,
  mockDetails,
  mockPopular,
  mockSearch,
} from "./mock-data";
import type { MediaDetails, MediaItem, MediaType } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type TmdbMovieResult = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
};

type TmdbTvResult = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
};

type TmdbMovieDetails = TmdbMovieResult & {
  tagline?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
};

type TmdbTvDetails = TmdbTvResult & {
  tagline?: string;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
};

function apiKey(): string {
  const key = process.env.TMDB_API_KEY?.trim();
  if (!key) {
    throw new Error("TMDB_API_KEY is not configured");
  }
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function mapMovie(item: TmdbMovieResult): MediaItem {
  return {
    id: item.id,
    title: item.title,
    overview: item.overview ?? "",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate: item.release_date ?? null,
    voteAverage: item.vote_average ?? 0,
    mediaType: "movie",
  };
}

function mapTv(item: TmdbTvResult): MediaItem {
  return {
    id: item.id,
    title: item.name,
    overview: item.overview ?? "",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate: item.first_air_date ?? null,
    voteAverage: item.vote_average ?? 0,
    mediaType: "tv",
  };
}

export function posterUrl(
  path: string | null,
  size: "w342" | "w500" | "w780" | "original" = "w500",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(
  path: string | null,
  size: "w780" | "w1280" | "original" = "w1280",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function yearFromDate(date: string | null): string {
  if (!date) return "";
  return date.slice(0, 4);
}

export async function getPopular(type: MediaType): Promise<MediaItem[]> {
  if (isUsingMockData()) {
    return mockPopular(type);
  }

  if (type === "movie") {
    const data = await tmdbFetch<{ results: TmdbMovieResult[] }>("/movie/popular");
    return data.results.map(mapMovie);
  }

  const data = await tmdbFetch<{ results: TmdbTvResult[] }>("/tv/popular");
  return data.results.map(mapTv);
}

export async function searchMedia(
  type: MediaType,
  query: string,
): Promise<MediaItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getPopular(type);
  }

  if (isUsingMockData()) {
    return mockSearch(type, trimmed);
  }

  if (type === "movie") {
    const data = await tmdbFetch<{ results: TmdbMovieResult[] }>("/search/movie", {
      query: trimmed,
      include_adult: "false",
    });
    return data.results.map(mapMovie);
  }

  const data = await tmdbFetch<{ results: TmdbTvResult[] }>("/search/tv", {
    query: trimmed,
    include_adult: "false",
  });
  return data.results.map(mapTv);
}

export async function getDetails(
  type: MediaType,
  id: number,
): Promise<MediaDetails | null> {
  if (isUsingMockData()) {
    return mockDetails(type, id);
  }

  try {
    if (type === "movie") {
      const item = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`);
      return {
        ...mapMovie(item),
        tagline: item.tagline || null,
        runtime: item.runtime ?? null,
        genres: (item.genres ?? []).map((g) => g.name),
        numberOfSeasons: null,
      };
    }

    const item = await tmdbFetch<TmdbTvDetails>(`/tv/${id}`);
    return {
      ...mapTv(item),
      tagline: item.tagline || null,
      runtime: item.episode_run_time?.[0] ?? null,
      genres: (item.genres ?? []).map((g) => g.name),
      numberOfSeasons: item.number_of_seasons ?? null,
    };
  } catch {
    return null;
  }
}

export { isUsingMockData };
