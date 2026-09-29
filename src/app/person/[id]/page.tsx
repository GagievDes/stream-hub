import type { Metadata } from "next";
import { PersonPage } from "@/components/person-page";
import { getPerson } from "@/lib/tmdb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getPerson(Number(id));
  return {
    title: person?.name ?? "Cast",
  };
}

export default async function PersonRoute({ params }: Props) {
  const { id } = await params;
  return <PersonPage id={Number(id)} />;
}
