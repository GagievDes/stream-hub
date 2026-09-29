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

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
};

export type PersonDetails = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownForDepartment: string | null;
};

export type PersonCredit = MediaItem & {
  character: string | null;
};
