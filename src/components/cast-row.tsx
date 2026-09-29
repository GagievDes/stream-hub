import Image from "next/image";
import Link from "next/link";
import { profileUrl } from "@/lib/tmdb";
import type { CastMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_CAST = 10;

export function CastRow({
  cast,
  className,
}: {
  cast: CastMember[];
  className?: string;
}) {
  const visible = cast.slice(0, MAX_CAST);
  if (visible.length === 0) return null;

  return (
    <section className={cn("mt-10", className)}>
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--fg)]">
        Cast
      </h2>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {visible.map((member) => {
          const photo = profileUrl(member.profilePath);
          return (
            <Link
              key={`${member.id}-${member.character}`}
              href={`/person/${member.id}`}
              className="group min-w-0"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-[var(--surface-2)]">
                {photo ? (
                  <Image
                    src={photo}
                    alt={member.name}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-end p-2">
                    <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--line)]">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-[var(--fg)] group-hover:text-[var(--accent)]">
                {member.name}
              </p>
              {member.character ? (
                <p className="mt-0.5 line-clamp-2 text-[10px] text-[var(--muted)] sm:text-xs">
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
