import { NextRequest, NextResponse } from "next/server";
import type { OpportunityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as OpportunityType | null;
  const domain = searchParams.get("domain");
  const q = searchParams.get("q");
  const remote = searchParams.get("remote") === "true";
  const featured = searchParams.get("featured") === "true";
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const opportunities = await prisma.opportunity.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(remote ? { isRemote: true } : {}),
      ...(featured ? { isFeatured: true } : {}),
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
    orderBy: [{ isFeatured: "desc" }, { relevanceScore: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: { source: true },
  });

  const filtered = domain
    ? opportunities.filter((o) =>
        parseJsonArray(o.domains).some((d) =>
          d.toLowerCase().includes(domain.toLowerCase()),
        ),
      )
    : opportunities;

  return NextResponse.json({
    count: filtered.length,
    opportunities: filtered.map((o) => ({
      ...o,
      domains: parseJsonArray(o.domains),
      tags: parseJsonArray(o.tags),
      skillsRequired: parseJsonArray(o.skillsRequired),
    })),
  });
}
