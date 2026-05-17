/** RSS and API sources for live opportunity ingestion. Extend this list as you add connectors. */
export const LIVE_SOURCES = [
  {
    slug: "remoteok",
    name: "Remote OK",
    type: "api" as const,
    apiUrl: "https://remoteok.com/api",
    websiteUrl: "https://remoteok.com/",
  },
  {
    slug: "hn-hiring",
    name: "Hacker News — Who is Hiring",
    type: "rss" as const,
    feedUrl: "https://hnrss.org/ask?tags=whoishiring",
    websiteUrl: "https://news.ycombinator.com/",
  },
  {
    slug: "remotive",
    name: "Remotive — Remote Jobs",
    type: "api" as const,
    apiUrl: "https://remotive.com/api/remote-jobs",
    websiteUrl: "https://remotive.com/",
  },
  {
    slug: "hn-remote-jobs",
    name: "HN — Remote Jobs",
    type: "rss" as const,
    feedUrl: "https://hnrss.org/jobs",
    websiteUrl: "https://news.ycombinator.com/",
  },
] as const;

export const CURATED_SOURCE = {
  slug: "careera-curated",
  name: "Careera Curated Programs",
  type: "curated" as const,
  websiteUrl: "https://github.com/",
} as const;
