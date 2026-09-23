# Pilot — Implementation Plan

Companion to `PRD.md`, `techstack.md`, `app-flow.md`. This is the build order — what to write, in what sequence, and how to know each piece is done before moving on.

**Guiding principle:** build the deterministic core (coverage checker, schedule allocator, edit-merge logic) and prove it with unit tests *before* wiring it to the LLM or the UI. The pipeline should work end-to-end with a mocked LLM before a single real API key is burned.

---

## 0. Repo Structure

Matches your actual layout — plain top-level folders, **no npm/pnpm workspaces**. A workspace monorepo isn't required for the "CLI must run the same pipeline as the app" rule; that rule only needs the pipeline code to live in one place and be imported, not exported as a package. Since the API and the `evaluate` CLI both run inside `Backend/`, a plain internal module is enough — the workspace setup I originally suggested was solving a problem you don't actually have (no separate package needs to be published or shared outside `Backend/`). **So: yes, this structure works, and it's simpler than what I first proposed.**

```
Pilot/
├── Backend/
│   ├── src/
│   │   ├── pipeline/                 # Shared pipeline logic — imported by API routes AND evaluate.ts
│   │   │   ├── stages/
│   │   │   │   ├── extractRequirements.ts
│   │   │   │   ├── crawlCompany.ts
│   │   │   │   ├── extractPages.ts
│   │   │   │   ├── hiringResearch.ts
│   │   │   │   ├── interviewResearch.ts
│   │   │   │   ├── generateQuestions.ts
│   │   │   │   ├── checkCoverage.ts        # pure function, no I/O
│   │   │   │   ├── generateGapQuestions.ts
│   │   │   │   ├── allocateSchedule.ts     # pure function, no I/O
│   │   │   │   └── validateKit.ts
│   │   │   ├── llm/
│   │   │   │   └── generateStructured.ts   # provider-agnostic LLM interface
│   │   │   ├── types.ts
│   │   │   └── runPipeline.ts              # orchestrates stages 1–10
│   │   ├── routes/                   # Express routes (auth, kits, questions, practice)
│   │   ├── models/                   # Mongoose schemas
│   │   ├── middleware/                # auth/ownership checks
│   │   └── server.ts
│   ├── scripts/
│   │   └── evaluate.ts               # npm run evaluate — imports from ../src/pipeline directly
│   ├── docker-compose.yml            # MongoDB (+ Redis if used)
│   ├── package.json
│   └── tsconfig.json
├── Frontend/                         # Next.js + Tailwind app
│   ├── app/ (or pages/)
│   ├── components/
│   └── package.json
├── Landing/                          # Marketing/landing page — standalone, no pipeline dependency
├── PRD.md
├── techstack.md
├── app-flow.md
├── DESIGN.md
├── implementation-plan.md
└── README.md
```

Key implication of this structure: `scripts/evaluate.ts` lives *inside* `Backend/` and does a relative import (`import { runPipeline } from '../src/pipeline/runPipeline'`) — same function the Express route calls. That relative-import relationship is what actually satisfies the "same pipeline" requirement; the workspaces machinery was never load-bearing for it.

One thing to decide now: `Frontend/` and `Landing/` being separate — are they two separate Next.js apps (e.g., `Landing` is the public marketing site, `Frontend` is the authenticated app), or is `Landing` a route inside `Frontend`? If they're genuinely separate deployables, each needs its own `package.json`/`next.config` and its own deploy target (e.g., Landing → Vercel static, Frontend → Vercel app). Worth confirming before Day 4 deployment, not blocking for Day 1–3.

---

## Day 1 — Foundations + Pipeline Skeleton

**Goal by end of day:** one kit can be created and, with the LLM entirely mocked, flow through all 10 stages and land in MongoDB with the correct shape.

1. **Scaffold the three top-level folders**
   - `Backend/` (Express + TS, with `src/pipeline/` and `scripts/evaluate.ts` inside it), `Frontend/` (Next.js + Tailwind), `Landing/` (static/marketing).
   - `Backend/docker-compose.yml` for MongoDB. Confirm `git clone → cd Backend && npm install && docker-compose up && npm run dev` works from scratch — do the same check for `Frontend/`.
   - No workspaces needed: `Backend`, `Frontend`, `Landing` each get their own `package.json` and are run independently. `Backend/scripts/evaluate.ts` imports directly from `Backend/src/pipeline`, so it never needs cross-folder resolution.

2. **Data model** (Mongoose schemas, per `PRD.md §5`)
   - `User`, `Kit`, embedded/referenced `Requirement`, `Question`, `Flashcard`, `ScheduleDay`, `CoverageReport`, `PracticeRecord`.
   - Every editable item gets `source: "generated" | "user_edited" | "user_added"` and `editedAt` from day one — retrofitting this later is painful.
   - Requirement IDs are stable strings (`R1`, `R2`, …) generated once per kit, never reused/renumbered.

3. **Auth**
   - Register/login/logout, JWT, bcrypt hashing.
   - Middleware enforcing kit ownership on every kit-scoped route (test this explicitly — it's a real security point in the rubric).

4. **Pipeline skeleton with mocked LLM**
   - Implement `runPipeline()` orchestrating all 10 stages per `PRD.md §4.3`.
   - Each stage gets a typed interface now, real logic later. Use a `MOCK_LLM=true` env flag that returns canned structured JSON so you can run the full pipeline before any API key is wired up.
   - `POST /kits` → creates kit, enqueues job, returns immediately with `status: generating`.
   - `GET /kits/:id/status` → returns current stage for polling.

**Definition of done:** `POST /kits` with mocked LLM produces a complete, correctly-shaped Kit document in MongoDB, requirements have stable IDs, and `GET /kits/:id` returns it.

---

## Day 2 — Deterministic Core + Real LLM Wiring

**Goal by end of day:** coverage loop and schedule allocation are real, tested, and correct; real LLM calls replace the mocks; editing + section regeneration work without destroying edits.

1. **Coverage Checker (`checkCoverage.ts`) — pure function, write tests first**
   - Input: `Requirement[]`, `Question[]` → Output: `{ covered: Map<reqId, questionId[]>, uncovered: Requirement[] }`.
   - Unit tests: all covered, some uncovered, zero requirements, zero questions, a requirement covered by multiple questions.

2. **Gap loop**
   - `runPipeline` wraps steps 6–8 in the retry loop from `PRD.md §4.3` (`MAX_ATTEMPTS = 3`).
   - Test: seed 2 uncovered requirements, confirm loop generates until covered or hits max attempts and flags the remainder — never silently drops them.

3. **Schedule Allocator (`allocateSchedule.ts`) — pure function, write tests first**
   - Input: `Question[]`, `Flashcard[]`, `days: number` → Output: exactly `days` `ScheduleDay[]` with integer `durationMinutes`.
   - Tests: `days = 1` (everything condensed), `days > item count` (some empty/light days, not errors), uneven division rounds correctly.

4. **Real LLM integration**
   - Implement `generateStructured<T>(prompt, zodSchema)` in `llm/generateStructured.ts` — parses response through Zod, retries once on validation failure with an error-correction prompt, throws a typed `PipelineStageError` on second failure (caught by orchestrator, stage marked failed, pipeline continues where possible).
   - Wire this into: requirement extraction, question generation, gap generation, company brief summarization.
   - Swap `MOCK_LLM` off; run one real end-to-end kit generation against a real JD + real company URL.

5. **Crawler**
   - Cheerio-based crawl + relevant-page filtering (about/careers/culture pages).
   - Handle unreachable URL gracefully → Company Brief flagged as incomplete, pipeline continues (per `app-flow.md §2.9`).

6. **Editing API**
   - `PATCH/POST/DELETE` on questions, flashcards, brief text → flips `source` to `user_edited`/`user_added`, updates `editedAt`.
   - Delete of a question that was sole coverage for a `must` requirement → recompute coverage inline, return updated `CoverageReport` in the response (no full regeneration needed).

7. **Regeneration endpoint**
   - `POST /kits/:id/regenerate { section }` → re-runs only the relevant stage(s), replaces only `source: generated` items in that section, preserves `user_edited`/`user_added`, then re-runs coverage checker against the *whole* kit.
   - Test explicitly: edit a question manually → regenerate that section → assert the edited question survived and coverage is still correct.

**Definition of done:** coverage checker and schedule allocator have passing unit tests covering edge cases; a real (non-mocked) kit generates end-to-end; editing an item and regenerating its section preserves the edit.

---

## Day 3 — Practice Mode + Evaluate CLI + Robustness

**Goal by end of day:** practice mode is functional with confidence tracking; `npm run evaluate` meets its timing and failure-isolation requirements; the pipeline survives realistic failure modes.

1. **Practice mode**
   - `PracticeRecord` writes on each confidence rating.
   - Practice queue endpoint: unpracticed cards first, then lowest-recent-confidence cards — simple weighted sort, no need for full SM-2.
   - Session summary aggregation (cards practiced, avg confidence shift).

2. **`npm run evaluate` CLI**
   - `Backend/scripts/evaluate.ts` imports `runPipeline` directly from `Backend/src/pipeline` (relative import, same file tree) — same code path as the API routes, per `PRD.md §7`.
   - Bounded-concurrency loop over input cases (start with concurrency 2–3 to respect LLM rate limits while staying under the 15-minute budget).
   - Per-case try/catch: on failure, log and push `{ status: "failed", error }`, continue to next case — batch never aborts.
   - `p-retry` wrapping LLM and crawl calls for rate-limit backoff.
   - Support a `--input` pointing at fixture cases with **local/mock company URLs** — test against a small local static server, not just live internet sites (explicit evaluator requirement).
   - Output `kits.json` with per-case status + timing; print a summary line.
   - **Time it against 5 real cases — must finish under 15 minutes.** If it doesn't, raise concurrency or trim retry counts before Day 4.

3. **Robustness pass**
   - Zero-requirement JD → clear blocking error at creation, not a broken kit.
   - Unreachable company URL → already handled Day 2; re-verify with regeneration flow too.
   - LLM rate limit mid-pipeline → confirm retry/backoff actually engages (simulate with a forced 429 in a test double).
   - Malformed LLM JSON → confirm Zod-driven repair retry actually triggers (simulate with a broken mock response).

**Definition of done:** practice queue correctly deprioritizes recently-confident cards; `npm run evaluate -- --input fixtures/5cases.json --output out.json` completes in under 15 minutes from a clean clone, with at least one intentionally-failing case still producing a full `kits.json` with the other 4 succeeding.

---

## Day 4 (Buffer) — UI Polish, README, Final Verification

1. **UI pass** (per `app-flow.md`)
   - Kit list dashboard with generation status.
   - Kit View tabs: Company Brief, Role Breakdown (with per-requirement coverage badges), Question Bank, Flashcards, Schedule, Coverage Report.
   - Inline editing, add/delete/reorder/move-category controls.
   - Regenerate button + confirmation modal per `app-flow.md §2.7`.
   - Practice mode flow + session summary screen.

2. **README** (root-level, plus a short one inside `Backend/` if setup differs enough to warrant it)
   - Setup instructions covering all three folders: `Backend/` (`npm install`, `docker-compose up`, `npm run dev`), `Frontend/` (`npm install`, `npm run dev`), `Landing/` if it's a separate app.
   - Architecture overview (link/paraphrase `PRD.md` pipeline diagram).
   - How to run `npm run evaluate`.
   - Known limitations / explicit non-goals from `PRD.md §2.2`.

3. **Final verification checklist**
   - [ ] Fresh clone → `npm install` → `docker-compose up` → `npm run dev` works with zero manual steps.
   - [ ] Create a kit end-to-end through the UI.
   - [ ] Edit a question, regenerate a different section, confirm the edit survived.
   - [ ] Force an uncovered `must` requirement, confirm it's visibly flagged, not hidden.
   - [ ] Run `npm run evaluate` on 5 fixture cases, confirm under 15 minutes and correct failure isolation.
   - [ ] Confirm kit ownership: user A cannot fetch user B's kit by ID.
   - [ ] `days = 1` schedule doesn't error.

---

## Testing Strategy Summary

| Layer | Test type | Priority |
|---|---|---|
| `checkCoverage`, `allocateSchedule` | Unit tests, pure functions | Highest — write before wiring to pipeline |
| `runPipeline` (mocked LLM) | Integration test | High — proves stage sequencing works |
| Edit + regenerate merge logic | Integration test | High — this is the explicitly-called-out hard requirement |
| Evaluate CLI | End-to-end timing test against real fixtures | High — has hard numeric requirements (5 cases / 15 min) |
| Auth/ownership | Integration test | Medium-high — security point in rubric |
| UI | Manual pass | Lower priority given time budget — functional over polished |

---

## Risk Register

| Risk | Mitigation |
|---|---|
| LLM free-tier rate limits blow the 15-min CLI budget | `generateStructured` behind an interface (per `techstack.md`) so provider is swappable in minutes; keep CLI concurrency tunable via env var |
| Coverage loop infinite-loops on a stubborn requirement | Hard `MAX_ATTEMPTS` cap, always terminates with explicit flagging |
| Regeneration silently overwrites a user edit | `source` field is the single source of truth for merge logic; covered by an explicit integration test, not just manual QA |
| Crawler hits a JS-heavy site and returns empty content | Playwright fallback (per `techstack.md`), but only triggered on near-empty Cheerio result to protect time budget |
| Running out of time before UI polish | UI is Day 4 (buffer) by design — backend/pipeline/CLI correctness is weighted higher in the rubric and comes first |
