import { z } from "zod";
import { generateStructured } from "../llm/generateStructured";
import { QUESTION_GENERATION_SYSTEM_PROMPT } from "../prompts";
import { ExtractedRequirement } from "./extractRequirements";

export const GeneratedQuestionSchema = z.object({
  text: z.string().describe("The interview question prompt"),
  category: z.enum(["technical", "behavioural", "system_design", "company_fit"]).describe("Question category"),
  requirementIds: z.array(z.string()).describe("List of requirement IDs this question tests"),
  answerOutline: z.string().optional().describe("Detailed answer strategy, technical talking points, and trade-offs tailored to this question"),
});

export const QuestionListSchema = z.array(GeneratedQuestionSchema);

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

/**
 * Stage 3: Generates interview questions across categories based on requirements and research
 */
export async function generateQuestions(
  requirements: ExtractedRequirement[],
  companyResearch: string,
  roleTitle: string
): Promise<GeneratedQuestion[]> {
  const reqListStr = requirements.map((r) => `- [${r.id}] (${r.type}): ${r.text}`).join("\n");

  const userPrompt = `ROLE TITLE: ${roleTitle}

REQUIREMENT LIST:
${reqListStr}

COMPANY / ROLE RESEARCH:
${companyResearch.slice(0, 5000) || "Standard industry context for " + roleTitle}
`;

  const result = await generateStructured({
    system: QUESTION_GENERATION_SYSTEM_PROMPT,
    user: userPrompt,
    schema: QuestionListSchema,
    temperature: 0.3,
  });

  return result;
}
