/** Detect Pakistan / international eligibility from opportunity text. */
const PAKISTAN_POSITIVE = [
  "pakistan",
  "pakistani",
  "south asia",
  "international",
  "global",
  "worldwide",
  "all countries",
  "any country",
  "no geographic",
  "open to all",
  "students worldwide",
  "remote",
  "work from anywhere",
];

const RESTRICTED = [
  "us only",
  "u.s. only",
  "united states only",
  "must be u.s. citizen",
  "eu only",
  "european union only",
  "uk only",
  "canada only",
  "citizens only",
];

const GLOBAL_PROGRAM_IDS = new Set([
  "gsoc",
  "outreachy",
  "lfx-mentorship",
  "icpc",
  "hacktoberfest",
  "github-education",
  "devpost-hackathons",
  "codeforces",
  "atcoder",
]);

export function detectPakistanEligibility(input: {
  title: string;
  description: string;
  eligibility?: string | null;
  isRemote?: boolean;
  externalId?: string;
  type?: string;
}): { pakistanEligible: boolean; isGlobal: boolean; regions: string[] } {
  const text = `${input.title} ${input.description} ${input.eligibility ?? ""}`.toLowerCase();

  if (input.externalId && GLOBAL_PROGRAM_IDS.has(input.externalId)) {
    return { pakistanEligible: true, isGlobal: true, regions: ["global", "pakistan"] };
  }

  const hasRestriction = RESTRICTED.some((r) => text.includes(r));
  if (hasRestriction) {
    return { pakistanEligible: false, isGlobal: false, regions: [] };
  }

  const mentionsPakistan = text.includes("pakistan") || text.includes("pakistani");
  const isInternational = PAKISTAN_POSITIVE.some((p) => text.includes(p));

  if (mentionsPakistan) {
    return { pakistanEligible: true, isGlobal: false, regions: ["pakistan"] };
  }

  if (isInternational || input.isRemote) {
    return {
      pakistanEligible: true,
      isGlobal: true,
      regions: ["global"],
    };
  }

  if (
    input.type === "OPEN_SOURCE" ||
    input.type === "COMPETITION" ||
    input.type === "HACKATHON"
  ) {
    return { pakistanEligible: true, isGlobal: true, regions: ["global"] };
  }

  return { pakistanEligible: false, isGlobal: true, regions: [] };
}
