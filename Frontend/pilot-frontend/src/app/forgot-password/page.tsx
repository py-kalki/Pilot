"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseAuthErrorMessage } from "@/lib/auth-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "var(--color-cream)" }}>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Form
      ══════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: "0 0 50%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "var(--color-cream)",
          overflowY: "auto",
        }}
      >
        {/* Top bar */}
        <div style={{ padding: "1.25rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Link href="https://usepilot.lat" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <Image
              src="/pilot-logo.png"
              alt="Pilot"
              width={68}
              height={26}
              style={{ objectFit: "contain", filter: "brightness(0)", height: "auto" }}
              priority
            />
          </Link>
          <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
            Remember your password?{" "}
            <Link href="/login" className="subtle-link">Sign in</Link>
          </span>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem 2.5rem" }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>

            {/* Headline */}
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-teal-deep)", margin: "0 0 0.5rem" }}>
                Account Recovery
              </p>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.2vw, 2.5rem)", fontWeight: 400, lineHeight: 1.15, color: "var(--color-ink)", margin: "0 0 0.5rem" }}>
                Reset password.
              </h1>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>
                Enter the email associated with your account and we’ll send you instructions to reset your password.
              </p>
            </div>

            {/* Success message */}
            {submitted ? (
              <div style={{ padding: "1.25rem", borderRadius: "10px", backgroundColor: "#EBF5F0", border: "1px solid #C2E2D3", color: "#1D5238", fontFamily: "var(--font-sans)", marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.3rem" }}>Reset email sent!</div>
                <p style={{ fontSize: "0.83rem", margin: 0, lineHeight: 1.5 }}>
                  If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly. Check your spam folder if you don’t see it.
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <Link href="/login" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", fontSize: "0.85rem", padding: "0.6rem 1.25rem" }}>
                    Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Error */}
                {error && (
                  <div style={{ marginBottom: "1.1rem", padding: "0.75rem 1rem", borderRadius: "8px", backgroundColor: "#FDF1F1", border: "1px solid #E8C3C3", fontSize: "0.83rem", color: "#8B2E2E", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-sans)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <div>
                      <label htmlFor="reset-email" className="field-label">Email address</label>
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        required
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      id="reset-submit"
                      className="btn-primary btn-full"
                      disabled={loading}
                      style={{ padding: "0.85rem 1.5rem", fontSize: "0.9rem", marginTop: "0.25rem" }}
                    >
                      {loading ? <><Spinner /> Sending link…</> : "Send reset link"}
                    </button>
                  </div>
                </form>

                <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
                  Remembered your password?{" "}
                  <Link href="/login" className="subtle-link">Back to sign in</Link>
                </p>
              </>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 2.5rem", display: "flex", gap: "1.5rem", justifyContent: "flex-start", flexShrink: 0 }}>
          {["Privacy", "Terms", "Help"].map((item) => (
            <Link key={item} href="#" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "none" }}>{item}</Link>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Oil painting image
      ══════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: "0 0 50%",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#E8E0D4",
        }}
      >
        <Image
          src="/login-image.png"
          alt="Renaissance scholar — the spirit of deep preparation"
          fill
          sizes="50vw"
          style={{ objectFit: "cover", objectPosition: "65% 75%" }}
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(32,22,20,0.72) 0%, rgba(32,22,20,0.18) 45%, transparent 70%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "1.75rem",
            right: "1.75rem",
          }}
        >
          <div style={{ position: "absolute", inset: 0, top: "6px", left: "6px", backgroundColor: "rgba(189,214,210,0.35)", borderRadius: "12px", transform: "rotate(1.5deg)" }} />
          <div style={{ position: "absolute", inset: 0, top: "3px", left: "3px", backgroundColor: "rgba(189,214,210,0.25)", borderRadius: "12px", transform: "rotate(0.5deg)" }} />

          <div
            style={{
              position: "relative",
              backgroundColor: "var(--color-mint-pale)",
              borderRadius: "12px",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", lineHeight: 0.8, color: "var(--color-teal-deep)", opacity: 0.35, marginBottom: "0.5rem", userSelect: "none" }}>
              &ldquo;
            </div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.92rem", lineHeight: 1.6, color: "var(--color-ink)", margin: "0 0 0.75rem", fontStyle: "italic" }}>
              Pilot covered things I never would have thought to prep for. I landed the offer on my dream team.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-teal-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "white" }}>KL</span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Kavya Lakshmi</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-muted)", margin: 0 }}>Senior Data Scientist · Meta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
