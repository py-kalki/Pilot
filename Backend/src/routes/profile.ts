import { Router, Request, Response, RequestHandler } from "express";
import multer from "multer";
import { Profile } from "../models/Profile";
import { Kit } from "../models/Kit";
import { requireAuth } from "../middleware/auth";
import { parseResumeText } from "../pipeline/stages/parseResume";
import { extractTextFromBuffer } from "../pipeline/stages/extractFileText";

const router = Router();

/* ── Multer: in-memory file storage (no disk) ───────────────── */
/* Matches the "Up to 15MB" promise shown in the onboarding UI. */
const MAX_RESUME_BYTES = 15 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/markdown",
    ];
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (allowed.includes(file.mimetype) || ["pdf", "docx", "doc", "txt", "md"].includes(ext || "")) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/**
 * Multer reports size/type failures as errors rather than responses, which
 * would reach Express' default handler as an HTML 500. Translate them to JSON
 * so the client can surface the actual reason.
 */
const resumeUpload: RequestHandler = (req, res, next) => {
  upload.single("resume")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    const tooLarge = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE";
    res.status(tooLarge ? 413 : 400).json({
      error: tooLarge
        ? `Resume file is too large. Maximum size is ${MAX_RESUME_BYTES / (1024 * 1024)}MB.`
        : err instanceof Error
        ? err.message
        : "Failed to upload resume",
    });
  });
};

/* ─────────────────────────────────────────────────────────────
   GET /api/profile — fetch authenticated user's profile
───────────────────────────────────────────────────────────── */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.uid;
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Check if user previously created kits before profiles were tracked
      const hasKits = await Kit.exists({ userId });
      profile = await Profile.create({
        userId,
        email: req.user!.email || "",
        name: req.user!.name || "Candidate",
        skills: [],
        experience: [],
        projects: [],
        education: [],
        socialLinks: {},
        onboardingCompleted: Boolean(hasKits),
      });
    } else if (!profile.onboardingCompleted) {
      // Existing user detection: check for existing kits, role, location, resume, or skills
      const hasKits = await Kit.exists({ userId });
      const isLegacyDone = Boolean(
        hasKits ||
        profile.targetRole ||
        profile.location ||
        profile.dob ||
        profile.resume?.fileName ||
        (profile.skills && profile.skills.length > 0)
      );
      if (isLegacyDone) {
        profile.onboardingCompleted = true;
        await profile.save();
      }
    }

    res.json({ profile });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    res.status(500).json({ error: "Failed to fetch candidate profile" });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/profile/resume/file — multipart file upload
   Accepts: PDF, DOCX, DOC, TXT, MD
   Extracts text properly, runs ATS parse, saves to DB
───────────────────────────────────────────────────────────── */
router.post(
  "/resume/file",
  requireAuth,
  resumeUpload,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.uid;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { targetRole, location, dob } = req.body;

      console.log(
        `[profile/resume/file] Received ${file.originalname} ` +
        `(${file.mimetype}, ${Math.round(file.size / 1024)} KB) for user ${userId}`
      );

      // ── Step 1: Extract clean text from binary buffer ──────
      const { text, method, charCount } = await extractTextFromBuffer(
        file.buffer,
        file.mimetype,
        file.originalname
      );

      console.log(`[profile/resume/file] Extracted ${charCount} chars via ${method}`);

      if (charCount < 50) {
        res.status(422).json({
          error: "Could not extract readable text from the uploaded file. Please paste your resume as text instead.",
        });
        return;
      }

      // ── Step 2: LLM ATS parsing ────────────────────────────
      const extracted = await parseResumeText(text);

      console.log(
        `[profile/resume/file] ATS extracted — name:${extracted.name}, ` +
        `phone:${extracted.phone}, skills:${extracted.skills?.length}, ` +
        `experience:${extracted.experience?.length}, projects:${extracted.projects?.length}`
      );

      // ── Step 3: Persist to DB ──────────────────────────────
      let profile = await Profile.findOne({ userId });

      const resumeFile = {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedAt: new Date(),
        rawText: text.slice(0, 12000),
      };

      if (!profile) {
        profile = new Profile({
          userId,
          email: req.user!.email || extracted.email || "",
          name: extracted.name || req.user!.name || "Candidate",
          phone: extracted.phone,
          location: location || extracted.location,
          dob: dob || undefined,
          targetRole: targetRole || undefined,
          summary: extracted.summary,
          skills: extracted.skills || [],
          socialLinks: extracted.socialLinks || {},
          experience: extracted.experience || [],
          projects: extracted.projects || [],
          education: extracted.education || [],
          certifications: extracted.certifications || [],
          resume: resumeFile,
        });
      } else {
        if (extracted.name) profile.name = extracted.name;
        if (extracted.phone) profile.phone = extracted.phone;
        if (extracted.location && !profile.location) profile.location = extracted.location;
        if (location) profile.location = location;
        if (targetRole) profile.targetRole = targetRole;
        if (dob) profile.dob = dob;
        if (extracted.summary) profile.summary = extracted.summary;
        if (extracted.skills?.length) profile.skills = extracted.skills;
        if (extracted.socialLinks) {
          profile.socialLinks = { ...profile.socialLinks, ...extracted.socialLinks };
        }
        if (extracted.experience?.length) profile.experience = extracted.experience;
        if (extracted.projects?.length) profile.projects = extracted.projects;
        if (extracted.education?.length) profile.education = extracted.education;
        if (extracted.certifications?.length) profile.certifications = extracted.certifications;
        profile.resume = resumeFile;
      }

      await profile.save();
      console.log(`[profile/resume/file] Saved profile for user ${userId}`);

      res.json({ success: true, profile, extracted });
    } catch (err) {
      console.error("[POST /api/profile/resume/file]", err);
      res.status(500).json({ error: "Failed to parse and save resume" });
    }
  }
);

/* ─────────────────────────────────────────────────────────────
   POST /api/profile/resume — text/JSON paste endpoint
   (LinkedIn profile paste, plain text paste)
───────────────────────────────────────────────────────────── */
router.post("/resume", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.uid;
    const { resumeText, fileName, fileSize, fileType, targetRole, location, dob } = req.body;

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 15) {
      res.status(400).json({ error: "Valid resumeText content is required (min 15 characters)" });
      return;
    }

    const cleanText = resumeText.trim();
    console.log(`[profile/resume] Parsing pasted text (${cleanText.length} chars) for user ${userId}`);

    const extracted = await parseResumeText(cleanText);

    console.log(
      `[profile/resume] ATS extracted — name:${extracted.name}, ` +
      `phone:${extracted.phone}, skills:${extracted.skills?.length}, ` +
      `experience:${extracted.experience?.length}`
    );

    let profile = await Profile.findOne({ userId });

    const resumeFile = {
      fileName: fileName || "pasted-resume.txt",
      fileSize: fileSize || cleanText.length,
      fileType: fileType || "text/plain",
      uploadedAt: new Date(),
      rawText: cleanText.slice(0, 12000),
    };

    if (!profile) {
      profile = new Profile({
        userId,
        email: req.user!.email || extracted.email || "",
        name: extracted.name || req.user!.name || "Candidate",
        phone: extracted.phone,
        location: location || extracted.location,
        dob: dob || undefined,
        targetRole: targetRole || undefined,
        summary: extracted.summary,
        skills: extracted.skills || [],
        socialLinks: extracted.socialLinks || {},
        experience: extracted.experience || [],
        projects: extracted.projects || [],
        education: extracted.education || [],
        certifications: extracted.certifications || [],
        resume: resumeFile,
      });
    } else {
      if (extracted.name) profile.name = extracted.name;
      if (extracted.phone) profile.phone = extracted.phone;
      if (extracted.location && !profile.location) profile.location = extracted.location;
      if (location) profile.location = location;
      if (targetRole) profile.targetRole = targetRole;
      if (dob) profile.dob = dob;
      if (extracted.summary) profile.summary = extracted.summary;
      if (extracted.skills?.length) profile.skills = extracted.skills;
      if (extracted.socialLinks) {
        profile.socialLinks = { ...profile.socialLinks, ...extracted.socialLinks };
      }
      if (extracted.experience?.length) profile.experience = extracted.experience;
      if (extracted.projects?.length) profile.projects = extracted.projects;
      if (extracted.education?.length) profile.education = extracted.education;
      if (extracted.certifications?.length) profile.certifications = extracted.certifications;
      profile.resume = resumeFile;
    }

    await profile.save();
    console.log(`[profile/resume] Saved profile for user ${userId}`);

    res.json({ success: true, profile, extracted });
  } catch (err) {
    console.error("[POST /api/profile/resume]", err);
    res.status(500).json({ error: "Failed to parse and save resume data" });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/profile — update profile fields
───────────────────────────────────────────────────────────── */
router.put("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.uid;
    const {
      name,
      phone,
      location,
      dob,
      targetRole,
      summary,
      skills,
      socialLinks,
      experience,
      projects,
      education,
      onboardingCompleted,
    } = req.body;

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({
        userId,
        email: req.user!.email || "",
        name: name || "Candidate",
        onboardingCompleted: false,
      });
    }

    if (name) profile.name = name;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (dob !== undefined) profile.dob = dob;
    if (targetRole !== undefined) profile.targetRole = targetRole;
    if (summary !== undefined) profile.summary = summary;
    if (Array.isArray(skills)) profile.skills = skills;
    if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
    if (Array.isArray(experience)) profile.experience = experience;
    if (Array.isArray(projects)) profile.projects = projects;
    if (Array.isArray(education)) profile.education = education;
    if (onboardingCompleted !== undefined) {
      profile.onboardingCompleted = Boolean(onboardingCompleted);
    }

    await profile.save();

    res.json({ success: true, profile });
  } catch (err) {
    console.error("[PUT /api/profile]", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
