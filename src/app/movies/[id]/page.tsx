import type { Metadata } from "next";
import { WatchPage } from "@/components/watch-page";
import { getDetails } from "@/lib/tmdb";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getDetails("movie", Number(id));
  return {
    title: details?.title ?? "Movie",
  };
}

export default async function MovieWatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { source } = await searchParams;
  return (
    <WatchPage
      mediaType="movie"
      id={Number(id)}
      sourceId={source}
    />
  );
}
