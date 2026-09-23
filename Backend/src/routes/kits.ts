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
