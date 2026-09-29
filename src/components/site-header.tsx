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
        "sticky top-0 z-40 border-b transition-colors duration-300",
        onHome
          ? "border-transparent"
          : "border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:h-16">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-[0.1em] text-[var(--fg)] transition-opacity hover:opacity-80 sm:text-2xl"
        >
          LUMINA
        </Link>
        {!onHome ? (
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
        ) : (
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Local app
          </span>
        )}
      </div>
    </header>
  );
}
