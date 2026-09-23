import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();

import { processBatchCase, BatchInputCase, BatchOutputKitEntry, BatchOutputFile } from "../src/cli/batch";

/**
 * Pilot Evaluation CLI (npm run evaluate)
 * Runs batch evaluations on fixture cases and writes an Appendix B compliant report.
 */
async function main() {
  const args = process.argv.slice(2);

  let inputPath = "";
  let outputPath = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input" && args[i + 1]) {
      inputPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      outputPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  // Fallback positional arguments
  if (!inputPath && args[0] && !args[0].startsWith("--")) {
    inputPath = path.resolve(args[0]);
    if (args[1] && !args[1].startsWith("--")) {
      outputPath = path.resolve(args[1]);
    }
  }

  if (!inputPath) {
    console.log("Usage: npm run evaluate -- --input <fixtures.json> [--output <out.json>]");
    process.exit(1);
  }

  if (!outputPath) {
    outputPath = path.resolve(path.dirname(inputPath), `output-${path.basename(inputPath)}`);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File does not exist: ${inputPath}`);
    process.exit(1);
  }

  console.log(`[evaluate] Loading evaluation cases from: ${inputPath}`);
  const raw = fs.readFileSync(inputPath, "utf-8");
  const cases: BatchInputCase[] = JSON.parse(raw);

  console.log(`[evaluate] Processing ${cases.length} evaluation case(s)...`);
  const startTime = Date.now();
  const results: BatchOutputKitEntry[] = [];

  for (const c of cases) {
    const res = await processBatchCase(c);
    results.push(res);
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);

  const outputFile: BatchOutputFile = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    kits: results,
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputFile, null, 2), "utf-8");

  console.log(`\n======================================================`);
  console.log(`[evaluate] Evaluation completed in ${durationSec}s`);
  console.log(`[evaluate] Total Cases: ${results.length}`);
  console.log(`[evaluate] Succeeded: ${results.filter((r) => r.status === "ok").length}`);
  console.log(`[evaluate] Failed: ${results.filter((r) => r.status === "failed").length}`);
  console.log(`[evaluate] Output Report: ${outputPath}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("[evaluate] Fatal error:", err);
  process.exit(1);
});
