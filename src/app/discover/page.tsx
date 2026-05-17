import type { OpportunityType } from "@/generated/prisma/client";
import { Header } from "@/components/Header";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SyncButton } from "@/components/SyncButton";
import { prisma } from "@/lib/prisma";

const FILTER_TYPES: { value: OpportunityType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "OPEN_SOURCE", label: "Open Source" },
  { value: "COMPETITION", label: "Competitions" },
  { value: "FELLOWSHIP", label: "Fellowships" },
  { value: "INTERNSHIP", label: "Internships" },
  { value: "HACKATHON", label: "Hackathons" },
  { value: "MENTORSHIP", label: "Mentorship" },
  { value: "SCHOLARSHIP", label: "Scholarships" },
];

type PageProps = {
  searchParams: Promise<{
    type?: string;
    q?: string;
    featured?: string;
    remote?: string;
    pakistan?: string;
    sort?: string;
  }>;
};

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type as OpportunityType | undefined;
  const q = params.q?.trim();
  const featured = params.featured === "true";
  const remote = params.remote === "true";
  const pakistan = params.pakistan === "true";
  const sortDeadline = params.sort === "deadline";

  let opportunities = await prisma.opportunity.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(featured ? { isFeatured: true } : {}),
      ...(remote ? { isRemote: true } : {}),
      ...(pakistan ? { pakistanEligible: true } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { organization: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: sortDeadline
      ? [{ deadline: "asc" }, { updatedAt: "desc" }]
      : [
          { isFeatured: "desc" },
          { pakistanEligible: "desc" },
          { relevanceScore: "desc" },
          { updatedAt: "desc" },
        ],
    take: 80,
  });

  if (sortDeadline) {
    opportunities = opportunities.filter(
      (o) => o.deadline && o.deadline > new Date(),
    );
  }

  const total = await prisma.opportunity.count();
  const pkCount = await prisma.opportunity.count({ where: { pakistanEligible: true } });
  const lastSync = await prisma.opportunitySource.findFirst({
    where: { lastSyncedAt: { not: null } },
    orderBy: { lastSyncedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Live opportunities
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Auto-synced from Remote OK, Remotive, Hacker News & more. Programs tagged for
              Pakistani students where eligibility is detected.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {total} total · {pkCount} Pakistan-eligible
              {lastSync?.lastSyncedAt &&
                ` · Synced ${lastSync.lastSyncedAt.toLocaleString()}`}
            </p>
          </div>
          <SyncButton />
        </div>

        <form className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row lg:flex-wrap lg:items-end">
          <label className="min-w-[200px] flex-1">
            <span className="mb-1 block text-xs font-medium text-zinc-500">Search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="gsoc, internship, icpc…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-zinc-500">Type</span>
            <select
              name="type"
              defaultValue={type ?? ""}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {FILTER_TYPES.map((t) => (
                <option key={t.label} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="pakistan" value="true" defaultChecked={pakistan} />
            Pakistan eligible
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="remote" value="true" defaultChecked={remote} />
            Remote only
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="sort" value="deadline" defaultChecked={sortDeadline} />
            By deadline
          </label>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Apply filters
          </button>
        </form>

        {opportunities.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-lg font-medium">No matches</p>
            <p className="mt-2 text-sm text-zinc-500">
              Click <strong>Refresh live data</strong> to pull the latest listings.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}