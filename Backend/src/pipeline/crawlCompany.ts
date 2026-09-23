import FirecrawlApp from "@mendable/firecrawl-js";

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || "fc-placeholder",
});

export interface CrawlResult {
  companyOverview: string;
  careersPage: string;
  jobListing: string;
  careersFound: boolean;
  jobRoleFound: boolean;
  careersUrl?: string;
  jobUrl?: string;
  pagesUsed: string[];
}

/** Common career page URL path patterns */
const CAREER_PATHS = [
  "/careers",
  "/jobs",
  "/work-with-us",
  "/join-us",
  "/hiring",
  "/about/careers",
  "/company/careers",
  "/opportunities",
  "/openings",
];

/** ATS domains that often host job descriptions */
const ATS_DOMAINS = [
  "greenhouse.io",
  "lever.co",
  "ashbyhq.com",
  "myworkdayjobs.com",
  "smartrecruiters.com",
  "recruitee.com",
  "bamboohr.com",
  "jobvite.com",
  "workable.com",
  "breezy.hr",
];

function normalizeUrl(url: string): string {
  try {
    const formatted = url.startsWith("http") ? url : `https://${url}`;
    const u = new URL(formatted);
    return u.origin;
  } catch {
    return url;
  }
}

async function scrapeUrl(url: string): Promise<string> {
  if (!url) return "";
  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
    });
    if (result && result.success && result.markdown) {
      // Truncate to keep context concise and relevant
      return result.markdown.slice(0, 8000);
    }
    return "";
  } catch (err) {
    console.warn(`[firecrawl] Scrape failed for ${url}:`, err);
    return "";
  }
}

interface ExtractedLink {
  text: string;
  url: string;
}

/** Extracts markdown and HTML links from scraped content */
function extractLinks(markdown: string, baseUrl: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const seen = new Set<string>();

  // Markdown links: [text](url)
  const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = mdRegex.exec(markdown)) !== null) {
    const text = match[1].trim();
    let url = match[2].trim();

    // Resolve relative URL
    if (url.startsWith("/")) {
      try {
        url = new URL(url, baseUrl).toString();
      } catch {
        continue;
      }
    }

    if (!seen.has(url)) {
      seen.add(url);
      links.push({ text, url });
    }
  }

  return links;
}

/** Finds the best hiring/career page URL from links or fallback paths */
function findCareerUrl(links: ExtractedLink[], baseUrl: string): string | null {
  const careerKeywords = [
    "career",
    "careers",
    "job",
    "jobs",
    "join our team",
    "join us",
    "work with us",
    "we are hiring",
    "we're hiring",
    "open roles",
    "positions",
    "opportunities",
  ];

  // 1. Check extracted links for career-specific keywords in text or url
  for (const link of links) {
    const textLower = link.text.toLowerCase();
    const urlLower = link.url.toLowerCase();

    for (const kw of careerKeywords) {
      if (textLower.includes(kw) || urlLower.includes(kw)) {
        return link.url;
      }
    }
  }

  // 2. Check for ATS links directly on homepage
  for (const link of links) {
    const urlLower = link.url.toLowerCase();
    if (ATS_DOMAINS.some((ats) => urlLower.includes(ats))) {
      return link.url;
    }
  }

  return null;
}

/** Finds a specific job opening link matching the candidate's jobRole */
function findMatchingJobUrl(links: ExtractedLink[], jobRole: string): string | null {
  if (!jobRole || links.length === 0) return null;

  const roleTokens = jobRole
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["and", "for", "the", "with"].includes(w));

  let bestMatch: { url: string; score: number } | null = null;

  for (const link of links) {
    const textLower = link.text.toLowerCase();
    const urlLower = link.url.toLowerCase();

    let score = 0;

    for (const token of roleTokens) {
      if (textLower.includes(token)) score += 3;
      if (urlLower.includes(token)) score += 2;
    }

    // Boost if link points to an ATS platform
    if (ATS_DOMAINS.some((ats) => urlLower.includes(ats))) {
      score += 2;
    }

    // Boost if URL contains /jobs/, /job/, /positions/, /view/
    if (
      urlLower.includes("/job/") ||
      urlLower.includes("/jobs/") ||
      urlLower.includes("/position/") ||
      urlLower.includes("/opening/")
    ) {
      score += 2;
    }

    if (score >= 3 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { url: link.url, score };
    }
  }

  return bestMatch ? bestMatch.url : null;
}

/**
 * Multi-Stage Intelligent Company & Job Crawler:
 * 1. Scrapes company home page for company overview
 * 2. Discovers and scrapes the hiring / careers page
 * 3. Identifies the specific job role opening link and crawls that job page
 * 4. Optionally crawls provided LinkedIn or direct opening link
 */
export async function crawlCompany(
  companyWebsite: string,
  jobRole: string,
  linkedinPage?: string,
  onProgress?: (msg: string) => void
): Promise<CrawlResult> {
  const originUrl = normalizeUrl(companyWebsite);
  const targetUrl = companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`;

  console.log(`[crawl] Step 1: Scraping company overview at ${targetUrl}`);
  onProgress?.("🌐 Scraping company overview...");

  // ── Step 1: Scrape Company Home / Main Page ─────────────────
  let companyOverview = await scrapeUrl(targetUrl);
  if (!companyOverview && originUrl !== targetUrl) {
    companyOverview = await scrapeUrl(originUrl);
  }

  const homepageLinks = companyOverview ? extractLinks(companyOverview, originUrl) : [];

  // ── Step 2: Find and Scrape Hiring / Careers Page ───────────
  let careersPage = "";
  let careersUrl = findCareerUrl(homepageLinks, originUrl);
  let careersFound = false;

  if (careersUrl) {
    console.log(`[crawl] Step 2: Found careers page link -> ${careersUrl}`);
    onProgress?.(`💼 Scraping careers page at ${careersUrl}...`);
    careersPage = await scrapeUrl(careersUrl);
    if (careersPage && careersPage.length > 150) {
      careersFound = true;
    }
  }

  // Fallback: test common career paths if not discovered via links
  if (!careersFound) {
    for (const path of CAREER_PATHS) {
      const tryUrl = `${originUrl}${path}`;
      console.log(`[crawl] Testing career path: ${tryUrl}`);
      const content = await scrapeUrl(tryUrl);
      if (content && content.length > 200) {
        careersPage = content;
        careersUrl = tryUrl;
        careersFound = true;
        console.log(`[crawl] Careers page found at fallback: ${tryUrl}`);
        break;
      }
    }
  }

  // ── Step 3: Find and Scrape Specific Job Opening Page ───────
  let jobListing = "";
  let jobUrl: string | null = null;
  let jobRoleFound = false;

  // Extract all links from the careers page
  const careersLinks = careersPage ? extractLinks(careersPage, careersUrl || originUrl) : [];
  const allCandidateLinks = [...careersLinks, ...homepageLinks];

  jobUrl = findMatchingJobUrl(allCandidateLinks, jobRole);

  if (jobUrl) {
    console.log(`[crawl] Step 3: Found matching job role opening -> ${jobUrl}`);
    onProgress?.(`🎯 Crawling specific job description for "${jobRole}"...`);
    const jobContent = await scrapeUrl(jobUrl);
    if (jobContent && jobContent.length > 150) {
      jobListing = jobContent;
      jobRoleFound = true;
    }
  }

  // If user passed a specific job link directly in the companyWebsite input
  if (
    !jobRoleFound &&
    (targetUrl.includes("/job") ||
      targetUrl.includes("/career") ||
      targetUrl.includes("/position") ||
      targetUrl.includes("/opening") ||
      ATS_DOMAINS.some((ats) => targetUrl.includes(ats)))
  ) {
    jobListing = companyOverview;
    jobUrl = targetUrl;
    jobRoleFound = true;
    careersFound = true;
  }

  // ── Step 4: Crawl LinkedIn / Extra Job Posting if provided ──
  if (linkedinPage) {
    try {
      console.log(`[crawl] Step 4: Crawling provided LinkedIn / Job URL: ${linkedinPage}`);
      onProgress?.("🔗 Crawling LinkedIn job posting...");
      const linkedinContent = await scrapeUrl(linkedinPage);
      if (linkedinContent && linkedinContent.length > 100) {
        if (!jobListing) {
          jobListing = linkedinContent;
          jobRoleFound = true;
          jobUrl = linkedinPage;
        } else {
          jobListing += `\n\n--- LinkedIn Job Posting Details ---\n` + linkedinContent.slice(0, 3000);
        }
      }
    } catch {
      // Ignore bot blocks on LinkedIn
    }
  }

  const pagesUsedSet = new Set<string>();
  if (companyOverview) pagesUsedSet.add(targetUrl);
  if (careersPage && careersUrl) pagesUsedSet.add(careersUrl);
  if (jobListing && jobUrl) pagesUsedSet.add(jobUrl);
  if (linkedinPage) pagesUsedSet.add(linkedinPage);

  const pagesUsed = Array.from(pagesUsedSet);

  console.log(
    `[crawl] Crawl complete. overview=${Boolean(companyOverview)}, careers=${careersFound} (${careersUrl || "n/a"}), jobRoleFound=${jobRoleFound} (${jobUrl || "n/a"}), pagesUsed=${pagesUsed.length}`
  );

  return {
    companyOverview: companyOverview || "Company overview could not be retrieved.",
    careersPage: careersPage || "",
    jobListing: jobListing || "",
    careersFound,
    jobRoleFound,
    careersUrl: careersUrl || undefined,
    jobUrl: jobUrl || undefined,
    pagesUsed,
  };
}
