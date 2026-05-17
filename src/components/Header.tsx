import Link from "next/link";
import { Bot, Compass, Map, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo size="md" />
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium text-zinc-600 sm:gap-5 dark:text-zinc-400">
          <Link
            href="/get-started"
            className="hidden items-center gap-1 transition hover:text-indigo-600 sm:inline-flex dark:hover:text-indigo-400"
          >
            <Sparkles className="h-4 w-4" />
            Get Started
          </Link>
          <Link href="/roadmap" className="hidden transition hover:text-indigo-600 sm:inline dark:hover:text-indigo-400">
            <span className="inline-flex items-center gap-1">
              <Map className="h-4 w-4" />
              Roadmap
            </span>
          </Link>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Bot className="h-4 w-4" />
            AI Guide
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Compass className="h-4 w-4" />
            Discover
          </Link>
        </nav>
      </div>
    </header>
  );
}
