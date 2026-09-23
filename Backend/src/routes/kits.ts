import { Router, Request, Response } from "express";
import { Kit } from "../models/Kit";
import { requireAuth } from "../middleware/auth";
import { runPipeline } from "../pipeline/runPipeline";

const router = Router();

/* ─────────────────────────────────────────────────────────────
   POST /api/kits — create a new kit + kick off pipeline async
───────────────────────────────────────────────────────────── */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, jobRole, companyWebsite, linkedinPage, interviewDate, notes } = req.body;

    if (!name || !jobRole || !companyWebsite) {
      res.status(400).json({ error: "name, jobRole, and companyWebsite are required" });
      return;
    }

    const kit = await Kit.create({
      userId: req.user!.uid,
      name,
      jobRole,
      companyWebsite,
      linkedinPage: linkedinPage || undefined,
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      notes: notes || undefined,
      status: "queued",
      statusMessage: "Your prep kit is queued for generation.",
    });

    // Run pipeline async — do NOT await (respond immediately)
    runPipeline(kit._id.toString()).catch((err) => {
      console.error("[kits] Pipeline error:", err);
    });

    res.status(201).json({ id: kit._id, status: kit.status });
  } catch (err) {
    console.error("[POST /kits]", err);
    res.status(500).json({ error: "Failed to create kit" });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/kits — list all kits for authenticated user
───────────────────────────────────────────────────────────── */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const kits = await Kit.find({ userId: req.user!.uid })
      .sort({ createdAt: -1 })
      .select("name jobRole companyWebsite status statusMessage interviewDate createdAt crawlData.careersFound");

    res.json({ kits });
  } catch (err) {
    console.error("[GET /kits]", err);
    res.status(500).json({ error: "Failed to fetch kits" });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/kits/:id/status — lightweight polling endpoint
───────────────────────────────────────────────────────────── */
router.get("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const kit = await Kit.findById(req.params.id)
      .select("status statusMessage errorMessage crawlData.careersFound userId");

    if (!kit) {
      res.status(404).json({ error: "Kit not found" });
      return;
    }
    if (kit.userId !== req.user!.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({
      status: kit.status,
      statusMessage: kit.statusMessage,
      errorMessage: kit.errorMessage,
      careersFound: kit.crawlData?.careersFound ?? null,
    });
  } catch (err) {
    console.error("[GET /kits/:id/status]", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/kits/:id — get full kit data
───────────────────────────────────────────────────────────── */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const kit = await Kit.findById(req.params.id);

    if (!kit) {
      res.status(404).json({ error: "Kit not found" });
      return;
    }
    if (kit.userId !== req.user!.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({ kit });
  } catch (err) {
    console.error("[GET /kits/:id]", err);
    res.status(500).json({ error: "Failed to fetch kit" });
  }
});

/* ─────────────────────────────────────────────────────────────
   PATCH /api/kits/:id/progress — update candidate study progress
───────────────────────────────────────────────────────────── */
router.patch("/:id/progress", requireAuth, async (req: Request, res: Response) => {
  try {
    const { practiced_question_ids, completed_checklist_keys } = req.body;

    const kit = await Kit.findById(req.params.id);
    if (!kit) {
      res.status(404).json({ error: "Kit not found" });
      return;
    }
    if (kit.userId !== req.user!.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    kit.progress = {
      practiced_question_ids: Array.isArray(practiced_question_ids) ? practiced_question_ids : kit.progress?.practiced_question_ids || [],
      completed_checklist_keys: Array.isArray(completed_checklist_keys) ? completed_checklist_keys : kit.progress?.completed_checklist_keys || [],
      last_studied_at: new Date(),
    };

    await kit.save();

    res.json({ success: true, progress: kit.progress });
  } catch (err) {
    console.error("[PATCH /kits/:id/progress]", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/kits/:id/regenerate-section — regenerate a single section
   (questions, flashcards, or schedule) without losing other sections
───────────────────────────────────────────────────────────── */
router.post("/:id/regenerate-section", requireAuth, async (req: Request, res: Response) => {
  try {
    const { section } = req.body;
    if (!["questions", "flashcards", "schedule"].includes(section)) {
      res.status(400).json({ error: "Invalid section. Must be questions, flashcards, or schedule" });
      return;
    }

    const kit = await Kit.findById(req.params.id);
    if (!kit) {
      res.status(404).json({ error: "Kit not found" });
      return;
    }
    if (kit.userId !== req.user!.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { generateQuestions } = await import("../pipeline/stages/generateQuestions");
    const { checkCoverage } = await import("../pipeline/stages/checkCoverage");
    const { generateGapQuestions } = await import("../pipeline/stages/generateGapQuestions");
    const { generateFlashcards } = await import("../pipeline/stages/generateFlashcards");
    const { allocateSchedule } = await import("../pipeline/stages/allocateSchedule");

    const reqs = (kit.kit.role?.requirements || []).map((r) => ({
      id: r.id.toUpperCase(),
      text: r.text,
      type: (r.priority === "must" ? "must" : "nice") as "must" | "nice",
    }));

    if (section === "questions") {
      let newQuestions = await generateQuestions(
        reqs,
        `${kit.kit.company_brief?.summary || ""}\n\nNotes: ${kit.notes || "None"}`,
        kit.jobRole
      );

      const coverageReport = checkCoverage(reqs, newQuestions, 1);
      if (coverageReport.uncovered.length > 0) {
        try {
          const gapQ = await generateGapQuestions(coverageReport.uncovered);
          newQuestions = [...newQuestions, ...gapQ];
        } catch {}
      }

      const validReqIdSet = new Set(reqs.map((r) => r.id.toLowerCase()));
      kit.kit.questions = newQuestions.map((q, idx) => {
        const mappedReqIds = (q.requirementIds || []).map((id) => id.toLowerCase()).filter((id) => validReqIdSet.has(id));
        let category: "technical" | "behavioural" | "system-design" | "company-fit" = "technical";
        if (q.category === "behavioural") category = "behavioural";
        else if (q.category === "system_design") category = "system-design";
        else if (q.category === "company_fit") category = "company-fit";

        return {
          id: `q${idx + 1}`,
          requirement_ids: mappedReqIds.length > 0 ? mappedReqIds : [reqs[0]?.id.toLowerCase() || "r1"],
          category,
          prompt: q.text,
          answer_outline: q.answerOutline || "Focus on structured problem-solving, concrete examples, and trade-offs.",
          difficulty: (idx % 3 === 0 ? 1 : idx % 3 === 1 ? 2 : 3) as 1 | 2 | 3,
        };
      });

      // Recalculate schedule with new questions
      const scheduledItems = kit.kit.questions.map((q) => ({ id: q.id, category: q.category }));
      kit.kit.schedule = allocateSchedule(scheduledItems, kit.kit.schedule?.days_available || 5);
      kit.kit.coverage = {
        uncovered_requirement_ids: checkCoverage(reqs, newQuestions, 2).uncovered_requirement_ids.map((id) => id.toLowerCase()),
        passes: 2,
      };
    } else if (section === "flashcards") {
      const allQ = kit.kit.questions || [];
      const formattedQ = allQ.map((q) => {
        let cat: "technical" | "behavioural" | "system_design" | "company_fit" = "technical";
        if (q.category === "behavioural") cat = "behavioural";
        else if (q.category === "system-design") cat = "system_design";
        else if (q.category === "company-fit") cat = "company_fit";
        return {
          text: q.prompt,
          category: cat,
          requirementIds: q.requirement_ids,
          answerOutline: q.answer_outline,
        };
      });
      const fcData = await generateFlashcards(reqs, formattedQ, kit.jobRole);
      const validReqIdSet = new Set(reqs.map((r) => r.id.toLowerCase()));

      kit.kit.flashcards = fcData.map((f, idx) => {
        const reqId = f.requirementId ? f.requirementId.toLowerCase() : undefined;
        return {
          id: `f${idx + 1}`,
          front: f.front,
          back: f.back,
          requirement_ids: reqId && validReqIdSet.has(reqId) ? [reqId] : [reqs[0]?.id.toLowerCase() || "r1"],
        };
      });
    } else if (section === "schedule") {
      const scheduledItems = (kit.kit.questions || []).map((q) => ({ id: q.id, category: q.category }));
      kit.kit.schedule = allocateSchedule(scheduledItems, kit.kit.schedule?.days_available || 5);
    }

    kit.markModified("kit");
    await kit.save();

    res.json({ success: true, kit: kit.kit });
  } catch (err) {
    console.error("[POST /kits/:id/regenerate-section]", err);
    res.status(500).json({ error: "Failed to regenerate section" });
  }
});

/* ─────────────────────────────────────────────────────────────
   PATCH /api/kits/:id/questions — edit / update question bank
───────────────────────────────────────────────────────────── */
router.patch("/:id/questions", requireAuth, async (req: Request, res: Response) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) {
      res.status(400).json({ error: "questions array is required" });
      return;
    }

    const kit = await Kit.findById(req.params.id);
    if (!kit) {
      res.status(404).json({ error: "Kit not found" });
      return;
    }
    if (kit.userId !== req.user!.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    kit.kit.questions = questions;
    kit.markModified("kit");
    await kit.save();

    res.json({ success: true, questions: kit.kit.questions });
  } catch (err) {
    console.error("[PATCH /kits/:id/questions]", err);
    res.status(500).json({ error: "Failed to update questions" });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/kits/:id — delete a kit
───────────────────────────────────────────────────────────── */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const kit = await Kit.findById(req.params.id);
    if (!kit) {
      res.status(404).json({ error: "Kit not found" });
      return;
    }
    if (kit.userId !== req.user!.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await kit.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /kits/:id]", err);
    res.status(500).json({ error: "Failed to delete kit" });
  }
});

export default router;
