import Link from "next/link";
import { Clapperboard, Tv } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow absolute left-1/2 top-0 h-[55vh] w-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.16),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(40,55,80,0.22),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-10 sm:py-14">
        <div className="mb-10 text-center sm:mb-14">
          <p className="animate-rise font-[family-name:var(--font-display)] text-5xl tracking-[0.14em] text-[var(--fg)] sm:text-7xl">
            LUMINA
          </p>
          <p className="animate-rise-delay mt-3 text-base text-[var(--muted)] sm:text-lg">
            Your local movie &amp; TV library
          </p>
        </div>

        <div className="animate-rise-delay-2 grid flex-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:min-h-[420px]">
          <Link
            href="/movies"
            className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden border border-[var(--line)] bg-[var(--surface)] p-8 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:shadow-[0_0_60px_rgba(212,160,23,0.14)] sm:min-h-[360px] sm:p-10"
          >
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.18),transparent_70%)] transition-transform duration-500 group-hover:scale-125" />
            <Clapperboard className="relative size-12 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 sm:size-16" />
            <div className="relative">
              <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wider text-[var(--fg)] sm:text-6xl lg:text-7xl">
                Movies
              </h1>
              <p className="mt-3 max-w-xs text-sm text-[var(--muted)] sm:text-base">
                Browse and watch films by name
              </p>
              <span className="mt-6 inline-flex text-sm text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">
                Open library →
              </span>
            </div>
          </Link>

          <Link
            href="/tv"
            className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden border border-[var(--line)] bg-[var(--surface)] p-8 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:shadow-[0_0_60px_rgba(212,160,23,0.14)] sm:min-h-[360px] sm:p-10"
          >
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[radial-gradient(circle,rgba(80,120,180,0.2),transparent_70%)] transition-transform duration-500 group-hover:scale-125" />
            <Tv className="relative size-12 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 sm:size-16" />
            <div className="relative">
              <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wider text-[var(--fg)] sm:text-6xl lg:text-7xl">
                TV Series
              </h1>
              <p className="mt-3 max-w-xs text-sm text-[var(--muted)] sm:text-base">
                Find shows and jump to any episode
              </p>
              <span className="mt-6 inline-flex text-sm text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">
                Open library →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
