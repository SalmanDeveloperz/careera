import type { OpportunityType, OpportunityStatus } from "@/generated/prisma/client";

export type RawOpportunity = {
  externalId?: string;
  title: string;
  description: string;
  type: OpportunityType;
  status?: OpportunityStatus;
  organization?: string;
  location?: string;
  isRemote?: boolean;
  url: string;
  applyUrl?: string;
  domains?: string[];
  tags?: string[];
  skillsRequired?: string[];
  eligibility?: string;
  stipend?: string;
  deadline?: Date | null;
  startsAt?: Date | null;
  publishedAt?: Date | null;
  isCurated?: boolean;
  isFeatured?: boolean;
  pakistanEligible?: boolean;
  isGlobal?: boolean;
  eligibleRegions?: string[];
};

export type FeedFilters = {
  type?: OpportunityType;
  domain?: string;
  q?: string;
  remote?: boolean;
  featured?: boolean;
  limit?: number;
};
