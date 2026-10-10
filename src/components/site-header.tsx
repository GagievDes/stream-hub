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

function libraryPath(pathname: string) {
  if (pathname === "/tv" || pathname.startsWith("/tv/")) return "/tv";
  return "/movies";
}

export function SiteHeader() {
  const pathname = usePathname();
  const atHome = pathname === "/";
  const searchHref = libraryPath(pathname);

  function onSearchClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== searchHref) return;
    const input = document.getElementById("library-search");
    if (!(input instanceof HTMLInputElement)) return;
    event.preventDefault();
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <Link
            href={searchHref}
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
              className={pathname.startsWith(link.href) ? "on" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
