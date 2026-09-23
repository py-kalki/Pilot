import { Kit, IKit } from "../models/Kit";
import { crawlCompany } from "./crawlCompany";
import { generateKit } from "./generateKit";

async function updateStatus(
  kitId: string,
  status: IKit["status"],
  statusMessage: string
): Promise<void> {
  await Kit.findByIdAndUpdate(kitId, { status, statusMessage });
}

export async function runPipeline(kitId: string): Promise<void> {
  const kit = await Kit.findById(kitId);
  if (!kit) {
    console.error(`[pipeline] Kit ${kitId} not found`);
    return;
  }

  try {
    // ── Stage 1: Multi-stage Crawling ─────────────────────────
    await updateStatus(kitId, "crawling", "🌐 Scraping company overview...");
    console.log(`[pipeline] ${kitId} → starting multi-stage crawl for ${kit.companyWebsite} (${kit.jobRole})`);

    const crawlData = await crawlCompany(
      kit.companyWebsite,
      kit.jobRole,
      kit.linkedinPage,
      async (progressMsg) => {
        await updateStatus(kitId, "crawling", progressMsg);
      }
    );

    // Save intermediate crawl data to DB
    await Kit.findByIdAndUpdate(kitId, { crawlData });

    // ── Stage 2: Deep Analysis & Synthesis ────────────────────
    let analysisMsg = "🔍 Synthesizing company overview & role requirements...";
    if (crawlData.jobRoleFound) {
      analysisMsg = "🎯 Found exact job posting — analyzing required competencies & tech stack...";
    } else if (crawlData.careersFound) {
      analysisMsg = "💼 Careers page found — analyzing company hiring standards & culture...";
    }

    await updateStatus(kitId, "analyzing", analysisMsg);
    console.log(
      `[pipeline] ${kitId} → crawl finished. careersFound=${crawlData.careersFound}, jobRoleFound=${crawlData.jobRoleFound}`
    );

    await new Promise((r) => setTimeout(r, 1200));

    // ── Stage 3: AI Kit Generation via Jev & Gemini ───────────
    await updateStatus(
      kitId,
      "generating",
      "✨ Generating customized questions, flashcards & 7-day study plan..."
    );
    console.log(`[pipeline] ${kitId} → generating kit via Jev + Gemini 2.0 Flash`);

    let availableDays = 5;
    if (kit.interviewDate) {
      const diffMs = new Date(kit.interviewDate).getTime() - Date.now();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) availableDays = Math.min(30, diffDays);
    }

    const generatedKit = await generateKit({
      jobRole: kit.jobRole,
      companyWebsite: kit.companyWebsite,
      notes: kit.notes,
      crawlData,
      days: availableDays,
    });

    // ── Stage 4: Mark Kit Ready ───────────────────────────────
    await Kit.findByIdAndUpdate(kitId, {
      status: "done",
      statusMessage: "🎉 Your interview prep kit is ready!",
      kit: generatedKit,
    });

    console.log(`[pipeline] ${kitId} → successfully generated kit ✓`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[pipeline] ${kitId} → pipeline error:`, message);

    await Kit.findByIdAndUpdate(kitId, {
      status: "error",
      statusMessage: "Generation encountered an issue. Please try again.",
      errorMessage: message,
    });
  }
}
