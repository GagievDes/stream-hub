import Image from "next/image";
import Link from "next/link";
import { profileUrl } from "@/lib/tmdb";
import type { CastMember } from "@/lib/types";

export function CastRow({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--fg)]">
        Cast
      </h2>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {cast.map((member) => {
          const photo = profileUrl(member.profilePath);
          return (
            <Link
              key={`${member.id}-${member.character}`}
              href={`/person/${member.id}`}
              className="group w-[112px] shrink-0 sm:w-[128px]"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-[var(--surface-2)]">
                {photo ? (
                  <Image
                    src={photo}
                    alt={member.name}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-end p-3">
                    <span className="font-[family-name:var(--font-display)] text-4xl text-[var(--line)]">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-[var(--fg)] group-hover:text-[var(--accent)]">
                {member.name}
              </p>
              {member.character ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
                  {member.character}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
