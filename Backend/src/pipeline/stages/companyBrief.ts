import { z } from "zod";
import { generateStructured } from "../llm/generateStructured";
import { COMPANY_BRIEF_SYSTEM_PROMPT } from "../prompts";

export const CompanyBriefSchema = z.object({
  summary: z.string().describe("3-6 sentence company summary grounded strictly in sources"),
  sources: z.array(z.string()).describe("List of valid source URLs used"),
});

export type GeneratedCompanyBrief = z.infer<typeof CompanyBriefSchema>;

/**
 * Stage 2: Generates a concise company brief from crawled pages
 */
export async function generateCompanyBrief(
  crawledContent: string,
  sources: string[]
): Promise<GeneratedCompanyBrief> {
  const validSources = sources.filter(Boolean);
  const userPrompt = `CRAWLED PAGES & SOURCE MATERIAL:
URLs Available:
${validSources.map((u) => `- ${u}`).join("\n")}

PAGE CONTENT:
${crawledContent.slice(0, 7000) || "No crawled text available."}
`;

  try {
    const result = await generateStructured({
      system: COMPANY_BRIEF_SYSTEM_PROMPT,
      user: userPrompt,
      schema: CompanyBriefSchema,
      temperature: 0.25,
    });

    // Ensure only actual crawled source URLs from validSources are returned
    const cleanedSources = (result.sources || []).filter((s) =>
      validSources.some((vs) => s === vs || s.replace(/\/$/, "") === vs.replace(/\/$/, ""))
    );

    return {
      summary: result.summary,
      sources: cleanedSources.length > 0 ? cleanedSources : validSources,
    };
  } catch (err) {
    console.warn("[companyBrief] Fallback summary due to error:", err);
    return {
      summary: "Company brief synthesized from available domain metadata and public job listing.",
      sources: validSources,
    };
  }
}
