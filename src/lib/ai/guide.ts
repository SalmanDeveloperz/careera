import type { Opportunity } from "@/generated/prisma/client";
import type { StudentProfile } from "@/lib/profile/types";
import { matchRoadmaps, ROADMAP_TEMPLATES } from "@/lib/roadmaps/templates";
import { parseJsonArray } from "@/lib/utils";
import { scoreOpportunity } from "@/lib/opportunities/match";

export type GuideContext = {
  profile: StudentProfile;
  opportunities: Opportunity[];
  userMessage: string;
};

function formatOpportunity(o: Opportunity): string {
  const deadline = o.deadline
    ? `Deadline: ${o.deadline.toLocaleDateString()}`
    : "Deadline: check official site";
  const pk = o.pakistanEligible ? "✓ Pakistan eligible" : "Eligibility: verify on site";
  return `• **${o.title}** (${o.type}) — ${o.organization ?? "Org TBD"}\n  ${pk} | ${deadline}\n  ${o.url}`;
}

export function buildGuideResponse(ctx: GuideContext): string {
  const { profile, opportunities, userMessage } = ctx;
  const lower = userMessage.toLowerCase();

  const roadmaps = matchRoadmaps({
    background: profile.background,
    fieldOfStudy: profile.fieldOfStudy,
    interests: profile.interests,
    careerStage: profile.careerStage,
  });

  const ranked = opportunities
    .map((o) => ({ o, score: scoreOpportunity(o, { skills: profile.skills, interests: profile.interests, fieldOfStudy: profile.fieldOfStudy }) }))
    .sort((a, b) => b.score - a.score);

  const pkOps = ranked.filter((x) => x.o.pakistanEligible).slice(0, 6);
  const topOps = ranked.slice(0, 6);

  const primaryRoadmap =
    ROADMAP_TEMPLATES.find((r) => r.slug === profile.preferredRoadmapSlug) ?? roadmaps[0];

  if (lower.includes("roadmap") || lower.includes("path") || lower.includes("plan")) {
    const m = primaryRoadmap.milestones
      .map(
        (ms) =>
          `### Phase ${ms.phase}: ${ms.title} (${ms.duration})\n${ms.tasks.map((t) => `- ${t}`).join("\n")}\n**Programs:** ${ms.opportunities.join(", ")}`,
      )
      .join("\n\n");
    return `## Your personalized roadmap: ${primaryRoadmap.title}\n\n${primaryRoadmap.description}\n\n${m}\n\n[View full roadmap](/roadmap) · [Discover opportunities](/discover?pakistan=true)`;
  }

  if (lower.includes("pakistan") || lower.includes("eligible") || lower.includes("international")) {
    if (pkOps.length === 0) {
      return `I couldn't find Pakistan-tagged opportunities in the live database yet. Click **Refresh live data** on Discover, or check global programs like GSoC, Outreachy, and LFX — they typically accept Pakistani students.\n\n[Discover →](/discover?pakistan=true)`;
    }
    return `## Opportunities likely open to Pakistani students\n\n${pkOps.map((x) => formatOpportunity(x.o)).join("\n\n")}\n\n_Always confirm eligibility on the official website._\n\n[See all Pakistan-eligible →](/discover?pakistan=true)`;
  }

  if (lower.includes("agriculture") || lower.includes("uaf") || lower.includes("burewala")) {
    return `## Guidance for CS at an Agriculture University\n\nYou're not alone — many CS students at agriculture universities (including UAF sub-campuses) lack structured tech career paths. Here's what works:\n\n1. **Your edge:** Domain knowledge in agriculture + CS = agri-tech, IoT, data — highlight this in projects.\n2. **Start now:** GitHub, one language, freeCodeCamp or CS50.\n3. **Global programs:** GSoC, LFX, Outreachy don't require top-tier city universities.\n4. **Community:** Find 2–3 seniors or online mentors on LinkedIn.\n\n**Recommended roadmap:** ${primaryRoadmap.title}\n\n${pkOps.slice(0, 4).map((x) => formatOpportunity(x.o)).join("\n\n") || ""}\n\n[Start your roadmap](/roadmap) · [Get started profile](/get-started)`;
  }

  if (lower.includes("gsoc") || lower.includes("open source") || lower.includes("intern")) {
    const filtered = ranked.filter((x) =>
      lower.includes("gsoc")
        ? x.o.title.toLowerCase().includes("gsoc") || parseJsonArray(x.o.tags).includes("gsoc")
        : true,
    );
    const list = (filtered.length ? filtered : topOps).slice(0, 5);
    return `## Matching opportunities\n\n${list.map((x) => formatOpportunity(x.o)).join("\n\n")}\n\n[Discover more](/discover)`;
  }

  const withDeadline = ranked
    .filter((x) => x.o.deadline && x.o.deadline > new Date())
    .sort((a, b) => (a.o.deadline!.getTime() - b.o.deadline!.getTime()))
    .slice(0, 5);

  let intro = `Hi${profile.name ? ` ${profile.name}` : ""}! I'm your Careera guide. `;
  if (profile.university) intro += `I see you're at **${profile.university}** studying **${profile.fieldOfStudy}**. `;

  const deadlineSection =
    withDeadline.length > 0
      ? `\n\n### Upcoming deadlines\n\n${withDeadline.map((x) => formatOpportunity(x.o)).join("\n\n")}`
      : "";

  const pkSection =
    pkOps.length > 0
      ? `\n\n### Pakistan-eligible picks\n\n${pkOps.slice(0, 4).map((x) => formatOpportunity(x.o)).join("\n\n")}`
      : "";

  return `${intro}

**Recommended path:** [${primaryRoadmap.title}](/roadmap)

Ask me about:
- "Show my roadmap"
- "Pakistan eligible internships"
- "I'm from agriculture university doing CS"
- "GSoC preparation"
${deadlineSection}${pkSection}

[Discover all opportunities](/discover) · [Update your profile](/get-started)`;
}

export async function enhanceWithOpenAI(
  ctx: GuideContext,
  baseReply: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return baseReply;

  try {
    const contextOps = ctx.opportunities
      .slice(0, 15)
      .map((o) => `${o.title} | ${o.type} | PK:${o.pakistanEligible} | ${o.url}`)
      .join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Careera, a career guide for students especially from Pakistan and agriculture universities pursuing CS. Be practical, accurate, and encouraging. Use ONLY opportunities from the context list when recommending programs. Mention deadlines when known. If unsure about eligibility, say to verify on the official site. Keep responses under 400 words with markdown.`,
          },
          {
            role: "user",
            content: `Profile: ${JSON.stringify(ctx.profile)}\n\nLive opportunities:\n${contextOps}\n\nDraft answer:\n${baseReply}\n\nUser question: ${ctx.userMessage}\n\nImprove the answer for the user.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!res.ok) return baseReply;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() || baseReply;
  } catch {
    return baseReply;
  }
}
