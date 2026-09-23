import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { TypeSafeClient, choice } from "@typesafe-ai/sdk";
import { CrawlResult } from "./crawlCompany";
import { IKitAppendixA } from "../models/Kit";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

/* ── Appendix A Zod Schema ──────────────────────────────────── */

const RequirementSchema = z.object({
  id: z.string().describe("Stable id like r1, r2, r3"),
  text: z.string().describe("Requirement text (e.g. '5+ years with React and TypeScript')"),
  kind: z.enum(["technical", "behavioural", "domain"]).describe("Kind of requirement"),
  priority: z.enum(["must", "nice"]).describe("Priority of requirement"),
});

const QuestionSchema = z.object({
  id: z.string().describe("Stable id like q1, q2, q3"),
  requirement_ids: z.array(z.string()).describe("List of requirement ids this question evaluates (e.g. ['r1', 'r2'])"),
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]).describe("Category of question"),
  prompt: z.string().describe("The interview question prompt"),
  answer_outline: z.string().describe("Detailed, high-scoring answer outline or sample response using STAR/framework"),
  difficulty: z.number().int().min(1).max(3).describe("Difficulty integer: 1 (easy), 2 (medium), or 3 (hard)"),
});

const FlashcardSchema = z.object({
  id: z.string().describe("Stable id like f1, f2, f3"),
  front: z.string().describe("Front of flashcard: question, concept, or prompt"),
  back: z.string().describe("Back of flashcard: concise, high-yield explanation or answer"),
  requirement_ids: z.array(z.string()).describe("List of requirement ids this card tests (e.g. ['r1'])"),
});

const ScheduleDaySchema = z.object({
  day: z.number().int().describe("Day number (1, 2, 3...)"),
  focus: z.string().describe("Focus theme for the study session"),
  question_ids: z.array(z.string()).describe("List of existing question ids to practice (e.g. ['q1', 'q2'])"),
  minutes: z.number().int().describe("Estimated study time in minutes as integer"),
});

const KitLLMOutputSchema = z.object({
  company_brief: z.object({
    summary: z.string().describe("Concise 1-2 paragraph executive summary of the company"),
    what_they_do: z.string().describe("Detailed breakdown of products, customers, and core business model"),
    sources: z.array(z.string()).describe("URLs referenced for the brief"),
  }),
  role: z.object({
    title: z.string().describe("Official job title"),
    seniority: z.string().describe("Seniority level (e.g. Senior, Mid, Staff, Lead, Entry)"),
    location: z.string().optional().describe("Role location (e.g. Remote, Hybrid, San Francisco, CA)"),
    responsibilities: z.array(z.string()).describe("List of primary responsibilities"),
    requirements: z.array(RequirementSchema).describe("List of 6-12 core requirements with IDs r1, r2..."),
  }),
  questions: z.array(QuestionSchema).describe("15-25 questions mapping directly to requirements (IDs q1, q2...)"),
  flashcards: z.array(FlashcardSchema).describe("10-15 high-yield flashcards mapping to requirements (IDs f1, f2...)"),
  schedule: z.object({
    days_available: z.number().int().describe("Number of study days available"),
    days: z.array(ScheduleDaySchema).describe("Day-by-day practice schedule"),
  }),
});

interface GenerateKitInput {
  jobRole: string;
  companyWebsite: string;
  notes?: string;
  crawlData: CrawlResult;
  days?: number;
  location?: string;
  directJdText?: string;
}

/**
 * Extracts company name cleanly from website domain
 */
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
 * Generates an Appendix A compliant interview prep kit using TypeSafe AI (JEV) + Gemini LLM.
 */
export async function generateKit(input: GenerateKitInput): Promise<IKitAppendixA> {
  const { jobRole, companyWebsite, notes, crawlData, days = 5, location = "", directJdText = "" } = input;

  const targetDays = Math.max(1, Math.min(30, days));
  const fullJd = directJdText || crawlData.jobListing || crawlData.careersPage || "";
  const jdChars = fullJd.length;
  const companyName = extractCompanyName(companyWebsite);
  const pagesUsed = crawlData.pagesUsed && crawlData.pagesUsed.length > 0 ? crawlData.pagesUsed : [companyWebsite];

  // ── 1. TypeSafe AI (JEV) Structured Classification ──────────
  let domainTrack = "Software Engineering";
  if (process.env.TYPESAFE_AI_API_KEY) {
    try {
      const typeSafe = new TypeSafeClient({ apiKey: process.env.TYPESAFE_AI_API_KEY });
      const { answers } = await typeSafe.systemOne({
        state: `Target Job Role: ${jobRole}\nCompany: ${companyWebsite}\nCompany Overview: ${crawlData.companyOverview.slice(0, 400)}`,
        questions: {
          domain: choice("What primary technical domain best characterizes this role?", {
            "Frontend & Web Engineering": "User interface, React, client-side, browser",
            "Backend & Distributed Systems": "APIs, database, scalability, microservices",
            "Full Stack Application Development": "Full stack web applications",
            "Machine Learning & AI Engineering": "ML models, LLMs, NLP, training, inference",
            "DevOps, Cloud & Infrastructure": "Kubernetes, CI/CD, AWS/GCP, SRE",
            "Product Management & Strategy": "Roadmaps, product sense, strategy, metrics",
            "Data Engineering & Analytics": "Data pipelines, SQL, ETL, warehouses",
            "Mobile Engineering": "iOS, Android, React Native",
            "Engineering Management": "Engineering leadership and management",
          }),
        },
      });

      if (answers.domain?.choice) {
        domainTrack = answers.domain.choice;
        console.log(`[typesafe-ai] JEV classified domain track: ${domainTrack}`);
      }
    } catch (jevErr) {
      console.warn("[typesafe-ai] JEV classification skipped:", jevErr);
    }
  }

  // ── 2. Construct Prompt for Gemini LLM ──────────────────────
  const prompt = `You are an elite interview intelligence system creating a strictly compliant interview prep kit.

## Appendix A Schema Specification Requirements:
Every requirement MUST have id 'r1', 'r2', 'r3'...
Every question MUST have id 'q1', 'q2', 'q3'... and map to valid requirement_ids (e.g. ['r1']).
Every flashcard MUST have id 'f1', 'f2', 'f3'... and map to valid requirement_ids (e.g. ['r1']).
Every schedule day MUST have integer 'minutes' and 'question_ids' referencing only questions that exist in the kit.
Question categories MUST strictly be one of: 'technical', 'behavioural', 'system-design', 'company-fit'.
Question difficulty MUST strictly be integer 1, 2, or 3 (1=easy, 2=medium, 3=hard).
Requirement kind MUST strictly be one of: 'technical', 'behavioural', 'domain'.
Requirement priority MUST strictly be one of: 'must', 'nice'.
Schedule days_available MUST be ${targetDays}.

## Target Role & Company
**Role Title:** ${jobRole}
**Domain Track:** ${domainTrack}
**Company:** ${companyName} (${companyWebsite})
**Available Study Days:** ${targetDays}
${location ? `**Location:** ${location}\n` : ""}

## Scraped Company Information
${crawlData.companyOverview || "Company overview derived from website domain."}

## Scraped Hiring & Careers Context
${crawlData.careersFound ? crawlData.careersPage : "No public careers page found."}

## Exact Job Description Content
${fullJd || "Standard job specifications for " + jobRole}

${notes ? `## Candidate Notes\n${notes}` : ""}

Generate a comprehensive, rigorous interview preparation kit matching the Appendix A structure exactly.`;

  console.log(`[generateKit] Generating Appendix A kit for ${jobRole} at ${companyWebsite}`);

  const { object: rawKit } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: KitLLMOutputSchema,
    prompt,
    maxRetries: 2,
  });

  // ── 3. Post-Processing & Strict Schema Conformance ──────────
  // Ensure requirement IDs are stable
  const validRequirements = rawKit.role.requirements.map((req, idx) => ({
    id: req.id || `r${idx + 1}`,
    text: req.text,
    kind: req.kind,
    priority: req.priority,
  }));
  const validReqIdSet = new Set(validRequirements.map((r) => r.id));

  // Ensure question IDs are stable and only reference valid requirement IDs
  const validQuestions = rawKit.questions.map((q, idx) => {
    const qId = q.id || `q${idx + 1}`;
    const filteredReqIds = (q.requirement_ids || []).filter((id) => validReqIdSet.has(id));
    return {
      id: qId,
      requirement_ids: filteredReqIds.length > 0 ? filteredReqIds : [validRequirements[0]?.id || "r1"],
      category: q.category,
      prompt: q.prompt,
      answer_outline: q.answer_outline,
      difficulty: (Math.max(1, Math.min(3, Math.round(q.difficulty || 2))) as 1 | 2 | 3),
    };
  });
  const validQuestionIdSet = new Set(validQuestions.map((q) => q.id));

  // Ensure flashcards reference valid requirement IDs
  const validFlashcards = rawKit.flashcards.map((f, idx) => {
    const fId = f.id || `f${idx + 1}`;
    const filteredReqIds = (f.requirement_ids || []).filter((id) => validReqIdSet.has(id));
    return {
      id: fId,
      front: f.front,
      back: f.back,
      requirement_ids: filteredReqIds.length > 0 ? filteredReqIds : [validRequirements[0]?.id || "r1"],
    };
  });

  // Ensure schedule only references questions that exist and has integer minutes
  const validScheduleDays = rawKit.schedule.days.map((d, idx) => {
    const filteredQIds = (d.question_ids || []).filter((qId) => validQuestionIdSet.has(qId));
    // Fallback if empty: assign at least one valid question
    const assignedQIds = filteredQIds.length > 0
      ? filteredQIds
      : validQuestions.slice(idx % validQuestions.length, (idx % validQuestions.length) + 2).map((q) => q.id);

    return {
      day: d.day || idx + 1,
      focus: d.focus || `Day ${idx + 1} Focus`,
      question_ids: assignedQIds,
      minutes: Math.round(d.minutes || 60),
    };
  });

  // Calculate coverage: find requirement IDs not mapped to any question
  const coveredReqIds = new Set<string>();
  for (const q of validQuestions) {
    for (const rId of q.requirement_ids) {
      coveredReqIds.add(rId);
    }
  }
  const uncovered_requirement_ids = validRequirements
    .filter((r) => !coveredReqIds.has(r.id))
    .map((r) => r.id);

  const finalKit: IKitAppendixA = {
    source: {
      company: companyName,
      company_url: companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`,
      role: jobRole,
      location: rawKit.role.location || location || "Remote / Unspecified",
      jd_chars: jdChars,
      researched_at: new Date().toISOString(),
      pages_used: pagesUsed,
    },
    company_brief: {
      summary: rawKit.company_brief.summary,
      what_they_do: rawKit.company_brief.what_they_do,
      sources: pagesUsed,
    },
    role: {
      title: rawKit.role.title || jobRole,
      seniority: rawKit.role.seniority || "Senior",
      responsibilities: rawKit.role.responsibilities || [],
      requirements: validRequirements,
    },
    questions: validQuestions,
    flashcards: validFlashcards,
    schedule: {
      days_available: targetDays,
      days: validScheduleDays,
    },
    coverage: {
      uncovered_requirement_ids,
      passes: 2,
    },
  };

  return finalKit;
}
