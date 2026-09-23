import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { JSON_REPAIR_SYSTEM_PROMPT } from "../prompts";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const ACTIVE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-3.6-flash",
];

export interface GenerateStructuredOptions<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a structured LLM call with system prompt, user prompt, and Zod validation,
 * featuring automatic model failover and JSON repair retry.
 */
export async function generateStructured<T>(
  options: GenerateStructuredOptions<T>
): Promise<T> {
  const { system, user, schema, temperature = 0.25 } = options;

  let lastError: unknown = null;

  for (let i = 0; i < ACTIVE_MODELS.length; i++) {
    const modelId = ACTIVE_MODELS[i];
    try {
      const { object } = await generateObject({
        model: google(modelId),
        system,
        prompt: user,
        schema,
        temperature,
        maxRetries: 0,
      });

      return object;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[generateStructured] Model ${modelId} failed:`, errMsg);
      lastError = err;

      // If quota/rate limit error, back off slightly before trying the next model
      if (errMsg.includes("quota") || errMsg.includes("rate-limit") || errMsg.includes("429")) {
        const match = errMsg.match(/retry in ([\d\.]+)s/i);
        const delayMs = match && match[1] ? Math.min(Math.ceil(parseFloat(match[1]) * 1000), 5000) : 1500;
        await sleep(delayMs);
      } else {
        await sleep(300);
      }
    }
  }

  // Fallback: If generateObject failed due to strict formatting, try text generation + JSON repair
  try {
    console.log("[generateStructured] Attempting raw text generation + JSON repair parse fallback...");
    const model = google("gemini-3.1-flash-lite");
    const rawRes = await generateText({
      model,
      system,
      prompt: user,
      temperature,
    });

    const cleanedText = rawRes.text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    const validated = schema.parse(parsed);
    return validated;
  } catch (repairErr) {
    console.warn("[generateStructured] Direct JSON parse failed, triggering repair prompt...");
    try {
      const repairModel = google("gemini-3.1-flash-lite");
      const repairRes = await generateObject({
        model: repairModel,
        system: JSON_REPAIR_SYSTEM_PROMPT,
        prompt: `System Prompt was: ${system}\nUser prompt was: ${user}\nValidation error: ${repairErr}`,
        schema,
        temperature: 0.1,
      });
      return repairRes.object;
    } catch (finalErr) {
      console.error("[generateStructured] Final repair attempt failed:", finalErr);
      throw lastError || finalErr;
    }
  }
}
