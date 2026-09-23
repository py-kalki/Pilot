"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

/* ── Icons ─────────────────────────────────────────────────── */
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── Quick Suggestion Presets ───────────────────────────────── */
const NAME_SUGGESTIONS = [
  "Google SWE Onsite",
  "Stripe Frontend Interview",
  "Amazon System Design",
  "Meta Product Manager",
];

const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Product Manager",
  "Data Scientist",
  "Engineering Manager",
];

const TOTAL_STEPS = 5;

interface FormState {
  name: string;
  jobRole: string;
  companyWebsite: string;
  linkedinPage: string;
  interviewDate: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  jobRole: "",
  companyWebsite: "",
  linkedinPage: "",
  interviewDate: "",
  notes: "",
};

export default function NewInterviewWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Auto focus input on step change
  useEffect(() => {
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (error) setError(null);
  }

  function validateCurrentStep(): boolean {
    if (step === 1) {
      if (!form.name.trim()) {
        setError("Please enter a name for this interview prep kit.");
        return false;
      }
      if (form.name.trim().length < 2) {
        setError("Interview name should be at least 2 characters.");
        return false;
      }
    } else if (step === 2) {
      if (!form.jobRole.trim()) {
        setError("Please enter the target job role.");
        return false;
      }
    } else if (step === 3) {
      if (!form.companyWebsite.trim()) {
        setError("Please enter the company website.");
        return false;
      }
      try {
        const urlStr = form.companyWebsite.startsWith("http")
          ? form.companyWebsite
          : `https://${form.companyWebsite}`;
        new URL(urlStr);
      } catch {
        setError("Please enter a valid website URL (e.g. stripe.com or https://stripe.com).");
        return false;
      }
    } else if (step === 4) {
      if (form.linkedinPage.trim()) {
        try {
          const urlStr = form.linkedinPage.startsWith("http")
            ? form.linkedinPage
            : `https://${form.linkedinPage}`;
          new URL(urlStr);
        } catch {
          setError("Please enter a valid LinkedIn or job URL, or leave blank to skip.");
          return false;
        }
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 1) {
      setError(null);
      setStep((s) => s - 1);
    } else {
      router.push("/interview");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      // Don't auto-advance on Enter if typing inside notes textarea in Step 5
      if (step === 5 && e.target instanceof HTMLTextAreaElement) {
        return;
      }
      e.preventDefault();
      handleNext();
    }
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    setLoading(true);
    setApiError(null);

    const formattedWebsite = form.companyWebsite.startsWith("http")
      ? form.companyWebsite.trim()
      : `https://${form.companyWebsite.trim()}`;

    const formattedLinkedin = form.linkedinPage.trim()
      ? form.linkedinPage.startsWith("http")
        ? form.linkedinPage.trim()
        : `https://${form.linkedinPage.trim()}`
      : undefined;

    try {
      const { id } = await api.kits.create({
        name: form.name.trim(),
        jobRole: form.jobRole.trim(),
        companyWebsite: formattedWebsite,
        linkedinPage: formattedLinkedin,
        interviewDate: form.interviewDate || undefined,
        notes: form.notes.trim() || undefined,
      });

      router.push(`/interview/${id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to create prep kit. Please try again.");
      setLoading(false);
    }
  }

  // Quick relative date helper
  function setRelativeDate(daysFromNow: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setField("interviewDate", `${yyyy}-${mm}-${dd}`);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      backgroundColor: "var(--color-cream-alt)",
      overflow: "hidden",
      userSelect: "none",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes stageFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wizard-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          border: 1px solid #E2DDD6;
          background-color: #FFFFFF;
          font-family: var(--font-sans);
          font-size: 0.78rem;
          color: var(--color-ink);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .wizard-chip:hover {
          border-color: var(--color-teal-deep);
          background-color: #F4F8F8;
          color: var(--color-teal-deep);
        }
        .wizard-chip.active {
          border-color: var(--color-teal-deep);
          background-color: #E8F3F4;
          color: var(--color-teal-deep);
          font-weight: 600;
        }
      `}</style>

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid #E2DDD6",
        backgroundColor: "var(--color-cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        height: "64px",
      }}>
        {/* Left: Back / Exit */}
        <button
          type="button"
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.84rem",
            cursor: "pointer",
            padding: "0.4rem 0.6rem",
            borderRadius: "6px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <ChevronLeft />
          <span>{step === 1 ? "Exit" : "Back"}</span>
        </button>

        {/* Center: Step progress indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div
                key={stepNum}
                title={`Step ${stepNum}`}
                style={{
                  width: isCurrent ? "28px" : "18px",
                  height: "5px",
                  borderRadius: "999px",
                  backgroundColor: isCurrent
                    ? "var(--color-teal-deep)"
                    : isCompleted
                    ? "var(--color-forest)"
                    : "#D8D2C9",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            );
          })}
        </div>

        {/* Right: Step badge */}
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: "var(--color-text-muted)",
        }}>
          Step {step} of {TOTAL_STEPS}
        </div>
      </div>

      {/* ── Main Centered Viewport (No Scroll) ────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem 2rem",
        position: "relative",
      }}>
        <div
          key={step}
          style={{
            width: "100%",
            maxWidth: "580px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2DDD6",
            borderRadius: "20px",
            padding: "2.25rem 2.5rem",
            boxShadow: "0 12px 32px -4px rgba(38, 34, 30, 0.08), 0 4px 12px -2px rgba(38, 34, 30, 0.04)",
            animation: "stageFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) both",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Step Overline */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-teal-deep)",
              backgroundColor: "#E8F3F4",
              padding: "0.25rem 0.65rem",
              borderRadius: "999px",
            }}>
              Step 0{step} / 0{TOTAL_STEPS}
            </span>

            {/* Context breadcrumb of previous inputs */}
            {step > 1 && (
              <span style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.74rem",
                color: "var(--color-text-muted)",
                maxWidth: "240px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {step === 2 && form.name}
                {step === 3 && `${form.name} • ${form.jobRole}`}
                {step === 4 && `${form.jobRole} @ ${form.companyWebsite.replace(/https?:\/\//, "")}`}
                {step === 5 && `${form.jobRole} @ ${form.companyWebsite.replace(/https?:\/\//, "")}`}
              </span>
            )}
          </div>

          {/* ── STEP 1: Interview Name ────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 0.5rem",
                lineHeight: 1.25,
              }}>
                Name your interview kit
              </h2>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--color-text-muted)",
                margin: "0 0 1.5rem",
                lineHeight: 1.5,
              }}>
                Give this prep kit a distinct title so you can easily reference it in your workspace.
              </p>

              <div style={{ marginBottom: "1.25rem" }}>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  placeholder="e.g. Google SWE Onsite"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                  style={{
                    fontSize: "1.05rem",
                    padding: "0.85rem 1.1rem",
                    borderColor: error ? "#B04040" : undefined,
                  }}
                />
              </div>

              {/* Suggestions */}
              <div>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-muted)",
                  margin: "0 0 0.5rem",
                }}>
                  Quick Examples:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {NAME_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`wizard-chip ${form.name === s ? "active" : ""}`}
                      onClick={() => setField("name", s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Target Job Role ───────────────────────────── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 0.5rem",
                lineHeight: 1.25,
              }}>
                What role are you targeting?
              </h2>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--color-text-muted)",
                margin: "0 0 1.5rem",
                lineHeight: 1.5,
              }}>
                Pilot calibrates technical topics, seniority depth, and questions to this specific position.
              </p>

              <div style={{ marginBottom: "1.25rem" }}>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={form.jobRole}
                  onChange={(e) => setField("jobRole", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                  style={{
                    fontSize: "1.05rem",
                    padding: "0.85rem 1.1rem",
                    borderColor: error ? "#B04040" : undefined,
                  }}
                />
              </div>

              {/* Suggestions */}
              <div>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-muted)",
                  margin: "0 0 0.5rem",
                }}>
                  Popular Roles:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {ROLE_SUGGESTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`wizard-chip ${form.jobRole === r ? "active" : ""}`}
                      onClick={() => setField("jobRole", r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Company Website ───────────────────────────── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 0.5rem",
                lineHeight: 1.25,
              }}>
                What is the company website?
              </h2>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--color-text-muted)",
                margin: "0 0 1.5rem",
                lineHeight: 1.5,
              }}>
                We&apos;ll crawl their official website and careers page to extract culture, mission, and company brief.
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  placeholder="e.g. stripe.com or https://stripe.com"
                  value={form.companyWebsite}
                  onChange={(e) => setField("companyWebsite", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                  style={{
                    fontSize: "1.05rem",
                    padding: "0.85rem 1.1rem",
                    borderColor: error ? "#B04040" : undefined,
                  }}
                />
              </div>

              <div style={{
                backgroundColor: "#F7F5F0",
                border: "1px solid #EAE5DE",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
              }}>
                <span style={{ color: "var(--color-teal-deep)", fontSize: "0.9rem", marginTop: "1px" }}>🌐</span>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.45 }}>
                  Firecrawl will scrape the domain, discover job descriptions, and deliver live context to the AI generator.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: LinkedIn or Job Posting (Optional) ─────────── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 0.5rem" }}>
                <h2 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontWeight: 400,
                  color: "var(--color-ink)",
                  margin: 0,
                  lineHeight: 1.25,
                }}>
                  Job posting or LinkedIn
                </h2>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  backgroundColor: "#EFECE6",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "6px",
                }}>
                  Optional
                </span>
              </div>

              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--color-text-muted)",
                margin: "0 0 1.5rem",
                lineHeight: 1.5,
              }}>
                Paste a specific LinkedIn job posting or opening link to extract precise requirements and qualifications.
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  placeholder="https://linkedin.com/jobs/view/... (or skip)"
                  value={form.linkedinPage}
                  onChange={(e) => setField("linkedinPage", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                  style={{
                    fontSize: "1.05rem",
                    padding: "0.85rem 1.1rem",
                    borderColor: error ? "#B04040" : undefined,
                  }}
                />
              </div>

              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)", margin: 0 }}>
                💡 If you don&apos;t have a direct link, you can skip this step and we&apos;ll find matching roles on their careers page.
              </p>
            </div>
          )}

          {/* ── STEP 5: Date, Focus Notes & Launch ────────────────── */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 0.5rem",
                lineHeight: 1.25,
              }}>
                Schedule & focus notes
              </h2>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.86rem",
                color: "var(--color-text-muted)",
                margin: "0 0 1.25rem",
                lineHeight: 1.5,
              }}>
                Set your target interview date and add any specific topics or context you want emphasized.
              </p>

              {/* Date Input with Shortcuts */}
              <div style={{ marginBottom: "1.1rem" }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}>
                  Interview Date <span style={{ fontWeight: 400, textTransform: "none" }}>(Optional)</span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.45rem" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="date"
                      value={form.interviewDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setField("interviewDate", e.target.value)}
                      className="input-field"
                      style={{
                        paddingRight: "2.4rem",
                        colorScheme: "light",
                        fontSize: "0.92rem",
                        padding: "0.65rem 0.9rem",
                      }}
                    />
                    <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-muted)" }}>
                      <CalendarIcon />
                    </span>
                  </div>
                </div>

                {/* Date quick pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  <button type="button" className="wizard-chip" onClick={() => setRelativeDate(1)}>Tomorrow</button>
                  <button type="button" className="wizard-chip" onClick={() => setRelativeDate(3)}>In 3 days</button>
                  <button type="button" className="wizard-chip" onClick={() => setRelativeDate(7)}>Next week</button>
                  <button type="button" className="wizard-chip" onClick={() => setRelativeDate(14)}>In 2 weeks</button>
                </div>
              </div>

              {/* Notes Input */}
              <div style={{ marginBottom: "0.5rem" }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                }}>
                  Focus Areas & Notes <span style={{ fontWeight: 400, textTransform: "none" }}>(Optional)</span>
                </label>
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  placeholder="e.g. Focus heavily on system design, distributed consensus, and behavioral STAR stories..."
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={3}
                  className="input-field"
                  style={{
                    fontSize: "0.88rem",
                    padding: "0.65rem 0.9rem",
                    resize: "none",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Error Display ─────────────────────────────────────── */}
          {error && (
            <div style={{
              marginTop: "0.85rem",
              padding: "0.65rem 0.9rem",
              borderRadius: "8px",
              backgroundColor: "#FDEAEA",
              border: "1px solid #F5C0C0",
              color: "#8B2020",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}>
              <span style={{ fontWeight: 600 }}>•</span> {error}
            </div>
          )}

          {apiError && (
            <div style={{
              marginTop: "0.85rem",
              padding: "0.65rem 0.9rem",
              borderRadius: "8px",
              backgroundColor: "#FDEAEA",
              border: "1px solid #F5C0C0",
              color: "#8B2020",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
            }}>
              {apiError}
            </div>
          )}

          {/* ── Navigation / Action Bar ───────────────────────────── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid #EAE5DE",
          }}>
            {/* Keyboard shortcut hint */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.74rem",
              color: "var(--color-text-muted)",
            }}>
              <kbd style={{
                backgroundColor: "#EFECE6",
                border: "1px solid #DCD7CE",
                borderRadius: "4px",
                padding: "0.15rem 0.4rem",
                fontSize: "0.7rem",
                fontFamily: "monospace",
              }}>
                Enter ↵
              </kbd>
              <span>to continue</span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #D8D2C9",
                    borderRadius: "999px",
                    padding: "0.65rem 1.25rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.84rem",
                    color: "var(--color-ink)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Back
                </button>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                  style={{
                    padding: "0.65rem 1.45rem",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span>{step === 4 && !form.linkedinPage ? "Skip & Continue" : "Continue"}</span>
                  <ChevronRight />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    padding: "0.7rem 1.6rem",
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Creating kit…</span>
                    </>
                  ) : (
                    <>
                      <SparkleIcon />
                      <span>Start creating prep kit</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
