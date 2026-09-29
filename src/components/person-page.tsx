import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MediaCard } from "@/components/media-card";
import {
  getPerson,
  getPersonCredits,
  profileUrl,
  yearFromDate,
} from "@/lib/tmdb";

export async function PersonPage({ id }: { id: number }) {
  if (!Number.isFinite(id) || id <= 0) notFound();

  const person = await getPerson(id);
  if (!person) notFound();

  const credits = await getPersonCredits(id);
  const movies = credits.filter((c) => c.mediaType === "movie");
  const shows = credits.filter((c) => c.mediaType === "tv");
  const photo = profileUrl(person.profilePath, "h632");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden bg-[var(--surface-2)] md:mx-0 md:w-56">
          {photo ? (
            <Image
              src={photo}
              alt={person.name}
              fill
              priority
              className="object-cover"
              sizes="224px"
            />
          ) : (
            <div className="flex h-full items-end p-4">
              <span className="font-[family-name:var(--font-display)] text-6xl text-[var(--line)]">
                {person.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 animate-rise text-center md:text-left">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            {person.knownForDepartment || "Cast"}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--fg)] sm:text-5xl md:text-6xl">
            {person.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--muted)] md:justify-start">
            {person.birthday ? (
              <span>Born {yearFromDate(person.birthday)}</span>
            ) : null}
            {person.placeOfBirth ? <span>{person.placeOfBirth}</span> : null}
          </div>
          {person.biography ? (
            <p className="mt-5 max-w-3xl text-[var(--muted)] leading-relaxed">
              {person.biography.length > 600
                ? `${person.biography.slice(0, 600).trim()}…`
                : person.biography}
            </p>
          ) : null}
        </div>
      </div>

      {movies.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl tracking-wide">
            Movies
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.slice(0, 20).map((item) => (
              <MediaCard key={`movie-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {shows.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl tracking-wide">
            TV Series
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shows.slice(0, 20).map((item) => (
              <MediaCard key={`tv-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {movies.length === 0 && shows.length === 0 ? (
        <p className="mt-12 text-[var(--muted)]">No other titles found.</p>
      ) : null}
    </div>
  );
}
