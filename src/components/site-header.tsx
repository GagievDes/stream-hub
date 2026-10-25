"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { publicAsset } from "@/lib/utils";

const LINKS = [
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Series" },
  { href: "/live", label: "Live TV" },
] as const;

const TV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV" },
  { href: "/live", label: "Live" },
  { href: "/search", label: "Search" },
] as const;

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function tvNavActive(pathname: string, href: string) {
  const path = normalizePath(pathname);
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

function isSearchPath(pathname: string) {
  return pathname === "/search" || pathname === "/search/";
}

function dockActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const atHome = pathname === "/";

  function onSearchClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isSearchPath(pathname)) return;
    const input = document.getElementById("global-search");
    if (!(input instanceof HTMLInputElement)) return;
    event.preventDefault();
    input.focus();
  }

  return (
    <>
      <header className="site-header sticky top-0 z-40">
        <div className="header-bar flex h-16 w-full items-center px-7 sm:px-10">
          <Link href="/" className="brand flex items-center gap-3 transition-opacity hover:opacity-80">
            <Image
              src={publicAsset("/logo.png")}
              alt="Strain Stream"
              width={44}
              height={44}
              className="brand-mark"
              priority
              unoptimized
            />
            <span className="brand-name">Strain Stream</span>
          </Link>
          <nav className="tv-top-nav" aria-label="Sections">
            {TV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={tvNavActive(pathname, link.href) ? "on" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/search"
            className="header-search"
            aria-label="Search"
            onClick={onSearchClick}
          >
            <Search className="size-5" strokeWidth={2.25} />
          </Link>
        </div>
      </header>
      {atHome ? null : (
        <nav className="glass-dock" aria-label="Libraries">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={dockActive(pathname, link.href) ? "on" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
