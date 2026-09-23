import { generateStructured } from "../llm/generateStructured";
import { GAP_QUESTION_SYSTEM_PROMPT } from "../prompts";
import { ExtractedRequirement } from "./extractRequirements";
import { GeneratedQuestion, QuestionListSchema } from "./generateQuestions";

/**
 * Stage 4b: Generates targeted questions specifically for uncovered requirements
 */
export async function generateGapQuestions(
  uncoveredRequirements: ExtractedRequirement[]
): Promise<GeneratedQuestion[]> {
  if (uncoveredRequirements.length === 0) {
    return [];
  }

  const reqListStr = uncoveredRequirements
    .map((r) => `- [${r.id}] (${r.type}): ${r.text}`)
    .join("\n");

  const userPrompt = `UNCOVERED REQUIREMENTS TO GENERATE QUESTIONS FOR:
${reqListStr}
`;

  const result = await generateStructured({
    system: GAP_QUESTION_SYSTEM_PROMPT,
    user: userPrompt,
    schema: QuestionListSchema,
    temperature: 0.25,
  });

  return result;
}
