"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, KitSummary } from "@/lib/api";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string; dot?: boolean }> = {
  queued:     { label: "Queued",     color: "#6B6560", bg: "#EFECE6" },
  crawling:   { label: "Crawling…",  color: "#7A5C2E", bg: "#FDF3E0", dot: true },
  analyzing:  { label: "Analyzing…", color: "#2A6B5E", bg: "#E4F4F1", dot: true },
  generating: { label: "Generating…",color: "#256571", bg: "#E0EFF2", dot: true },
  done:       { label: "Ready",      color: "#1E6B40", bg: "#E2F2EA" },
  error:      { label: "Error",      color: "#8B2020", bg: "#FDEAEA" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE.queued;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.35rem",
      padding: "0.25rem 0.65rem", borderRadius: "999px",
      fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
      color: cfg.color, backgroundColor: cfg.bg,
      letterSpacing: "0.02em",
    }}>
      {cfg.dot && (
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          backgroundColor: cfg.color,
          animation: "pulseDot 1.2s ease-in-out infinite",
        }} />
      )}
      {cfg.label}
    </span>
  );
}

function KitCard({ kit }: { kit: KitSummary }) {
  const domain = (() => {
    try { return new URL(kit.companyWebsite.startsWith("http") ? kit.companyWebsite : `https://${kit.companyWebsite}`).hostname.replace("www.", ""); }
    catch { return kit.companyWebsite; }
  })();

  const dateStr = kit.interviewDate
    ? new Date(kit.interviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Link href={`/interview/${kit._id}`} style={{ textDecoration: "none" }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2DDD6",
        borderRadius: "14px",
        padding: "1.35rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        cursor: "pointer",
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -4px rgba(38,34,30,0.10)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "none";
        }}
      >
        {/* Top row: name + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
          <h3 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.05rem",
            fontWeight: 400,
            color: "var(--color-ink)",
            margin: 0,
            lineHeight: 1.3,
          }}>
            {kit.name}
          </h3>
          <StatusBadge status={kit.status} />
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-ink)", margin: 0, fontWeight: 500 }}>
            {kit.jobRole}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", color: "var(--color-text-muted)", margin: 0 }}>
            {domain}
          </p>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.25rem" }}>
          {dateStr ? (
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: "0.72rem",
              color: "var(--color-text-muted)",
              display: "flex", alignItems: "center", gap: "0.3rem",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateStr}
            </span>
          ) : <span />}
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#C0BBB4" }}>
            {new Date(kit.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "4rem 2rem",
    }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "16px",
        backgroundColor: "#EFECE6", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.5rem",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 400, color: "var(--color-ink)", margin: "0 0 0.5rem" }}>
        No interviews yet.
      </h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-muted)", margin: "0 0 1.75rem", maxWidth: "380px", lineHeight: 1.55 }}>
        Create your first AI-powered interview prep kit. Paste a company URL and let Pilot build your personalized preparation.
      </p>
      <Link href="/interview/new" className="btn-primary" style={{ textDecoration: "none", padding: "0.7rem 1.6rem", fontSize: "0.88rem" }}>
        Create your first prep kit
      </Link>
    </div>
  );
}

export default function InterviewPage() {
  const [kits, setKits] = useState<KitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKits = useCallback(async () => {
    try {
      const { kits: data } = await api.kits.list();
      setKits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load kits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  // Auto-refresh if any kit is still generating
  useEffect(() => {
    const hasGenerating = kits.some((k) =>
      ["queued", "crawling", "analyzing", "generating"].includes(k.status)
    );
    if (!hasGenerating) return;
    const interval = setInterval(fetchKits, 4000);
    return () => clearInterval(interval);
  }, [kits, fetchKits]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-cream-alt)" }}>

      {/* Top bar */}
      <div style={{
        padding: "1.25rem 2rem",
        borderBottom: "1px solid #E2DDD6",
        backgroundColor: "var(--color-cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", margin: "0 0 0.15rem" }}>
            Dashboard
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem", fontWeight: 400, color: "var(--color-ink)", margin: 0 }}>
            Your Interviews
          </h1>
        </div>
        <Link
          href="/interview/new"
          className="btn-primary"
          style={{ textDecoration: "none", padding: "0.6rem 1.25rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create
        </Link>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "1.75rem 2rem", overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid var(--color-teal-deep)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#8B2020" }}>
            <p style={{ fontFamily: "var(--font-sans)" }}>{error}</p>
          </div>
        ) : kits.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
              {kits.map((kit) => <KitCard key={kit._id} kit={kit} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
