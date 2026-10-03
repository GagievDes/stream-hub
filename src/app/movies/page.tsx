import type { Metadata } from "next";
import { BrowsePage } from "@/components/browse-page";

export const metadata: Metadata = {
  title: "Movies",
};

export default function MoviesPage() {
  return <BrowsePage mediaType="movie" />;
}
