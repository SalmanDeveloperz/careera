import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Calendar, Flag, MapPin, Star } from "lucide-react";
import type { Opportunity, OpportunityType } from "@/generated/prisma/client";
import { cn, parseJsonArray } from "@/lib/utils";

const TYPE_LABELS: Record<OpportunityType, string> = {
  INTERNSHIP: "Internship",
  JOB: "Job",
  SCHOLARSHIP: "Scholarship",
  COMPETITION: "Competition",
  OPEN_SOURCE: "Open Source",
  FELLOWSHIP: "Fellowship",
  HACKATHON: "Hackathon",
  EVENT: "Event",
  CERTIFICATION: "Certification",
  MENTORSHIP: "Mentorship",
};

const TYPE_COLORS: Record<OpportunityType, string> = {
  INTERNSHIP: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  JOB: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  SCHOLARSHIP: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  COMPETITION: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  OPEN_SOURCE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  FELLOWSHIP: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  HACKATHON: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
  EVENT: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  CERTIFICATION: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  MENTORSHIP: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
};

type Props = {
  opportunity: Opportunity & { matchScore?: number };
};

export function OpportunityCard({ opportunity }: Props) {
  const tags = parseJsonArray(opportunity.tags).slice(0, 4);

  return (
    <article className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            TYPE_COLORS[opportunity.type],
          )}
        >
          {TYPE_LABELS[opportunity.type]}
        </span>
        {opportunity.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Star className="h-3 w-3" />
            Featured
          </span>
        )}
        {opportunity.pakistanEligible && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <Flag className="h-3 w-3" />
            PK eligible
          </span>
        )}
        {opportunity.deadline && opportunity.deadline > new Date() && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {formatDistanceToNow(opportunity.deadline, { addSuffix: true })}
          </span>
        )}
        {opportunity.matchScore !== undefined && (
          <span className="ml-auto text-xs text-zinc-500">
            Match {Math.round(opportunity.matchScore)}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {opportunity.title}
      </h3>
      {opportunity.organization && (
        <p className="mt-1 text-sm text-zinc-500">{opportunity.organization}</p>
      )}
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {opportunity.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
        {opportunity.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {opportunity.isRemote ? "Remote" : opportunity.location}
          </span>
        )}
        {opportunity.deadline && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Deadline {formatDistanceToNow(opportunity.deadline, { addSuffix: true })}
          </span>
        )}
      </div>

      <a
        href={opportunity.applyUrl ?? opportunity.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition group-hover:bg-indigo-700"
      >
        View opportunity
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </article>
  );
}
