# Pilot — Product Requirements Document

**Product:** AI Interview Prep Kit Generator
**Version:** v0.1 (Assessment Build)
**Timeline:** 4 days total, ~2–3 days focused development
**Status:** Draft for build

---

## 1. Overview

**One-line pitch:** User gives a Job Description + Company Website + days until interview → Pilot researches the company and generates a personalized, editable, practice-ready interview prep kit.

Pilot is graded not on "does it generate plausible questions" but on whether it is a **reliable pipeline of deterministic software wrapped around an LLM** — with explicit requirement tracking, coverage verification, and edit-safe regeneration.

### 1.1 Core thesis
> Research → Extract → Generate → Validate → Detect Gaps → Regenerate → Persist → Let User Edit → Practice

Anything that can be computed in code (coverage checking, schedule allocation, requirement IDs, edit diffing) **must** be computed in code — never delegated to the LLM as free text.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Produce a structured, requirement-traceable interview kit from a JD + company URL + day count.
- Guarantee no `must`-classified requirement ships uncovered by at least one question.
- Let users edit any part of the kit and survive partial regeneration without losing edits.
- Support flashcard practice with confidence tracking and weak-card prioritization.
- Ship a scriptable batch evaluator that reuses the exact same pipeline as the app.

### 2.2 Non-Goals (v0.1)
- No multi-tenant org/teams — single user owns their kits.
- No payment/billing.
- No mobile app — responsive web only.
- No real-time collaborative editing.
- No support for non-English JDs (assume English input for v0.1).

---

## 3. Users

| User | Need |
|---|---|
| Job candidate | Wants a personalized, credible prep kit fast, without missing a topic the interviewer might ask. |
| Assessment evaluator (hidden persona) | Runs `npm run evaluate` against N JD/URL pairs and checks structural correctness, coverage, and robustness of output — not UI. |

---

## 4. Functional Requirements

### 4.1 Authentication
- Register / login / logout (email + password minimum; session or JWT-based).
- Each user sees only their own kits — enforce at the query layer, not just UI.

### 4.2 Kit Creation Input
- Job description (text, required)
- Company website URL (required)
- Days until interview (integer, required, 1–30 reasonable bound)
- Optional: bulk upload of multiple JD/company pairs via file (CSV/JSON) → creates multiple kit generation jobs

### 4.3 Generation Pipeline (sequential, stage-isolated)

Each stage takes typed input, returns typed output, and is independently testable/mockable. No stage may silently swallow failure — failures must be recorded and surfaced.

```
1. JD Extractor        → JD text                → Requirement[]
2. Web Crawler          → Company URL            → CrawledPage[]
3. Page Extractor       → CrawledPage[]           → RelevantPage[] (about/careers/culture)
4. Hiring Research       → RelevantPage[]          → HiringSignal[]
5. Interview Research    → Company name/role       → PublicInterviewData[] (search-derived)
6. Question Generator    → Requirement[] + research → Question[] (each tagged with requirementIds[])
7. Coverage Checker      → Requirement[] + Question[] → CoverageReport (code, not LLM)
8. Gap Generator         → uncovered Requirement[]  → additional Question[] (loop back to step 7)
9. Schedule Allocator    → Question[]/Flashcard[] + days → StudySchedule (code, not LLM)
10. Validator            → full Kit                 → pass/fail + structured errors
```

**Hard rule:** Steps 7 (Coverage Checker) and 9 (Schedule Allocator) are deterministic code. The LLM proposes; code verifies and enforces.

#### Coverage loop contract
```
loop:
  report = checkCoverage(requirements, questions)
  if report.uncovered.length == 0: break
  newQuestions = generateForRequirements(report.uncovered)
  questions += newQuestions
  attempts += 1
  if attempts > MAX_ATTEMPTS: mark remaining uncovered as "flagged", stop
```
- `MAX_ATTEMPTS` should be small (e.g., 2–3) to keep the pipeline within time budget.
- Any requirement still uncovered after max attempts is surfaced explicitly in the Coverage Report — never hidden.

### 4.4 Generated Kit — Required Sections

**Company Brief**
- What the company does
- Summary
- Sources (URLs actually crawled/used — no fabricated sources)

**Role Breakdown**
- Role title, seniority
- Responsibilities
- Requirements — each with a **stable ID** (e.g., `R1`, `R2`) and classification `must` | `nice`

**Question Bank**
- Categories: Technical, Behavioural, System Design, Company Fit
- Each question stores `requirementIds: string[]` linking it back to what it tests

**Flashcards**
- Front/back pairs, linked to a requirement or question where applicable

**Study Schedule**
- Exactly `days` entries (matches user input, no more, no fewer)
- Each day: assigned topics/questions + `durationMinutes: integer`
- Computed in code from question/flashcard volume and days available, not LLM-estimated

**Coverage Report**
- List of requirements with covering question IDs
- List of any uncovered/flagged requirements + reason

### 4.5 Editing & Regeneration (core hard requirement)

- User can: edit any question/answer/flashcard/company brief text; add/delete questions; reorder questions; move questions between categories.
- User can regenerate **a single section** (e.g., "Technical questions only," or "Company Brief only") without touching the rest of the kit.
- **Manual edits must survive regeneration of *other* sections.** Implementation approach:
  - Every editable item has `source: "generated" | "user_edited" | "user_added"` and `editedAt` timestamp.
  - Regeneration of section X only replaces items in X where `source === "generated"` (or explicitly confirmed by user to overwrite `user_edited` items).
  - Regenerating one section re-runs the coverage checker for the whole kit afterward (since requirement coverage is global).

### 4.6 Practice Mode
- Flashcard practice flow (show front → reveal back → self-rate confidence, e.g., 1–5 or Again/Hard/Good/Easy)
- Store per-card confidence history
- Practice queue prioritizes weaker cards (lower recent confidence / not-yet-practiced first) — simple spaced-repetition-lite ranking, not necessarily full SM-2
- Show a coverage/practice dashboard: % requirements covered, % cards practiced, weak areas

---

## 5. Data Model (conceptual)

```
User
 └── Kit
      ├── companyBrief { summary, sources[] }
      ├── role { title, seniority, responsibilities[] }
      ├── requirements[] { id, text, type: must|nice }
      ├── questions[] { id, text, category, requirementIds[], source, editedAt }
      ├── flashcards[] { id, front, back, requirementId?, source }
      ├── schedule[] { day, items[], durationMinutes }
      ├── coverageReport { covered[], uncovered[] }
      └── meta { status, createdAt, pipelineRunId }

PracticeRecord
 └── { userId, flashcardId, confidence, practicedAt }
```

Stable requirement IDs must persist across regenerations of the same kit — never renumber existing requirements.

---

## 6. API Surface (indicative)

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout

POST   /kits                      → create kit, kick off pipeline (async job)
GET    /kits                      → list user's kits
GET    /kits/:id                  → full kit + status
GET    /kits/:id/status           → pipeline stage progress (for polling/streaming)

PATCH  /kits/:id/questions/:qid   → edit a question
POST   /kits/:id/questions        → add question
DELETE /kits/:id/questions/:qid   → delete question
PATCH  /kits/:id/questions/reorder
POST   /kits/:id/regenerate       → body: { section: "questions" | "flashcards" | "companyBrief" | ... }

POST   /kits/:id/practice/:cardId → record confidence
GET    /kits/:id/practice/queue   → prioritized practice queue
```

Generation should run as an async job (queue or background worker) with a pollable/streamable status endpoint — a JD + full research crawl will exceed a typical HTTP request timeout.

---

## 7. Batch Evaluation CLI (mandatory)

```bash
npm run evaluate -- --input <cases.json> --output <kits.json>
```

Requirements:
- Runs **the same pipeline code path** as the live app (no separate "eval-only" logic).
- Input: array of `{ jobDescription, companyUrl, days }` (or similar) cases.
- Must process 5 cases within 15 minutes.
- If one case throws, **log the failure and continue** — never abort the whole batch.
- Must implement retry/backoff for rate-limited LLM or crawl calls.
- Must run from a clean clone (`git clone` → `npm install` → `npm run evaluate`) with no manual setup beyond env vars.
- Must support locally-hosted/mock company URLs (evaluators may point at a local fixture server, not just live internet sites) — don't hardcode assumptions that the crawler only talks to the public internet.
- Output JSON should mirror the Kit structure, plus per-case status (`success` | `failed` + error) and timing.

---

## 8. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB |
| Language | TypeScript |
| Scraping | Implementer's choice (e.g., Cheerio for static, Playwright if JS-rendered pages are common) |
| LLM | Any provider with a genuine free tier |
| Queue/jobs | In-process async worker acceptable for v0.1; note as future work if scaling matters |

> Note: this deviates from your usual Prisma/PostgreSQL stack — the brief specifies MongoDB. Worth confirming whether that's a hard constraint of the assessment or flexible; if flexible, Prisma/Postgres would give you stronger schema guarantees for the requirement↔question relational integrity this project leans on.

---

## 9. Non-Functional Requirements

- **Robustness:** crawler failures, LLM timeouts, and malformed LLM JSON output must degrade gracefully (retry → fallback → flagged, never a hard crash).
- **Determinism where it matters:** coverage checking and schedule allocation must be unit-testable pure functions, independent of any LLM call.
- **Idempotency:** re-running generation for the same kit shouldn't duplicate requirements/questions.
- **Observability:** each pipeline run should be traceable stage-by-stage (useful both for debugging and for the evaluator's "sequencing" score).
- **Security:** kit ownership enforced server-side on every kit/question/flashcard route; no IDOR via guessable kit IDs (use UUIDs, not incrementing ints).

---

## 10. Rubric Alignment (100 pts)

| Area | Pts | PRD Section Driving It |
|---|---:|---|
| Requirement extraction | 20 | §4.3 Step 1, §5 stable IDs |
| Coverage + schedule | 15 | §4.3 Steps 7–9, coverage loop contract |
| Research + sequencing | 10 | §4.3 full pipeline, observability (§9) |
| Robustness | 10 | §9 Robustness, §7 CLI failure isolation |
| Builder/editing/regeneration | 15 | §4.5 |
| UI/interaction design | 10 | (own pass — not detailed here) |
| Code quality + README | 10 | project hygiene, out of PRD scope |
| Practice + creative feature | 10 | §4.6 |

---

## 11. Suggested Build Order (2–3 focused days)

**Day 1 — Pipeline skeleton + data model**
- Data model + DB schema
- Auth
- Pipeline stages 1–6 wired with real (or mocked) LLM/crawl calls, returning typed stubs
- Get one end-to-end kit generating, even if rough

**Day 2 — Deterministic core + editing**
- Coverage checker + gap-generation loop (code-first, tested in isolation)
- Schedule allocator (code-first, tested in isolation)
- Editing endpoints + source-tracking (`generated` vs `user_edited`)
- Section-level regeneration that respects edits

**Day 3 — Practice mode, CLI, polish**
- Flashcard practice + confidence tracking + weak-card queue
- `npm run evaluate` CLI against the same pipeline
- Robustness pass (retries, failure isolation, malformed-output handling)
- UI pass + README

**Buffer (day 4):** fixes, edge cases (0-requirement JD, unreachable company URL, 1-day schedule), final evaluate run against sample cases.

---

## 12. Open Questions
- Is MongoDB a hard requirement, or is Postgres/Prisma acceptable given it's your stronger stack?
- What LLM provider's free tier are you targeting — this affects rate-limit/retry tuning in the CLI?
- Any constraint on crawler depth/politeness (robots.txt, request volume) for the company website crawl?
