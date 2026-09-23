import { ExtractedRequirement } from "./extractRequirements";
import { GeneratedQuestion } from "./generateQuestions";

export interface CoverageReport {
  covered: Record<string, string[]>;
  uncovered: ExtractedRequirement[];
  uncovered_requirement_ids: string[];
  passes: number;
}

/**
 * Stage 4: Pure deterministic function checking requirement coverage across questions
 * (NEVER calls the LLM)
 */
export function checkCoverage(
  requirements: ExtractedRequirement[],
  questions: GeneratedQuestion[],
  passes = 1
): CoverageReport {
  const covered: Record<string, string[]> = {};
  const coveredSet = new Set<string>();

  // Map each requirement to question indices/prompts
  for (const req of requirements) {
    covered[req.id] = [];
  }

  questions.forEach((q, idx) => {
    const qIdentifier = `q${idx + 1}`;
    for (const rId of q.requirementIds) {
      if (covered[rId]) {
        covered[rId].push(qIdentifier);
        coveredSet.add(rId);
      }
    }
  });

  const uncovered = requirements.filter((r) => !coveredSet.has(r.id));
  const uncovered_requirement_ids = uncovered.map((r) => r.id);

  return {
    covered,
    uncovered,
    uncovered_requirement_ids,
    passes,
  };
}
