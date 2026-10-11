import type { MediaType } from "@/lib/types";

export type CatalogKey =
  | "popular"
  | "trending"
  | "popular_month"
  | "popular_year"
  | "top_rated"
  | "now_playing"
  | "on_the_air";

export type PopularWindow = "now" | "week" | "month" | "year";

export const POPULAR_WINDOWS: { key: PopularWindow; title: string }[] = [
  { key: "now", title: "Popular right now" },
  { key: "week", title: "This week" },
  { key: "month", title: "This month" },
  { key: "year", title: "This year" },
];

export type CatalogShelf = {
  key: CatalogKey;
  title: string;
};

export function catalogShelves(mediaType: MediaType): CatalogShelf[] {
  if (mediaType === "movie") {
    return [
      { key: "popular", title: "Popular right now" },
      { key: "trending", title: "Trending this week" },
      { key: "popular_month", title: "Popular this month" },
      { key: "popular_year", title: "Popular this year" },
      { key: "top_rated", title: "Top rated" },
      { key: "now_playing", title: "Now playing" },
    ];
  }

  return [
    { key: "popular", title: "Popular right now" },
    { key: "trending", title: "Trending this week" },
    { key: "popular_month", title: "Popular this month" },
    { key: "popular_year", title: "Popular this year" },
    { key: "top_rated", title: "Top rated" },
    { key: "on_the_air", title: "On the air" },
  ];
}
