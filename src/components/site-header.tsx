"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicAsset } from "@/lib/utils";

const LINKS = [
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV Series" },
  { href: "/live", label: "Live TV" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header sticky top-0 z-40">
        <div className="header-bar mx-auto flex h-16 w-full max-w-6xl items-center px-6">
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
        </div>
      </header>
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
    </>
  );
}
