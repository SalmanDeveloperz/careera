export type CareerStage =
  | "university-student"
  | "final-year"
  | "fresh-graduate"
  | "early-career";

export type UniversityBackground =
  | "agriculture"
  | "computer-science"
  | "engineering"
  | "business"
  | "other";

export type StudentProfile = {
  name?: string;
  country: string;
  city?: string;
  university?: string;
  degree?: string;
  fieldOfStudy: string;
  background: UniversityBackground;
  careerStage: CareerStage;
  currentYear?: number;
  interests: string[];
  goals: string[];
  skills: string[];
  preferredRoadmapSlug?: string;
  completedOnboarding: boolean;
  updatedAt: string;
};

export const DEFAULT_PROFILE: StudentProfile = {
  country: "PK",
  fieldOfStudy: "Computer Science",
  background: "agriculture",
  careerStage: "university-student",
  interests: [],
  goals: [],
  skills: [],
  completedOnboarding: false,
  updatedAt: new Date().toISOString(),
};
