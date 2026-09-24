"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getFirebaseAuthErrorMessage } from "@/lib/auth-errors";
import { api } from "@/lib/api";

/* ── Inline SVG icons ──────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Password strength helper ──────────────────────────────── */
function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "#E0DDD8" };
  let score = 0;
  if (pwd.length >= 8)       score++;
  if (/[A-Z]/.test(pwd))     score++;
  if (/[0-9]/.test(pwd))     score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Weak",   color: "#C0392B" },
    2: { label: "Fair",   color: "#D4870A" },
    3: { label: "Good",   color: "#256571" },
    4: { label: "Strong", color: "#233E2B" },
  };
  return { score, ...(map[score] ?? map[1]) };
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const strength = getStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }
      router.push("/onboarding");
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      try {
        const res = await api.profile.get();
        if (res?.profile?.onboardingCompleted) {
          router.push("/interview");
        } else {
          router.push("/onboarding");
        }
      } catch {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
      setGoogleLoading(false);
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
          <Link href="https://usepilot.cfd" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
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
            Have an account?{" "}
            <Link href="/login" className="subtle-link">Sign in</Link>
          </span>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem 2.5rem" }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>

            {/* Headline */}
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-teal-deep)", margin: "0 0 0.5rem" }}>
                Get started — it&apos;s free
              </p>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.2vw, 2.5rem)", fontWeight: 400, lineHeight: 1.15, color: "var(--color-ink)", margin: "0 0 0.5rem" }}>
                Create your account.
              </h1>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>
                One job description. A complete interview kit in minutes.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: "1.1rem", padding: "0.75rem 1rem", borderRadius: "8px", backgroundColor: "#FDF1F1", border: "1px solid #E8C3C3", fontSize: "0.83rem", color: "#8B2E2E", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-sans)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

                {/* Name */}
                <div>
                  <label htmlFor="signup-name" className="field-label">Full name</label>
                  <input id="signup-name" type="text" autoComplete="name" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required disabled={loading} />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="signup-email" className="field-label">Email address</label>
                  <input id="signup-email" type="email" autoComplete="off" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required disabled={loading} />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="signup-password" className="field-label">Password</label>
                  <div className="input-wrapper">
                    <input id="signup-password" type={showPwd ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required disabled={loading} />
                    <button type="button" className="input-toggle" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? "Hide password" : "Show password"} tabIndex={-1}>
                      {showPwd ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div style={{ height: "3px", borderRadius: "999px", backgroundColor: "#E0DDD8", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color, borderRadius: "999px", transition: "width 0.3s ease, background-color 0.3s ease" }} />
                      </div>
                      {strength.label && (
                        <p style={{ fontSize: "0.73rem", color: strength.color, marginTop: "0.25rem", fontWeight: 500, fontFamily: "var(--font-sans)" }}>
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer" }}>
                  <input type="checkbox" id="signup-terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={loading} style={{ marginTop: "0.15rem", width: "15px", height: "15px", accentColor: "var(--color-teal-deep)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
                    I agree to Pilot&apos;s{" "}
                    <Link href="/terms" className="subtle-link">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="subtle-link">Privacy Policy</Link>.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  id="signup-submit"
                  className="btn-primary btn-full"
                  disabled={loading || !agreed}
                  style={{ padding: "0.85rem 1.5rem", fontSize: "0.9rem" }}
                >
                  {loading ? <><Spinner /> Creating account…</> : "Create free account"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="divider" style={{ margin: "1rem 0" }}>or</div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="btn-secondary btn-full"
              style={{ gap: "0.625rem" }}
            >
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              {googleLoading ? "Connecting to Google…" : "Continue with Google"}
            </button>

            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
              Already have an account?{" "}
              <Link href="/login" className="subtle-link">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 2.5rem", display: "flex", gap: "1.5rem", flexShrink: 0 }}>
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
        {/* Full-bleed painting */}
        <Image
          src="/sign-up.png"
          alt="Renaissance scholar — the spirit of deep preparation"
          fill
          sizes="50vw"
          style={{ objectFit: "cover", objectPosition: "65% 75%" }}
          priority
        />

        {/* Bottom gradient vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(32,22,20,0.72) 0%, rgba(32,22,20,0.12) 40%, transparent 65%)",
          }}
        />

        {/* Stats row — mid-panel */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "1.75rem",
            right: "1.75rem",
            transform: "translateY(-50%)",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          {[
            { num: "10×", label: "More prepared" },
            { num: "< 5 min", label: "To generate" },
            { num: "100%", label: "Requirement coverage" },
          ].map(({ num, label }) => (
            <div
              key={label}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "0.75rem 0.875rem",
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 300, color: "white", margin: "0 0 0.2rem" }}>{num}</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quote card — bottom */}
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
          <div style={{ position: "relative", backgroundColor: "var(--color-mint-pale)", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", lineHeight: 0.8, color: "var(--color-teal-deep)", opacity: 0.35, marginBottom: "0.5rem", userSelect: "none" }}>&ldquo;</div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--color-ink)", margin: "0 0 0.75rem", fontStyle: "italic" }}>
              Pilot felt like having a knowledgeable mentor walk me through everything before the big day.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-teal-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "white" }}>AR</span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>Arjun Rao</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-muted)", margin: 0 }}>Product Manager · Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Micro-components ──────────────────────────────────────── */
function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
