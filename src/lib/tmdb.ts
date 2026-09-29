import {
  isUsingMockData,
  mockCast,
  mockDetails,
  mockPerson,
  mockPersonCredits,
  mockPopular,
  mockSearch,
  mockTvSeasons,
} from "./mock-data";
import type {
  CastMember,
  MediaDetails,
  MediaItem,
  MediaType,
  PersonCredit,
  PersonDetails,
  TvSeason,
} from "./types";

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
  seasons?: {
    season_number: number;
    name: string;
    episode_count: number;
  }[];
};

type TmdbSeasonDetails = {
  season_number: number;
  name: string;
  episodes?: {
    episode_number: number;
    name: string;
  }[];
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

export function profileUrl(
  path: string | null,
  size: "w185" | "w342" | "h632" = "w185",
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
  return getCatalog(type, "popular");
}

export async function getCatalog(
  type: MediaType,
  catalog:
    | "popular"
    | "trending"
    | "top_rated"
    | "now_playing"
    | "on_the_air",
): Promise<MediaItem[]> {
  if (isUsingMockData()) {
    // Demo mode reuses the curated popular list for every shelf.
    return mockPopular(type);
  }

  if (catalog === "trending") {
    const data = await tmdbFetch<{
      results: (TmdbMovieResult | TmdbTvResult)[];
    }>(`/trending/${type}/week`);
    return data.results.map((item) =>
      type === "movie"
        ? mapMovie(item as TmdbMovieResult)
        : mapTv(item as TmdbTvResult),
    );
  }

  if (type === "movie") {
    const path =
      catalog === "top_rated"
        ? "/movie/top_rated"
        : catalog === "now_playing"
          ? "/movie/now_playing"
          : "/movie/popular";
    const data = await tmdbFetch<{ results: TmdbMovieResult[] }>(path);
    return data.results.map(mapMovie);
  }

  const path =
    catalog === "top_rated"
      ? "/tv/top_rated"
      : catalog === "on_the_air"
        ? "/tv/on_the_air"
        : "/tv/popular";
  const data = await tmdbFetch<{ results: TmdbTvResult[] }>(path);
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

/** Regular seasons only (skips specials / season 0). */
export async function getTvSeasons(id: number): Promise<TvSeason[]> {
  if (isUsingMockData()) {
    return mockTvSeasons(id);
  }

  try {
    const show = await tmdbFetch<TmdbTvDetails>(`/tv/${id}`);
    const seasonNumbers = (show.seasons ?? [])
      .map((s) => s.season_number)
      .filter((n) => n > 0);

    const seasons = await Promise.all(
      seasonNumbers.map(async (seasonNumber) => {
        const data = await tmdbFetch<TmdbSeasonDetails>(
          `/tv/${id}/season/${seasonNumber}`,
        );
        const episodes = (data.episodes ?? []).map((ep) => ({
          episodeNumber: ep.episode_number,
          name: ep.name || `Episode ${ep.episode_number}`,
        }));
        return {
          seasonNumber,
          name: data.name || `Season ${seasonNumber}`,
          episodeCount: episodes.length,
          episodes,
        } satisfies TvSeason;
      }),
    );

    return seasons.filter((s) => s.episodes.length > 0);
  } catch {
    return [];
  }
}

export async function getCast(
  type: MediaType,
  id: number,
): Promise<CastMember[]> {
  if (isUsingMockData()) {
    return mockCast(type, id);
  }

  try {
    const data = await tmdbFetch<{
      cast: {
        id: number;
        name: string;
        character?: string;
        profile_path: string | null;
        order?: number;
      }[];
    }>(`/${type}/${id}/credits`);

    return (data.cast ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 16)
      .map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character || "",
        profilePath: member.profile_path,
        order: member.order ?? 999,
      }));
  } catch {
    return [];
  }
}

export async function getPerson(id: number): Promise<PersonDetails | null> {
  if (isUsingMockData()) {
    return mockPerson(id);
  }

  try {
    const person = await tmdbFetch<{
      id: number;
      name: string;
      biography?: string;
      birthday?: string | null;
      place_of_birth?: string | null;
      profile_path: string | null;
      known_for_department?: string | null;
    }>(`/person/${id}`);

    return {
      id: person.id,
      name: person.name,
      biography: person.biography || "",
      birthday: person.birthday ?? null,
      placeOfBirth: person.place_of_birth ?? null,
      profilePath: person.profile_path,
      knownForDepartment: person.known_for_department ?? null,
    };
  } catch {
    return null;
  }
}

export async function getPersonCredits(id: number): Promise<PersonCredit[]> {
  if (isUsingMockData()) {
    return mockPersonCredits(id);
  }

  try {
    const data = await tmdbFetch<{
      cast: {
        id: number;
        title?: string;
        name?: string;
        overview?: string;
        poster_path: string | null;
        backdrop_path: string | null;
        release_date?: string;
        first_air_date?: string;
        vote_average?: number;
        character?: string;
        media_type?: "movie" | "tv";
        popularity?: number;
      }[];
    }>(`/person/${id}/combined_credits`);

    const credits = (data.cast ?? [])
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .map((item) => {
        const mediaType = item.media_type as MediaType;
        return {
          id: item.id,
          title: (mediaType === "movie" ? item.title : item.name) || "Untitled",
          overview: item.overview ?? "",
          posterPath: item.poster_path,
          backdropPath: item.backdrop_path,
          releaseDate:
            (mediaType === "movie" ? item.release_date : item.first_air_date) ??
            null,
          voteAverage: item.vote_average ?? 0,
          mediaType,
          character: item.character || null,
        } satisfies PersonCredit;
      })
      .sort((a, b) => {
        const da = a.releaseDate || "";
        const db = b.releaseDate || "";
        return db.localeCompare(da);
      });

    // Dedupe by media type + id
    const seen = new Set<string>();
    return credits.filter((credit) => {
      const key = `${credit.mediaType}-${credit.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

export { isUsingMockData };
