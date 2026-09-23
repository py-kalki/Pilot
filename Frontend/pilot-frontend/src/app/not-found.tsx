import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-cream)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top bar — logo centered ───────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 2.5rem 1rem",
          width: "100%",
          flexShrink: 0,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          <Image
            src="/pilot-logo.png"
            alt="Pilot"
            width={96}
            height={34}
            style={{ objectFit: "contain", filter: "brightness(0)", height: "auto" }}
            priority
          />
        </Link>
      </header>

      {/* ── Centerpiece — massive editorial serif "Error 404" ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1rem 2rem",
          userSelect: "none",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-moralana)",
            fontSize: "clamp(4.5rem, 16vw, 17rem)",
            fontWeight: 400,
            fontStyle: "normal",
            color: "var(--color-ink)",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          Error 404
        </h1>
      </main>

      {/* ── Bottom Section — copy on left, links on right ─────── */}
      <footer
        style={{
          padding: "1.5rem 3rem 2.5rem",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "2rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left — brand info & redirect button */}
        <div style={{ maxWidth: "420px" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              margin: "0 0 0.5rem",
            }}
          >
            Pilot · Creative Intelligence
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.05rem",
              fontWeight: 400,
              color: "var(--color-ink)",
              lineHeight: 1.45,
              margin: "0 0 1.25rem",
            }}
          >
            Whoops! It seems like you&apos;ve taken a detour into the digital wilderness.
          </p>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              textDecoration: "none",
              padding: "0.65rem 1.6rem",
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "999px",
            }}
          >
            HOME <span style={{ fontSize: "0.95rem" }}>→</span>
          </Link>
        </div>

        {/* Right — utility links */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            paddingBottom: "0.25rem",
          }}
        >
          {["Privacy", "Terms", "Help"].map((item) => (
            <Link
              key={item}
              href="#"
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.04em",
                transition: "color 0.2s ease",
              }}
            >
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
