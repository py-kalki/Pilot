"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, FullKit, Question, Flashcard, Requirement, ScheduleDay } from "@/lib/api";

/* ── Icons ─────────────────────────────────────────────────── */
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B2020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
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
                Generating
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
                    {/* Step dot */}
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: isDone ? "var(--color-teal-deep)" : isActive ? "transparent" : "#F0EDE8",
                      border: isActive ? "2px solid var(--color-teal-deep)" : "none",
                      transition: "all 0.3s ease",
                    }}>
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isActive ? (
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-teal-deep)", animation: "pulseDot 1.2s ease-in-out infinite" }} />
                      ) : (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D4CFC9" }} />
                      )}
                    </div>

                    {/* Step label */}
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
type Tab = "overview" | "questions" | "flashcards" | "schedule" | "coverage";

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

function QuestionCard({ q, idx }: { q: Question; idx: number }) {
  const [open, setOpen] = useState(false);
  const diffInfo = DIFFICULTY_MAP[q.difficulty] || DIFFICULTY_MAP[2];
  const questionText = q.prompt || (q as unknown as { question?: string }).question || "";
  const answerText = q.answer_outline || (q as unknown as { sampleAnswer?: string }).sampleAnswer || "";

  return (
    <div style={{
      border: "1px solid #E2DDD6",
      borderRadius: "12px",
      overflow: "hidden",
      backgroundColor: "#FFFFFF",
      transition: "box-shadow 0.15s ease",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "1.1rem 1.25rem",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
            color: "var(--color-teal-deep)", backgroundColor: "#EBF3F4",
            padding: "0.15rem 0.45rem", borderRadius: "6px", flexShrink: 0,
          }}>
            {q.id || `q${idx + 1}`}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", fontWeight: 500, color: "var(--color-ink)", margin: "0 0 0.45rem", lineHeight: 1.45 }}>
              {questionText}
            </p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ padding: "0.15rem 0.55rem", borderRadius: "999px", fontSize: "0.68rem", fontWeight: 600, fontFamily: "var(--font-sans)", color: diffInfo.color, backgroundColor: diffInfo.bg }}>
                {diffInfo.label}
              </span>
              <span style={{ padding: "0.15rem 0.55rem", borderRadius: "999px", fontSize: "0.68rem", fontFamily: "var(--font-sans)", color: "#256571", backgroundColor: "#E0EFF2" }}>
                {CATEGORY_MAP[q.category] || q.category}
              </span>
              {q.requirement_ids && q.requirement_ids.length > 0 && (
                <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
                  Maps to: {q.requirement_ids.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "4px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 1.25rem 1.25rem 1.25rem", borderTop: "1px solid #F0EDE8", backgroundColor: "#FAF9F6" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-teal-deep)", margin: "1rem 0 0.4rem" }}>
            Answer Outline & Strategy
          </p>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-ink)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
            {answerText}
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardView({ cards }: { cards: Flashcard[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
      {cards.map((card, idx) => {
        const id = card.id || `f${idx + 1}`;
        const isFlipped = flipped[id];

        return (
          <div
            key={id}
            onClick={() => setFlipped((p) => ({ ...p, [id]: !p[id] }))}
            style={{
              minHeight: "160px", borderRadius: "14px", border: "1.5px solid #E2DDD6",
              padding: "1.25rem", cursor: "pointer",
              backgroundColor: isFlipped ? "var(--color-teal-deep)" : "#FFFFFF",
              color: isFlipped ? "#FFFFFF" : "var(--color-ink)",
              transition: "all 0.25s ease",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              boxShadow: "0 4px 12px -2px rgba(38,34,30,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", opacity: 0.7 }}>
                {isFlipped ? "Answer" : `Card ${id}`}
              </span>
              {card.requirement_ids && card.requirement_ids.length > 0 && (
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", opacity: 0.6 }}>
                  {card.requirement_ids.join(", ")}
                </span>
              )}
            </div>

            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.98rem", fontWeight: 400, lineHeight: 1.5, margin: 0 }}>
              {isFlipped ? card.back : card.front}
            </p>

            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", opacity: 0.45, margin: "0.75rem 0 0" }}>
              {isFlipped ? "Click to view question" : "Click to reveal answer"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function KitContentView({ kit }: { kit: FullKit }) {
  const [tab, setTab] = useState<Tab>("overview");
  const content = kit.kit;

  const brief = content.company_brief;
  const role = content.role;
  const source = content.source;
  const schedule = content.schedule;
  const coverage = content.coverage;

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview & Requirements" },
    { id: "questions", label: "Questions", count: content.questions?.length },
    { id: "flashcards", label: "Flashcards", count: content.flashcards?.length },
    { id: "schedule", label: "Study Schedule", count: schedule?.days?.length },
    { id: "coverage", label: "Coverage & Audit" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: "0.35rem",
        padding: "0.6rem 2rem",
        borderBottom: "1px solid #E2DDD6",
        backgroundColor: "var(--color-cream)",
        overflowX: "auto",
        flexShrink: 0,
      }}>
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

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        {/* ── TAB 1: Overview & Requirements ──────────────────── */}
        {tab === "overview" && (
          <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {/* Header info */}
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-teal-deep)", margin: "0 0 0.25rem" }}>
                {source?.company || kit.name} • {role?.seniority || "Target Role"}
              </p>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
                {role?.title || kit.jobRole}
              </h2>
            </div>

            {/* Requirements Section */}
            {role?.requirements && role.requirements.length > 0 && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px", padding: "1.5rem 1.75rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 1rem" }}>
                  Role Competencies & Requirements
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {role.requirements.map((req: Requirement) => (
                    <div key={req.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", padding: "0.5rem 0", borderBottom: "1px solid #F5F2ED" }}>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 700,
                        backgroundColor: req.priority === "must" ? "#E8F3F4" : "#F4F1EC",
                        color: req.priority === "must" ? "var(--color-teal-deep)" : "var(--color-text-muted)",
                        padding: "0.15rem 0.45rem", borderRadius: "4px",
                        textTransform: "uppercase", flexShrink: 0, marginTop: "2px",
                      }}>
                        {req.id} • {req.priority}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-ink)", margin: "0 0 0.2rem", lineHeight: 1.45 }}>
                          {req.text}
                        </p>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                          Category: {req.kind}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Brief */}
            {brief && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px", padding: "1.5rem 1.75rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.75rem" }}>
                  About the Company
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-ink)", lineHeight: 1.65, margin: "0 0 1.25rem" }}>
                  {brief.summary}
                </p>
                <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-teal-deep)", margin: "0 0 0.5rem" }}>
                  What They Do
                </h4>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-ink)", lineHeight: 1.65, margin: 0 }}>
                  {brief.what_they_do}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {role?.responsibilities && role.responsibilities.length > 0 && (
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px", padding: "1.5rem 1.75rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.75rem" }}>
                  Core Responsibilities
                </h3>
                <ul style={{ margin: 0, padding: "0 0 0 1.2rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {role.responsibilities.map((resp, i) => (
                    <li key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-ink)", lineHeight: 1.5 }}>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Questions ────────────────────────────────── */}
        {tab === "questions" && (
          <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
                Targeted Interview Questions
              </h2>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                {content.questions?.length || 0} questions generated
              </span>
            </div>
            {(content.questions || []).map((q, i) => <QuestionCard key={q.id || i} q={q} idx={i} />)}
          </div>
        )}

        {/* ── TAB 3: Flashcards ───────────────────────────────── */}
        {tab === "flashcards" && (
          <div style={{ maxWidth: "900px" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 1.25rem" }}>
              Rapid Revision Flashcards
            </h2>
            <FlashcardView cards={content.flashcards || []} />
          </div>
        )}

        {/* ── TAB 4: Study Schedule ───────────────────────────── */}
        {tab === "schedule" && (
          <div style={{ maxWidth: "780px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.25rem" }}>
                {schedule?.days_available || 5}-Day Structured Study Roadmap
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                Day-by-day practice sessions mapping to specific questions and requirements.
              </p>
            </div>

            {(schedule?.days || []).map((day: ScheduleDay) => (
              <div key={day.day} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px", padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-teal-deep)", backgroundColor: "#E8F3F4", padding: "0.2rem 0.55rem", borderRadius: "999px" }}>
                    Day 0{day.day}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-ink)" }}>
                    ⏱️ {day.minutes} minutes
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.65rem" }}>
                  {day.focus}
                </h3>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "var(--color-text-muted)" }}>
                    Questions to review:
                  </span>
                  {day.question_ids.map((qid) => (
                    <span key={qid} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, backgroundColor: "#F0EDE8", color: "var(--color-ink)", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                      {qid}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 5: Coverage & Audit ─────────────────────────── */}
        {tab === "coverage" && (
          <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.35rem" }}>
                Requirement Coverage Audit
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                Verifying that every role competency has dedicated practice questions and flashcards.
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2DDD6", borderRadius: "14px", padding: "1.5rem 1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#E2F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E6B40" }}>
                  <CheckIcon />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                    Coverage Status: {coverage?.uncovered_requirement_ids?.length === 0 ? "100% Comprehensive" : `${role?.requirements?.length ? role.requirements.length - (coverage?.uncovered_requirement_ids?.length || 0) : 0} of ${role?.requirements?.length || 0} Covered`}
                  </h3>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
                    Verified across {coverage?.passes || 2} audit passes
                  </p>
                </div>
              </div>

              {coverage?.uncovered_requirement_ids && coverage.uncovered_requirement_ids.length > 0 ? (
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "#8B2020", fontWeight: 600, margin: "0 0 0.4rem" }}>
                    Uncovered Requirements ({coverage.uncovered_requirement_ids.length}):
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {coverage.uncovered_requirement_ids.map((id) => (
                      <li key={id} style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#8B2020" }}>{id}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", color: "#1E6B40", margin: 0 }}>
                  ✨ All {role?.requirements?.length || 0} extracted requirements have active evaluation questions in the kit.
                </p>
              )}
            </div>

            {source && (
              <div style={{ backgroundColor: "#FAF9F6", border: "1px solid #EAE5DE", borderRadius: "14px", padding: "1.25rem 1.5rem" }}>
                <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", margin: "0 0 0.75rem" }}>
                  Source Metadata
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Company URL:</span> {source.company_url}</div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>JD Length:</span> {source.jd_chars} chars</div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Location:</span> {source.location}</div>
                  <div><span style={{ color: "var(--color-text-muted)" }}>Researched:</span> {new Date(source.researched_at).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-cream-alt)" }}>
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
        <Link href="/interview" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}>
          <ChevronLeft /> All interviews
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
