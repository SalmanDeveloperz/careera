"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfileOrDefault } from "@/lib/profile/storage";
import { ROADMAP_TEMPLATES, type RoadmapTemplate } from "@/lib/roadmaps/templates";
import { cn } from "@/lib/utils";

export function RoadmapViewer() {
  const [roadmap, setRoadmap] = useState<RoadmapTemplate | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const profile = getProfileOrDefault();
    const found =
      ROADMAP_TEMPLATES.find((r) => r.slug === profile.preferredRoadmapSlug) ??
      ROADMAP_TEMPLATES[0];
    setRoadmap(found);
    try {
      const saved = localStorage.getItem("careera-roadmap-progress");
      if (saved) setCompleted(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  function toggleTask(phase: string, task: string) {
    const key = `${phase}:${task}`;
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    localStorage.setItem("careera-roadmap-progress", JSON.stringify(next));
  }

  if (!roadmap) return null;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{roadmap.title}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{roadmap.description}</p>
        <p className="mt-3 text-sm text-indigo-700 dark:text-indigo-300">
          ~{roadmap.durationMonths} months · {roadmap.milestones.length} phases
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/discover?pakistan=true"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Pakistan-eligible opportunities
          </Link>
          <Link
            href="/guide"
            className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-700 dark:text-indigo-300"
          >
            Ask AI Guide
          </Link>
        </div>
      </div>

      <div className="relative space-y-0">
        {roadmap.milestones.map((ms, idx) => (
          <div key={ms.phase} className="relative flex gap-6 pb-10">
            {idx < roadmap.milestones.length - 1 && (
              <div className="absolute left-[15px] top-10 h-full w-0.5 bg-indigo-200 dark:bg-indigo-900" />
            )}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {ms.phase}
            </div>
            <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {ms.title}
                </h3>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800">
                  {ms.duration}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {ms.tasks.map((task) => {
                  const key = `${ms.phase}:${task}`;
                  const done = completed[key];
                  return (
                    <li key={task}>
                      <button
                        type="button"
                        onClick={() => toggleTask(ms.phase, task)}
                        className="flex w-full items-start gap-2 text-left text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        {done ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                        )}
                        <span className={cn(done && "line-through opacity-60")}>{task}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {ms.opportunities.length > 0 && (
                <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Related programs
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ms.opportunities.map((op) => (
                      <Link
                        key={op}
                        href={`/discover?q=${encodeURIComponent(op)}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-indigo-950"
                      >
                        {op.replace(/-/g, " ")}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Switch roadmap anytime from{" "}
        <Link href="/get-started" className="text-indigo-600 hover:underline">
          Get Started
        </Link>
      </div>
    </div>
  );
}