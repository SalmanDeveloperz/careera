import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildGuideResponse, enhanceWithOpenAI } from "@/lib/ai/guide";
import type { StudentProfile } from "@/lib/profile/types";
import { prisma } from "@/lib/prisma";
import { scoreOpportunity } from "@/lib/opportunities/match";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  profile: z
    .object({
      name: z.string().optional(),
      country: z.string(),
      university: z.string().optional(),
      fieldOfStudy: z.string(),
      background: z.string(),
      careerStage: z.string(),
      interests: z.array(z.string()),
      goals: z.array(z.string()),
      skills: z.array(z.string()),
      preferredRoadmapSlug: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { message, profile: rawProfile } = bodySchema.parse(json);

    const profile: StudentProfile = {
      country: rawProfile?.country ?? "PK",
      fieldOfStudy: rawProfile?.fieldOfStudy ?? "Computer Science",
      background: (rawProfile?.background as StudentProfile["background"]) ?? "agriculture",
      careerStage:
        (rawProfile?.careerStage as StudentProfile["careerStage"]) ?? "university-student",
      interests: rawProfile?.interests ?? [],
      goals: rawProfile?.goals ?? [],
      skills: rawProfile?.skills ?? [],
      name: rawProfile?.name,
      university: rawProfile?.university,
      preferredRoadmapSlug: rawProfile?.preferredRoadmapSlug,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    const all = await prisma.opportunity.findMany({ take: 120 });
    const opportunities = all
      .map((o) => ({
        o,
        score: scoreOpportunity(o, {
          skills: profile.skills,
          interests: profile.interests,
          fieldOfStudy: profile.fieldOfStudy,
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map((x) => x.o);

    const baseReply = buildGuideResponse({
      profile,
      opportunities,
      userMessage: message,
    });

    const reply = await enhanceWithOpenAI(
      { profile, opportunities, userMessage: message },
      baseReply,
    );

    return NextResponse.json({
      reply,
      usedAI: Boolean(process.env.OPENAI_API_KEY),
      opportunityCount: opportunities.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat failed",
      },
      { status: 400 },
    );
  }
}
