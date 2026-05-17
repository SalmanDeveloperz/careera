import Parser from "rss-parser";
import { OpportunityStatus, OpportunityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, toJsonArray } from "@/lib/utils";
import { detectPakistanEligibility } from "./eligibility";
import { parseDeadlineFromText } from "./deadline-parse";
import { CURATED_PROGRAMS } from "./curated-programs";
import { CURATED_SOURCE, LIVE_SOURCES } from "./sources";
import type { RawOpportunity } from "./types";

const rssParser = new Parser({ timeout: 15000 });

function inferTypeFromText(text: string): OpportunityType {
  const lower = text.toLowerCase();
  if (lower.includes("hackathon")) return "HACKATHON";
  if (lower.includes("scholarship") || lower.includes("grant")) return "SCHOLARSHIP";
  if (lower.includes("fellowship")) return "FELLOWSHIP";
  if (lower.includes("competition") || lower.includes("contest")) return "COMPETITION";
  if (lower.includes("mentorship") || lower.includes("mentor")) return "MENTORSHIP";
  if (lower.includes("open source") || lower.includes("gsoc")) return "OPEN_SOURCE";
  if (lower.includes("intern")) return "INTERNSHIP";
  return "JOB";
}

function inferStatus(deadline?: Date | null): OpportunityStatus {
  if (!deadline) return "ACTIVE";
  const now = new Date();
  if (deadline < now) return "CLOSED";
  if (deadline.getTime() - now.getTime() > 1000 * 60 * 60 * 24 * 60) return "UPCOMING";
  return "ACTIVE";
}

async function upsertOpportunity(
  sourceId: string | null,
  raw: RawOpportunity,
): Promise<"created" | "updated" | "skipped"> {
  const baseSlug = slugify(raw.title);
  const slug = raw.externalId ? `${baseSlug}-${raw.externalId}` : baseSlug;

  const deadline =
    raw.deadline ?? parseDeadlineFromText(`${raw.description} ${raw.eligibility ?? ""}`);

  const eligibilityMeta =
    raw.pakistanEligible !== undefined
      ? {
          pakistanEligible: raw.pakistanEligible,
          isGlobal: raw.isGlobal ?? true,
          eligibleRegions: toJsonArray(raw.eligibleRegions ?? []),
        }
      : (() => {
          const detected = detectPakistanEligibility({
            title: raw.title,
            description: raw.description,
            eligibility: raw.eligibility,
            isRemote: raw.isRemote,
            externalId: raw.externalId,
            type: raw.type,
          });
          return {
            pakistanEligible: detected.pakistanEligible,
            isGlobal: detected.isGlobal,
            eligibleRegions: toJsonArray(detected.regions),
          };
        })();

  const data = {
    sourceId,
    externalId: raw.externalId ?? null,
    title: raw.title,
    slug,
    description: raw.description.slice(0, 4000),
    type: raw.type,
    status: raw.status ?? inferStatus(raw.deadline),
    organization: raw.organization ?? null,
    location: raw.location ?? null,
    isRemote: raw.isRemote ?? false,
    url: raw.url,
    applyUrl: raw.applyUrl ?? raw.url,
    domains: toJsonArray(raw.domains ?? []),
    tags: toJsonArray(raw.tags ?? []),
    skillsRequired: toJsonArray(raw.skillsRequired ?? []),
    eligibility: raw.eligibility ?? null,
    stipend: raw.stipend ?? null,
    deadline: deadline ?? null,
    startsAt: raw.startsAt ?? null,
    publishedAt: raw.publishedAt ?? null,
    isCurated: raw.isCurated ?? false,
    isFeatured: raw.isFeatured ?? false,
    ...eligibilityMeta,
    relevanceScore:
      (raw.isFeatured ? 10 : raw.isCurated ? 8 : 5) +
      (eligibilityMeta.pakistanEligible ? 2 : 0),
  };

  if (sourceId && raw.externalId) {
    const existing = await prisma.opportunity.findUnique({
      where: { sourceId_externalId: { sourceId, externalId: raw.externalId } },
    });
    if (existing) {
      await prisma.opportunity.update({ where: { id: existing.id }, data });
      return "updated";
    }
  }

  try {
    await prisma.opportunity.upsert({
      where: { slug },
      create: data,
      update: data,
    });
    return "created";
  } catch {
    return "skipped";
  }
}

async function ensureSource(config: {
  slug: string;
  name: string;
  type: string;
  feedUrl?: string;
  apiUrl?: string;
  websiteUrl?: string;
}) {
  return prisma.opportunitySource.upsert({
    where: { slug: config.slug },
    create: {
      slug: config.slug,
      name: config.name,
      type: config.type,
      feedUrl: config.feedUrl ?? null,
      apiUrl: config.apiUrl ?? null,
      websiteUrl: config.websiteUrl ?? null,
    },
    update: {
      name: config.name,
      feedUrl: config.feedUrl ?? null,
      apiUrl: config.apiUrl ?? null,
      websiteUrl: config.websiteUrl ?? null,
    },
  });
}

async function syncCurated(): Promise<number> {
  const source = await ensureSource(CURATED_SOURCE);
  let count = 0;
  for (const program of CURATED_PROGRAMS) {
    const result = await upsertOpportunity(source.id, program);
    if (result !== "skipped") count += 1;
  }
  await prisma.opportunitySource.update({
    where: { id: source.id },
    data: { lastSyncedAt: new Date() },
  });
  return count;
}

async function syncRemotive(sourceId: string): Promise<number> {
  const res = await fetch("https://remotive.com/api/remote-jobs", {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return 0;

  const body = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
  let count = 0;

  for (const job of body.jobs?.slice(0, 30) ?? []) {
    const title = String(job.title ?? "").trim();
    if (!title) continue;
    const description = String(job.description ?? "").replace(/<[^>]+>/g, " ").slice(0, 2000);

    const raw: RawOpportunity = {
      externalId: `remotive-${job.id ?? title}`,
      title,
      description,
      type: inferTypeFromText(title),
      organization: String(job.company_name ?? "Remote"),
      isRemote: true,
      url: String(job.url ?? "https://remotive.com"),
      location: String(job.candidate_required_location ?? "Remote"),
      tags: ["remote", "remotive"],
      domains: ["software-engineering"],
      publishedAt: job.publication_date ? new Date(String(job.publication_date)) : new Date(),
      deadline: parseDeadlineFromText(description),
    };

    const result = await upsertOpportunity(sourceId, raw);
    if (result !== "skipped") count += 1;
  }
  return count;
}

async function syncRemoteOk(sourceId: string): Promise<number> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return 0;

  const data = (await res.json()) as Array<Record<string, unknown>>;
  let count = 0;

  for (const item of data.slice(1, 40)) {
    const position = String(item.position ?? item.title ?? "").trim();
    if (!position) continue;

    const tags = String(item.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const raw: RawOpportunity = {
      externalId: `remoteok-${item.id ?? position}`,
      title: position,
      description: String(item.description ?? "").replace(/<[^>]+>/g, " ").slice(0, 2000) || position,
      type: inferTypeFromText(position),
      organization: String(item.company ?? "Remote company"),
      isRemote: true,
      url: String(item.url ?? item.apply_url ?? "https://remoteok.com"),
      location: String(item.location ?? "Remote"),
      tags: ["remote", ...tags],
      domains: tags.length ? tags : ["software-engineering"],
      stipend: item.salary ? String(item.salary) : undefined,
      publishedAt: item.date ? new Date(String(item.date)) : new Date(),
    };

    const result = await upsertOpportunity(sourceId, raw);
    if (result !== "skipped") count += 1;
  }
  return count;
}

async function syncRssFeed(
  sourceId: string,
  feedUrl: string,
  defaultType: OpportunityType = "EVENT",
): Promise<number> {
  const feed = await rssParser.parseURL(feedUrl);
  let count = 0;

  for (const item of feed.items.slice(0, 25)) {
    const title = item.title?.trim();
    const link = item.link?.trim();
    if (!title || !link) continue;

    const raw: RawOpportunity = {
      externalId: item.guid ?? item.id ?? link,
      title,
      description: (item.contentSnippet ?? item.content ?? title).slice(0, 2000),
      type: inferTypeFromText(`${title} ${item.categories?.join(" ") ?? ""}`) || defaultType,
      url: link,
      organization: feed.title,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      deadline: parseDeadlineFromText(
        `${item.contentSnippet ?? ""} ${item.content ?? ""} ${title}`,
      ),
      tags: item.categories?.map(String) ?? [],
      domains: item.categories?.map((c) => slugify(String(c))) ?? [],
    };

    const result = await upsertOpportunity(sourceId, raw);
    if (result !== "skipped") count += 1;
  }
  return count;
}

export type SyncResult = {
  curated: number;
  live: number;
  sources: { slug: string; count: number; error?: string }[];
  syncedAt: string;
};

export async function syncAllOpportunities(): Promise<SyncResult> {
  const curated = await syncCurated();
  const sources: SyncResult["sources"] = [];
  let live = 0;

  for (const config of LIVE_SOURCES) {
    try {
      const source = await ensureSource(config);
      let count = 0;

      if (config.type === "api" && config.apiUrl?.includes("remoteok")) {
        count = await syncRemoteOk(source.id);
      } else if (config.type === "api" && config.apiUrl?.includes("remotive")) {
        count = await syncRemotive(source.id);
      } else if (config.type === "rss" && config.feedUrl) {
        const defaultType: OpportunityType =
          config.slug.includes("hackathon") || config.slug.includes("jobs")
            ? "JOB"
            : "EVENT";
        count = await syncRssFeed(source.id, config.feedUrl, defaultType);
      }

      await prisma.opportunitySource.update({
        where: { id: source.id },
        data: { lastSyncedAt: new Date() },
      });

      live += count;
      sources.push({ slug: config.slug, count });
    } catch (error) {
      sources.push({
        slug: config.slug,
        count: 0,
        error: error instanceof Error ? error.message : "Sync failed",
      });
    }
  }

  return {
    curated,
    live,
    sources,
    syncedAt: new Date().toISOString(),
  };
}
