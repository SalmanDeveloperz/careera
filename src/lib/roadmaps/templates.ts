export type RoadmapMilestone = {
  phase: string;
  title: string;
  duration: string;
  tasks: string[];
  opportunities: string[];
};

export type RoadmapTemplate = {
  slug: string;
  title: string;
  description: string;
  audience: string[];
  domains: string[];
  durationMonths: number;
  milestones: RoadmapMilestone[];
  featured?: boolean;
};

export const ROADMAP_TEMPLATES: RoadmapTemplate[] = [
  {
    slug: "cs-from-agriculture-uni",
    title: "CS Student from Agriculture University",
    description:
      "Built for students at agriculture universities (e.g. UAF sub-campuses) pursuing CS with little structured guidance. Combines fundamentals, open source, and global remote opportunities Pakistanis can access.",
    audience: ["agriculture", "computer-science", "university-student"],
    domains: ["software-engineering", "open-source"],
    durationMonths: 24,
    featured: true,
    milestones: [
      {
        phase: "1",
        title: "Foundation (Semester 1–2)",
        duration: "6 months",
        tasks: [
          "Master one language (Python or C++)",
          "Complete freeCodeCamp Responsive Web Design or CS50x",
          "Learn Git & GitHub — push 3 small projects",
          "Join university CS society / peer study group",
        ],
        opportunities: ["github-education", "freecodecamp"],
      },
      {
        phase: "2",
        title: "Build visible proof (Year 2)",
        duration: "6 months",
        tasks: [
          "Solve 50+ problems on LeetCode Easy/Medium or Codeforces",
          "Contribute to 1 open-source repo (good-first-issue)",
          "Build a full-stack mini project (agri-tech idea = great portfolio)",
          "Apply for GitHub Student Developer Pack",
        ],
        opportunities: ["hacktoberfest", "codeforces", "github-education"],
      },
      {
        phase: "3",
        title: "Global programs (Year 3)",
        duration: "6 months",
        tasks: [
          "Target GSoC / LFX / Outreachy — start contributing in winter",
          "Join ICPC or local coding contests",
          "Write technical blog posts on LinkedIn",
          "Connect with 5 alumni working in tech",
        ],
        opportunities: ["gsoc", "lfx-mentorship", "outreachy", "icpc"],
      },
      {
        phase: "4",
        title: "Career launch (Final year+)",
        duration: "6 months",
        tasks: [
          "Apply to remote internships (Remote OK, company career pages)",
          "Prepare resume: projects > grades for most tech roles",
          "Practice interviews — NeetCode / mock interviews",
          "Consider freelancing on Upwork with portfolio",
        ],
        opportunities: ["remote-internships", "devpost-hackathons"],
      },
    ],
  },
  {
    slug: "open-source-developer",
    title: "Open Source Developer Path",
    description: "From first contribution to GSoC/LFX and maintainer experience.",
    audience: ["computer-science", "fresh-graduate"],
    domains: ["open-source"],
    durationMonths: 12,
    milestones: [
      {
        phase: "1",
        title: "First contributions",
        duration: "3 months",
        tasks: ["Pick a CNCF or Mozilla project", "Fix documentation or small bugs", "Attend community calls"],
        opportunities: ["hacktoberfest", "apache-mentorship"],
      },
      {
        phase: "2",
        title: "Mentorship programs",
        duration: "6 months",
        tasks: ["Apply to GSoC, LFX, or Outreachy", "Maintain contribution streak on GitHub"],
        opportunities: ["gsoc", "lfx-mentorship", "outreachy"],
      },
    ],
  },
  {
    slug: "competitive-programming",
    title: "Competitive Programming & Tech Interviews",
    description: "ICPC, Codeforces, and algorithmic roles.",
    audience: ["computer-science"],
    domains: ["competitive-programming"],
    durationMonths: 18,
    milestones: [
      {
        phase: "1",
        title: "Core algorithms",
        duration: "6 months",
        tasks: ["Striver / CP sheet", "Codeforces Div 2 participation weekly"],
        opportunities: ["codeforces", "atcoder", "icpc"],
      },
    ],
  },
  {
    slug: "remote-global-intern",
    title: "Remote Global Internships",
    description: "Remote roles and fellowships open to Pakistani students.",
    audience: ["fresh-graduate", "early-career"],
    domains: ["software-engineering"],
    durationMonths: 6,
    milestones: [
      {
        phase: "1",
        title: "Profile & applications",
        duration: "3 months",
        tasks: ["Optimize LinkedIn + GitHub", "Apply to 5 remote roles weekly", "Tailor CV per role"],
        opportunities: ["remoteok", "mlh-fellowship"],
      },
    ],
  },
];

export function matchRoadmaps(profile: {
  background: string;
  fieldOfStudy: string;
  interests: string[];
  careerStage: string;
}): RoadmapTemplate[] {
  const scored = ROADMAP_TEMPLATES.map((r) => {
    let score = 0;
    if (r.audience.includes(profile.background)) score += 5;
    if (profile.background === "agriculture" && r.slug === "cs-from-agriculture-uni") score += 10;
    for (const i of profile.interests) {
      if (r.domains.some((d) => d.includes(i) || i.includes(d))) score += 3;
    }
    if (r.featured) score += 1;
    return { r, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((x) => x.r);
}
