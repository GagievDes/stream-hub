import Link from "next/link";
import { Clapperboard, Tv } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.18),transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-[50vh] w-[50vw] bg-[radial-gradient(circle_at_bottom_right,rgba(60,80,120,0.2),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,239,232,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,232,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-16 sm:py-24">
        <p className="animate-rise font-[family-name:var(--font-display)] text-6xl tracking-[0.12em] text-[var(--fg)] sm:text-8xl md:text-9xl">
          LUMINA
        </p>
        <h1 className="animate-rise-delay mt-4 max-w-xl text-xl text-[var(--fg)] sm:text-2xl">
          Watch by name — not by ID.
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Pick Movies or TV Series, search The Movie Database for titles you
          know, then play through vidsrc with the matching TMDB ID handled for
          you.
        </p>

        <div className="animate-rise-delay-2 mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/movies"
            className="group flex items-center justify-between gap-4 border border-[var(--line)] bg-[var(--surface)] px-6 py-5 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:shadow-[0_0_40px_rgba(212,160,23,0.12)] sm:min-w-[240px]"
          >
            <span className="flex items-center gap-3">
              <Clapperboard className="size-5 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110" />
              <span className="font-[family-name:var(--font-display)] text-2xl tracking-wider">
                Movies
              </span>
            </span>
            <span className="text-[var(--muted)] transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/tv"
            className="group flex items-center justify-between gap-4 border border-[var(--line)] bg-[var(--surface)] px-6 py-5 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:shadow-[0_0_40px_rgba(212,160,23,0.12)] sm:min-w-[240px]"
          >
            <span className="flex items-center gap-3">
              <Tv className="size-5 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110" />
              <span className="font-[family-name:var(--font-display)] text-2xl tracking-wider">
                TV Series
              </span>
            </span>
            <span className="text-[var(--muted)] transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
