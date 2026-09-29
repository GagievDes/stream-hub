import type { Metadata } from "next";
import { WatchPage } from "@/components/watch-page";
import { getDetails } from "@/lib/tmdb";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; e?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getDetails("tv", Number(id));
  return {
    title: details?.title ?? "TV Series",
  };
}

export default async function TvWatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s, e } = await searchParams;
  return (
    <WatchPage
      mediaType="tv"
      id={Number(id)}
      season={Math.max(1, Number(s) || 1)}
      episode={Math.max(1, Number(e) || 1)}
    />
  );
}
