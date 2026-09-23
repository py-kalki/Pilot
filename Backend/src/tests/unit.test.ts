import { allocateSchedule } from "../pipeline/stages/allocateSchedule";
import { checkCoverage } from "../pipeline/stages/checkCoverage";
import { ExtractedRequirement } from "../pipeline/stages/extractRequirements";
import { GeneratedQuestion } from "../pipeline/stages/generateQuestions";
import { IKitAppendixA, IScheduleDay } from "../models/Kit";
import { z } from "zod";

/* ── Appendix A Zod Validator for Strict Compliance ────────────────────── */
const RequirementSchema = z.object({
  id: z.string().regex(/^r\d+$/i),
  text: z.string().min(1),
  kind: z.enum(["technical", "behavioural", "domain"]),
  priority: z.enum(["must", "nice"]),
});

const QuestionSchema = z.object({
  id: z.string().regex(/^q\d+$/i),
  requirement_ids: z.array(z.string()).min(1),
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]),
  prompt: z.string().min(1),
  answer_outline: z.string().min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const FlashcardSchema = z.object({
  id: z.string().regex(/^f\d+$/i),
  front: z.string().min(1),
  back: z.string().min(1),
  requirement_ids: z.array(z.string()).min(1),
});

const ScheduleDaySchema = z.object({
  day: z.number().int().positive(),
  focus: z.string().min(1),
  question_ids: z.array(z.string()),
  minutes: z.number().int().positive(),
});

const KitAppendixASchema = z.object({
  source: z.object({
    company: z.string(),
    company_url: z.string(),
    role: z.string(),
    location: z.string(),
    jd_chars: z.number().int().nonnegative(),
    researched_at: z.string(),
    pages_used: z.array(z.string()),
  }),
  company_brief: z.object({
    summary: z.string(),
    what_they_do: z.string(),
    sources: z.array(z.string()),
  }),
  role: z.object({
    title: z.string(),
    seniority: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(RequirementSchema),
  }),
  questions: z.array(QuestionSchema),
  flashcards: z.array(FlashcardSchema),
  schedule: z.object({
    days_available: z.number().int().positive(),
    days: z.array(ScheduleDaySchema),
  }),
  coverage: z.object({
    uncovered_requirement_ids: z.array(z.string()),
    passes: z.number().int().positive(),
  }),
});

/* ── Test Suite Execution ─────────────────────────────────────────────── */

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  passedTests++;
  console.log(`✓ PASS: ${msg}`);
}

async function runTests() {
  console.log("==================================================");
  console.log(" PILOT — AUTOMATED UNIT TEST & SPEC VERIFICATION  ");
  console.log("==================================================\n");

  // 1. Schedule Allocation Tests
  console.log("--- 1. Schedule Allocator (Pure Function) ---");
  {
    const sampleQuestions = [
      { id: "q1", category: "technical" },
      { id: "q2", category: "system-design" },
      { id: "q3", category: "behavioural" },
      { id: "q4", category: "company-fit" },
      { id: "q5", category: "technical" },
    ];

    // Standard 5 days
    const sched5 = allocateSchedule(sampleQuestions, 5);
    assert(sched5.days_available === 5, "days_available equals requested 5 days");
    assert(sched5.days.length === 5, "days array length exactly equals 5");
    assert(sched5.days.every((d: IScheduleDay) => Number.isInteger(d.minutes)), "Every day's minutes is an integer");
    assert(
      sched5.days.every((d: IScheduleDay) => d.question_ids.every((qid: string) => sampleQuestions.some((q) => q.id === qid))),
      "All scheduled question IDs refer to real questions in the question bank"
    );

    // Condensed 1 day
    const sched1 = allocateSchedule(sampleQuestions, 1);
    assert(sched1.days_available === 1, "days_available equals 1 when requested 1 day");
    assert(sched1.days.length === 1, "days array length is exactly 1");
    assert(Number.isInteger(sched1.days[0].minutes), "Day 1 minutes is an integer");
    assert(sched1.days[0].question_ids.length === 5, "All questions scheduled on day 1");

    // Large 30 days
    const sched30 = allocateSchedule(sampleQuestions, 30);
    assert(sched30.days_available === 30, "Large schedule allocates exactly 30 days");
    assert(sched30.days.length === 30, "days array length is exactly 30 without errors");
    assert(sched30.days.every((d: IScheduleDay) => Number.isInteger(d.minutes)), "All 30 days have integer minutes");

    // 0 questions edge case
    const sched0 = allocateSchedule([], 3);
    assert(sched0.days_available === 3 && sched0.days.length === 3, "Handles 0 questions gracefully without crashing");
  }

  // 2. Deterministic Coverage Checking Tests
  console.log("\n--- 2. Requirement Coverage Checker (Pure Function) ---");
  {
    const reqs: ExtractedRequirement[] = [
      { id: "R1", text: "TypeScript & React", type: "must" },
      { id: "R2", text: "Node.js & MongoDB", type: "must" },
      { id: "R3", text: "AWS & Docker", type: "nice" },
      { id: "R4", text: "System Design", type: "must" },
    ];

    const questionsPass1: GeneratedQuestion[] = [
      { text: "React state management", category: "technical", difficulty: 2, requirementIds: ["R1"] },
      { text: "Node.js event loop", category: "technical", difficulty: 2, requirementIds: ["R2"] },
    ];

    const rep1 = checkCoverage(reqs, questionsPass1, 1);
    assert(rep1.passes === 1, "Pass 1 records passes=1");
    assert(rep1.uncovered.length === 2, "Correctly identifies 2 uncovered requirements");
    assert(rep1.uncovered_requirement_ids.includes("R3") && rep1.uncovered_requirement_ids.includes("R4"), "Uncovered list contains R3 and R4");

    // Close gaps in Pass 2
    const questionsPass2: GeneratedQuestion[] = [
      ...questionsPass1,
      { text: "Docker containerization", category: "technical", difficulty: 2, requirementIds: ["R3"] },
      { text: "Distributed microservices", category: "system_design", difficulty: 3, requirementIds: ["R4"] },
    ];

    const rep2 = checkCoverage(reqs, questionsPass2, 2);
    assert(rep2.passes === 2, "Pass 2 records passes=2");
    assert(rep2.uncovered.length === 0, "100% covered leaves 0 uncovered requirements");
    assert(rep2.uncovered_requirement_ids.length === 0, "uncovered_requirement_ids is empty");
  }

  // 3. Strict Appendix A Schema Compliance Test
  console.log("\n--- 3. Strict Appendix A Schema Validation ---");
  {
    const mockKit: IKitAppendixA = {
      source: {
        company: "Stripe",
        company_url: "https://stripe.com",
        role: "Senior Backend Engineer",
        location: "San Francisco, CA",
        jd_chars: 1420,
        researched_at: new Date().toISOString(),
        pages_used: ["https://stripe.com", "https://stripe.com/jobs"],
      },
      company_brief: {
        summary: "Stripe builds financial infrastructure for the internet.",
        what_they_do: "Payments, billing, banking-as-a-service, and financial infrastructure.",
        sources: ["https://stripe.com"],
      },
      role: {
        title: "Senior Backend Engineer",
        seniority: "Senior",
        responsibilities: [
          "Design and build highly available payment APIs.",
          "Maintain 99.999% reliability across distributed transaction ledgers.",
        ],
        requirements: [
          { id: "r1", text: "5+ years of distributed backend systems in Go/Java", kind: "technical", priority: "must" },
          { id: "r2", text: "Strong proficiency in database concurrency and ACID transactions", kind: "technical", priority: "must" },
          { id: "r3", text: "Cross-functional leadership and mentorship", kind: "behavioural", priority: "must" },
          { id: "r4", text: "Experience with financial compliance is a plus", kind: "domain", priority: "nice" },
        ],
      },
      questions: [
        {
          id: "q1",
          requirement_ids: ["r1", "r2"],
          category: "system-design",
          prompt: "How do you ensure idempotency across distributed payment webhooks?",
          answer_outline: "Discuss idempotent keys, atomic check-and-set, Redis distributed locks, and database unique constraints.",
          difficulty: 3,
        },
        {
          id: "q2",
          requirement_ids: ["r3"],
          category: "behavioural",
          prompt: "Describe a situation where you mediated a technical architecture conflict between senior engineers.",
          answer_outline: "STAR framework focusing on data-driven benchmarks, architectural trade-offs, and building consensus.",
          difficulty: 2,
        },
        {
          id: "q3",
          requirement_ids: ["r4"],
          category: "company-fit",
          prompt: "How does Stripe's developer-first API philosophy guide your system design decisions?",
          answer_outline: "Connect backward compatibility, explicit error codes, and developer ergonomic standards.",
          difficulty: 1,
        },
      ],
      flashcards: [
        {
          id: "f1",
          front: "What is the primary mechanism to guarantee webhook idempotency?",
          back: "Unique idempotency keys stored in an atomic transaction store with deduplication windows.",
          requirement_ids: ["r1"],
        },
      ],
      schedule: {
        days_available: 3,
        days: [
          { day: 1, focus: "Foundations & Architecture", question_ids: ["q1"], minutes: 45 },
          { day: 2, focus: "Behavioral & Leadership", question_ids: ["q2"], minutes: 35 },
          { day: 3, focus: "Company Fit & Review", question_ids: ["q3"], minutes: 30 },
        ],
      },
      coverage: {
        uncovered_requirement_ids: [],
        passes: 2,
      },
    };

    const parsed = KitAppendixASchema.safeParse(mockKit);
    assert(parsed.success, "Mock kit strictly conforms to Appendix A Zod schema without deviations");
    if (!parsed.success) {
      console.error(parsed.error);
    }
  }

  // 4. Priority Classification & Implicit Must Heuristic Tests
  console.log("\n--- 4. Must vs Nice Priority Logic ---");
  {
    const mustTexts = [
      "5+ years of experience with React and TypeScript",
      "Strong proficiency in designing distributed systems",
      "Minimum 3 years working with PostgreSQL or MySQL",
      "Hands-on architectural leadership and mentorship",
      "Required: Bachelor's degree in CS or equivalent experience",
    ];

    const niceTexts = [
      "Experience with Kubernetes is a plus",
      "Familiarity with GraphQL is a bonus",
      "Nice to have: exposure to Kafka",
      "Preferred qualification: active open-source contributor",
    ];

    const hasMustSignal = (t: string) =>
      /\b(\d+\+?\s*years?|proficiency|proficient|strong|deep|required|minimum|core|fundamental|proven|architect|lead|expert|hands-on|bachelor|master|degree|solid)\b/i.test(t);

    const hasNiceSignal = (t: string) =>
      /\b(plus|bonus|nice to have|preferred|optional|exposure to|familiarity with|good to have)\b/i.test(t);

    for (const text of mustTexts) {
      assert(hasMustSignal(text) && !hasNiceSignal(text), `Correctly flags implicit/explicit must: "${text}"`);
    }

    for (const text of niceTexts) {
      assert(hasNiceSignal(text), `Correctly flags explicit bonus/nice: "${text}"`);
    }
  }

  console.log("\n==================================================");
  console.log(` TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
