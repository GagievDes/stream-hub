import type { CatalogKey } from "@/lib/categories";
import type { MediaType } from "@/lib/types";

export type TvRowSource = {
  key: string;
  title: string;
  mediaType: MediaType;
  catalog: CatalogKey;
};

/** Home rows reuse the same catalog endpoints as the Movies and TV libraries. */
export const TV_HOME_ROWS: TvRowSource[] = [
  { key: "trending-movies", title: "Trending", mediaType: "movie", catalog: "trending" },
  { key: "popular-movies", title: "Popular Movies", mediaType: "movie", catalog: "popular" },
  { key: "popular-tv", title: "Popular TV", mediaType: "tv", catalog: "popular" },
  { key: "trending-tv", title: "Trending TV", mediaType: "tv", catalog: "trending" },
  { key: "now-playing", title: "Now Playing", mediaType: "movie", catalog: "now_playing" },
  { key: "on-the-air", title: "On the Air", mediaType: "tv", catalog: "on_the_air" },
  { key: "top-movies", title: "Top Rated Movies", mediaType: "movie", catalog: "top_rated" },
  { key: "top-tv", title: "Top Rated TV", mediaType: "tv", catalog: "top_rated" },
];
