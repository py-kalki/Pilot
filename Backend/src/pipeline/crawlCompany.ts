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
  "/career",
  "/jobs",
  "/job",
  "/hiring",
  "/work-with-us",
  "/join-us",
  "/join",
  "/about/careers",
  "/company/careers",
  "/opportunities",
  "/openings",
  "/careers/",
  "/jobs/",
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

interface ExtractedLink {
  text: string;
  url: string;
}

/** Converts raw HTML to clean text and extracts links */
function htmlToMarkdown(html: string, baseUrl: string): { text: string; links: ExtractedLink[] } {
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "");

  const links: ExtractedLink[] = [];
  const seen = new Set<string>();
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRegex.exec(cleaned)) !== null) {
    let href = m[1].trim();
    const rawText = m[2].replace(/<[^>]+>/g, " ").trim();
    if (href.startsWith("/")) {
      try {
        href = new URL(href, baseUrl).toString();
      } catch {
        continue;
      }
    }
    if (href.startsWith("http") && !seen.has(href)) {
      seen.add(href);
      links.push({ text: rawText, url: href });
    }
  }

  const text = cleaned
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n\n# $1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "\n\n$1\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text: text.slice(0, 10000), links };
}

/**
 * Scrapes a URL using Firecrawl with automatic fallback to native HTTP fetch + HTML extraction.
 */
async function scrapeUrl(url: string): Promise<{ text: string; links: ExtractedLink[] }> {
  if (!url) return { text: "", links: [] };

  // 1. Try Firecrawl
  try {
    const result: any = await firecrawl.scrapeUrl(url, {
      formats: ["markdown", "links"],
    });
    if (result && result.success && result.markdown && result.markdown.length > 50) {
      const links: ExtractedLink[] = [];
      const seen = new Set<string>();

      // Extract markdown links from Firecrawl markdown
      const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
      let match: RegExpExecArray | null;
      while ((match = mdRegex.exec(result.markdown)) !== null) {
        const text = match[1].trim();
        let linkUrl = match[2].trim();
        if (linkUrl.startsWith("/")) {
          try {
            linkUrl = new URL(linkUrl, url).toString();
          } catch {
            continue;
          }
        }
        if (!seen.has(linkUrl)) {
          seen.add(linkUrl);
          links.push({ text, url: linkUrl });
        }
      }

      // Add direct links from Firecrawl response if present
      if (Array.isArray(result.links)) {
        for (const l of result.links) {
          if (typeof l === "string" && l.startsWith("http") && !seen.has(l)) {
            seen.add(l);
            links.push({ text: "", url: l });
          }
        }
      }

      return { text: result.markdown.slice(0, 8000), links };
    }
  } catch (err) {
    console.warn(`[scrapeUrl] Firecrawl failed for ${url} (rate-limit or error), falling back to native fetch:`, err);
  }

  // 2. Fallback: Native HTTP fetch
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const html = await res.text();
      return htmlToMarkdown(html, url);
    }
  } catch (fetchErr) {
    console.warn(`[scrapeUrl] Native fetch failed for ${url}:`, fetchErr);
  }

  return { text: "", links: [] };
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

  const excludedPaths = [
    "/how-it-works",
    "/pricing",
    "/features",
    "/privacy",
    "/terms",
    "/cookie",
    "/blog",
    "/login",
    "/sign-up",
  ];

  // 1. Check extracted links for career-specific keywords in text or url
  for (const link of links) {
    const textLower = link.text.toLowerCase();
    const urlLower = link.url.toLowerCase();

    if (excludedPaths.some((p) => urlLower.includes(p))) {
      continue;
    }

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
  let homeResult = await scrapeUrl(targetUrl);
  if (!homeResult.text && originUrl !== targetUrl) {
    homeResult = await scrapeUrl(originUrl);
  }

  const companyOverview = homeResult.text;
  const homepageLinks = homeResult.links;

  // ── Step 2: Find and Scrape Hiring / Careers Page ───────────
  let careersPage = "";
  let careersUrl = findCareerUrl(homepageLinks, originUrl);
  let careersFound = false;

  if (careersUrl) {
    console.log(`[crawl] Step 2: Found careers page link -> ${careersUrl}`);
    onProgress?.(`💼 Scraping careers page at ${careersUrl}...`);
    const scraped = await scrapeUrl(careersUrl);
    if (scraped.text && scraped.text.length > 100) {
      careersPage = scraped.text;
      careersFound = true;
    }
  }

  // Fallback: test common career paths if not discovered via links
  if (!careersFound) {
    for (const path of CAREER_PATHS) {
      const tryUrl = `${originUrl}${path}`;
      console.log(`[crawl] Testing career path: ${tryUrl}`);
      const scraped = await scrapeUrl(tryUrl);
      if (scraped.text && scraped.text.length > 100) {
        careersPage = scraped.text;
        careersUrl = tryUrl;
        careersFound = true;
        console.log(`[crawl] Careers page found at: ${tryUrl} (${scraped.text.length} chars)`);
        break;
      }
    }
  }

  // ── Step 3: Find and Scrape Specific Job Opening Page ───────
  let jobListing = "";
  let jobUrl: string | null = null;
  let jobRoleFound = false;

  const careersLinks = careersPage ? (await scrapeUrl(careersUrl || originUrl)).links : [];
  const allCandidateLinks = [...careersLinks, ...homepageLinks];

  jobUrl = findMatchingJobUrl(allCandidateLinks, jobRole);

  if (jobUrl) {
    console.log(`[crawl] Step 3: Found matching job role opening -> ${jobUrl}`);
    onProgress?.(`🎯 Crawling specific job description for "${jobRole}"...`);
    const jobContent = await scrapeUrl(jobUrl);
    if (jobContent.text && jobContent.text.length > 100) {
      jobListing = jobContent.text;
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
      if (linkedinContent.text && linkedinContent.text.length > 100) {
        if (!jobListing) {
          jobListing = linkedinContent.text;
          jobRoleFound = true;
          jobUrl = linkedinPage;
        } else {
          jobListing += `\n\n--- LinkedIn Job Posting Details ---\n` + linkedinContent.text.slice(0, 3000);
        }
      }
    } catch {
      // Ignore bot blocks on LinkedIn
    }
  }

  // Build clean, verified pagesUsed list (strictly actual crawled pages, no random marketing sublinks)
  const pagesUsedSet = new Set<string>();
  if (companyOverview) pagesUsedSet.add(targetUrl);
  if (careersFound && careersUrl) pagesUsedSet.add(careersUrl);
  if (jobRoleFound && jobUrl) pagesUsedSet.add(jobUrl);
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
