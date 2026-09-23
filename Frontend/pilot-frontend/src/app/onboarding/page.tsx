"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, UserProfile } from "@/lib/api";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Briefcase,
  Code2,
  GraduationCap,
  Globe,
  Phone,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Check,
} from "lucide-react";

/* ── Step definitions ──────────────────────────────────────── */
const TOTAL_STEPS = 4;

/* ── Inline SVG icons ──────────────────────────────────────── */
const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "spin 0.7s linear infinite" }}
  >
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/* ── Popular job roles for suggestion pills ─────────────────── */
const JOB_SUGGESTIONS = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "UX / Product Designer",
  "Frontend Engineer",
  "Engineering Manager",
  "DevOps / SRE",
  "Fullstack Developer",
];

/* ── Custom Theme DatePicker Component ──────────────────────── */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CustomDatePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? new Date(value + "T00:00:00") : null;
  const initialYear = parsedDate ? parsedDate.getFullYear() : 2000;
  const initialMonth = parsedDate ? parsedDate.getMonth() : 0;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 90 }, (_, i) => currentYear - 13 - i);

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(day: number) {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(formatted);
    setIsOpen(false);
  }

  const formattedDisplay =
    parsedDate && !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        <input
          id="ob-dob"
          type="text"
          readOnly
          value={formattedDisplay}
          placeholder="Select date of birth"
          onClick={() => setIsOpen((prev) => !prev)}
          className="input-field"
          style={{
            paddingRight: "3.2rem",
            cursor: "pointer",
            borderColor: error ? "#B04040" : isOpen ? "var(--color-teal-deep)" : undefined,
            backgroundColor: "#FFFFFF",
            userSelect: "none",
          }}
        />
        <button
          type="button"
          aria-label="Toggle calendar"
          title="Open calendar"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          style={{
            position: "absolute",
            right: "0.6rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: isOpen ? "rgba(37, 101, 113, 0.12)" : "transparent",
            border: "none",
            padding: "0.45rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isOpen ? "var(--color-teal-deep)" : "var(--color-text-muted)",
            borderRadius: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <Calendar size={18} />
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 60,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2DDD6",
            borderRadius: "14px",
            boxShadow: "0 14px 36px -4px rgba(38,34,30,0.16), 0 4px 12px -2px rgba(38,34,30,0.08)",
            padding: "1.1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.85rem",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "var(--color-ink)",
                  border: "1px solid #E2DDD6",
                  borderRadius: "8px",
                  padding: "0.3rem 0.5rem",
                  backgroundColor: "var(--color-cream-alt)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  color: "var(--color-ink)",
                  border: "1px solid #E2DDD6",
                  borderRadius: "8px",
                  padding: "0.3rem 0.5rem",
                  backgroundColor: "var(--color-cream-alt)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1px solid #E2DDD6",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1px solid #E2DDD6",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  padding: "0.25rem 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
            }}
          >
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  style={{
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    color: "#D0CCC6",
                  }}
                >
                  {dayNum}
                </div>
              );
            })}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                parsedDate &&
                parsedDate.getFullYear() === viewYear &&
                parsedDate.getMonth() === viewMonth &&
                parsedDate.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  style={{
                    height: "34px",
                    borderRadius: "50%",
                    border: isSelected ? "none" : "1px solid transparent",
                    backgroundColor: isSelected ? "var(--color-teal-deep)" : "transparent",
                    color: isSelected ? "#FFFFFF" : "var(--color-ink)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: isSelected ? 600 : 400,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  // Step 1 — Personal info
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  // Step 2 — Target info
  const [jobRole, setJobRole] = useState("");
  const [location, setLocation] = useState("");

  // Step 3 — Resume ATS Upload & Extraction
  const [resumeMode, setResumeMode] = useState<"upload" | "paste">("upload");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeFileSize, setResumeFileSize] = useState<number>(0);
  const [resumeText, setResumeText] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<UserProfile | null>(null);
  const [parseError, setParseError] = useState("");

  // Navigation
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File Upload Handler ────────────────────────────────── */
  const handleFileUpload = async (file: File) => {
    setParseError("");
    setResumeFileName(file.name);
    setResumeFileSize(file.size);
    setIsParsingResume(true);

    try {
      // Send the raw binary file as FormData — backend extracts text
      // with pdf-parse (PDF) or mammoth (DOCX), avoiding browser binary garbage
      const res = await api.profile.uploadResumeFile(file, {
        targetRole: jobRole,
        location: location,
        dob: dob,
      });

      if (res && res.profile) {
        setParsedProfile(res.profile);
        if (res.profile.name && !name) setName(res.profile.name);
        // Show a readable preview of what was extracted
        setResumeText(res.profile.resume?.rawText || file.name);
      }
    } catch (err: unknown) {
      console.warn("ATS Parser warning:", err);
      setParseError("Could not fully parse document. You can also paste your resume text below.");
    } finally {
      setIsParsingResume(false);
    }
  };

  const handlePastedResumeParse = async () => {
    if (!resumeText.trim() || resumeText.length < 20) {
      setParseError("Please paste at least a few sentences from your resume or LinkedIn profile.");
      return;
    }
    setIsParsingResume(true);
    setParseError("");
    try {
      const res = await api.profile.uploadResume({
        resumeText,
        fileName: "Pasted_Resume.txt",
        fileSize: resumeText.length,
        fileType: "text/plain",
        targetRole: jobRole,
        location: location,
        dob: dob,
      });

      if (res && res.profile) {
        setParsedProfile(res.profile);
        if (res.profile.name && !name) setName(res.profile.name);
      }
    } catch (err: unknown) {
      console.error("Paste parse error:", err);
      setParseError("Failed to parse resume text. Please check your content and retry.");
    } finally {
      setIsParsingResume(false);
    }
  };

  /* ── Validation ─────────────────────────────────────────── */
  function validate(): boolean {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!name.trim()) next.name = "Please enter your full name.";
      if (!dob) next.dob = "Please enter your date of birth.";
      else {
        const age = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        if (age < 13) next.dob = "You must be at least 13 years old.";
        if (age > 100) next.dob = "Please enter a valid date of birth.";
      }
    }
    if (step === 2) {
      if (!jobRole.trim()) next.jobRole = "Please enter your target job role.";
      if (!location.trim()) next.location = "Please enter your preferred location.";
    }
    if (step === 3) {
      if (!resumeFileName && !resumeText.trim() && !parsedProfile) {
        next.resume = "Please upload or paste your resume to extract your ATS profile.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function advance() {
    if (!validate()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      setErrors({});
    }
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleFinish() {
    setLoading(true);
    try {
      // If parsedProfile exists or basic info is filled, save final profile
      await api.profile.update({
        name,
        targetRole: jobRole,
        location,
        dob,
      });
      router.push("/interview");
    } catch {
      router.push("/interview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-cream)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
        padding: "1.5rem 1.5rem 2rem",
      }}
    >
      {/* ── Top Header ───────────────────────────────────────── */}
      <header
        style={{
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem 0 1.5rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          <Image
            src="/pilot-logo.png"
            alt="Pilot"
            width={88}
            height={32}
            style={{ objectFit: "contain", filter: "brightness(0)", height: "auto" }}
            priority
          />
        </Link>
      </header>

      {/* ── Centered Onboarding Card ─────────────────────────── */}
      <main
        style={{
          width: "100%",
          maxWidth: "580px",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          margin: "auto 0",
        }}
      >
        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-teal-deep)",
            }}
          >
            Step {step} of {TOTAL_STEPS}
          </span>

          {/* Progress bar dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const isComplete = i + 1 < step;
              const isActive = i + 1 === step;
              return (
                <div
                  key={i}
                  style={{
                    width: isActive ? "28px" : "8px",
                    height: "8px",
                    borderRadius: "999px",
                    backgroundColor: isComplete
                      ? "var(--color-teal-deep)"
                      : isActive
                      ? "var(--color-ink)"
                      : "#D8D4CE",
                    transition: "all 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Card Container */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2DDD6",
            borderRadius: "20px",
            padding: "2.25rem 2.25rem 2.5rem",
            boxShadow: "0 10px 30px -5px rgba(38,34,30,0.05), 0 4px 10px -2px rgba(38,34,30,0.02)",
          }}
        >
          {/* Headline and description */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.85rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: "0 0 0.45rem",
                lineHeight: 1.2,
              }}
            >
              {step === 1 && "Nice to meet you."}
              {step === 2 && "What's your target role?"}
              {step === 3 && "Upload your Resume / CV."}
              {step === 4 && "Review your candidate dossier."}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {step === 1 && "Let's start with basic details to personalize your candidate profile."}
              {step === 2 && "Tell us your target position — we'll tailor mock questions & rubrics to it."}
              {step === 3 && "Our ATS intelligence engine will extract your experience, projects, phone, socials, and skills."}
              {step === 4 && "Review all extracted details and launch your first AI interview practice session."}
            </p>
          </div>

          {/* ── STEP 1: Personal Info ────────────────────────── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label htmlFor="ob-name" className="field-label">
                  Full name
                </label>
                <input
                  id="ob-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Jane Smith"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className="input-field"
                  style={errors.name ? { borderColor: "#B04040" } : {}}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div>
                <label className="field-label">Date of birth</label>
                <CustomDatePicker
                  value={dob}
                  onChange={(val) => {
                    setDob(val);
                    setErrors((p) => ({ ...p, dob: "" }));
                  }}
                  error={errors.dob}
                />
                {errors.dob && <p className="field-error">{errors.dob}</p>}
              </div>

              <button
                type="button"
                onClick={advance}
                className="btn-primary btn-full"
                style={{
                  padding: "0.85rem 1.5rem",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "999px",
                }}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Role & Location ──────────────────────── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label htmlFor="ob-role" className="field-label">
                  Target job role
                </label>
                <input
                  id="ob-role"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobRole}
                  onChange={(e) => {
                    setJobRole(e.target.value);
                    setErrors((p) => ({ ...p, jobRole: "" }));
                  }}
                  className="input-field"
                  style={errors.jobRole ? { borderColor: "#B04040" } : {}}
                />
                {errors.jobRole && <p className="field-error">{errors.jobRole}</p>}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
                  {JOB_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setJobRole(s);
                        setErrors((p) => ({ ...p, jobRole: "" }));
                      }}
                      style={{
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        border: `1.5px solid ${jobRole === s ? "var(--color-teal-deep)" : "#E2DDD6"}`,
                        backgroundColor: jobRole === s ? "rgba(37,101,113,0.08)" : "transparent",
                        color: jobRole === s ? "var(--color-teal-deep)" : "var(--color-text-muted)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.76rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="ob-location" className="field-label">
                  Preferred location
                </label>
                <input
                  id="ob-location"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setErrors((p) => ({ ...p, location: "" }));
                  }}
                  className="input-field"
                  style={errors.location ? { borderColor: "#B04040" } : {}}
                />
                {errors.location && <p className="field-error">{errors.location}</p>}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-secondary"
                  style={{
                    padding: "0.85rem 1.25rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    borderRadius: "999px",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={advance}
                  className="btn-primary btn-full"
                  style={{
                    padding: "0.85rem 1.5rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderRadius: "999px",
                  }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Resume ATS Intelligence & Upload ─────── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Toggle mode: Upload vs Paste */}
              <div
                style={{
                  display: "flex",
                  padding: "3px",
                  backgroundColor: "var(--color-cream-alt)",
                  borderRadius: "999px",
                  border: "1px solid #E2DDD6",
                  gap: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setResumeMode("upload")}
                  style={{
                    flex: 1,
                    padding: "0.45rem 1rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: resumeMode === "upload" ? "#FFFFFF" : "transparent",
                    color: resumeMode === "upload" ? "var(--color-ink)" : "var(--color-text-muted)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    boxShadow: resumeMode === "upload" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Upload File (PDF / TXT / DOC)
                </button>
                <button
                  type="button"
                  onClick={() => setResumeMode("paste")}
                  style={{
                    flex: 1,
                    padding: "0.45rem 1rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: resumeMode === "paste" ? "#FFFFFF" : "transparent",
                    color: resumeMode === "paste" ? "var(--color-ink)" : "var(--color-text-muted)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    boxShadow: resumeMode === "paste" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Paste Text / LinkedIn
                </button>
              </div>

              {resumeMode === "upload" ? (
                /* Drag-and-Drop Area */
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx,.md"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: "2px dashed #D5D0C7",
                      borderRadius: "14px",
                      padding: "2rem 1.5rem",
                      textAlign: "center",
                      backgroundColor: "var(--color-cream-alt)",
                      cursor: "pointer",
                      transition: "border-color 0.2s ease, background-color 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(37, 101, 113, 0.1)",
                        color: "var(--color-teal-deep)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 0.75rem",
                      }}
                    >
                      <UploadCloud size={24} />
                    </div>
                    <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 0.25rem" }}>
                      {resumeFileName ? resumeFileName : "Click or drag your resume here"}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: 0 }}>
                      Supports PDF, TXT, DOCX, Markdown (Up to 15MB)
                    </p>
                  </div>
                </div>
              ) : (
                /* Paste Resume Area */
                <div>
                  <textarea
                    rows={6}
                    className="input-field"
                    placeholder="Paste your resume text, bio, past companies, and LinkedIn details here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    style={{ resize: "vertical", fontSize: "0.85rem", lineHeight: 1.5 }}
                  />
                  <button
                    type="button"
                    onClick={handlePastedResumeParse}
                    disabled={isParsingResume || !resumeText.trim()}
                    className="btn-secondary"
                    style={{
                      marginTop: "0.6rem",
                      fontSize: "0.8rem",
                      padding: "0.45rem 1rem",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                    }}
                  >
                    {isParsingResume ? <Spinner /> : <Sparkles size={14} />}
                    {isParsingResume ? "Extracting ATS Data..." : "Analyze & Extract ATS Profile"}
                  </button>
                </div>
              )}

              {/* Parsing Progress / Live ATS Feedback (Non-blocking background banner) */}
              {isParsingResume && (
                <div
                  style={{
                    backgroundColor: "rgba(37, 101, 113, 0.08)",
                    border: "1px solid rgba(37, 101, 113, 0.2)",
                    borderRadius: "12px",
                    padding: "0.9rem 1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Spinner />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-teal-deep)", margin: 0 }}>
                        ATS Background Parser Active
                      </p>
                      <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(37, 101, 113, 0.15)", color: "var(--color-teal-deep)", padding: "0.15rem 0.5rem", borderRadius: "999px", fontWeight: 600 }}>
                        Non-blocking
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
                      Extracting work history, skills, phone, and projects in background. You can advance immediately — details will appear in your account!
                    </p>
                  </div>
                </div>
              )}

              {/* Parsed Extraction Success Pill */}
              {parsedProfile && !isParsingResume && (
                <div
                  style={{
                    backgroundColor: "rgba(35, 62, 43, 0.06)",
                    border: "1px solid rgba(35, 62, 43, 0.2)",
                    borderRadius: "12px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={16} color="var(--color-forest)" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-forest)" }}>
                      ATS Information Successfully Extracted
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem" }}>
                    {parsedProfile.phone && (
                      <span style={{ backgroundColor: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid #E2DDD6" }}>
                        📞 {parsedProfile.phone}
                      </span>
                    )}
                    {parsedProfile.socialLinks?.linkedin && (
                      <span style={{ backgroundColor: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid #E2DDD6" }}>
                        🔗 LinkedIn Linked
                      </span>
                    )}
                    {parsedProfile.skills?.length > 0 && (
                      <span style={{ backgroundColor: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid #E2DDD6" }}>
                        ⚡ {parsedProfile.skills.length} Skills Cataloged
                      </span>
                    )}
                    {parsedProfile.experience?.length > 0 && (
                      <span style={{ backgroundColor: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid #E2DDD6" }}>
                        💼 {parsedProfile.experience.length} Positions Structured
                      </span>
                    )}
                    {parsedProfile.projects?.length > 0 && (
                      <span style={{ backgroundColor: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid #E2DDD6" }}>
                        🚀 {parsedProfile.projects.length} Projects Analyzed
                      </span>
                    )}
                  </div>
                </div>
              )}

              {parseError && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#B04040", fontSize: "0.8rem" }}>
                  <AlertCircle size={14} />
                  <span>{parseError}</span>
                </div>
              )}

              {errors.resume && <p className="field-error">{errors.resume}</p>}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-secondary"
                  style={{
                    padding: "0.85rem 1.25rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    borderRadius: "999px",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={advance}
                  className="btn-primary btn-full"
                  style={{
                    padding: "0.85rem 1.5rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderRadius: "999px",
                  }}
                >
                  Review Dossier <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Final Confirmation ──────────── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div
                style={{
                  backgroundColor: "var(--color-cream-alt)",
                  border: "1px solid #E2DDD6",
                  borderRadius: "14px",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <SummaryRow label="Candidate Name" value={name || parsedProfile?.name || "Candidate"} />
                <div style={{ height: "1px", backgroundColor: "#E8E4DE" }} />
                <SummaryRow label="Target Role" value={jobRole} highlight />
                <div style={{ height: "1px", backgroundColor: "#E8E4DE" }} />
                <SummaryRow label="Location" value={location || parsedProfile?.location || "Remote"} />
                <div style={{ height: "1px", backgroundColor: "#E8E4DE" }} />
                <SummaryRow
                  label="Resume Attached"
                  value={resumeFileName || (parsedProfile ? "Parsed Resume" : "Attached")}
                />
                {parsedProfile?.phone && (
                  <>
                    <div style={{ height: "1px", backgroundColor: "#E8E4DE" }} />
                    <SummaryRow label="Phone" value={parsedProfile.phone} />
                  </>
                )}
                {parsedProfile?.skills && parsedProfile.skills.length > 0 && (
                  <>
                    <div style={{ height: "1px", backgroundColor: "#E8E4DE" }} />
                    <SummaryRow label="Extracted Skills" value={`${parsedProfile.skills.length} Skills`} />
                  </>
                )}
              </div>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                All information will be accessible and editable on your <strong>/account</strong> page.{" "}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--color-teal-deep)",
                    fontWeight: 500,
                    fontSize: "0.8rem",
                    textDecoration: "underline",
                  }}
                >
                  Edit details
                </button>
              </p>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-secondary"
                  style={{
                    padding: "0.85rem 1.25rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    borderRadius: "999px",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={loading}
                  className="btn-primary btn-full"
                  style={{
                    padding: "0.85rem 1.5rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderRadius: "999px",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner /> Preparing session…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Launch Workspace
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem 0 0.5rem",
        }}
      >
        {["Privacy", "Terms", "Help"].map((item) => (
          <Link
            key={item}
            href="#"
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.04em",
            }}
          >
            {item}
          </Link>
        ))}
      </footer>
    </div>
  );
}

/* ── SummaryRow sub-component ──────────────────────────────── */
function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: highlight ? "var(--font-serif)" : "var(--font-sans)",
          fontSize: highlight ? "1rem" : "0.88rem",
          fontWeight: highlight ? 400 : 500,
          color: highlight ? "var(--color-teal-deep)" : "var(--color-ink)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
