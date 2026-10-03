import type { Metadata } from "next";
import { BrowsePage } from "@/components/browse-page";

export const metadata: Metadata = {
  title: "TV Series",
};

export default function TvPage() {
  return <BrowsePage mediaType="tv" />;
}
