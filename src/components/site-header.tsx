"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent transition-colors duration-300",
        !onHome && "border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--fg)] transition-opacity hover:opacity-80"
        >
          LUMINA
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/movies"
            className={cn(
              "rounded-md px-3 py-2 transition-colors",
              pathname.startsWith("/movies")
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]",
            )}
          >
            Movies
          </Link>
          <Link
            href="/tv"
            className={cn(
              "rounded-md px-3 py-2 transition-colors",
              pathname.startsWith("/tv")
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]",
            )}
          >
            TV Series
          </Link>
        </nav>
      </div>
    </header>
  );
}
