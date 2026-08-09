import Link from "next/link";
import { Logo } from "@/components/logo";

export function LandingHero() {
  return (
    <section className="relative px-4 pb-8 pt-12 text-center sm:px-6 sm:pt-20 md:pt-28">
      <div className="mx-auto max-w-3xl opacity-0 animate-fade-in-up stagger-1">
        <p className="glass-pill mb-6 inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300" />
          From chaos to clarity in seconds
        </p>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.15] opacity-0 animate-fade-in-up stagger-2 sm:text-5xl md:text-6xl lg:text-7xl">
        Make your classes{" "}
        <span className="bg-gradient-to-r from-[#9aadff] via-[#b8a8ff] to-[#d4a8ff] bg-clip-text text-transparent">
          actually make sense.
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground opacity-0 animate-fade-in-up stagger-3 sm:text-xl">
        Upload videos, slides, pictures, and notes. CourseMap keeps every detail,
        rebuilds them into a navigable digital notebook, and lets you ask an
        assistant to find, rewrite, or elaborate.
      </p>

      <div className="mt-10 opacity-0 animate-fade-in-up stagger-4">
        <Link
          href="/generate"
          className="glass-button inline-flex h-14 items-center justify-center rounded-3xl px-10 text-base font-bold text-primary-foreground transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
        >
          Generate FREE course map
        </Link>
      </div>
    </section>
  );
}

export function LandingHeader() {
  return (
    <header className="glass-soft relative z-10 mx-4 mt-4 rounded-3xl px-5 py-4 sm:mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo href="/" />
        <Link
          href="/generate"
          className="glass-button hidden rounded-full px-5 py-2 text-sm font-bold text-primary-foreground sm:inline-flex"
        >
          Try free
        </Link>
        <span className="glass-pill hidden rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground md:block">
          Messy materials → structured understanding
        </span>
      </div>
    </header>
  );
}
