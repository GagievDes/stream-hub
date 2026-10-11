import Image from "next/image";
import Link from "next/link";
import { personHref } from "@/lib/paths";
import { profileUrl } from "@/lib/tmdb";
import type { CastMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_CAST = 16;

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
    <section className={cn("mt-8", className)}>
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--fg)]">
        Cast
      </h2>
      <div className="flex flex-wrap gap-x-3 gap-y-4">
        {visible.map((member) => {
          const photo = profileUrl(member.profilePath);
          return (
            <Link
              key={`${member.id}-${member.character}`}
              href={personHref(member.id)}
              className="group w-16 shrink-0"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-[var(--surface-2)]">
                {photo ? (
                  <Image
                    src={photo}
                    alt={member.name}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-end p-1.5">
                    <span className="font-[family-name:var(--font-display)] text-lg text-[var(--line)]">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--fg)] group-hover:text-[var(--accent)]">
                {member.name}
              </p>
              {member.character ? (
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--muted)]">
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
