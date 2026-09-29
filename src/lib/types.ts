export type MediaType = "movie" | "tv";

export type MediaItem = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  mediaType: MediaType;
};

export type MediaDetails = MediaItem & {
  tagline: string | null;
  runtime: number | null;
  genres: string[];
  numberOfSeasons: number | null;
};

export type TvEpisode = {
  episodeNumber: number;
  name: string;
};

export type TvSeason = {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes: TvEpisode[];
};
