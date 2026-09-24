"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

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

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      api.profile.get()
        .then((res) => {
          if (!res?.profile?.onboardingCompleted) {
            router.push("/onboarding");
          } else {
            setCheckingOnboarding(false);
          }
        })
        .catch(() => {
          setCheckingOnboarding(false);
        });
    }
  }, [user, loading, router]);

  if (loading || !user || checkingOnboarding) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "var(--color-cream)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          border: "2.5px solid var(--color-teal-deep)",
          borderTopColor: "transparent",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const initials = (user.displayName || user.email || "U")
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "var(--color-cream-alt)" }}>

      {/* ══ LEFT SIDEBAR ══════════════════════════════════════ */}
      <aside style={{
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
      }}>
        {/* Logo */}
        <div>
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

          {/* Nav */}
          <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "2px" }}>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              padding: "0 0.75rem",
              margin: "0 0 0.5rem",
            }}>
              Workspace
            </p>

            {NAV_ITEMS.map((item) => (
              <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </nav>
        </div>

        {/* User block at bottom */}
        <Link
          href="/account"
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #EDE9E2",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            textDecoration: "none",
            backgroundColor: "transparent",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#EFECE6";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            backgroundColor: "var(--color-teal-deep)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>
                {initials}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {user.displayName || "User"}
            </p>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              color: "var(--color-text-muted)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {user.email}
            </p>
          </div>
        </Link>
      </aside>

      {/* ══ MAIN CONTENT AREA ═════════════════════════════════ */}
      <main style={{
        flex: 1,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {children}
      </main>
    </div>
  );
}

/* ── Sidebar nav item (client component with active detection) */
function SidebarNavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  // We'll use a simple approach with CSS classes for active detection
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.55rem 0.75rem",
        borderRadius: "8px",
        textDecoration: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "0.855rem",
        fontWeight: 500,
        color: "var(--color-ink)",
        transition: "background-color 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "#EFECE6";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
    >
      <span style={{ color: "var(--color-text-muted)", display: "flex", flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}
