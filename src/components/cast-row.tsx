import Image from "next/image";
import Link from "next/link";
import { profileUrl } from "@/lib/tmdb";
import type { CastMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CastRow({
  cast,
  compact = false,
  className,
}: {
  cast: CastMember[];
  compact?: boolean;
  className?: string;
}) {
  if (cast.length === 0) return null;

  return (
    <section className={cn(compact ? "mt-6" : "mt-12", className)}>
      <h2
        className={cn(
          "mb-3 font-[family-name:var(--font-display)] tracking-wide text-[var(--fg)]",
          compact ? "text-xl" : "mb-4 text-2xl",
        )}
      >
        Cast
      </h2>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2">
        {cast.map((member) => {
          const photo = profileUrl(member.profilePath);
          return (
            <Link
              key={`${member.id}-${member.character}`}
              href={`/person/${member.id}`}
              className={cn(
                "group shrink-0",
                compact ? "w-[72px] sm:w-[80px]" : "w-[96px] sm:w-[108px]",
              )}
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-[var(--surface-2)]">
                {photo ? (
                  <Image
                    src={photo}
                    alt={member.name}
                    fill
                    sizes={compact ? "80px" : "108px"}
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
