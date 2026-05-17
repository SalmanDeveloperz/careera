import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Compass,
  Globe2,
  Layers,
  Radar,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { OpportunityCard } from "@/components/OpportunityCard";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featured = await prisma.opportunity.findMany({
    where: { isFeatured: true },
    orderBy: { relevanceScore: "desc" },
    take: 6,
  });

  const total = await prisma.opportunity.count();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-transparent to-transparent dark:from-indigo-950/40" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <Logo size="lg" href="" className="mb-8" />
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              GenAI-intelligent career guidance
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Career guidance for students with no roadmap
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Built for CS students at agriculture universities and campuses everywhere — pick
              your path, get a step-by-step roadmap, and discover global opportunities
              (including programs open to Pakistan) synced in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Start your profile
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
              >
                <Bot className="h-4 w-4" />
                AI Guide
              </Link>
              <Link
                href="/discover?pakistan=true"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <Compass className="h-4 w-4" />
                {total > 0 ? `${total}+` : ""} opportunities
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Why Careera
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Radar,
                title: "Real-time ingestion",
                desc: "RSS feeds, APIs, and curated sources sync on demand so listings stay current.",
              },
              {
                icon: Layers,
                title: "Hidden gems surfaced",
                desc: "Programs like GSoC, Outreachy, and LFX — not just generic job boards.",
              },
              {
                icon: Bot,
                title: "Smart matching",
                desc: "Rank opportunities by your skills, interests, and field of study.",
              },
              {
                icon: Globe2,
                title: "Built to scale",
                desc: "PostgreSQL-ready schema, notifications, roadmaps — your full FYP vision.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Icon className="h-8 w-8 text-indigo-600" />
                <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {featured.length > 0 && (
          <section className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Featured programs
                  </h2>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    High-impact opportunities every CS student should know
                  </p>
                </div>
                <Link
                  href="/discover?featured=true"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all
                </Link>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
