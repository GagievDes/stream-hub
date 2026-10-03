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
      <div className="scroll-panel max-h-[22rem] overflow-y-auto overscroll-contain pr-1">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {visible.map((member) => {
            const photo = profileUrl(member.profilePath);
            return (
              <Link
                key={`${member.id}-${member.character}`}
                href={personHref(member.id)}
                className="group min-w-0"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-[var(--surface-2)]">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={member.name}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-end p-1.5">
                      <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--line)]">
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
      </div>
    </section>
  );
}
