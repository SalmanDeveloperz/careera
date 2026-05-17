"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type CareerStage,
  type StudentProfile,
  type UniversityBackground,
} from "@/lib/profile/types";
import { saveProfile } from "@/lib/profile/storage";
import { ROADMAP_TEMPLATES } from "@/lib/roadmaps/templates";
import { cn } from "@/lib/utils";

const INTEREST_OPTIONS = [
  "open-source",
  "web-development",
  "mobile",
  "data-science",
  "competitive-programming",
  "cloud-devops",
  "ai-ml",
  "cybersecurity",
  "agri-tech",
  "freelancing",
];

const GOAL_OPTIONS = [
  "internship",
  "gsoc",
  "remote-job",
  "higher-studies",
  "freelance-income",
  "competitions",
  "first-job",
];

type Props = { initial?: Partial<StudentProfile> };

export function OnboardingWizard({ initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    country: "PK",
    fieldOfStudy: "Computer Science",
    background: "agriculture",
    careerStage: "university-student",
    interests: [],
    goals: [],
    skills: [],
    university: "",
    ...initial,
  });

  const steps = ["About you", "Background", "Interests", "Goals", "Roadmap"];

  function toggle(list: string[], item: string) {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  }

  function finish(slug: string) {
    const complete: StudentProfile = {
      country: profile.country ?? "PK",
      city: profile.city,
      name: profile.name,
      university: profile.university,
      degree: profile.degree,
      fieldOfStudy: profile.fieldOfStudy ?? "Computer Science",
      background: (profile.background ?? "agriculture") as UniversityBackground,
      careerStage: (profile.careerStage ?? "university-student") as CareerStage,
      currentYear: profile.currentYear,
      interests: profile.interests ?? [],
      goals: profile.goals ?? [],
      skills: profile.skills ?? [],
      preferredRoadmapSlug: slug,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(complete);
    router.push("/roadmap");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full",
                i <= step ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800",
              )}
            />
            <p className="mt-1 hidden text-xs text-zinc-500 sm:block">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        {step === 0 && (
          <Step title="Tell us about yourself">
            <Field label="Name (optional)">
              <input
                className={inputClass}
                value={profile.name ?? ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
              />
            </Field>
            <Field label="University / Institution">
              <input
                className={inputClass}
                value={profile.university ?? ""}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                placeholder="e.g. UAF Sub Campus Burewala"
              />
            </Field>
            <Field label="Country">
              <select
                className={inputClass}
                value={profile.country ?? "PK"}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              >
                <option value="PK">Pakistan</option>
                <option value="IN">India</option>
                <option value="BD">Bangladesh</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Field of study">
              <input
                className={inputClass}
                value={profile.fieldOfStudy ?? ""}
                onChange={(e) => setProfile({ ...profile, fieldOfStudy: e.target.value })}
              />
            </Field>
          </Step>
        )}

        {step === 1 && (
          <Step title="Your background">
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              This helps us recommend the right roadmap — especially for agriculture universities
              offering CS.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["agriculture", "Agriculture university + CS"],
                  ["computer-science", "CS / IT university"],
                  ["engineering", "Engineering"],
                  ["other", "Other background"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setProfile({ ...profile, background: value as UniversityBackground })
                  }
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition",
                    profile.background === value
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                      : "border-zinc-200 dark:border-zinc-700",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <Field label="Career stage">
              <select
                className={inputClass}
                value={profile.careerStage}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    careerStage: e.target.value as CareerStage,
                  })
                }
              >
                <option value="university-student">University student</option>
                <option value="final-year">Final year</option>
                <option value="fresh-graduate">Fresh graduate</option>
                <option value="early-career">Early career (0–2 years)</option>
              </select>
            </Field>
          </Step>
        )}

        {step === 2 && (
          <Step title="What interests you?">
            <ChipGrid
              options={INTEREST_OPTIONS}
              selected={profile.interests ?? []}
              onToggle={(item) =>
                setProfile({
                  ...profile,
                  interests: toggle(profile.interests ?? [], item),
                })
              }
            />
          </Step>
        )}

        {step === 3 && (
          <Step title="What are your goals?">
            <ChipGrid
              options={GOAL_OPTIONS}
              selected={profile.goals ?? []}
              onToggle={(item) =>
                setProfile({
                  ...profile,
                  goals: toggle(profile.goals ?? [], item),
                })
              }
            />
          </Step>
        )}

        {step === 4 && (
          <Step title="Pick your roadmap">
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              We&apos;ll personalize opportunities and AI guidance to this path.
            </p>
            <div className="space-y-3">
              {ROADMAP_TEMPLATES.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => finish(r.slug)}
                  className="w-full rounded-xl border border-zinc-200 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-700 dark:hover:bg-indigo-950/30"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {r.title}
                    {r.featured && (
                      <span className="ml-2 text-xs font-normal text-indigo-600">Recommended</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.description}</p>
                  <p className="mt-2 text-xs text-zinc-500">{r.durationMonths} months · {r.milestones.length} phases</p>
                </button>
              ))}
            </div>
          </Step>
        )}

        {step < 4 && (
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm text-zinc-600 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm capitalize transition",
            selected.includes(opt)
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-zinc-200 dark:border-zinc-700",
          )}
        >
          {opt.replace(/-/g, " ")}
        </button>
      ))}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950";
