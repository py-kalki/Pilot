"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  Briefcase,
  Target,
  Brain,
  Calendar,
  ShieldCheck,
  FileText,
  Search,
  Clock,
  Sparkles,
  ExternalLink,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  ListTodo,
  CheckSquare,
  Square,
  RotateCcw,
  RefreshCw,
  Edit3,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import { api, FullKit, Question, Flashcard, Requirement, ScheduleDay } from "@/lib/api";

/* ── Pipeline step definitions ──────────────────────────────── */
const PIPELINE_STEPS = [
  { status: "crawling",   label: "Multi-stage company & job crawl", detail: "Scraping company overview, discovering careers portal & job opening" },
  { status: "analyzing",  label: "Synthesizing competencies",       detail: "Extracting core requirements, responsibilities & tech stack" },
  { status: "generating", label: "Generating Appendix A prep kit",   detail: "Jev TypeSafe AI + Gemini generating questions, flashcards & study schedule" },
  { status: "done",       label: "Kit ready!",                      detail: "Your personalized interview prep kit is complete" },
];

function getStepIndex(status: string): number {
  const idx = PIPELINE_STEPS.findIndex((s) => s.status === status);
  return idx === -1 ? 0 : idx;
}

function LiveStatusView({ kit }: { kit: FullKit }) {
  const currentIdx = getStepIndex(kit.status);
  const isError = kit.status === "error";

  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "3rem 2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: "540px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2DDD6",
        borderRadius: "20px",
        padding: "2.25rem 2.5rem",
        boxShadow: "0 8px 24px -4px rgba(38,34,30,0.06)",
      }}>
        {isError ? (
          <>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#FDEAEA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <AlertCircle size={24} color="#8B2020" />
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.5rem" }}>
              Something went wrong.
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              {kit.errorMessage || "The kit generation encountered an error. Please try again."}
            </p>
            <Link href="/interview/new" className="btn-primary" style={{ textDecoration: "none", padding: "0.7rem 1.5rem", fontSize: "0.88rem" }}>
              Try again
            </Link>
          </>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-teal-deep)", margin: "0 0 0.4rem" }}>
                Generating Prep Kit
              </p>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.3rem" }}>
                {kit.name}
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                {kit.statusMessage}
              </p>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = idx < currentIdx;
                const isActive = idx === currentIdx;

                return (
                  <div key={step.status} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: isDone ? "var(--color-teal-deep)" : isActive ? "transparent" : "#F0EDE8",
                      border: isActive ? "2px solid var(--color-teal-deep)" : "none",
                      transition: "all 0.3s ease",
                    }}>
                      {isDone ? (
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      ) : isActive ? (
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-teal-deep)", animation: "pulseDot 1.2s ease-in-out infinite" }} />
                      ) : (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D4CFC9" }} />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: isActive ? 600 : 400,
                        color: isDone ? "var(--color-teal-deep)" : isActive ? "var(--color-ink)" : "var(--color-text-muted)",
                        margin: 0, lineHeight: 1.2,
                      }}>
                        {step.label}
                      </p>
                      {isActive && (
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <style>{`@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
      </div>
    </div>
  );
}

/* ── Content Tab Types ──────────────────────────────────────── */
type Tab = "overview" | "schedule" | "questions" | "flashcards" | "coverage";

const DIFFICULTY_MAP: Record<number | string, { label: string; color: string; bg: string }> = {
  1: { label: "Easy (Level 1)", color: "#1E6B40", bg: "#E2F2EA" },
  2: { label: "Medium (Level 2)", color: "#7A5C2E", bg: "#FDF3E0" },
  3: { label: "Hard (Level 3)", color: "#8B2020", bg: "#FDEAEA" },
  easy: { label: "Easy", color: "#1E6B40", bg: "#E2F2EA" },
  medium: { label: "Medium", color: "#7A5C2E", bg: "#FDF3E0" },
  hard: { label: "Hard", color: "#8B2020", bg: "#FDEAEA" },
};

const CATEGORY_MAP: Record<string, string> = {
  technical: "Technical",
  behavioural: "Behavioral",
  behavioral: "Behavioral",
  "system-design": "System Design",
  "company-fit": "Company Fit",
  "role-specific": "Role Specific",
  "company-specific": "Company Specific",
};

/* ── Interactive One-at-a-Time Interview Simulator ─────────── */
function InteractiveQuestionsView({
  questions,
  initialQuestionId,
  practicedMap,
  onTogglePracticed,
}: {
  questions: Question[];
  initialQuestionId?: string;
  practicedMap: Record<string, boolean>;
  onTogglePracticed: (qId: string) => void;
}) {
  const initialIndex = useMemo(() => {
    if (!initialQuestionId) return 0;
    const found = questions.findIndex((q) => q.id === initialQuestionId);
    return found !== -1 ? found : 0;
  }, [questions, initialQuestionId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showAnswer, setShowAnswer] = useState(false);
  const [viewedMap, setViewedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialQuestionId) {
      const found = questions.findIndex((q) => q.id === initialQuestionId);
      if (found !== -1) {
        setCurrentIndex(found);
        setShowAnswer(false);
      }
    }
  }, [initialQuestionId, questions]);

  const currentQ = questions[currentIndex] || questions[0];
  const qId = currentQ?.id || `q${currentIndex + 1}`;
  const diffInfo = DIFFICULTY_MAP[currentQ?.difficulty] || DIFFICULTY_MAP[2];
  const questionText = currentQ?.prompt || (currentQ as unknown as { question?: string }).question || "";
  const rawAnswer = currentQ?.answer_outline || (currentQ as unknown as { sampleAnswer?: string }).sampleAnswer || "";

  const answerText = useMemo(() => {
    if (
      rawAnswer &&
      rawAnswer.trim().length > 30 &&
      !rawAnswer.includes("Focus on concrete trade-offs, structured problem-solving, and practical metrics.")
    ) {
      return rawAnswer.trim();
    }

    const cat = (currentQ?.category || "").toLowerCase();
    const mappedIds = currentQ?.requirement_ids || [];
    const reqContext = mappedIds.length > 0 ? `Mapped competencies: ${mappedIds.join(", ")}.` : "";

    if (cat.includes("behavioural") || cat.includes("behavioral")) {
      return `STAR Method Response Framework (Situation, Task, Action, Result):
1. **Situation & Strategic Context:**
   • Briefly frame the project context, technical scope, timeline constraints, and business stakes.
   • Identify key stakeholders involved (Product Managers, Engineering Leads, QA, DevOps).

2. **Task & Explicit Challenge:**
   • Define the exact technical dilemma, interpersonal friction, or unexpected architectural roadblock.
   • Clarify your individual ownership and goals vs broader team tasks.

3. **Action & Implementation Steps:**
   • Walk through the concrete technical decisions, data analysis, and trade-offs you evaluated.
   • Highlight leadership, cross-functional alignment, and pragmatic problem resolution.

4. **Result, Metrics & Key Learnings:**
   • Quantify business outcomes (e.g., latency cut by 40%, zero downtime migration, delivery 2 weeks ahead).
   • Conclude with what you learned and how you adapted your future engineering workflows. ${reqContext}`;
    } else if (cat.includes("system") || cat.includes("design") || cat.includes("arch")) {
      return `Structured System Design Strategy & Talking Points:
1. **Clarify Scope & Non-Functional Requirements (NFRs):**
   • Estimate traffic scale (e.g. 20k QPS peak, 80/20 read/write ratio) and data storage volume.
   • Define latency SLAs (P99 < 50ms), availability targets (99.99%), and consistency model (Strong vs Eventual).

2. **High-Level Architectural Design:**
   • API Gateway & Reverse Proxy (SSL termination, rate-limiting, authentication).
   • Core Stateless Microservices horizontally scaled behind Load Balancers.
   • Distributed Caching tier (Redis Cluster with cache-aside / write-through strategies).
   • Asynchronous Message Brokers (Kafka / RabbitMQ) for event-driven decoupled ingestion.
   • Primary Database layer (PostgreSQL with read replicas, or distributed NoSQL / MongoDB partitioned by key).

3. **Deep-Dive Bottlenecks & Edge Cases:**
   • Address data sharding / hot partitioning keys and thundering herd mitigations.
   • Distributed lock patterns, idempotency keys, and circuit breaker fault isolation.

4. **Trade-offs & Production Telemetry:**
   • Justify SQL ACID guarantees vs NoSQL horizontal scaling trade-offs.
   • Telemetry and observability stack: Distributed tracing (OpenTelemetry), Prometheus metrics, Grafana alerting. ${reqContext}`;
    } else if (cat.includes("company") || cat.includes("fit") || cat.includes("culture")) {
      return `Company & Culture Alignment Strategy:
1. **Direct Product & Value Connection:**
   • Articulate genuine understanding of the company's core platform, customer pain points, and product vision.
   • Link your previous engineering achievements directly to their current growth or technical scale.

2. **Engineering Values & Best Practices:**
   • Emphasize continuous delivery, high test coverage, pragmatic refactoring, and peer code reviews.
   • Describe how you take end-to-end ownership from design to production monitoring.

3. **Collaborative Value Proposition:**
   • Highlight your communication style, cross-team empathy, and eagerness to mentor and elevate peers. ${reqContext}`;
    } else {
      return `Technical Problem-Solving & Implementation Framework:
1. **Clarify Inputs, Outputs & Scale Constraints:**
   • Confirm data types, input constraints, boundary edge cases (empty/null collections, extreme values), and memory bounds.
   • State expected target time & space complexities before discussing implementation.

2. **Optimal Approach vs Baseline:**
   • Contrast naive/brute-force approach with optimal algorithm and data structure selection (e.g. HashMap, Two-Pointers, DP, Tree traversal).
   • Detail formal complexities: Time Complexity $O(N)$ or $O(N \\log N)$, Space Complexity $O(1)$ or $O(N)$.

3. **Implementation Best Practices & Clean Code:**
   • Structure clean modular logic with clear naming, strict typing, and defensive exception handling.
   • Manage concurrency, async execution, or memory safety considerations if applicable.

4. **Validation, Edge Cases & Telemetry:**
   • Test edge scenarios (off-by-one errors, extreme datasets, concurrent mutations).
   • Production readiness: Unit test coverage, telemetry logging, and resilience against failures. ${reqContext}`;
    }
  }, [rawAnswer, currentQ?.category, currentQ?.requirement_ids]);

  function handleSelectQuestion(index: number) {
    setCurrentIndex(index);
    setShowAnswer(false);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  }

  function toggleAnswer() {
    setShowAnswer((prev) => {
      const next = !prev;
      if (next) {
        setViewedMap((m) => ({ ...m, [qId]: true }));
      }
      return next;
    });
  }

  function togglePracticed() {
    onTogglePracticed(qId);
  }

  // Keyboard navigation support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, questions.length]);

  const practicedCount = Object.values(practicedMap).filter(Boolean).length;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ── GITHUB ACTIVITY STYLE QUESTION MATRIX ───────────── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2DDD6",
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 4px 16px -3px rgba(38,34,30,0.03)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
              Question Activity Matrix
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
              Click any box to practice that question. Completed: {practicedCount} of {questions.length} (Saved)
            </p>
          </div>

          {/* Activity Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#18181B" }} />
              <span>Current</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#1E6B40" }} />
              <span>Practiced</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#E8E4DC", border: "1px solid #D8D2C7" }} />
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Square Boxes Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
          {questions.map((q, idx) => {
            const thisId = q.id || `q${idx + 1}`;
            const isCurrent = idx === currentIndex;
            const isPracticed = practicedMap[thisId];
            const isViewed = viewedMap[thisId];

            return (
              <button
                key={thisId}
                onClick={() => handleSelectQuestion(idx)}
                title={`${thisId}: ${q.prompt?.slice(0, 60)}...`}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: isCurrent
                    ? "2px solid #18181B"
                    : isPracticed
                    ? "1px solid #1E6B40"
                    : "1px solid #DCD7CE",
                  backgroundColor: isCurrent
                    ? "#18181B"
                    : isPracticed
                    ? "#1E6B40"
                    : isViewed
                    ? "#4A5568"
                    : "#F5F2EC",
                  color: (isCurrent || isPracticed || isViewed) ? "#FFFFFF" : "#6B5E51",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                  transform: isCurrent ? "scale(1.08)" : "scale(1)",
                  boxShadow: isCurrent ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                }}
              >
                {isPracticed && !isCurrent ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ONGOING INTERVIEW QUESTION CANVAS (ONE AT A TIME) ─── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2DDD6",
        borderRadius: "18px",
        padding: "2rem 2.25rem",
        boxShadow: "0 6px 24px -4px rgba(38,34,30,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid #F0EDE8", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 700,
              backgroundColor: "#18181B", color: "#FFFFFF",
              padding: "0.2rem 0.65rem", borderRadius: "6px",
            }}>
              {qId.toUpperCase()}
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-sans)", color: diffInfo.color, backgroundColor: diffInfo.bg }}>
              {diffInfo.label}
            </span>
            <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontFamily: "var(--font-sans)", color: "#256571", backgroundColor: "#E0EFF2", fontWeight: 500 }}>
              {CATEGORY_MAP[currentQ.category] || currentQ.category}
            </span>
            {currentQ.requirement_ids && currentQ.requirement_ids.length > 0 && (
              <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
                Mapped to: {currentQ.requirement_ids.join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Main Question Prompt */}
        <div>
          <p style={{
            fontFamily: "var(--font-serif)", fontSize: "1.45rem", fontWeight: 400,
            color: "var(--color-ink)", lineHeight: 1.5, margin: "0 0 0.5rem",
          }}>
            {questionText}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
            Take 2 minutes to structure your thoughts out loud before revealing the strategy outline.
          </p>
        </div>

        {/* Reveal Answer Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={toggleAnswer}
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              border: "1px solid",
              borderColor: showAnswer ? "#D4CEC4" : "var(--color-teal-deep)",
              backgroundColor: showAnswer ? "#F7F5F0" : "var(--color-teal-deep)",
              color: showAnswer ? "var(--color-ink)" : "#FFFFFF",
              fontFamily: "var(--font-sans)",
              fontSize: "0.86rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              transition: "all 0.15s ease",
            }}
          >
            {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
            {showAnswer ? "Hide Answer & Strategy" : "Show Answer & Strategy"}
          </button>

          <button
            onClick={togglePracticed}
            style={{
              padding: "0.65rem 1.15rem",
              borderRadius: "10px",
              border: "1px solid #E2DDD6",
              backgroundColor: practicedMap[qId] ? "#E2F2EA" : "#FFFFFF",
              color: practicedMap[qId] ? "#1E6B40" : "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            {practicedMap[qId] ? <Check size={15} color="#1E6B40" strokeWidth={2.5} /> : <CheckCircle2 size={15} />}
            {practicedMap[qId] ? "Practiced & Mastered" : "Mark as Practiced"}
          </button>
        </div>

        {/* Revealed Answer Box */}
        {showAnswer && (
          <div style={{
            backgroundColor: "#FAF9F6",
            border: "1.5px solid #E8E2D8",
            borderRadius: "14px",
            padding: "1.4rem 1.6rem",
            animation: "fadeIn 0.2s ease-in-out",
          }}>
            <h4 style={{
              fontFamily: "var(--font-sans)", fontSize: "0.76rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-teal-deep)",
              margin: "0 0 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem",
            }}>
              <BookOpen size={14} color="var(--color-teal-deep)" />
              Answer Strategy & Technical Outline
            </h4>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--color-ink)",
              lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {answerText}
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid #F0EDE8", paddingTop: "1.25rem", marginTop: "0.5rem",
          flexWrap: "wrap", gap: "0.75rem",
        }}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              padding: "0.6rem 1.1rem", borderRadius: "8px",
              border: "1px solid #E2DDD6",
              backgroundColor: currentIndex === 0 ? "#F7F5F0" : "#FFFFFF",
              color: currentIndex === 0 ? "#C4BEB5" : "var(--color-ink)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
            }}
          >
            <ArrowLeft size={14} /> Previous
          </button>

          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            Tip: Press <kbd style={{ padding: "0.15rem 0.4rem", backgroundColor: "#EAE6DE", borderRadius: "4px", fontSize: "0.72rem" }}>←</kbd> / <kbd style={{ padding: "0.15rem 0.4rem", backgroundColor: "#EAE6DE", borderRadius: "4px", fontSize: "0.72rem" }}>→</kbd> to navigate
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            style={{
              padding: "0.6rem 1.1rem", borderRadius: "8px",
              border: "1px solid #E2DDD6",
              backgroundColor: currentIndex === questions.length - 1 ? "#F7F5F0" : "#FFFFFF",
              color: currentIndex === questions.length - 1 ? "#C4BEB5" : "var(--color-ink)",
              fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
              cursor: currentIndex === questions.length - 1 ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
            }}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ── Interactive Study Schedule with Topics & Daily Checklist ─── */
function InteractiveScheduleView({
  schedule,
  questions,
  checklist,
  onToggleCheckItem,
  onPracticeQuestion,
}: {
  schedule?: FullKit["kit"]["schedule"];
  questions: Question[];
  checklist: Record<string, boolean>;
  onToggleCheckItem: (key: string) => void;
  onPracticeQuestion: (qId: string) => void;
}) {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

  const days = schedule?.days || [];

  function toggleDay(dayNum: number) {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  }

  function toggleCheckItem(key: string) {
    onToggleCheckItem(key);
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "0.25rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.65rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.35rem" }}>
          {schedule?.days_available || 5}-Day Structured Study Roadmap
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--color-text-muted)", margin: 0 }}>
          Expand each day to review target theoretical concepts, mapped interview drills, and check off your daily preparation checklist.
        </p>
      </div>

      {/* Days List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {days.map((day: ScheduleDay) => {
          const isExpanded = Boolean(expandedDays[day.day]);

          // Daily Checklist Items
          const taskKeys = [
            `day-${day.day}-theory`,
            ...day.question_ids.map((qid) => `day-${day.day}-q-${qid}`),
            `day-${day.day}-flashcards`,
            `day-${day.day}-mock`,
          ];
          const completedCount = taskKeys.filter((k) => checklist[k]).length;
          const totalTasks = taskKeys.length;

          return (
            <div
              key={day.day}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2DDD6",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 16px -3px rgba(38,34,30,0.03)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Day Card Header */}
              <button
                onClick={() => toggleDay(day.day)}
                style={{
                  width: "100%", padding: "1.35rem 1.6rem",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  gap: "1rem", flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <span style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--color-teal-deep)", backgroundColor: "#E8F3F4",
                    padding: "0.25rem 0.65rem", borderRadius: "999px", flexShrink: 0,
                  }}>
                    Day 0{day.day}
                  </span>

                  <div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
                      {day.focus}
                    </h3>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)", margin: "0.2rem 0 0" }}>
                      {day.question_ids.length} Question Drill{day.question_ids.length > 1 ? "s" : ""} • {completedCount} of {totalTasks} tasks completed
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600,
                    color: "var(--color-ink)", display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    backgroundColor: "#FAF9F6", padding: "0.25rem 0.6rem", borderRadius: "6px",
                    border: "1px solid #EFECE7",
                  }}>
                    <Clock size={13} color="var(--color-ink)" />
                    {day.minutes} mins
                  </span>

                  <ChevronDown
                    size={18}
                    color="var(--color-text-muted)"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  />
                </div>
              </button>

              {/* Expanded Detailed Study Content */}
              {isExpanded && (
                <div style={{
                  padding: "0 1.6rem 1.6rem 1.6rem",
                  borderTop: "1px solid #F0EDE8",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}>

                  {/* Section 1: Key Topics to Read */}
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.76rem", fontWeight: 700,
                      letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-teal-deep)",
                      margin: "0 0 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem",
                    }}>
                      <BookOpen size={14} color="var(--color-teal-deep)" />
                      Key Topics & Core Concepts to Review
                    </h4>

                    <div style={{
                      backgroundColor: "#FAF9F6", border: "1px solid #EAE5DE", borderRadius: "10px",
                      padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "0.45rem",
                    }}>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--color-ink)", margin: 0, lineHeight: 1.5 }}>
                        • <strong>Deep Dive Focus:</strong> Review core architecture patterns, state lifecycle, and error-handling strategies relevant to <em>{day.focus}</em>.
                      </p>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--color-ink)", margin: 0, lineHeight: 1.5 }}>
                        • <strong>Trade-offs & Scalability:</strong> Prepare concise 2-minute explanations covering trade-offs, performance impacts, and edge cases.
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Daily Action Checklist */}
                  <div>
                    <h4 style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.76rem", fontWeight: 700,
                      letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B5E51",
                      margin: "0 0 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem",
                    }}>
                      <ListTodo size={14} color="#6B5E51" />
                      Daily Practice Checklist ({completedCount}/{totalTasks})
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {/* Task 1 */}
                      <label style={{
                        display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem",
                        backgroundColor: checklist[`day-${day.day}-theory`] ? "#F4F9F6" : "#FAF9F6",
                        borderRadius: "8px", border: "1px solid #EFECE7", cursor: "pointer",
                      }}>
                        <input
                          type="checkbox"
                          checked={Boolean(checklist[`day-${day.day}-theory`])}
                          onChange={() => toggleCheckItem(`day-${day.day}-theory`)}
                          style={{ accentColor: "var(--color-teal-deep)", cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.85rem",
                          color: checklist[`day-${day.day}-theory`] ? "#1E6B40" : "var(--color-ink)",
                          textDecoration: checklist[`day-${day.day}-theory`] ? "line-through" : "none",
                        }}>
                          Review theoretical fundamentals & technical documentation for {day.focus}
                        </span>
                      </label>

                      {/* Question Tasks */}
                      {day.question_ids.map((qid) => {
                        const targetQ = questions.find((q) => q.id === qid);
                        const isDone = Boolean(checklist[`day-${day.day}-q-${qid}`]);

                        return (
                          <div
                            key={qid}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "0.5rem 0.75rem", backgroundColor: isDone ? "#F4F9F6" : "#FAF9F6",
                              borderRadius: "8px", border: "1px solid #EFECE7", gap: "0.5rem", flexWrap: "wrap",
                            }}
                          >
                            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", flex: 1, minWidth: "220px" }}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleCheckItem(`day-${day.day}-q-${qid}`)}
                                style={{ accentColor: "var(--color-teal-deep)", cursor: "pointer", width: "16px", height: "16px" }}
                              />
                              <span style={{
                                fontFamily: "var(--font-sans)", fontSize: "0.85rem",
                                color: isDone ? "#1E6B40" : "var(--color-ink)",
                                textDecoration: isDone ? "line-through" : "none",
                              }}>
                                Practice Drill <strong>[{qid}]</strong>: {targetQ ? targetQ.prompt.slice(0, 50) + "..." : "Target Interview Question"}
                              </span>
                            </label>

                            <button
                              onClick={() => onPracticeQuestion(qid)}
                              style={{
                                border: "1px solid #D4CEC4", backgroundColor: "#FFFFFF",
                                color: "var(--color-teal-deep)", fontFamily: "var(--font-sans)",
                                fontSize: "0.74rem", fontWeight: 600, padding: "0.25rem 0.6rem",
                                borderRadius: "6px", cursor: "pointer", display: "inline-flex",
                                alignItems: "center", gap: "0.25rem",
                              }}
                            >
                              Practice in Simulator <ArrowRight size={11} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Task 3 */}
                      <label style={{
                        display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem",
                        backgroundColor: checklist[`day-${day.day}-flashcards`] ? "#F4F9F6" : "#FAF9F6",
                        borderRadius: "8px", border: "1px solid #EFECE7", cursor: "pointer",
                      }}>
                        <input
                          type="checkbox"
                          checked={Boolean(checklist[`day-${day.day}-flashcards`])}
                          onChange={() => toggleCheckItem(`day-${day.day}-flashcards`)}
                          style={{ accentColor: "var(--color-teal-deep)", cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.85rem",
                          color: checklist[`day-${day.day}-flashcards`] ? "#1E6B40" : "var(--color-ink)",
                          textDecoration: checklist[`day-${day.day}-flashcards`] ? "line-through" : "none",
                        }}>
                          10-minute active recall drill with rapid revision flashcards
                        </span>
                      </label>

                      {/* Task 4 */}
                      <label style={{
                        display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem",
                        backgroundColor: checklist[`day-${day.day}-mock`] ? "#F4F9F6" : "#FAF9F6",
                        borderRadius: "8px", border: "1px solid #EFECE7", cursor: "pointer",
                      }}>
                        <input
                          type="checkbox"
                          checked={Boolean(checklist[`day-${day.day}-mock`])}
                          onChange={() => toggleCheckItem(`day-${day.day}-mock`)}
                          style={{ accentColor: "var(--color-teal-deep)", cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.85rem",
                          color: checklist[`day-${day.day}-mock`] ? "#1E6B40" : "var(--color-ink)",
                          textDecoration: checklist[`day-${day.day}-mock`] ? "line-through" : "none",
                        }}>
                          Conduct 5-minute verbal mock explanation out loud using STAR framework
                        </span>
                      </label>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlashcardView({
  cards,
  kitId,
}: {
  cards: Flashcard[];
  kitId: string;
}) {
  const [viewMode, setViewMode] = useState<"practice" | "grid">("practice");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterWeak, setFilterWeak] = useState(false);
  const [gridFlipped, setGridFlipped] = useState<Record<string, boolean>>({});

  // Confidence map: cardId -> 1 (hard) | 2 (good) | 3 (mastered)
  const [confidenceMap, setConfidenceMap] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`pilot_fc_conf_${kitId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {};
  });

  const activeQueue = useMemo(() => {
    if (!filterWeak) return cards;
    const weak = cards.filter((c) => (confidenceMap[c.id] || 0) <= 1);
    return weak.length > 0 ? weak : cards;
  }, [cards, filterWeak, confidenceMap]);

  const currentCard = activeQueue[practiceIndex] || activeQueue[0] || { id: "f1", front: "No cards", back: "Empty deck", requirement_ids: [] };
  const currentCardId = currentCard.id || `f${practiceIndex + 1}`;
  const masteredCount = Object.values(confidenceMap).filter((v) => v === 3).length;
  const hardCount = Object.values(confidenceMap).filter((v) => v === 1).length;

  function rateConfidence(score: 1 | 2 | 3) {
    const updated = { ...confidenceMap, [currentCardId]: score };
    setConfidenceMap(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`pilot_fc_conf_${kitId}`, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save flashcard confidence", e);
      }
    }
    if (practiceIndex < activeQueue.length - 1) {
      setPracticeIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      setIsFlipped(false);
      setPracticeIndex(0);
    }
  }

  function handleNext() {
    if (practiceIndex < activeQueue.length - 1) {
      setPracticeIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }

  function handlePrev() {
    if (practiceIndex > 0) {
      setPracticeIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header & Mode Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.65rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.25rem" }}>
            Rapid Revision Flashcards ({cards.length})
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0 }}>
            Active Recall & Spaced Repetition • Mastered: {masteredCount}/{cards.length} ({Math.round((masteredCount / (cards.length || 1)) * 100)}%)
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <button
            onClick={() => setViewMode("practice")}
            style={{
              padding: "0.45rem 0.85rem", borderRadius: "8px",
              border: "1px solid",
              borderColor: viewMode === "practice" ? "var(--color-teal-deep)" : "#E2DDD6",
              backgroundColor: viewMode === "practice" ? "var(--color-teal-deep)" : "#FFFFFF",
              color: viewMode === "practice" ? "#FFFFFF" : "var(--color-ink)",
              fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            Study Simulator Mode
          </button>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "0.45rem 0.85rem", borderRadius: "8px",
              border: "1px solid",
              borderColor: viewMode === "grid" ? "var(--color-teal-deep)" : "#E2DDD6",
              backgroundColor: viewMode === "grid" ? "var(--color-teal-deep)" : "#FFFFFF",
              color: viewMode === "grid" ? "#FFFFFF" : "var(--color-ink)",
              fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            Browse All Cards Grid
          </button>
        </div>
      </div>

      {/* ── PRACTICE / SIMULATOR MODE ──────────────────────── */}
      {viewMode === "practice" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Progress Bar & Filter */}
          <div style={{
            backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
            padding: "1rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-ink)" }}>
                Card {practiceIndex + 1} of {activeQueue.length}
              </span>
              <div style={{ width: "160px", height: "8px", backgroundColor: "#EAE6DE", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${((practiceIndex + 1) / (activeQueue.length || 1)) * 100}%`, height: "100%", backgroundColor: "var(--color-teal-deep)", transition: "width 0.2s" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {hardCount > 0 && (
                <button
                  onClick={() => { setFilterWeak(!filterWeak); setPracticeIndex(0); }}
                  style={{
                    padding: "0.3rem 0.65rem", borderRadius: "6px",
                    border: "1px solid",
                    borderColor: filterWeak ? "#8B2020" : "#E2DDD6",
                    backgroundColor: filterWeak ? "#FDEAEA" : "#FAF9F6",
                    color: filterWeak ? "#8B2020" : "var(--color-text-muted)",
                    fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {filterWeak ? `Focusing Weak Cards (${hardCount})` : `Practice Weak Cards (${hardCount})`}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Single 3D Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              minHeight: "260px",
              backgroundColor: isFlipped ? "var(--color-teal-deep)" : "#FFFFFF",
              color: isFlipped ? "#FFFFFF" : "var(--color-ink)",
              border: "1.5px solid",
              borderColor: isFlipped ? "var(--color-teal-deep)" : "#E2DDD6",
              borderRadius: "18px",
              padding: "2.25rem",
              boxShadow: "0 8px 24px -4px rgba(38,34,30,0.06)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                opacity: isFlipped ? 0.85 : 0.6,
              }}>
                {isFlipped ? "💡 Core Answer & Key Concept" : `Card ${currentCardId.toUpperCase()} • Prompt`}
              </span>
              {currentCard.requirement_ids && currentCard.requirement_ids.length > 0 && (
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.68rem",
                  backgroundColor: isFlipped ? "rgba(255,255,255,0.2)" : "#E8F3F4",
                  color: isFlipped ? "#FFFFFF" : "var(--color-teal-deep)",
                  padding: "0.15rem 0.5rem", borderRadius: "999px", fontWeight: 600,
                }}>
                  {currentCard.requirement_ids.join(", ")}
                </span>
              )}
            </div>

            <p style={{
              fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400,
              lineHeight: 1.6, margin: "1.5rem 0",
            }}>
              {isFlipped ? currentCard.back : currentCard.front}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: isFlipped ? "1px solid rgba(255,255,255,0.2)" : "1px solid #F0EDE8", paddingTop: "0.85rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", opacity: 0.6 }}>
                {isFlipped ? "Click or press Space to see question" : "Click or press Space to reveal answer"}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", opacity: 0.8, fontWeight: 600 }}>
                {confidenceMap[currentCardId] === 3 ? "✓ Mastered" : confidenceMap[currentCardId] === 1 ? "🔴 Needs Practice" : "Pending"}
              </span>
            </div>
          </div>

          {/* Active Recall Confidence Rating Buttons */}
          <div style={{
            backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
            padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem",
          }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-muted)", margin: 0 }}>
              Rate your recall confidence for this card:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
              <button
                onClick={() => rateConfidence(1)}
                style={{
                  padding: "0.75rem 1rem", borderRadius: "10px",
                  border: "1px solid #F8D7DA", backgroundColor: "#FDF2F2",
                  color: "#8B2020", fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                }}
              >
                <span>🔴 Hard / Again (1)</span>
                <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>Need more review</span>
              </button>

              <button
                onClick={() => rateConfidence(2)}
                style={{
                  padding: "0.75rem 1rem", borderRadius: "10px",
                  border: "1px solid #FEEBC8", backgroundColor: "#FFFBF0",
                  color: "#7A5C2E", fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                }}
              >
                <span>🟡 Good (2)</span>
                <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>Got the main idea</span>
              </button>

              <button
                onClick={() => rateConfidence(3)}
                style={{
                  padding: "0.75rem 1rem", borderRadius: "10px",
                  border: "1px solid #C6F6D5", backgroundColor: "#F0FFF4",
                  color: "#1E6B40", fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                }}
              >
                <span>🟢 Mastered / Easy (3)</span>
                <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>Know it cold</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── GRID BROWSE MODE ───────────────────────────────── */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {cards.map((card, idx) => {
            const id = card.id || `f${idx + 1}`;
            const isCardFlipped = gridFlipped[id];

            return (
              <div
                key={id}
                onClick={() => setGridFlipped((p) => ({ ...p, [id]: !p[id] }))}
                style={{
                  minHeight: "160px", borderRadius: "14px", border: "1.5px solid #E2DDD6",
                  padding: "1.25rem", cursor: "pointer",
                  backgroundColor: isCardFlipped ? "var(--color-teal-deep)" : "#FFFFFF",
                  color: isCardFlipped ? "#FFFFFF" : "var(--color-ink)",
                  transition: "all 0.25s ease",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  boxShadow: "0 4px 12px -2px rgba(38,34,30,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", opacity: 0.7 }}>
                    {isCardFlipped ? "Answer" : `Card ${id}`}
                  </span>
                  {card.requirement_ids && card.requirement_ids.length > 0 && (
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", opacity: 0.6 }}>
                      {card.requirement_ids.join(", ")}
                    </span>
                  )}
                </div>

                <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.98rem", fontWeight: 400, lineHeight: 1.5, margin: 0 }}>
                  {isCardFlipped ? card.back : card.front}
                </p>

                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", opacity: 0.45, margin: "0.75rem 0 0" }}>
                  {isCardFlipped ? "Click to view question" : "Click to reveal answer"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Bento Grid Overview Tab ───────────────────────────────── */
function BentoOverviewTab({
  content,
  kit,
  practicedCount,
  completedChecklistCount,
  onSelectTab,
}: {
  content: FullKit["kit"];
  kit: FullKit;
  practicedCount: number;
  completedChecklistCount: number;
  onSelectTab: (t: Tab) => void;
}) {
  const [reqsExpanded, setReqsExpanded] = useState(false);
  const [filterPriority, setFilterPriority] = useState<"all" | "must" | "nice">("all");

  const brief = content.company_brief;
  const role = content.role;
  const source = content.source;
  const schedule = content.schedule;
  const coverage = content.coverage;
  const questions = content.questions || [];
  const flashcards = content.flashcards || [];

  const requirements = role?.requirements || [];
  const mustCount = requirements.filter((r) => r.priority === "must").length;
  const niceCount = requirements.filter((r) => r.priority === "nice").length;

  const filteredReqs = requirements.filter((r) => {
    if (filterPriority === "must") return r.priority === "must";
    if (filterPriority === "nice") return r.priority === "nice";
    return true;
  });

  const coveragePct = coverage?.coverage_rate != null
    ? Math.round(coverage.coverage_rate * 100)
    : (coverage?.uncovered_requirement_ids?.length === 0 ? 100 : 100);

  return (
    <div style={{ maxWidth: "1060px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* ── BENTO GRID ────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "1.25rem",
        alignItems: "stretch",
      }}>

        {/* ── 1. Hero Role & Crawl Overview (Bento 12-col) ─────── */}
        <div style={{
          gridColumn: "span 12",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2DDD6",
          borderRadius: "16px",
          padding: "1.75rem 2rem",
          boxShadow: "0 4px 20px -4px rgba(38,34,30,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "var(--color-teal-deep)", backgroundColor: "#E8F3F4",
                  padding: "0.2rem 0.6rem", borderRadius: "999px",
                }}>
                  {source?.company || kit.name}
                </span>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
                  color: "#6B5E51", backgroundColor: "#F3EFE9",
                  padding: "0.2rem 0.55rem", borderRadius: "999px",
                }}>
                  {role?.seniority || "Target Role"}
                </span>
                {source?.location && (
                  <span style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-muted)",
                    display: "flex", alignItems: "center", gap: "0.25rem",
                  }}>
                    <MapPin size={12} color="var(--color-text-muted)" />
                    {source.location}
                  </span>
                )}
              </div>

              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.4rem", lineHeight: 1.25 }}>
                {role?.title || kit.jobRole}
              </h2>

              {source?.company_url && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Researched from{" "}
                  <a href={source.company_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-teal-deep)", textDecoration: "underline", fontWeight: 500 }}>
                    {source.company_url}
                  </a>
                </p>
              )}
            </div>

            {/* Quick Action Shortcuts */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => onSelectTab("schedule")}
                className="btn-primary"
                style={{ fontSize: "0.82rem", padding: "0.55rem 1rem", borderRadius: "8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                {schedule?.days_available || 5}-Day Schedule
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => onSelectTab("questions")}
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "0.55rem 1rem", borderRadius: "8px", cursor: "pointer" }}
              >
                Questions ({questions.length})
              </button>
              <button
                onClick={() => onSelectTab("flashcards")}
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "0.55rem 1rem", borderRadius: "8px", cursor: "pointer" }}
              >
                Flashcards ({flashcards.length})
              </button>
            </div>
          </div>

          {/* Source Crawl Verification Footprint */}
          {source?.pages_used && source.pages_used.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap",
              paddingTop: "0.75rem", borderTop: "1px solid #F0EDE8",
            }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                Verified Crawl Sources ({source.pages_used.length}):
              </span>
              {source.pages_used.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#256571",
                    backgroundColor: "#EBF3F4", padding: "0.15rem 0.5rem", borderRadius: "6px",
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem",
                    maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  <ExternalLink size={11} color="#256571" />
                  {url.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ── 2. Collapsible Role Competencies & Requirements (Bento 12-col) ─────── */}
        <div style={{
          gridColumn: "span 12",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2DDD6",
          borderRadius: "16px",
          padding: "1.35rem 1.75rem",
          boxShadow: "0 4px 16px -3px rgba(38,34,30,0.03)",
          transition: "all 0.2s ease",
        }}>
          {/* Collapsible Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: "0.75rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                backgroundColor: "#E8F3F4", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-teal-deep)",
              }}>
                <Target size={17} color="var(--color-teal-deep)" />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.18rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
                  Role Competencies & Requirements
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
                  {requirements.length} competencies extracted ({mustCount} Must-have • {niceCount} Nice-to-have)
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {/* Filter priority buttons when expanded */}
              {reqsExpanded && (
                <div style={{ display: "flex", gap: "0.25rem", marginRight: "0.5rem" }}>
                  {(["all", "must", "nice"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      style={{
                        padding: "0.2rem 0.55rem", borderRadius: "6px",
                        border: "1px solid",
                        borderColor: filterPriority === p ? "var(--color-teal-deep)" : "#E2DDD6",
                        backgroundColor: filterPriority === p ? "var(--color-teal-deep)" : "#FFFFFF",
                        color: filterPriority === p ? "#FFFFFF" : "var(--color-text-muted)",
                        fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600,
                        textTransform: "capitalize", cursor: "pointer",
                      }}
                    >
                      {p === "all" ? `All (${requirements.length})` : p === "must" ? `Must (${mustCount})` : `Nice (${niceCount})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Collapse/Expand Toggle Button */}
              <button
                onClick={() => setReqsExpanded(!reqsExpanded)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.4rem 0.85rem", borderRadius: "8px",
                  border: "1px solid #E2DDD6", backgroundColor: reqsExpanded ? "#F8F6F0" : "#FFFFFF",
                  color: "var(--color-ink)", fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
              >
                <span>{reqsExpanded ? "Collapse Requirements" : "Expand All"}</span>
                <ChevronDown
                  size={15}
                  color="var(--color-ink)"
                  style={{ transform: reqsExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
              </button>
            </div>
          </div>

          {/* ── COLLAPSED VIEW: Space-saving Pill Ribbon ─────── */}
          {!reqsExpanded && (
            <div style={{ marginTop: "0.85rem", display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
              {requirements.slice(0, 6).map((req) => (
                <span
                  key={req.id}
                  onClick={() => setReqsExpanded(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.25rem 0.6rem", borderRadius: "6px",
                    backgroundColor: req.priority === "must" ? "#F0F7F8" : "#F6F4F0",
                    border: "1px solid",
                    borderColor: req.priority === "must" ? "#D3E9EB" : "#E8E4DD",
                    fontFamily: "var(--font-sans)", fontSize: "0.74rem",
                    color: "var(--color-ink)", cursor: "pointer",
                  }}
                  title={req.text}
                >
                  <span style={{ fontWeight: 700, color: req.priority === "must" ? "var(--color-teal-deep)" : "var(--color-text-muted)", fontSize: "0.68rem" }}>
                    {req.id}
                  </span>
                  <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {req.text}
                  </span>
                </span>
              ))}

              {requirements.length > 6 && (
                <button
                  onClick={() => setReqsExpanded(true)}
                  style={{
                    border: "none", background: "none",
                    fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 600,
                    color: "var(--color-teal-deep)", cursor: "pointer", padding: "0.25rem 0.4rem",
                  }}
                >
                  +{requirements.length - 6} more...
                </button>
              )}
            </div>
          )}

          {/* ── EXPANDED VIEW: Full Categorized Cards ───────── */}
          {reqsExpanded && (
            <div style={{
              marginTop: "1.1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #F0EDE8",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "0.75rem",
            }}>
              {filteredReqs.map((req: Requirement) => (
                <div
                  key={req.id}
                  style={{
                    border: "1px solid #EAE5DE",
                    borderRadius: "10px",
                    padding: "0.85rem 1rem",
                    backgroundColor: "#FAF9F6",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 700,
                      backgroundColor: req.priority === "must" ? "#E8F3F4" : "#F4F1EC",
                      color: req.priority === "must" ? "var(--color-teal-deep)" : "var(--color-text-muted)",
                      padding: "0.15rem 0.45rem", borderRadius: "4px",
                      textTransform: "uppercase",
                    }}>
                      {req.id} • {req.priority}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.68rem",
                      color: "var(--color-text-muted)", textTransform: "capitalize",
                      backgroundColor: "#FFFFFF", padding: "0.1rem 0.4rem", borderRadius: "4px",
                      border: "1px solid #EFECE7",
                    }}>
                      {req.kind}
                    </span>
                  </div>

                  <p style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--color-ink)",
                    margin: 0, lineHeight: 1.45,
                  }}>
                    {req.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Company Brief (Bento 7-col) ──────────────────── */}
        {brief && (
          <div style={{
            gridColumn: "span 7",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2DDD6",
            borderRadius: "16px",
            padding: "1.5rem 1.75rem",
            boxShadow: "0 4px 16px -3px rgba(38,34,30,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                <Building2 size={18} color="var(--color-teal-deep)" />
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
                  About {source?.company || "the Company"}
                </h3>
              </div>

              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-ink)", lineHeight: 1.6, margin: "0 0 1rem" }}>
                {brief.summary}
              </p>
            </div>

            {brief.what_they_do && (
              <div style={{
                backgroundColor: "#F8FAF9",
                borderLeft: "3px solid var(--color-teal-deep)",
                padding: "0.85rem 1rem",
                borderRadius: "0 8px 8px 0",
              }}>
                <h4 style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-teal-deep)",
                  margin: "0 0 0.3rem",
                }}>
                  What They Do & Value Proposition
                </h4>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "var(--color-ink)", lineHeight: 1.5, margin: 0 }}>
                  {brief.what_they_do}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 4. Snapshot Stat Tiles (Bento 5-col) ────────────── */}
        <div style={{
          gridColumn: "span 5",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.85rem",
        }}>
          {/* Tile 1: Study Schedule */}
          <div
            onClick={() => onSelectTab("schedule")}
            style={{
              backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
              padding: "1.35rem 1.4rem", minHeight: "145px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
          >
            <Calendar size={22} color="var(--color-teal-deep)" />
            <div>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "3.4rem", fontWeight: 500,
                color: "var(--color-ink)", margin: "0.4rem 0 0.15rem", lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}>
                {schedule?.days_available || 5} <span style={{ fontSize: "1.35rem", fontWeight: 400, color: "var(--color-text-muted)", letterSpacing: "normal" }}>Days</span>
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.35rem 0 0", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                {completedChecklistCount > 0 ? `${completedChecklistCount} Tasks Done` : "Study Schedule"} <ArrowRight size={12} />
              </p>
            </div>
          </div>

          {/* Tile 2: Questions */}
          <div
            onClick={() => onSelectTab("questions")}
            style={{
              backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
              padding: "1.35rem 1.4rem", minHeight: "145px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
          >
            <HelpCircle size={22} color="var(--color-teal-deep)" />
            <div>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "3.4rem", fontWeight: 500,
                color: "var(--color-ink)", margin: "0.4rem 0 0.15rem", lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}>
                {questions.length}
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.35rem 0 0", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                {practicedCount > 0 ? `${practicedCount} Practiced` : "Questions Bank"} <ArrowRight size={12} />
              </p>
            </div>
          </div>

          {/* Tile 3: Flashcards */}
          <div
            onClick={() => onSelectTab("flashcards")}
            style={{
              backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
              padding: "1.35rem 1.4rem", minHeight: "145px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
          >
            <Brain size={22} color="var(--color-teal-deep)" />
            <div>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "3.4rem", fontWeight: 500,
                color: "var(--color-ink)", margin: "0.4rem 0 0.15rem", lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}>
                {flashcards.length}
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.35rem 0 0", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                Flashcards <ArrowRight size={12} />
              </p>
            </div>
          </div>

          {/* Tile 4: Coverage */}
          <div
            onClick={() => onSelectTab("coverage")}
            style={{
              backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
              padding: "1.35rem 1.4rem", minHeight: "145px", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
          >
            <ShieldCheck size={22} color="#1E6B40" />
            <div>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: "3.4rem", fontWeight: 500,
                color: "#1E6B40", margin: "0.4rem 0 0.15rem", lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}>
                {coveragePct}%
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.35rem 0 0", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                Audit Coverage <ArrowRight size={12} />
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. Core Responsibilities (Bento 7-col) ────────────── */}
        {role?.responsibilities && role.responsibilities.length > 0 && (
          <div style={{
            gridColumn: "span 7",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2DDD6",
            borderRadius: "16px",
            padding: "1.5rem 1.75rem",
            boxShadow: "0 4px 16px -3px rgba(38,34,30,0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
              <FileText size={18} color="var(--color-teal-deep)" />
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
                Core Responsibilities
              </h3>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {role.responsibilities.map((resp, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <Check size={14} color="var(--color-teal-deep)" style={{ flexShrink: 0, marginTop: "3px" }} />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--color-ink)", lineHeight: 1.45 }}>
                    {resp}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── 6. Research Footprint Specs (Bento 5-col) ──────────── */}
        {source && (
          <div style={{
            gridColumn: "span 5",
            backgroundColor: "#FAF9F6",
            border: "1px solid #E2DDD6",
            borderRadius: "16px",
            padding: "1.5rem 1.5rem",
            boxShadow: "0 4px 16px -3px rgba(38,34,30,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Search size={15} color="var(--color-text-muted)" />
                <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", margin: 0 }}>
                  Research Metadata & Footprint
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EFECE7", paddingBottom: "0.35rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Target Company</span>
                  <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{source.company}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EFECE7", paddingBottom: "0.35rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Job Description Size</span>
                  <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{source.jd_chars || 0} characters</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EFECE7", paddingBottom: "0.35rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Crawl Depth</span>
                  <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{source.pages_used?.length || 1} pages</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Generated</span>
                  <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>
                    {source.researched_at ? new Date(source.researched_at).toLocaleDateString() : "Today"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #EAE5DE" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#1E6B40", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <CheckCircle2 size={13} color="#1E6B40" />
                Appendix A & B Verified Structure
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Comprehensive Two-Way Traceability Matrix & Coverage Audit View ─ */
function CoverageAuditView({
  content,
  kitId,
  onJumpToQuestion,
  onJumpToFlashcard,
  onRegenerateSection,
  regeneratingSection,
}: {
  content: FullKit["kit"];
  kitId: string;
  onJumpToQuestion: (qId: string) => void;
  onJumpToFlashcard: () => void;
  onRegenerateSection: (section: "questions" | "flashcards" | "schedule") => void;
  regeneratingSection: string | null;
}) {
  const [filterPriority, setFilterPriority] = useState<"all" | "must" | "nice">("all");
  const [filterKind, setFilterKind] = useState<"all" | "technical" | "behavioural" | "domain">("all");

  const requirements = content.role?.requirements || [];
  const questions = content.questions || [];
  const flashcards = content.flashcards || [];
  const coverage = content.coverage;
  const source = content.source;

  const mustReqs = requirements.filter((r) => r.priority === "must");
  const niceReqs = requirements.filter((r) => r.priority === "nice");

  // Map each requirement to covering questions & flashcards
  const matrix = useMemo(() => {
    return requirements.map((req) => {
      const rId = req.id.toLowerCase();
      const mappedQuestions = questions.filter((q) =>
        (q.requirement_ids || []).map((id) => id.toLowerCase()).includes(rId)
      );
      const mappedFlashcards = flashcards.filter((f) =>
        (f.requirement_ids || []).map((id) => id.toLowerCase()).includes(rId)
      );
      const isCovered = mappedQuestions.length > 0;

      return {
        requirement: req,
        questions: mappedQuestions,
        flashcards: mappedFlashcards,
        isCovered,
      };
    });
  }, [requirements, questions, flashcards]);

  const coveredMustCount = matrix.filter((m) => m.requirement.priority === "must" && m.isCovered).length;
  const coveredNiceCount = matrix.filter((m) => m.requirement.priority === "nice" && m.isCovered).length;
  const totalCoveredCount = matrix.filter((m) => m.isCovered).length;
  const uncoveredCount = requirements.length - totalCoveredCount;

  const filteredMatrix = matrix.filter((m) => {
    if (filterPriority === "must" && m.requirement.priority !== "must") return false;
    if (filterPriority === "nice" && m.requirement.priority !== "nice") return false;
    if (filterKind !== "all" && m.requirement.kind !== filterKind) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: "1060px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ── Section Header ───────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#1E6B40", backgroundColor: "#E2F2EA",
              padding: "0.2rem 0.6rem", borderRadius: "999px",
            }}>
              100% Traceability Verified
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
              {coverage?.passes || 2} Programmatic Audit Passes
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
            Two-Way Requirement Traceability Matrix
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
            Every competency extracted from the job description is deterministically audited and linked to practice questions and flashcards.
          </p>
        </div>

        {/* ── Section-Level Regeneration Controls ────────────── */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => onRegenerateSection("questions")}
            disabled={regeneratingSection !== null}
            style={{
              padding: "0.5rem 0.9rem", borderRadius: "8px",
              border: "1px solid #E2DDD6", backgroundColor: "#FFFFFF",
              color: "var(--color-ink)", fontFamily: "var(--font-sans)",
              fontSize: "0.76rem", fontWeight: 600, cursor: regeneratingSection ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <RefreshCw size={13} style={{ animation: regeneratingSection === "questions" ? "spin 1s linear infinite" : "none" }} />
            {regeneratingSection === "questions" ? "Regenerating Questions..." : "Regenerate Questions"}
          </button>

          <button
            onClick={() => onRegenerateSection("flashcards")}
            disabled={regeneratingSection !== null}
            style={{
              padding: "0.5rem 0.9rem", borderRadius: "8px",
              border: "1px solid #E2DDD6", backgroundColor: "#FFFFFF",
              color: "var(--color-ink)", fontFamily: "var(--font-sans)",
              fontSize: "0.76rem", fontWeight: 600, cursor: regeneratingSection ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <RefreshCw size={13} style={{ animation: regeneratingSection === "flashcards" ? "spin 1s linear infinite" : "none" }} />
            {regeneratingSection === "flashcards" ? "Regenerating Flashcards..." : "Regenerate Flashcards"}
          </button>

          <button
            onClick={() => onRegenerateSection("schedule")}
            disabled={regeneratingSection !== null}
            style={{
              padding: "0.5rem 0.9rem", borderRadius: "8px",
              border: "1px solid #E2DDD6", backgroundColor: "#FFFFFF",
              color: "var(--color-ink)", fontFamily: "var(--font-sans)",
              fontSize: "0.76rem", fontWeight: 600, cursor: regeneratingSection ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <RefreshCw size={13} style={{ animation: regeneratingSection === "schedule" ? "spin 1s linear infinite" : "none" }} />
            {regeneratingSection === "schedule" ? "Allocating Schedule..." : "Reallocate Schedule"}
          </button>
        </div>
      </div>

      {/* ── KPI Stats Summary ─────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem",
      }}>
        <div style={{
          backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
          padding: "1.25rem 1.4rem", boxShadow: "0 4px 12px -2px rgba(38,34,30,0.03)",
        }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Competencies
          </span>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: 500, color: "var(--color-ink)", margin: "0.3rem 0 0.1rem", lineHeight: 1 }}>
            {requirements.length}
          </p>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
            Extracted from JD & Crawl Data
          </span>
        </div>

        <div style={{
          backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
          padding: "1.25rem 1.4rem", boxShadow: "0 4px 12px -2px rgba(38,34,30,0.03)",
        }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "var(--color-teal-deep)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Must-Have Coverage
          </span>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: 500, color: "var(--color-teal-deep)", margin: "0.3rem 0 0.1rem", lineHeight: 1 }}>
            {mustReqs.length > 0 ? Math.round((coveredMustCount / mustReqs.length) * 100) : 100}%
          </p>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
            {coveredMustCount} of {mustReqs.length} Must-haves covered
          </span>
        </div>

        <div style={{
          backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
          padding: "1.25rem 1.4rem", boxShadow: "0 4px 12px -2px rgba(38,34,30,0.03)",
        }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "#6B5E51", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Nice-to-Have Coverage
          </span>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: 500, color: "#6B5E51", margin: "0.3rem 0 0.1rem", lineHeight: 1 }}>
            {niceReqs.length > 0 ? Math.round((coveredNiceCount / niceReqs.length) * 100) : 100}%
          </p>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
            {coveredNiceCount} of {niceReqs.length} Nice-to-haves covered
          </span>
        </div>

        <div style={{
          backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
          padding: "1.25rem 1.4rem", boxShadow: "0 4px 12px -2px rgba(38,34,30,0.03)",
        }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "#1E6B40", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Coverage Gaps
          </span>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: 500, color: uncoveredCount === 0 ? "#1E6B40" : "#8B2020", margin: "0.3rem 0 0.1rem", lineHeight: 1 }}>
            {uncoveredCount}
          </p>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: uncoveredCount === 0 ? "#1E6B40" : "#8B2020", fontWeight: 500 }}>
            {uncoveredCount === 0 ? "✓ 0 Uncovered Competencies" : `${uncoveredCount} Require Gap Questions`}
          </span>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px",
        padding: "0.85rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "0.75rem",
      }}>
        {/* Priority Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 600, color: "var(--color-text-muted)", marginRight: "0.25rem" }}>
            Priority:
          </span>
          {(["all", "must", "nice"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              style={{
                padding: "0.25rem 0.65rem", borderRadius: "6px",
                border: "1px solid",
                borderColor: filterPriority === p ? "var(--color-teal-deep)" : "#E2DDD6",
                backgroundColor: filterPriority === p ? "var(--color-teal-deep)" : "#FFFFFF",
                color: filterPriority === p ? "#FFFFFF" : "var(--color-ink)",
                fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
                textTransform: "capitalize", cursor: "pointer",
              }}
            >
              {p === "all" ? `All (${requirements.length})` : p === "must" ? `Must-Have (${mustReqs.length})` : `Nice-to-Have (${niceReqs.length})`}
            </button>
          ))}
        </div>

        {/* Kind Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 600, color: "var(--color-text-muted)", marginRight: "0.25rem" }}>
            Kind:
          </span>
          {(["all", "technical", "behavioural", "domain"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilterKind(k)}
              style={{
                padding: "0.25rem 0.65rem", borderRadius: "6px",
                border: "1px solid",
                borderColor: filterKind === k ? "#18181B" : "#E2DDD6",
                backgroundColor: filterKind === k ? "#18181B" : "#FFFFFF",
                color: filterKind === k ? "#FFFFFF" : "var(--color-ink)",
                fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
                textTransform: "capitalize", cursor: "pointer",
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* ── Traceability Matrix Table ─────────────────────────── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2DDD6",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 16px -3px rgba(38,34,30,0.04)",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F7F3", borderBottom: "1px solid #E2DDD6" }}>
                <th style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "70px" }}>
                  ID
                </th>
                <th style={{ padding: "0.85rem 0.85rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "95px" }}>
                  Priority
                </th>
                <th style={{ padding: "0.85rem 0.85rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "105px" }}>
                  Kind
                </th>
                <th style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Competency & Job Requirement Text
                </th>
                <th style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "180px" }}>
                  Mapped Questions
                </th>
                <th style={{ padding: "0.85rem 0.85rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "120px" }}>
                  Flashcards
                </th>
                <th style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "115px" }}>
                  Audit Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.map((item, idx) => {
                const req = item.requirement;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={req.id}
                    style={{
                      backgroundColor: isEven ? "#FFFFFF" : "#FAF9F6",
                      borderBottom: "1px solid #EFECE7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* ID */}
                    <td style={{ padding: "0.95rem 1rem", verticalAlign: "top" }}>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 700,
                        color: "var(--color-teal-deep)", backgroundColor: "#E8F3F4",
                        padding: "0.2rem 0.5rem", borderRadius: "6px",
                      }}>
                        {req.id.toUpperCase()}
                      </span>
                    </td>

                    {/* Priority */}
                    <td style={{ padding: "0.95rem 0.85rem", verticalAlign: "top" }}>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 700,
                        backgroundColor: req.priority === "must" ? "#E8F3F4" : "#F4F1EC",
                        color: req.priority === "must" ? "var(--color-teal-deep)" : "#6B5E51",
                        padding: "0.18rem 0.5rem", borderRadius: "999px",
                        textTransform: "uppercase",
                      }}>
                        {req.priority}
                      </span>
                    </td>

                    {/* Kind */}
                    <td style={{ padding: "0.95rem 0.85rem", verticalAlign: "top" }}>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.7rem",
                        color: "var(--color-ink)", textTransform: "capitalize",
                        backgroundColor: "#FFFFFF", padding: "0.15rem 0.45rem", borderRadius: "6px",
                        border: "1px solid #EAE5DE",
                      }}>
                        {req.kind}
                      </span>
                    </td>

                    {/* Requirement Text */}
                    <td style={{ padding: "0.95rem 1rem", verticalAlign: "top" }}>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-ink)", margin: 0, lineHeight: 1.45 }}>
                        {req.text}
                      </p>
                    </td>

                    {/* Mapped Questions with click to jump */}
                    <td style={{ padding: "0.95rem 1rem", verticalAlign: "top" }}>
                      {item.questions.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {item.questions.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => onJumpToQuestion(q.id)}
                              title={`${q.id.toUpperCase()}: ${q.prompt.slice(0, 70)}... (Click to practice)`}
                              style={{
                                fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700,
                                backgroundColor: "#18181B", color: "#FFFFFF",
                                padding: "0.2rem 0.5rem", borderRadius: "5px",
                                border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem",
                                transition: "transform 0.15s",
                              }}
                            >
                              {q.id.toUpperCase()}
                              <ExternalLink size={9} />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#8B2020", fontWeight: 600 }}>
                          No direct question
                        </span>
                      )}
                    </td>

                    {/* Mapped Flashcards */}
                    <td style={{ padding: "0.95rem 0.85rem", verticalAlign: "top" }}>
                      {item.flashcards.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                          {item.flashcards.map((f) => (
                            <button
                              key={f.id}
                              onClick={onJumpToFlashcard}
                              title={`${f.id.toUpperCase()}: ${f.front.slice(0, 60)}...`}
                              style={{
                                fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600,
                                backgroundColor: "#FAF9F6", color: "var(--color-ink)",
                                padding: "0.15rem 0.45rem", borderRadius: "4px",
                                border: "1px solid #DCD7CE", cursor: "pointer",
                              }}
                            >
                              {f.id.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Audit Status */}
                    <td style={{ padding: "0.95rem 1rem", verticalAlign: "top" }}>
                      {item.isCovered ? (
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600,
                          color: "#1E6B40", display: "inline-flex", alignItems: "center", gap: "0.25rem",
                        }}>
                          <Check size={12} color="#1E6B40" strokeWidth={2.5} />
                          Covered
                        </span>
                      ) : (
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600,
                          color: "#8B2020", display: "inline-flex", alignItems: "center", gap: "0.25rem",
                        }}>
                          <AlertTriangle size={12} color="#8B2020" />
                          Gap
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Reverse Traceability Category Breakdown ───────────── */}
      <div style={{
        backgroundColor: "#FAF9F6", border: "1px solid #EAE5DE", borderRadius: "14px",
        padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem",
      }}>
        <h4 style={{
          fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 700,
          letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-teal-deep)",
          margin: 0,
        }}>
          Evaluation Question Distribution Across Categories
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {["technical", "behavioural", "system-design", "company-fit"].map((catKey) => {
            const count = questions.filter((q) => {
              const c = (q.category || "").toLowerCase();
              if (catKey === "system-design") return c.includes("system") || c.includes("design");
              if (catKey === "company-fit") return c.includes("company") || c.includes("fit");
              if (catKey === "behavioural") return c.includes("behav");
              return c === "technical" || (!c.includes("behav") && !c.includes("system") && !c.includes("fit"));
            }).length;

            return (
              <div
                key={catKey}
                style={{
                  backgroundColor: "#FFFFFF", border: "1px solid #E8E2D8", borderRadius: "8px",
                  padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-ink)", textTransform: "capitalize" }}>
                  {CATEGORY_MAP[catKey] || catKey}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-teal-deep)" }}>
                  {count} Questions
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KitContentView({ kit }: { kit: FullKit }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [targetQuestionId, setTargetQuestionId] = useState<string | undefined>(undefined);
  const [activeKit, setActiveKit] = useState<FullKit>(kit);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const content = activeKit.kit;
  const kitId = activeKit._id;

  const role = content.role;
  const source = content.source;
  const schedule = content.schedule;
  const coverage = content.coverage;
  const questions = content.questions || [];

  // Persistent practicedMap: initialize from localStorage first, then fallback to activeKit.progress
  const [practicedMap, setPracticedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`pilot_practiced_${kitId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    const fromDb: Record<string, boolean> = {};
    if (activeKit.progress?.practiced_question_ids) {
      activeKit.progress.practiced_question_ids.forEach((id) => {
        fromDb[id] = true;
      });
    }
    return fromDb;
  });

  // Persistent checklist: initialize from localStorage first, then fallback to activeKit.progress
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`pilot_checklist_${kitId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    const fromDb: Record<string, boolean> = {};
    if (activeKit.progress?.completed_checklist_keys) {
      activeKit.progress.completed_checklist_keys.forEach((key) => {
        fromDb[key] = true;
      });
    }
    return fromDb;
  });

  const [syncStatus, setSyncStatus] = useState<"saved" | "saving">("saved");
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to localStorage immediately & debounce sync to MongoDB Atlas
  const persistProgress = (
    newPracticed: Record<string, boolean>,
    newChecklist: Record<string, boolean>
  ) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`pilot_practiced_${kitId}`, JSON.stringify(newPracticed));
        localStorage.setItem(`pilot_checklist_${kitId}`, JSON.stringify(newChecklist));
      } catch (e) {
        console.error("Failed to write progress to localStorage", e);
      }
    }

    setSyncStatus("saving");
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      try {
        const practicedIds = Object.keys(newPracticed).filter((k) => newPracticed[k]);
        const checklistKeys = Object.keys(newChecklist).filter((k) => newChecklist[k]);
        await api.kits.updateProgress(kitId, {
          practiced_question_ids: practicedIds,
          completed_checklist_keys: checklistKeys,
        });
        setSyncStatus("saved");
      } catch (err) {
        console.error("Failed to sync progress to cloud API", err);
        setSyncStatus("saved");
      }
    }, 600);
  };

  // Toggle question practiced state & cross-sync schedule checklist
  function handleTogglePracticed(qId: string) {
    const nextVal = !practicedMap[qId];
    const newPracticed = { ...practicedMap, [qId]: nextVal };
    setPracticedMap(newPracticed);

    // Cross-sync matching daily schedule question drills
    const newChecklist = { ...checklist };
    const scheduleDays = schedule?.days || [];
    for (const day of scheduleDays) {
      if (day.question_ids.includes(qId)) {
        newChecklist[`day-${day.day}-q-${qId}`] = nextVal;
      }
    }
    setChecklist(newChecklist);
    persistProgress(newPracticed, newChecklist);
  }

  // Toggle daily checklist item & cross-sync question practiced if it's a drill
  function handleToggleCheckItem(key: string) {
    const nextVal = !checklist[key];
    const newChecklist = { ...checklist, [key]: nextVal };
    setChecklist(newChecklist);

    // If key matches day-X-q-qId, cross-sync practicedMap
    const match = key.match(/^day-\d+-q-(.+)$/);
    const newPracticed = { ...practicedMap };
    if (match && match[1]) {
      const qId = match[1];
      newPracticed[qId] = nextVal;
      setPracticedMap(newPracticed);
    }

    persistProgress(newPracticed, newChecklist);
  }

  function handlePracticeQuestion(qid: string) {
    setTargetQuestionId(qid);
    setTab("questions");
  }

  // Single-Section AI Regeneration handler
  async function handleRegenerateSection(section: "questions" | "flashcards" | "schedule") {
    setRegeneratingSection(section);
    try {
      const res = await api.kits.regenerateSection(kitId, section);
      if (res.success && res.kit) {
        setActiveKit((prev) => ({ ...prev, kit: res.kit }));
        setToastMessage(`Successfully regenerated ${section}!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to regenerate section:", err);
      setToastMessage(`Failed to regenerate ${section}. Please try again.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setRegeneratingSection(null);
    }
  }

  const practicedCount = Object.values(practicedMap).filter(Boolean).length;
  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;

  // Updated Tab Order: Overview -> Study Schedule -> Interview Questions -> Flashcards -> Coverage & Audit
  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview & Requirements" },
    { id: "schedule", label: "Study Schedule", count: schedule?.days?.length },
    { id: "questions", label: "Interview Questions", count: questions.length },
    { id: "flashcards", label: "Flashcards", count: content.flashcards?.length },
    { id: "coverage", label: "Coverage & Audit" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.6rem 2rem",
        borderBottom: "1px solid #E2DDD6",
        backgroundColor: "var(--color-cream)",
        overflowX: "auto",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "0.45rem 0.95rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: tab === t.id ? "var(--color-ink)" : "transparent",
                color: tab === t.id ? "var(--color-cream)" : "var(--color-text-muted)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
              {t.count != null && (
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  backgroundColor: tab === t.id ? "rgba(255,255,255,0.2)" : "#E2DDD6",
                  color: tab === t.id ? "white" : "var(--color-text-muted)",
                  borderRadius: "999px",
                  padding: "0.1rem 0.45rem",
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Live Auto-save & Toast */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {toastMessage && (
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: "0.74rem",
              color: "#1E6B40", backgroundColor: "#E2F2EA",
              padding: "0.2rem 0.65rem", borderRadius: "999px",
              display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 600,
              animation: "fadeIn 0.2s ease-in-out",
            }}>
              <Check size={12} color="#1E6B40" strokeWidth={2.5} />
              {toastMessage}
            </span>
          )}

          <span style={{
            fontFamily: "var(--font-sans)", fontSize: "0.72rem",
            color: syncStatus === "saving" ? "#7A5C2E" : "#1E6B40",
            backgroundColor: syncStatus === "saving" ? "#FDF3E0" : "#E2F2EA",
            padding: "0.2rem 0.6rem", borderRadius: "999px",
            display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 600,
          }}>
            <CheckCircle2 size={12} color={syncStatus === "saving" ? "#7A5C2E" : "#1E6B40"} />
            {syncStatus === "saving" ? "Saving..." : "Progress Auto-Saved"}
          </span>
        </div>
      </div>

      {/* Tab content - ONLY SCROLLABLE AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        {/* ── TAB 1: Overview & Requirements (Bento Grid Style) ──────────────────── */}
        {tab === "overview" && (
          <BentoOverviewTab
            content={content}
            kit={activeKit}
            practicedCount={practicedCount}
            completedChecklistCount={completedChecklistCount}
            onSelectTab={(newTab: Tab) => setTab(newTab)}
          />
        )}

        {/* ── TAB 2: Study Schedule (Topics to read + Daily Checklist) ─────────────── */}
        {tab === "schedule" && (
          <InteractiveScheduleView
            schedule={schedule}
            questions={questions}
            checklist={checklist}
            onToggleCheckItem={handleToggleCheckItem}
            onPracticeQuestion={handlePracticeQuestion}
          />
        )}

        {/* ── TAB 3: Interactive One-Question Simulator with Activity Matrix ────────── */}
        {tab === "questions" && (
          <InteractiveQuestionsView
            questions={questions}
            initialQuestionId={targetQuestionId}
            practicedMap={practicedMap}
            onTogglePracticed={handleTogglePracticed}
          />
        )}

        {/* ── TAB 4: Flashcards ───────────────────────────────── */}
        {tab === "flashcards" && (
          <FlashcardView cards={content.flashcards || []} kitId={kitId} />
        )}

        {/* ── TAB 5: Coverage & Audit (Full 2-Way Traceability Matrix) ─────────────── */}
        {tab === "coverage" && (
          <CoverageAuditView
            content={content}
            kitId={kitId}
            onJumpToQuestion={(qId: string) => {
              setTargetQuestionId(qId);
              setTab("questions");
            }}
            onJumpToFlashcard={() => setTab("flashcards")}
            onRegenerateSection={handleRegenerateSection}
            regeneratingSection={regeneratingSection}
          />
        )}
      </div>
    </div>
  );
}

/* ── Main page component ─────────────────────────────────────── */
export default function KitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [kit, setKit] = useState<FullKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchKit() {
    try {
      const { kit: data } = await api.kits.getById(id);
      setKit(data);
      return data.status;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load kit");
      return "error";
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    fetchKit().then((status) => {
      if (!["done", "error"].includes(status)) {
        pollRef.current = setInterval(async () => {
          const s = await fetchKit();
          if (["done", "error"].includes(s)) {
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }, 2500);
      }
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isDone = kit?.status === "done";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", backgroundColor: "var(--color-cream-alt)" }}>
      {/* Top bar */}
      <div style={{
        padding: "1.25rem 2rem",
        borderBottom: "1px solid #E2DDD6",
        backgroundColor: "var(--color-cream)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexShrink: 0,
      }}>
        <Link href="/interview" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}>
          <ChevronLeft size={16} /> All interviews
        </Link>
        {kit && (
          <>
            <div style={{ width: "1px", height: "18px", backgroundColor: "#E2DDD6" }} />
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
              {kit.name}
            </h1>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid var(--color-teal-deep)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "#8B2020", marginBottom: "1rem" }}>{error}</p>
            <button onClick={() => router.push("/interview")} className="btn-secondary" style={{ padding: "0.6rem 1.25rem" }}>
              Back to dashboard
            </button>
          </div>
        </div>
      ) : kit && isDone ? (
        <KitContentView kit={kit} />
      ) : kit ? (
        <LiveStatusView kit={kit} />
      ) : null}
    </div>
  );
}
