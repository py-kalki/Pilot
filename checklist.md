# Pilot — Assessment Checklist

Mapped directly to the brief (`software-engineer-assignment.pdf`) and its 100-point rubric. Organized by what's graded automatically (can't argue with it) vs. what's human-reviewed (can be explained/defended in the README).

---

## A. Requirement Extraction — 20 pts (Automated)
> "the must-haves in each description are found, marked correctly, and nothing is invented"

- [ ] Every requirement object has `id`, `text`, `kind` (`technical` | `behavioural` | `domain`), and `priority` (`must` | `nice`) — exact field names from Appendix A
- [ ] `priority` is derived from actual JD wording ("required"/"must have" → must; "preferred"/"nice to have"/"bonus" → nice), not a default guess
- [ ] No requirement invented that isn't stated or clearly implied in the JD text
- [ ] No duplicate requirements under different wording
- [ ] Requirement ids are stable within a kit (never renumbered on edit/regenerate)
- [ ] Tested against a thin, two-line JD stub — produces few/honest requirements, not fabricated ones
- [ ] **Known current bug to fix:** your live kit showed 0 must / 23 nice — verify classification logic against real "X+ years", "strong proficiency in Y" style implicit-must language, not just the literal word "required"

## B. Coverage & Schedule — 15 pts (Automated)
> "every must-have requirement has a question, the schedule spans exactly the days requested and allocates all of it"

- [ ] Every `must` requirement has at least one question with its id in `requirement_ids`
- [ ] Coverage check is **code**, not an LLM call (pure function, unit-tested)
- [ ] Gap loop: uncovered requirements → generate targeted questions → recheck, with a defined max-pass cap (documented in README)
- [ ] `coverage.uncovered_requirement_ids` and `coverage.passes` present and accurate on the final kit
- [ ] Schedule allocator is **code**, not an LLM call (pure function, unit-tested)
- [ ] `schedule.days_available` equals the `days` value the user/case actually requested
- [ ] `schedule.days` array length equals `days_available` exactly — not more, not fewer
- [ ] Every `days[].minutes` is an **integer** (no floats, no "about an hour")
- [ ] Every `question_ids` entry inside `schedule.days` refers to a question that actually exists in `questions[]`
- [ ] Harder/higher-priority material scheduled earlier, not the night before
- [ ] Tested with `days = 1` (condensed, doesn't error) and a large value like `days = 60` (doesn't break/duplicate oddly)

## C. Research & Sequencing — 10 pts (Automated)
> "the company site is crawled, a hiring page sought, public discussion searched, question categories generated separately, and coverage genuinely checked"

- [ ] Company site is actually crawled (not a single fixed-path fetch) — link discovery + ranking, not a hardcoded `/careers` guess
- [ ] Crawler attempts to locate a hiring/interview-process page even when it's at an unpredictable path (`/careers`, `/jobs`, handbook, engineering blog)
- [ ] Public discussion of the company's interview process is searched for separately from the site crawl
- [ ] Question generation calls are **separated by category/requirement type** — e.g., "5+ years React" → technical call, "mentors juniors" → behavioural call — not one single prompt returning everything
- [ ] A hiring-process page that's actually found changes what's generated (e.g., take-home + system design round mentioned → reflected in question categories), not ignored
- [ ] Coverage check step is genuinely a second pass over the first draft, not folded into generation
- [ ] robots.txt respected during crawling
- [ ] README documents which sources were actually used

## D. Robustness — 10 pts (Automated)
> "the run completes, unreachable sites are recorded rather than fatal, kits match the expected structure, tests pass"

- [ ] Invalid/404/timeout company URL → run completes, error recorded, kit still produced (JD-only) rather than the whole pipeline failing
- [ ] Company site with no discoverable hiring/about page → honest kit that says so, not fabricated content
- [ ] Public discussion returns nothing → honest brief, not invented "community sentiment"
- [ ] LLM returns invalid JSON or incomplete structure → repair/retry path (Zod validation + one correction attempt), not a crash
- [ ] LLM provider rate-limits (429) → retry with backoff, request stays within free-tier tokens/minute limits, doesn't fall over on first "slow down"
- [ ] Same description + company submitted twice → doesn't crash or silently duplicate a kit (dedupe or new kit — either is fine, just handle it deliberately)
- [ ] Generated kit is **validated against Appendix A structure before saving** — reject/repair if it doesn't match
- [ ] Automated tests exist and pass for: schedule allocation, coverage checking, structure validation
- [ ] `npm run evaluate -- --input <cases.json> --output <kits.json>` runs from a **clean clone** with no manual setup beyond documented install step
- [ ] Evaluate command reads env vars from `.env.example` — documented, not hardcoded
- [ ] Evaluate command completes **5 cases within 15 minutes**, including any retries rate limits force
- [ ] Evaluate command **continues after one case fails** — logs the failure, doesn't abort the batch
- [ ] Evaluate command uses the exact same pipeline code as the live API — not a parallel/duplicated implementation
- [ ] Company URLs used by evaluators may be local addresses — crawler doesn't hardcode a host assumption, follows relative links correctly
- [ ] Batch output file matches Appendix B exactly: `{ version, generated_at, kits: [{ id, status, kit, error }] }`, `status` is `"ok"` or `"failed"`, `error` is `{ code, message }` or `null`

## E. Appendix A — Exact Field Check (feeds directly into A–D above)
Field names must match **exactly** — this is what the automated pass checks against.

- [ ] `source: { company, company_url, role, location, jd_chars, researched_at, pages_used[] }`
- [ ] `company_brief: { summary, what_they_do, sources[] }`
- [ ] `role: { title, seniority, responsibilities[], requirements[] }`
- [ ] `requirements[]: { id, text, kind, priority }`
- [ ] `questions[]: { id, requirement_ids[], category, prompt, answer_outline, difficulty }` — `difficulty` is integer 1–3
- [ ] `flashcards[]: { id, front, back, requirement_ids[] }`
- [ ] `schedule: { days_available, days: [{ day, focus, question_ids[], minutes }] }`
- [ ] `coverage: { uncovered_requirement_ids[], passes }`
- [ ] All ids (`r1`, `q1`, `f1`, etc.) stable within a kit
- [ ] **Cross-check against your current `PRD.md`/`prompts.ts`:** those currently use `camelCase` (`requirementIds`, `durationMinutes`) and are missing `kind`, `answer_outline`, `difficulty`, `focus`, and the full `source` object — needs reconciling before this checklist can be marked done.

## F. The Builder (Editing/Regeneration) — 15 pts (Human review)
> "editing, reordering, and whether a regeneration preserves edits" — "the hardest state problem in the assessment"

- [ ] Inline edit on any question, answer outline, flashcard, or brief text
- [ ] Reorder questions within a category
- [ ] Move a question from one category to another
- [ ] Add a question or flashcard by hand
- [ ] Delete a question or flashcard
- [ ] Regenerate a single section independently: company brief OR one question category OR the schedule
- [ ] Generated/edited/pinned state is explicitly tracked per item (e.g., a `source` field) — documented in README
- [ ] **Explicit test:** manually edit a question in one category → regenerate a *different* category → edited question is untouched
- [ ] **Explicit test:** manually edit a question in a category → regenerate *that same category* → the edited question survives, only untouched/generated items are replaced
- [ ] Deleting a question that was sole coverage for a `must` requirement re-triggers a visible coverage flag

## G. Interaction Design — 10 pts (Human review)
- [ ] Clear loading state while a kit is generating (visible progress, not a blank spinner with no context)
- [ ] Clear empty state (no kits yet)
- [ ] Clear error state (generation failed, partial failure) — structured and useful, not a raw stack trace
- [ ] Editing/reordering feels immediate (optimistic UI), not round-tripping to the server on every keystroke
- [ ] Usable on both laptop and phone (responsive)
- [ ] Navigable by keyboard

## H. Code Quality & README — 10 pts (Human review)
- [ ] Clean separation of concerns: retrieval / extraction / generation / scheduling / persistence are distinct modules, not tangled
- [ ] Meaningful naming, no dead code left over from scaffolding
- [ ] Commit history reflects actual incremental development, not one giant commit
- [ ] JavaScript or TypeScript only
- [ ] README includes **all** of:
  - [ ] Project overview + tech stack, with justification if different from preferred stack
  - [ ] Setup instructions (local + deployed) and exact commands to run the batch entry point
  - [ ] Which LLM provider/model used
  - [ ] High-level architecture
  - [ ] Retrieval approach and sources used
  - [ ] How research/generation steps are sequenced, what each step is responsible for
  - [ ] How generated/edited/pinned state is represented
  - [ ] How the schedule is allocated
  - [ ] Explanation of the creative feature, if built
  - [ ] Key design decisions, trade-offs, known limitations

## I. Practice Mode + Creative Feature — 10 pts (Human review)
- [ ] Step through flashcards one at a time, reveal-answer interaction
- [ ] Record a confidence rating per card
- [ ] Show what's been covered vs. not
- [ ] Next practice session ordered by lowest confidence first (simple weighted sort is fine — just defend the choice in README)
- [ ] (Optional) One creative feature built and **explained in README + video**: why it was built, what real prep problem it solves — not a cosmetic addition

## J. Authentication & Security
- [ ] Register / login / logout with session handling
- [ ] Signed-out visitor cannot reach protected pages or API endpoints
- [ ] Users can read/modify only their own kits (ownership enforced server-side, not just hidden in UI)
- [ ] Expired/invalid sessions handled sensibly (not a crash or silent failure)
- [ ] External URLs validated before fetching; private/loopback addresses rejected in production
- [ ] Fetched content restricted to expected content-types and sizes
- [ ] Text from fetched pages / pasted JD is treated as **content**, never as instructions the LLM should follow (prompt-injection defense — genuinely relevant here since both inputs are untrusted text fed to a model)

## K. Deployment & Submission (Mandatory)
- [ ] Application deployed and publicly accessible
- [ ] Frontend reachable
- [ ] Backend reachable
- [ ] Env vars handled securely, each one documented in README/`.env.example`
- [ ] GitHub repo public (or access granted), complete source, real commit history
- [ ] Batch entry point confirmed working from a **fresh clone** of the deployed repo (not just your local dev copy)
- [ ] Deployment link (public URL, both frontend and backend reachable) included in submission
- [ ] Walkthrough video, 3–4 minutes, covering:
  - [ ] End-to-end kit creation from a pasted JD + company URL
  - [ ] Research/generation steps + second pass closing a coverage gap
  - [ ] Editing/reordering + a regeneration that preserves edits
  - [ ] Practice mode + schedule
  - [ ] Creative feature (if built) + one design decision you'd defend
- [ ] Submitted through the Trao careers page before the 4-day link expiry — **submit with margin**, link cannot be reopened

## L. Explicitly Out of Scope (don't waste time here)
- [ ] No job search/aggregator
- [ ] No CV parsing/rewriting
- [ ] No applying-to-jobs flow
- [ ] No audio/video interview simulation
- [ ] No payments
- [ ] No team/sharing features
- [ ] No email verification / password reset / role hierarchies (auth stays minimal)
