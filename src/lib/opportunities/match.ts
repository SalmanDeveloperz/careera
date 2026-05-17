import type { Opportunity } from "@/generated/prisma/client";
import { parseJsonArray } from "@/lib/utils";

export type UserSignals = {
  skills?: string[];
  interests?: string[];
  fieldOfStudy?: string;
  experienceLevel?: string;
};

function normalizeToken(value: string): string {
  return value.toLowerCase().trim();
}

export function scoreOpportunity(
  opportunity: Opportunity,
  signals: UserSignals,
): number {
  let score = opportunity.relevanceScore;
  const tags = parseJsonArray(opportunity.tags).map(normalizeToken);
  const domains = parseJsonArray(opportunity.domains).map(normalizeToken);
  const skills = parseJsonArray(opportunity.skillsRequired).map(normalizeToken);

  const userSkills = (signals.skills ?? []).map(normalizeToken);
  const userInterests = (signals.interests ?? []).map(normalizeToken);

  for (const skill of userSkills) {
    if (skills.includes(skill) || tags.includes(skill)) score += 3;
    if (domains.includes(skill)) score += 2;
  }

  for (const interest of userInterests) {
    if (tags.includes(interest) || domains.includes(interest)) score += 4;
  }

  if (signals.fieldOfStudy) {
    const field = normalizeToken(signals.fieldOfStudy);
    if (
      opportunity.title.toLowerCase().includes(field) ||
      opportunity.description.toLowerCase().includes(field)
    ) {
      score += 2;
    }
  }

  if (opportunity.isFeatured) score += 2;
  if (opportunity.isCurated) score += 1;
  if (opportunity.deadline) {
    const days =
      (opportunity.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days > 0 && days < 30) score += 2;
  }

  return score;
}
