import type { Metadata } from "next";
import { WatchPage } from "@/components/watch-page";
import { getDetails } from "@/lib/tmdb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getDetails("tv", Number(id));
  return {
    title: details?.title ?? "TV Series",
  };
}

export default async function TvWatchPage({ params }: Props) {
  const { id } = await params;
  return <WatchPage mediaType="tv" id={Number(id)} />;
}
