import { z } from "zod";
import { generateStructured } from "../llm/generateStructured";
import { REQUIREMENT_EXTRACTION_SYSTEM_PROMPT } from "../prompts";

export const ExtractedRequirementSchema = z.object({
  id: z.string().describe("Stable id like R1, R2, R3"),
  text: z.string().describe("Concise requirement phrase"),
  type: z.enum(["must", "nice"]).describe("Requirement priority type"),
});

export const RequirementListSchema = z.array(ExtractedRequirementSchema);

export type ExtractedRequirement = z.infer<typeof ExtractedRequirementSchema>;

/**
 * Stage 1: Extracts structured hiring requirements from a job description
 */
export async function extractRequirements(jobDescription: string): Promise<ExtractedRequirement[]> {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return [
      { id: "R1", text: "Core software engineering fundamentals and problem solving", type: "must" },
      { id: "R2", text: "Effective communication and cross-functional collaboration", type: "must" },
    ];
  }

  const userPrompt = `JOB DESCRIPTION:\n${jobDescription.trim()}`;

  const result = await generateStructured({
    system: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT,
    user: userPrompt,
    schema: RequirementListSchema,
    temperature: 0.2,
  });

  return result;
}
