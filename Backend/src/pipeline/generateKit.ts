import { CrawlResult } from "./crawlCompany";
import { IKitAppendixA, IRequirement, IQuestion, IFlashcard } from "../models/Kit";
import { extractRequirements, ExtractedRequirement } from "./stages/extractRequirements";
import { generateCompanyBrief } from "./stages/companyBrief";
import { generateQuestions, GeneratedQuestion } from "./stages/generateQuestions";
import { checkCoverage } from "./stages/checkCoverage";
import { generateGapQuestions } from "./stages/generateGapQuestions";
import { generateFlashcards } from "./stages/generateFlashcards";
import { allocateSchedule } from "./stages/allocateSchedule";

interface GenerateKitInput {
  jobRole: string;
  companyWebsite: string;
  notes?: string;
  crawlData: CrawlResult;
  days?: number;
  location?: string;
  directJdText?: string;
}

function extractCompanyName(url: string): string {
  try {
    const formatted = url.startsWith("http") ? url : `https://${url}`;
    const host = new URL(formatted).hostname.replace("www.", "");
    const name = host.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Target Company";
  }
}

/**
 * Orchestrates the full modular pipeline:
 * 1. extractRequirements (LLM Stage 1)
 * 2. companyBrief (LLM Stage 2)
 * 3. generateQuestions (LLM Stage 3)
 * 4. checkCoverage (Pure Function Stage 4)
 * 5. generateGapQuestions (LLM Stage 4b - Coverage Loop)
 * 6. generateFlashcards (LLM Stage 5)
 * 7. allocateSchedule (Pure Function Stage 6)
 * 8. Assemble strict Appendix A Kit structure
 */
export async function generateKit(input: GenerateKitInput): Promise<IKitAppendixA> {
  const { jobRole, companyWebsite, notes, crawlData, days = 5, location = "", directJdText = "" } = input;

  const targetDays = Math.max(1, Math.min(30, days));
  const fullJd = directJdText || crawlData.jobListing || crawlData.careersPage || `${jobRole} at ${companyWebsite}`;
  const jdChars = fullJd.length;
  const companyName = extractCompanyName(companyWebsite);
  const pagesUsed = crawlData.pagesUsed && crawlData.pagesUsed.length > 0 ? crawlData.pagesUsed : [companyWebsite];

  console.log(`[generateKit] Starting multi-stage generation for "${jobRole}" at ${companyName}`);

  // ── Stage 1: Requirement Extraction ─────────────────────────
  console.log("[generateKit] Stage 1: Extracting structured requirements...");
  const extractedReqs = await extractRequirements(fullJd);

  // ── Stage 2: Company Brief ──────────────────────────────────
  console.log("[generateKit] Stage 2: Generating company brief...");
  const companyBriefData = await generateCompanyBrief(
    `${crawlData.companyOverview}\n\n${crawlData.careersPage}`,
    pagesUsed
  );

  // ── Stage 3: Initial Question Generation ────────────────────
  console.log("[generateKit] Stage 3: Generating question bank...");
  let allQuestions: GeneratedQuestion[] = await generateQuestions(
    extractedReqs,
    `${companyBriefData.summary}\n\nCandidate Notes: ${notes || "None"}`,
    jobRole
  );

  // ── Stage 4: Deterministic Coverage Check (Pass 1) ──────────
  console.log("[generateKit] Stage 4: Checking requirement coverage (Pass 1)...");
  let coverageReport = checkCoverage(extractedReqs, allQuestions, 1);

  // ── Stage 4b: Gap Generation Loop (Pass 2) ──────────────────
  if (coverageReport.uncovered.length > 0) {
    console.log(
      `[generateKit] Stage 4b: Found ${coverageReport.uncovered.length} uncovered requirements -> generating gap questions...`
    );
    try {
      const gapQuestions = await generateGapQuestions(coverageReport.uncovered);
      allQuestions = [...allQuestions, ...gapQuestions];
      coverageReport = checkCoverage(extractedReqs, allQuestions, 2);
    } catch (gapErr) {
      console.warn("[generateKit] Gap question generation skipped:", gapErr);
    }
  }

  // ── Stage 5: Flashcard Generation ───────────────────────────
  console.log("[generateKit] Stage 5: Generating spaced practice flashcards...");
  let flashcardData = [];
  try {
    flashcardData = await generateFlashcards(extractedReqs, allQuestions, jobRole);
  } catch (fcErr) {
    console.warn("[generateKit] Flashcard generation fallback:", fcErr);
    flashcardData = extractedReqs.map((r, i) => ({
      front: `Core Competency (${r.id}): ${r.text}`,
      back: `Demonstrate mastery of ${r.text} using clear architectural and behavioral examples.`,
      requirementId: r.id,
    }));
  }

  // ── Stage 6: Deterministic Schedule Allocation ──────────────
  console.log("[generateKit] Stage 6: Allocating study schedule (pure function)...");
  const scheduledQuestionItems = allQuestions.map((q, i) => ({
    id: `q${i + 1}`,
    category: q.category,
  }));
  const schedule = allocateSchedule(scheduledQuestionItems, targetDays);

  // ── Stage 7: Appendix A Normalization & Assembly ────────────
  console.log("[generateKit] Stage 7: Assembling strict Appendix A kit structure...");

  // Build Appendix A Requirements: kind, priority, text
  const rawMustCount = extractedReqs.filter((r) => r.type === "must").length;
  const appendixRequirements: IRequirement[] = extractedReqs.map((req, idx) => {
    const textLower = req.text.toLowerCase();

    // Check explicit signals
    const hasExplicitNiceSignal =
      /\b(plus|bonus|nice to have|preferred|optional|exposure to|familiarity with|good to have)\b/i.test(textLower);
    const hasExplicitMustSignal =
      /\b(\d+\+?\s*years?|proficiency|proficient|strong|deep|required|minimum|core|fundamental|proven|architect|lead|expert|hands-on|bachelor|master|degree|solid)\b/i.test(textLower);

    let priority: "must" | "nice" = req.type === "must" ? "must" : "nice";

    if (req.type === "must") {
      priority = hasExplicitNiceSignal ? "nice" : "must";
    } else {
      // If marked nice by LLM, check if it was overly conservative
      if (hasExplicitMustSignal && !hasExplicitNiceSignal) {
        priority = "must";
      } else if (rawMustCount === 0 && !hasExplicitNiceSignal && idx < Math.ceil(extractedReqs.length * 0.7)) {
        // Fallback: if LLM returned 0 must-haves, classify primary competencies as must
        priority = "must";
      }
    }

    const kind =
      textLower.includes("communication") ||
      textLower.includes("lead") ||
      textLower.includes("collaborat") ||
      textLower.includes("stakeholder") ||
      textLower.includes("teamwork") ||
      textLower.includes("mentorship")
        ? "behavioural"
        : textLower.includes("domain") ||
          textLower.includes("fintech") ||
          textLower.includes("healthcare") ||
          textLower.includes("compliance") ||
          textLower.includes("security clearance") ||
          textLower.includes("e-commerce")
        ? "domain"
        : "technical";

    return {
      id: req.id ? req.id.toLowerCase() : `r${idx + 1}`,
      text: req.text,
      kind,
      priority,
    };
  });

  const validReqIdSet = new Set(appendixRequirements.map((r) => r.id));

  // Helper to generate a detailed, structured answer strategy
  function buildTailoredAnswerOutline(
    promptText: string,
    cat: string,
    reqTexts: string[]
  ): string {
    const reqContext = reqTexts.length > 0 ? `Relevant competencies: ${reqTexts.join("; ")}.` : "";
    if (cat === "behavioural") {
      return `Use the STAR Framework (Situation, Task, Action, Result):
1. **Situation & Context:** Briefly describe the specific project, team size, timeline constraints, and business stakes.
2. **Task & Objective:** Clearly define your personal ownership, the core obstacle or disagreement, and success metrics.
3. **Action & Leadership:** Detail your structured problem-solving approach, technical decisions, and stakeholder management.
4. **Result & Quantified Impact:** Share quantifiable business impact (e.g., latency reduced, team delivery accelerated) and retrospective lessons learned. ${reqContext}`;
    } else if (cat === "system_design" || cat === "system-design") {
      return `Structured System Design Strategy:
1. **Scope & Clarify Requirements:** Define traffic scale (QPS/RPS), latency SLAs (P99 < 50ms), consistency model (Eventual vs Strong), and storage growth.
2. **High-Level Architecture:** Outline API gateway, microservices boundary, caching layer (Redis), message queues (Kafka/RabbitMQ), and primary databases.
3. **Deep Dive & Critical Bottlenecks:** Address data partitioning/sharding, replication topology, rate-limiting, failure modes, and circuit breaking.
4. **Trade-offs & Observability:** Justify SQL vs NoSQL selections, caching eviction policies (LRU), and key monitoring telemetry. ${reqContext}`;
    } else if (cat === "company_fit" || cat === "company-fit") {
      return `Company Alignment & Cultural Impact Strategy:
1. **Direct Mission & Product Connection:** Explain how your domain experience matches the company's specific product line and user needs.
2. **Engineering Philosophy:** Discuss your approach to continuous delivery, peer mentorship, and shipping high-quality software in fast-paced environments.
3. **Value Proposition:** Highlight the concrete technical and collaborative strengths you bring to their engineering team. ${reqContext}`;
    } else {
      return `Technical Problem-Solving & Implementation Framework:
1. **Clarify Requirements & Constraints:** Confirm expected inputs/outputs, data volume, edge cases (empty inputs, nulls, concurrency), and error boundaries.
2. **Algorithmic Approach & Complexity:** Compare baseline vs optimal solutions; analyze Time Complexity (e.g. O(N) or O(N log N)) and Space Complexity (O(1) / O(N)).
3. **Robust Code & Architecture:** Structure clean modular components, manage async/concurrency gracefully, and enforce type safety.
4. **Testing, Edge Cases & Failure Modes:** Walk through unit testing strategies, integration tests, and resilience against failures. ${reqContext}`;
    }
  }

  // Build Appendix A Questions
  const appendixQuestions: IQuestion[] = allQuestions.map((q, idx) => {
    const qId = `q${idx + 1}`;
    // Map R1/R2 to r1/r2
    const mappedReqIds = (q.requirementIds || [])
      .map((id) => id.toLowerCase())
      .filter((id) => validReqIdSet.has(id));

    const finalReqIds = mappedReqIds.length > 0
      ? mappedReqIds
      : [appendixRequirements[0]?.id || "r1"];

    let category: IQuestion["category"] = "technical";
    if (q.category === "behavioural") category = "behavioural";
    else if (q.category === "system_design") category = "system-design";
    else if (q.category === "company_fit") category = "company-fit";

    const difficulty = (idx % 3 === 0 ? 1 : idx % 3 === 1 ? 2 : 3) as 1 | 2 | 3;

    const mappedReqTexts = finalReqIds
      .map((id) => appendixRequirements.find((r) => r.id === id)?.text)
      .filter((t): t is string => Boolean(t));

    const answerOutline =
      q.answerOutline && q.answerOutline.trim().length > 25
        ? q.answerOutline.trim()
        : buildTailoredAnswerOutline(q.text, category, mappedReqTexts);

    return {
      id: qId,
      requirement_ids: finalReqIds,
      category,
      prompt: q.text,
      answer_outline: answerOutline,
      difficulty,
    };
  });

  // Build Appendix A Flashcards
  const appendixFlashcards: IFlashcard[] = flashcardData.map((f, idx) => {
    const fId = `f${idx + 1}`;
    const reqId = f.requirementId ? f.requirementId.toLowerCase() : undefined;
    const reqIds = reqId && validReqIdSet.has(reqId) ? [reqId] : [appendixRequirements[0]?.id || "r1"];

    return {
      id: fId,
      front: f.front,
      back: f.back,
      requirement_ids: reqIds,
    };
  });

  // Map coverage IDs to lowercase
  const finalUncoveredIds = coverageReport.uncovered_requirement_ids.map((id) => id.toLowerCase());

  const finalKit: IKitAppendixA = {
    source: {
      company: companyName,
      company_url: companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`,
      role: jobRole,
      location: location || "Remote / Unspecified",
      jd_chars: jdChars,
      researched_at: new Date().toISOString(),
      pages_used: pagesUsed,
    },
    company_brief: {
      summary: companyBriefData.summary,
      what_they_do: `${companyName} delivers innovative solutions in its target industry, prioritizing engineering excellence and customer impact.`,
      sources: companyBriefData.sources.length > 0 ? companyBriefData.sources : pagesUsed,
    },
    role: {
      title: jobRole,
      seniority: jobRole.toLowerCase().includes("senior") ? "Senior" : jobRole.toLowerCase().includes("lead") ? "Lead" : "Mid",
      responsibilities: [
        `Deliver high-impact features and technical capabilities for the ${jobRole} track.`,
        "Collaborate with product, engineering, and cross-functional teams to solve technical challenges.",
        "Ensure scalability, reliability, and code quality across deliverables.",
      ],
      requirements: appendixRequirements,
    },
    questions: appendixQuestions,
    flashcards: appendixFlashcards,
    schedule,
    coverage: {
      uncovered_requirement_ids: finalUncoveredIds,
      passes: coverageReport.passes,
    },
  };

  console.log(
    `[generateKit] Completed kit for "${jobRole}". Total requirements=${appendixRequirements.length}, questions=${appendixQuestions.length}, coverage passes=${coverageReport.passes}`
  );

  return finalKit;
}
