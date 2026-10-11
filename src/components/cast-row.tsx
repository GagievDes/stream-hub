"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { personHref } from "@/lib/paths";
import { profileUrl } from "@/lib/tmdb";
import type { CastMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CastRow({
  cast,
  className,
}: {
  cast: CastMember[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || open) return;
    setOverflows(row.scrollWidth > row.clientWidth + 1);
  }, [cast, open]);

  if (cast.length === 0) return null;

  return (
    <section className={cn("mt-8", className)}>
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--fg)]">
        Cast
      </h2>
      <div
        ref={rowRef}
        className={cn("flex gap-x-3 gap-y-4", open ? "flex-wrap" : "flex-nowrap overflow-hidden")}
      >
        {cast.map((member) => (
          <CastThumb key={`${member.id}-${member.character}`} member={member} />
        ))}
      </div>
      {open || overflows ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-3 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs text-white transition-colors hover:border-white hover:bg-white/15"
        >
          {open ? "Show less" : "Show all"}
        </button>
      ) : null}
    </section>
  );
}

function CastThumb({ member }: { member: CastMember }) {
  const photo = profileUrl(member.profilePath);
  return (
    <Link href={personHref(member.id)} className="group w-16 shrink-0">
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
}
