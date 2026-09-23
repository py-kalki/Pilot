"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, UserProfile, KitSummary } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Code2,
  GraduationCap,
  FileText,
  UploadCloud,
  CheckCircle2,
  Key,
  Download,
  LogOut,
  Calendar,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Award,
  Layers,
  Edit3,
  ExternalLink,
  Clock,
  Shield,
  Plus,
} from "lucide-react";

/* ── Inline Brand SVGs ─────────────────────────────────────── */
const LinkedinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 1.64 1.64 1.64 1.64 0 0 0-1.64-1.64z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

/* ── Sidebar Nav Items (Exact same as /interview) ───────────── */
const NAV_ITEMS = [
  {
    href: "/interview",
    label: "Interviews",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/interview/new",
    label: "New prep",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "Account",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [kits, setKits] = useState<KitSummary[]>([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTargetRole, setEditTargetRole] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editPortfolio, setEditPortfolio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Resume Re-upload State
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password reset state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // Data Export state
  const [isExporting, setIsExporting] = useState(false);

  // Default Study Days Preference
  const [defaultDays, setDefaultDays] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("pilot_pref_days") || "5", 10);
    }
    return 5;
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [profRes, kitsRes] = await Promise.all([
          api.profile.get().catch(() => null),
          api.kits.list().catch(() => ({ kits: [] })),
        ]);

        if (profRes && profRes.profile) {
          setProfile(profRes.profile);
          setEditName(profRes.profile.name || user.displayName || "");
          setEditPhone(profRes.profile.phone || "");
          setEditLocation(profRes.profile.location || "");
          setEditTargetRole(profRes.profile.targetRole || "");
          setEditSummary(profRes.profile.summary || "");
          setEditLinkedin(profRes.profile.socialLinks?.linkedin || "");
          setEditGithub(profRes.profile.socialLinks?.github || "");
          setEditPortfolio(profRes.profile.socialLinks?.portfolio || "");
        } else {
          setEditName(user.displayName || "");
        }

        if (kitsRes && kitsRes.kits) {
          setKits(kitsRes.kits);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  // Handle Profile Update Save
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (editName.trim() && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editName.trim() });
      }

      const res = await api.profile.update({
        name: editName.trim() || user.displayName || "Candidate",
        phone: editPhone.trim(),
        location: editLocation.trim(),
        targetRole: editTargetRole.trim(),
        summary: editSummary.trim(),
        socialLinks: {
          linkedin: editLinkedin.trim(),
          github: editGithub.trim(),
          portfolio: editPortfolio.trim(),
        },
      });

      if (res && res.profile) {
        setProfile(res.profile);
      }
      setIsEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Resume Re-upload & ATS Parsing
  const handleResumeUpload = async (file: File) => {
    setIsUploadingResume(true);
    try {
      // Send raw binary to backend — pdf-parse / mammoth extract text server-side
      const res = await api.profile.uploadResumeFile(file, {
        targetRole: profile?.targetRole,
        location: profile?.location,
      });

      if (res && res.profile) {
        setProfile(res.profile);
        setEditName(res.profile.name || editName);
        setEditPhone(res.profile.phone || editPhone);
        setEditLocation(res.profile.location || editLocation);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Resume upload failed:", err);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Password Reset Email
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    setResetError("");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: unknown) {
      const e = err as Error;
      setResetError(e.message || "Failed to dispatch reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Copy UID
  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Export Full Dossier
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const fullKits = await Promise.all(
        kits.map(async (k) => {
          try {
            const data = await api.kits.getById(k._id);
            return data.kit;
          } catch {
            return k;
          }
        })
      );

      const payload = {
        export_version: "1.0",
        exported_at: new Date().toISOString(),
        candidate: {
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName,
          profile,
        },
        kits: fullKits,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pilot-dossier-${user?.uid?.slice(0, 8) || "candidate"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--color-cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "2.5px solid var(--color-teal-deep)",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalKitsCount = kits.length;
  const readyKitsCount = kits.filter((k) => k.status === "done").length;

  // Compute total questions practiced
  let totalPracticedCount = 0;
  if (typeof window !== "undefined") {
    kits.forEach((k) => {
      try {
        const stored = localStorage.getItem(`pilot_practiced_${k._id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) totalPracticedCount += parsed.length;
        }
      } catch {}
    });
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "var(--color-cream-alt)" }}>
      {/* ══ LEFT SIDEBAR (Identical to /interview) ═══════════════ */}
      <aside
        style={{
          width: "228px",
          flexShrink: 0,
          height: "100vh",
          backgroundColor: "var(--color-cream)",
          borderRight: "1px solid #E2DDD6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0",
          overflowY: "auto",
        }}
      >
        <div>
          {/* Brand Logo */}
          <div style={{ padding: "1.4rem 1.5rem 1.25rem", borderBottom: "1px solid #EDE9E2" }}>
            <Link href="/interview" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              <Image
                src="/pilot-logo.png"
                alt="Pilot"
                width={76}
                height={28}
                style={{ objectFit: "contain", filter: "brightness(0)", height: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "2px" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                padding: "0 0.75rem",
                margin: "0 0 0.5rem",
              }}
            >
              Workspace
            </p>

            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/account";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.855rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--color-cream)" : "var(--color-ink)",
                    backgroundColor: isActive ? "var(--color-ink)" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ color: isActive ? "var(--color-cream)" : "var(--color-text-muted)", display: "flex" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Block at Sidebar Bottom */}
        <Link
          href="/account"
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #EDE9E2",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            textDecoration: "none",
            backgroundColor: "#EFECE6",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--color-teal-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>
                {initials}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--color-ink)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.displayName || "Candidate"}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>
        </Link>
      </aside>

      {/* ══ MAIN CONTENT AREA (Identical top bar to /interview) ══ */}
      <main
        style={{
          flex: 1,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Top Bar Header (Same layout as /interview) ──────── */}
        <header
          style={{
            padding: "1.25rem 2rem",
            borderBottom: "1px solid #E2DDD6",
            backgroundColor: "var(--color-cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                margin: "0 0 0.15rem",
              }}
            >
              Account & Security
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.45rem",
                fontWeight: 400,
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              Candidate Dossier
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,.md"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleResumeUpload(e.target.files[0]);
                }
              }}
            />

            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingResume}
              style={{
                fontSize: "0.82rem",
                padding: "0.45rem 1rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <UploadCloud size={14} />
              {isUploadingResume ? "Parsing ATS Resume..." : "Re-Upload Resume"}
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleExportData}
              disabled={isExporting}
              style={{
                fontSize: "0.82rem",
                padding: "0.45rem 1.15rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Download size={14} />
              {isExporting ? "Exporting..." : "Export Dossier"}
            </button>
          </div>
        </header>

        {/* ── Scrollable Body View ────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem 2.5rem 4rem",
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Status alerts */}
          {uploadSuccess && (
            <div
              style={{
                backgroundColor: "rgba(35, 62, 43, 0.08)",
                border: "1px solid rgba(35, 62, 43, 0.2)",
                borderRadius: "12px",
                padding: "0.85rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.85rem",
                color: "var(--color-forest)",
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={16} /> Resume parsed and ATS candidate dossier updated successfully!
            </div>
          )}

          {saveSuccess && (
            <div
              style={{
                backgroundColor: "rgba(37, 101, 113, 0.08)",
                border: "1px solid rgba(37, 101, 113, 0.2)",
                borderRadius: "12px",
                padding: "0.85rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.85rem",
                color: "var(--color-teal-deep)",
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={16} /> Profile updates saved to cloud database.
            </div>
          )}

          {/* ── 1. BENCHMARK TELEMETRY BAR (DESIGN.md §4) ──────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--color-white)",
                border: "1px solid #E2DDD6",
                borderRadius: "14px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                Kits Synthesized
              </span>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 300, color: "var(--color-ink)", margin: 0 }}>
                {totalKitsCount}
              </p>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                {readyKitsCount} ready for practice
              </span>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-white)",
                border: "1px solid #E2DDD6",
                borderRadius: "14px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                Questions Practiced
              </span>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 300, color: "var(--color-ink)", margin: 0 }}>
                {totalPracticedCount}
              </p>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                STAR structured answers
              </span>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-white)",
                border: "1px solid #E2DDD6",
                borderRadius: "14px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                Extracted Skills
              </span>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 300, color: "var(--color-ink)", margin: 0 }}>
                {profile?.skills?.length || 0}
              </p>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                Parsed by ATS engine
              </span>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-white)",
                border: "1px solid #E2DDD6",
                borderRadius: "14px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                Target Timeline
              </span>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 300, color: "var(--color-ink)", margin: 0 }}>
                {defaultDays} <span style={{ fontSize: "0.95rem", fontWeight: 400 }}>Days</span>
              </p>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                Paced study allocation
              </span>
            </div>
          </div>

          {/* ── 2. CANDIDATE IDENTITY & CONTACT CARD ─────────── */}
          <section
            style={{
              backgroundColor: "var(--color-white)",
              border: "1px solid #E2DDD6",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #EDE9E2",
                paddingBottom: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    display: "block",
                    marginBottom: "0.2rem",
                  }}
                >
                  Candidate Information
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, margin: 0 }}>
                  Personal Details & Contact
                </h2>
              </div>

              {!isEditingProfile ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditingProfile(true)}
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.95rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditingProfile(false)}
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingProfile ? (
              /* Profile Edit Form */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
                <div>
                  <label className="field-label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="field-label">Target Role</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editTargetRole}
                    onChange={(e) => setEditTargetRole(e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
                <div>
                  <label className="field-label">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="field-label">LinkedIn URL</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="field-label">GitHub URL</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Portfolio / Website</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editPortfolio}
                    onChange={(e) => setEditPortfolio(e.target.value)}
                    placeholder="https://myportfolio.dev"
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Executive Bio / Summary</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    placeholder="Experienced full-stack engineer specializing in distributed systems and React architectures."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            ) : (
              /* Profile Display View */
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>
                {/* Avatar */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-teal-deep)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(37, 101, 113, 0.2)",
                      border: "3px solid #FAF8F5",
                      overflow: "hidden",
                    }}
                  >
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {profile?.targetRole || "Candidate"}
                  </span>
                </div>

                {/* Candidate Information Matrix */}
                <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0 0 0.2rem", color: "var(--color-ink)" }}>
                      {profile?.name || user.displayName || "Candidate"}
                    </h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                      {profile?.summary || "No executive summary provided. Upload a resume to populate automatically."}
                    </p>
                  </div>

                  {/* Contact Badges Row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--color-ink)" }}>
                      <Mail size={14} color="var(--color-teal-deep)" />
                      {user.email}
                    </div>

                    {profile?.phone && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--color-ink)" }}>
                        <Phone size={14} color="var(--color-teal-deep)" />
                        {profile.phone}
                      </div>
                    )}

                    {profile?.location && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--color-ink)" }}>
                        <MapPin size={14} color="var(--color-teal-deep)" />
                        {profile.location}
                      </div>
                    )}
                  </div>

                  {/* Social / Portfolio Links */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                    {profile?.socialLinks?.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin.startsWith("http") ? profile.socialLinks.linkedin : `https://${profile.socialLinks.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          padding: "0.3rem 0.75rem",
                          borderRadius: "999px",
                          border: "1px solid #E2DDD6",
                          backgroundColor: "var(--color-cream-alt)",
                          color: "var(--color-ink)",
                          textDecoration: "none",
                        }}
                      >
                        <LinkedinIcon /> LinkedIn <ExternalLink size={11} color="var(--color-text-muted)" />
                      </a>
                    )}

                    {profile?.socialLinks?.github && (
                      <a
                        href={profile.socialLinks.github.startsWith("http") ? profile.socialLinks.github : `https://${profile.socialLinks.github}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          padding: "0.3rem 0.75rem",
                          borderRadius: "999px",
                          border: "1px solid #E2DDD6",
                          backgroundColor: "var(--color-cream-alt)",
                          color: "var(--color-ink)",
                          textDecoration: "none",
                        }}
                      >
                        <GithubIcon /> GitHub <ExternalLink size={11} color="var(--color-text-muted)" />
                      </a>
                    )}

                    {profile?.socialLinks?.portfolio && (
                      <a
                        href={profile.socialLinks.portfolio.startsWith("http") ? profile.socialLinks.portfolio : `https://${profile.socialLinks.portfolio}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          padding: "0.3rem 0.75rem",
                          borderRadius: "999px",
                          border: "1px solid #E2DDD6",
                          backgroundColor: "var(--color-cream-alt)",
                          color: "var(--color-ink)",
                          textDecoration: "none",
                        }}
                      >
                        <Globe size={13} color="var(--color-teal-deep)" /> Portfolio <ExternalLink size={11} color="var(--color-text-muted)" />
                      </a>
                    )}

                    {/* Resume File Chip */}
                    {profile?.resume?.fileName && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          padding: "0.3rem 0.75rem",
                          borderRadius: "999px",
                          border: "1px solid rgba(37, 101, 113, 0.3)",
                          backgroundColor: "rgba(37, 101, 113, 0.08)",
                          color: "var(--color-teal-deep)",
                        }}
                      >
                        <FileText size={13} />
                        {profile.resume.fileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── 3. WORK EXPERIENCE TIMELINE ──────────────────── */}
          <section
            style={{
              backgroundColor: "var(--color-white)",
              border: "1px solid #E2DDD6",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #EDE9E2",
                paddingBottom: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: "0.2rem",
                }}
              >
                Career History
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, margin: 0 }}>
                Work Experience
              </h2>
            </div>

            {profile?.experience && profile.experience.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {profile.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderLeft: "2px solid var(--color-teal-deep)",
                      paddingLeft: "1.25rem",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                        {exp.role} <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>at</span> {exp.company}
                      </h3>
                      {exp.duration && (
                        <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--color-text-muted)", backgroundColor: "var(--color-cream-alt)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
                          {exp.duration}
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <p style={{ fontSize: "0.85rem", color: "var(--color-ink)", margin: "0.4rem 0 0.5rem", lineHeight: 1.5 }}>
                        {exp.description}
                      </p>
                    )}

                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                        {exp.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
                No past work experience registered. Upload or paste a resume to populate automatically.
              </p>
            )}
          </section>

          {/* ── 4. KEY PROJECTS CATALOG ──────────────────────── */}
          <section
            style={{
              backgroundColor: "var(--color-white)",
              border: "1px solid #E2DDD6",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #EDE9E2",
                paddingBottom: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: "0.2rem",
                }}
              >
                Portfolio & Implementations
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, margin: 0 }}>
                Technical Projects
              </h2>
            </div>

            {profile?.projects && profile.projects.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "var(--color-cream-alt)",
                      border: "1px solid #E2DDD6",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <h3 style={{ fontSize: "0.98rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                          {proj.name}
                        </h3>
                        {proj.link && (
                          <a
                            href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "var(--color-teal-deep)" }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: "0.4rem 0 0", lineHeight: 1.5 }}>
                        {proj.description}
                      </p>
                    </div>

                    {proj.techStack && proj.techStack.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {proj.techStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E2DDD6",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                              color: "var(--color-ink)",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
                No technical projects listed. Upload your resume to extract key projects.
              </p>
            )}
          </section>

          {/* ── 5. SKILLS & EDUCATION GRID ─────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
            {/* Skills Card */}
            <section
              style={{
                backgroundColor: "var(--color-white)",
                border: "1px solid #E2DDD6",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ borderBottom: "1px solid #EDE9E2", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    display: "block",
                    marginBottom: "0.2rem",
                  }}
                >
                  Competencies
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, margin: 0 }}>
                  Technical Skills
                </h2>
              </div>

              {profile?.skills && profile.skills.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {profile.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        backgroundColor: "var(--color-cream-alt)",
                        border: "1px solid #E2DDD6",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        color: "var(--color-ink)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
                  No skills extracted yet.
                </p>
              )}
            </section>

            {/* Education Card */}
            <section
              style={{
                backgroundColor: "var(--color-white)",
                border: "1px solid #E2DDD6",
                borderRadius: "16px",
                padding: "2rem",
              }}
            >
              <div style={{ borderBottom: "1px solid #EDE9E2", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    display: "block",
                    marginBottom: "0.2rem",
                  }}
                >
                  Credentials
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, margin: 0 }}>
                  Education & Honors
                </h2>
              </div>

              {profile?.education && profile.education.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {profile.education.map((edu, eIdx) => (
                    <div key={eIdx} style={{ borderBottom: eIdx < profile.education.length - 1 ? "1px solid #EDE9E2" : "none", paddingBottom: "0.75rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                        {edu.degree}
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: "0.2rem 0" }}>
                        {edu.institution} {edu.year ? `• ${edu.year}` : ""} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
                  No education history listed.
                </p>
              )}
            </section>
          </div>

          {/* ── 6. SECURITY & ACCESS RECOVERY ────────────────── */}
          <section
            style={{
              backgroundColor: "var(--color-white)",
              border: "1px solid #E2DDD6",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ borderBottom: "1px solid #EDE9E2", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: "0.2rem",
                }}
              >
                Credentials & Keys
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, margin: 0 }}>
                Security & Session
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: "var(--color-cream-alt)",
                  borderRadius: "12px",
                  border: "1px solid #E5E0D8",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(37, 101, 113, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-teal-deep)",
                    }}
                  >
                    <Key size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
                      Password & Authentication
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: 0 }}>
                      Trigger a password recovery authorization email to {user.email}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePasswordReset}
                  disabled={isSendingReset}
                  style={{ fontSize: "0.82rem", padding: "0.45rem 1.15rem" }}
                >
                  {isSendingReset ? "Sending..." : resetSent ? "✓ Email Dispatched" : "Send Reset Link"}
                </button>
              </div>

              {resetError && <p style={{ fontSize: "0.8rem", color: "#B04040", margin: 0 }}>{resetError}</p>}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1.25rem",
                  backgroundColor: "rgba(35, 62, 43, 0.04)",
                  borderRadius: "12px",
                  border: "1px solid rgba(35, 62, 43, 0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Shield size={18} color="var(--color-forest)" />
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink)" }}>
                    Candidate UID: <code style={{ backgroundColor: "#E8E4DE", padding: "0.1rem 0.3rem", borderRadius: "4px" }}>{user.uid}</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  style={{
                    background: "none",
                    border: "1px solid #DCD6CC",
                    borderRadius: "6px",
                    padding: "0.3rem 0.65rem",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  {copiedUid ? <Check size={12} color="var(--color-teal-deep)" /> : <Copy size={12} />}
                  {copiedUid ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>

          {/* ── 7. SIGN OUT ACTION ───────────────────────────── */}
          <section
            style={{
              backgroundColor: "#FCF9F7",
              border: "1px solid #ECD9D3",
              borderRadius: "16px",
              padding: "1.75rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, margin: "0 0 0.2rem", color: "var(--color-ink)" }}>
                Sign Out
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
                End session on this browser. All ATS data and prep telemetry remain safely stored in the cloud.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 1.25rem",
                borderRadius: "999px",
                backgroundColor: "transparent",
                border: "1.5px solid #C45543",
                color: "#C45543",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
