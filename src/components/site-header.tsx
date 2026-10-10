"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn, publicAsset } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <>
    <header
      className={cn(
        "site-header sticky top-0 z-40 border-b transition-colors duration-300",
        onHome
          ? "border-transparent bg-transparent"
          : "border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] backdrop-blur-md",
      )}
    >
      <div className="header-bar mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:h-16">
        <Link
          href="/"
          className="brand flex items-center gap-2.5 transition-opacity hover:opacity-85"
        >
          <Image
            src={publicAsset("/logo.png")}
            alt="Strain Stream"
            width={44}
            height={44}
            className="brand-mark size-10 sm:size-11"
            priority
            unoptimized
          />
          <span className="brand-name font-[family-name:var(--font-display)] text-xl tracking-[0.08em] text-[var(--fg)] sm:text-2xl">
            STRAIN STREAM
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {!onHome ? (
          <nav className="page-nav flex items-center gap-1 text-sm">
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
            <Link
              href="/live"
              className={cn(
                "rounded-md px-3 py-2 transition-colors",
                pathname.startsWith("/live")
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              Live TV
            </Link>
          </nav>
          ) : null}
        </div>
      </div>
    </header>
    <nav className="glass-dock" aria-label="Libraries">
      <Link href="/movies" className={pathname.startsWith("/movies") ? "on" : undefined}>
        Movies
      </Link>
      <Link href="/tv" className={pathname.startsWith("/tv") ? "on" : undefined}>
        TV Series
      </Link>
      <Link href="/live" className={pathname.startsWith("/live") ? "on" : undefined}>
        Live TV
      </Link>
    </nav>
    </>
  );
}
