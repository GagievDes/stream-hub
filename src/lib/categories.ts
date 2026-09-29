import type { MediaType } from "@/lib/types";

export type CatalogKey =
  | "popular"
  | "trending"
  | "top_rated"
  | "now_playing"
  | "on_the_air";

export type CatalogShelf = {
  key: CatalogKey;
  title: string;
};

export function catalogShelves(mediaType: MediaType): CatalogShelf[] {
  if (mediaType === "movie") {
    return [
      { key: "popular", title: "Popular right now" },
      { key: "trending", title: "Trending this week" },
      { key: "top_rated", title: "Top rated" },
      { key: "now_playing", title: "Now playing" },
    ];
  }

  return [
    { key: "popular", title: "Popular right now" },
    { key: "trending", title: "Trending this week" },
    { key: "top_rated", title: "Top rated" },
    { key: "on_the_air", title: "On the air" },
  ];
}
