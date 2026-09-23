# Pilot — App Flow

Describes screen-by-screen user journeys and the underlying pipeline/state flow. Companion to `PRD.md` (feature spec) and `techstack.md` (stack).

---

## 1. High-Level Flow Map

```
Register/Login
      │
      ▼
 Dashboard (Kit List)
      │
      ├── New Kit → Input Form → Generating (async) → Kit View
      │
      └── Existing Kit → Kit View
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
        Edit Kit      Regenerate       Practice Mode
        (sections)    (one section)    (flashcards)
```

---

## 2. Screen-by-Screen Flow

### 2.1 Auth
- **Register** → email, password → account created → redirect to Dashboard.
- **Login** → email, password → session/JWT issued → redirect to Dashboard.
- **Logout** → clears session → redirect to Login.

### 2.2 Dashboard (Kit List)
- Lists all kits owned by the logged-in user: title (derived from role/company), status (`generating` | `ready` | `failed`), created date, days-until-interview countdown.
- Actions: **New Kit**, open existing kit, delete kit.
- Kits in `generating` status poll/stream their pipeline stage progress inline (e.g., "Researching company… Step 4/10").

### 2.3 New Kit — Input Form
- Fields: Job Description (textarea), Company Website URL, Days Until Interview (number).
- Alternate path: **Bulk Upload** (CSV/JSON of multiple JD/URL/day sets) → creates multiple kit jobs queued sequentially.
- Submit → kit record created with status `generating` → pipeline job enqueued → user redirected to Kit View in a "generating" state.

### 2.4 Kit View — Generating State
- Shows pipeline stage-by-stage progress (mirrors the 10-step pipeline in the PRD): Extracting requirements → Crawling company site → Researching hiring/interview data → Generating questions → Checking coverage → Filling gaps → Building schedule → Validating.
- On completion: transitions to Kit View — Ready State.
- On partial failure (e.g., crawl failed but rest succeeded): kit still renders, with a visible warning on the affected section (e.g., "Company Brief may be incomplete — site could not be crawled") rather than blocking the whole kit.

### 2.5 Kit View — Ready State
Tabbed/sectioned layout:

- **Company Brief** — summary + sources list.
- **Role Breakdown** — title, seniority, responsibilities, requirements list (each tagged `must`/`nice`, with a badge showing how many questions cover it — including a visible flag if a `must` requirement is uncovered).
- **Question Bank** — grouped by category (Technical / Behavioural / System Design / Company Fit); each question shows its linked requirement ID(s).
- **Flashcards** — grid/list view, separate from practice mode (this is the browse/edit view).
- **Study Schedule** — day-by-day view, each day showing assigned items + total minutes.
- **Coverage Report** — explicit list: covered requirements (✅ with covering question links) vs. uncovered/flagged (⚠️ with a one-click "generate more questions for this" action).

### 2.6 Editing Flow
- Inline edit on any question, flashcard, or brief text → saved on blur/submit → item's `source` flips from `generated` to `user_edited`.
- Add question → appears with `source: user_added`.
- Delete question → removed; if it was the sole coverage for a `must` requirement, Coverage Report immediately re-flags that requirement (recomputed client-side or via a lightweight recheck call — no full regeneration needed).
- Reorder / move between categories → drag-and-drop or up/down controls; persisted as an order index, doesn't affect `source` or coverage.

### 2.7 Regenerate Flow (single section)
1. User clicks "Regenerate" on a specific section (e.g., Company Brief, or Technical questions).
2. Confirmation modal: *"This will replace AI-generated content in this section. Your manual edits [N items] will be preserved unless you choose otherwise."*
3. On confirm: pipeline re-runs only the relevant stage(s) for that section.
4. Items with `source: generated` in that section are replaced; items with `source: user_edited` or `user_added` are kept (unless user explicitly opted to overwrite in the modal).
5. Coverage Checker re-runs against the *whole* kit afterward (since a regenerated section can change overall coverage).
6. Kit View updates in place; a toast confirms what changed ("Regenerated 4 technical questions, kept 2 of your edits").

### 2.8 Practice Mode (Flashcards)
1. Entered from Kit View → "Practice" button.
2. Shows a prioritized queue: unpracticed cards and low-confidence cards first.
3. Card flow: show front → user reveals back → user rates confidence (e.g., Again/Hard/Good/Easy or 1–5) → next card.
4. Confidence rating persisted per card with timestamp.
5. Session summary screen at the end: cards practiced, average confidence shift, remaining weak cards.
6. Dashboard/Kit View shows an aggregate practice-coverage indicator (e.g., "68% of cards practiced, 5 weak cards remaining").

### 2.9 Error / Edge States
- **Invalid/unreachable company URL:** pipeline continues with JD-only requirement extraction; Company Brief section shows an explicit "could not research company website" notice rather than fabricated content.
- **Zero extractable requirements from JD:** blocks kit creation with a clear inline error asking for a more detailed JD.
- **1-day schedule:** all questions/flashcards condensed into a single day's plan rather than erroring.
- **LLM rate limit mid-pipeline:** stage retries with backoff (per techstack.md); if still failing, kit is marked `partial` with the failed stage clearly flagged, not silently dropped.

---

## 3. Batch Evaluation CLI Flow (non-UI)

```
npm run evaluate -- --input cases.json --output kits.json
      │
      ▼
For each case (sequential or bounded-concurrency):
      │
      ├── Run same pipeline function used by the API
      ├── On success → append kit result to output
      ├── On failure → log error, append { status: "failed", error }, continue
      │
      ▼
Write kits.json with per-case status + timing
Print summary: N succeeded / N failed / total time
```
- No UI involved — pure function calls into the shared pipeline module (same code path as `POST /kits`, just invoked directly instead of over HTTP).
- Must complete 5 cases within 15 minutes total, with retry/backoff already accounted for in that budget.

---

## 4. State Ownership Summary

| State | Owner | Notes |
|---|---|---|
| Kit generation status | Backend (DB field) | Frontend polls/streams, never owns source of truth. |
| Item `source` (generated/edited/added) | Backend (DB field per item) | Drives regeneration merge logic — never inferred client-side. |
| Coverage Report | Backend (recomputed on any question add/delete/regenerate) | Never cached stale on the client past an edit action. |
| Practice confidence history | Backend (append-only log) | Queue prioritization is computed server-side from this log. |
