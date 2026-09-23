import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();

import { crawlCompany, CrawlResult } from "../pipeline/crawlCompany";
import { generateKit } from "../pipeline/generateKit";
import { IKitAppendixA } from "../models/Kit";

export interface BatchInputCase {
  id?: string;
  jd?: string;
  job_description?: string;
  company?: string;
  company_url?: string;
  url?: string;
  role?: string;
  jobRole?: string;
  days?: number;
  days_available?: number;
}

export interface BatchOutputError {
  code: string;
  message: string;
}

export interface BatchOutputKitEntry {
  id: string;
  status: "ok" | "failed";
  kit: IKitAppendixA | null;
  error: BatchOutputError | null;
}

export interface BatchOutputFile {
  version: string;
  generated_at: string;
  kits: BatchOutputKitEntry[];
}

/**
 * Extracts a candidate role title from the first line or headline of a Job Description
 */
function extractRoleFromJd(jd: string): string {
  if (!jd) return "Software Engineer";
  const lines = jd.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const first = lines[0].replace(/^#+\s*/, "");
    if (first.length < 80) return first;
  }
  return "Software Engineer";
}

/**
 * Processes a single batch case and produces an Appendix A kit or failure entry
 */
export async function processBatchCase(c: BatchInputCase): Promise<BatchOutputKitEntry> {
  const caseId = c.id || c.company || "case-1";
  const jdText = c.jd || c.job_description || "";
  const role = c.role || c.jobRole || extractRoleFromJd(jdText);
  const companyUrl = c.company_url || c.url || "";
  const days = c.days || c.days_available || 5;

  console.log(`\n[batch] Processing case "${caseId}" -> ${role} at ${companyUrl}`);

  try {
    let crawlData: CrawlResult;
    try {
      if (companyUrl) {
        crawlData = await crawlCompany(companyUrl, role);
      } else {
        crawlData = {
          companyOverview: "",
          careersPage: "",
          jobListing: jdText,
          careersFound: false,
          jobRoleFound: Boolean(jdText),
          pagesUsed: [],
        };
      }
    } catch (crawlErr) {
      console.warn(`[batch] Crawl failed for ${companyUrl}:`, crawlErr);
      crawlData = {
        companyOverview: "",
        careersPage: "",
        jobListing: jdText,
        careersFound: false,
        jobRoleFound: Boolean(jdText),
        pagesUsed: [],
      };
    }

    // If company is unreachable and no JD provided at all, mark as failed
    if (!crawlData.companyOverview && !crawlData.careersPage && !jdText) {
      return {
        id: caseId,
        status: "failed",
        kit: null,
        error: {
          code: "COMPANY_UNREACHABLE",
          message: `Company site at ${companyUrl} was unreachable and no job description was supplied.`,
        },
      };
    }

    const kit = await generateKit({
      jobRole: role,
      companyWebsite: companyUrl,
      crawlData,
      directJdText: jdText,
      days,
    });

    return {
      id: caseId,
      status: "ok",
      kit,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[batch] Failed case ${caseId}:`, message);

    return {
      id: caseId,
      status: "failed",
      kit: null,
      error: {
        code: "GENERATION_FAILED",
        message,
      },
    };
  }
}

/**
 * Main batch runner
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: ts-node src/cli/batch.ts <input.json> [output.json]");
    console.log("Or: npm run batch <input.json> [output.json]");
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = args[1]
    ? path.resolve(args[1])
    : path.resolve(path.dirname(inputPath), `output-${path.basename(inputPath)}`);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file does not exist at ${inputPath}`);
    process.exit(1);
  }

  console.log(`[batch] Reading input from: ${inputPath}`);
  const rawInput = fs.readFileSync(inputPath, "utf-8");
  const cases: BatchInputCase[] = JSON.parse(rawInput);

  if (!Array.isArray(cases)) {
    console.error("Error: Input JSON must be an array of cases matching Appendix B.");
    process.exit(1);
  }

  console.log(`[batch] Starting batch processing for ${cases.length} cases...`);
  const results: BatchOutputKitEntry[] = [];

  for (const c of cases) {
    const res = await processBatchCase(c);
    results.push(res);
  }

  const outputFile: BatchOutputFile = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    kits: results,
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputFile, null, 2), "utf-8");
  console.log(`\n[batch] Successfully processed ${results.length} kits.`);
  console.log(`[batch] Output written to: ${outputPath}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[batch] Fatal error:", err);
    process.exit(1);
  });
}
