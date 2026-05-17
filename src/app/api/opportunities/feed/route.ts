import { NextRequest, NextResponse } from "next/server";
import type { OpportunityType } from "@/generated/prisma/client";
import { scoreOpportunity } from "@/lib/opportunities/match";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? [];
  const interests =
    searchParams.get("interests")?.split(",").filter(Boolean) ?? [];
  const field = searchParams.get("field") ?? undefined;
  const type = searchParams.get("type") as OpportunityType | null;
  const limit = Math.min(Number(searchParams.get("limit") ?? 24), 50);

  const opportunities = await prisma.opportunity.findMany({
    where: type ? { type } : {},
    take: 120,
    include: { source: true },
  });

  const ranked = opportunities
    .map((o) => ({
      opportunity: o,
      matchScore: scoreOpportunity(o, {
        skills,
        interests,
        fieldOfStudy: field,
      }),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return NextResponse.json({
    signals: { skills, interests, field },
    feed: ranked.map(({ opportunity, matchScore }) => ({
      matchScore,
      ...opportunity,
      domains: parseJsonArray(opportunity.domains),
      tags: parseJsonArray(opportunity.tags),
      skillsRequired: parseJsonArray(opportunity.skillsRequired),
    })),
  });
}
