# Pilot — Tech Stack

Confirmed against the assessment's preferred stack (frontend, backend, DB, language, scraping, LLM are all as specified in the brief).

---

## 1. Core Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **Next.js + Tailwind CSS** | App Router, React Server Components where generation status doesn't need client interactivity; client components for the editor/practice views. |
| Backend | **Node.js + Express** | Kept separate from Next.js API routes so the pipeline and `evaluate` CLI can share the exact same service code without going through HTTP. |
| Database | **MongoDB** | Confirmed by brief. Mongoose for schema validation/typing over raw driver calls. |
| Language | **TypeScript** | Used everywhere (frontend, backend, CLI) for one shared type layer — critical since Requirement ↔ Question ↔ Coverage linking must stay consistent across the whole pipeline. |
| Scraping | Cheerio (+ Playwright fallback) | Cheerio for static HTML company pages (fast, no browser). Playwright only if a target page is JS-rendered and Cheerio returns near-empty content — keep this as an escape hatch, not the default, to protect the 15-minute batch budget. |
| LLM | Any provider with a genuine free tier | Recommend Google Gemini (Flash tier) or Groq (Llama models) — both have workable free-tier rate limits for a 5-case batch run within 15 minutes. Keep the provider behind an interface so it's swappable without touching pipeline logic. |

---

## 2. Supporting Libraries

| Purpose | Library | Why |
|---|---|---|
| Schema validation (LLM output, API bodies) | **Zod** | Every LLM call that returns structured JSON gets parsed through a Zod schema; malformed output triggers a retry/repair step instead of silently corrupting a kit. |
| MongoDB modeling | **Mongoose** | Gives schema shape + TS types on top of Mongo's flexibility; needed since requirements/questions/coverage have real structural constraints. |
| Auth | **jsonwebtoken** + **bcrypt** | JWT session, bcrypt for password hashing. Simple, no external auth provider dependency (keeps the "clean clone → npm install → run" requirement for evaluators trivial). |
| Background jobs | **BullMQ** (+ Redis) if available, else in-process async queue | Generation runs long; needs to survive an HTTP request timeout. If Redis isn't available in the eval environment, fall back to an in-memory job runner — but the pipeline function itself must be identical either way. |
| HTTP client (LLM + scraping) | **undici** / native `fetch` | No need for axios; Node's built-in fetch is sufficient and one less dependency. |
| Retry/backoff | **p-retry** | Used around LLM calls and crawl requests for the CLI's required rate-limit/retry handling. |
| Testing | **Vitest** | Fast, TS-native. Coverage checker and schedule allocator are pure functions — these get real unit tests, not just pipeline smoke tests. |
| Env management | **dotenv** + a small Zod-validated env schema | Fail fast on missing API keys rather than failing deep inside a pipeline run. |
| Linting/formatting | **ESLint + Prettier** | Baseline code quality (part of the 10-pt "code quality" score). |

---

## 3. Deployment / Dev Environment

| Concern | Choice |
|---|---|
| Local dev | `docker-compose` for MongoDB (+ Redis if BullMQ is used) so `git clone → npm install → npm run dev` works with zero manual DB setup — this directly serves the evaluator's "clean clone" requirement. |
| Hosting (if deployed) | Frontend: Vercel. Backend/API: Railway or Render. DB: MongoDB Atlas free tier. |
| CLI execution | Runs as a plain Node script (`npm run evaluate`) against the same `.env` — no separate deployment needed. |

---

## 4. Explicit Stack Decisions to Flag

- **MongoDB over Postgres/Prisma** — this is a deliberate deviation from your usual stack; Mongoose schemas need to be written carefully to enforce the requirement↔question relational integrity that a relational DB would give you for free.
- **LLM provider is swappable by design** — wrap every LLM call behind a single `generateStructured<T>(prompt, schema)` interface so switching providers (if a free tier gets rate-limited mid-build) doesn't touch pipeline code.
- **Scraping stays lightweight by default** — Playwright is a fallback, not the default, to keep the 5-case/15-minute batch budget safe.
