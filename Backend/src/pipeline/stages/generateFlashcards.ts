import { z } from "zod";
import { generateStructured } from "../llm/generateStructured";
import { FLASHCARD_GENERATION_SYSTEM_PROMPT } from "../prompts";
import { ExtractedRequirement } from "./extractRequirements";
import { GeneratedQuestion } from "./generateQuestions";

export const GeneratedFlashcardSchema = z.object({
  front: z.string().describe("Front: short prompt or concept"),
  back: z.string().describe("Back: concise, high-yield explanation"),
  requirementId: z.string().optional().describe("Associated requirement id like R1"),
});

export const FlashcardListSchema = z.array(GeneratedFlashcardSchema);

export type GeneratedFlashcard = z.infer<typeof GeneratedFlashcardSchema>;

/**
 * Stage 5: Generates concise flashcards for spaced repetition practice
 */
export async function generateFlashcards(
  requirements: ExtractedRequirement[],
  questions: GeneratedQuestion[],
  roleTitle: string
): Promise<GeneratedFlashcard[]> {
  const reqStr = requirements.map((r) => `- [${r.id}]: ${r.text}`).join("\n");
  const qStr = questions.slice(0, 15).map((q, i) => `${i + 1}. ${q.text}`).join("\n");

  const userPrompt = `ROLE: ${roleTitle}

REQUIREMENTS:
${reqStr}

SAMPLE INTERVIEW QUESTIONS:
${qStr}
`;

  const result = await generateStructured({
    system: FLASHCARD_GENERATION_SYSTEM_PROMPT,
    user: userPrompt,
    schema: FlashcardListSchema,
    temperature: 0.25,
  });

  return result;
}
