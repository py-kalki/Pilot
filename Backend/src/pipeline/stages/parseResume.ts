import { z } from "zod";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { RESUME_ATS_PARSER_SYSTEM_PROMPT } from "../prompts";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const ATS_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
];

export const ExtractedResumeSchema = z.object({
  name: z.string().optional().describe("Candidate full name"),
  email: z.string().optional().describe("Candidate email address"),
  phone: z.string().optional().describe("Candidate phone number"),
  location: z.string().optional().describe("Candidate location / city / state"),
  summary: z.string().optional().describe("Professional executive summary or bio"),
  socialLinks: z
    .object({
      linkedin: z.string().optional().describe("LinkedIn profile URL"),
      github: z.string().optional().describe("GitHub profile URL"),
      portfolio: z.string().optional().describe("Portfolio website URL"),
      twitter: z.string().optional().describe("Twitter/X handle or URL"),
      other: z.string().optional().describe("Any other portfolio or blog link"),
    })
    .default({}),
  skills: z.array(z.string()).default([]).describe("Technical, domain, and soft skills"),
  experience: z
    .array(
      z.object({
        company: z.string().describe("Company or organization name"),
        role: z.string().describe("Job title / role"),
        duration: z.string().optional().describe("Employment dates/duration"),
        location: z.string().optional().describe("Job location"),
        description: z.string().optional().describe("Brief role description"),
        highlights: z.array(z.string()).default([]).describe("Key accomplishments & bullet points"),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().describe("Project name"),
        description: z.string().describe("Project overview and architectural impact"),
        techStack: z.array(z.string()).default([]).describe("Technologies and tools used"),
        link: z.string().optional().describe("Project live URL or repository link"),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string().describe("University, college, or bootcamp"),
        degree: z.string().describe("Degree, major, or credential"),
        year: z.string().optional().describe("Graduation year or date range"),
        gpa: z.string().optional().describe("GPA or academic honors if noted"),
      })
    )
    .default([]),
  certifications: z.array(z.string()).default([]).describe("Professional certifications or awards"),
});

export type ExtractedResumeData = z.output<typeof ExtractedResumeSchema>;

/**
 * Coerces whatever shape the model returned into a plain string.
 *
 * The prompt asks for string fields/arrays, but Gemini regularly answers with
 * objects (`highlights: [{ text: "…" }]`) or nested arrays. Mongoose casts a
 * String path from those with a CastError, which failed the entire profile save
 * and surfaced as "Could not fully parse document" during onboarding.
 */
function str(...values: unknown[]): string {
  for (const value of values) {
    const text = readText(value);
    if (text) return text;
  }
  return "";
}

function readText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(readText).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return readText(obj.text ?? obj.description ?? obj.detail ?? obj.value ?? obj.name ?? obj.url ?? "");
  }
  return "";
}

/**
 * Normalizes any LLM output (camelCase, snake_case, nested personal_info, etc.)
 * into our strict canonical ExtractedResumeData structure.
 */
export function normalizeExtractedResume(data: any): ExtractedResumeData {
  if (!data || typeof data !== "object") {
    return {
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      socialLinks: {},
    };
  }

  const personal = data.personal_info || data.contact_info || data.contact || {};
  const name = str(
    data.name,
    data.fullName,
    data.full_name,
    personal.name,
    personal.full_name,
    personal.fullName
  );
  const email = str(data.email, personal.email);
  const phone = str(
    data.phone,
    data.phoneNumber,
    data.phone_number,
    personal.phone,
    personal.phoneNumber,
    personal.phone_number
  );
  const location = str(data.location, personal.location, data.address);
  const summary = str(
    data.summary,
    data.bio,
    data.overview,
    data.professionalSummary,
    data.professional_summary
  );

  const links =
    data.socialLinks ||
    data.social_links ||
    data.links ||
    personal.links ||
    personal.social_links ||
    {};
  const socialLinks = {
    linkedin: str(links.linkedin, links.linkedIn) || undefined,
    github: str(links.github, links.gitHub) || undefined,
    portfolio: str(links.portfolio, links.website, links.site) || undefined,
    twitter: str(links.twitter, links.x) || undefined,
    other: str(links.other, links.blog) || undefined,
  };

  const rawSkills = Array.isArray(data.skills)
    ? data.skills
    : Array.isArray(data.technical_skills)
    ? data.technical_skills
    : [];
  const skills = rawSkills.map((s: any) => str(s.name, s.skill, s)).filter(Boolean);

  const rawExp =
    data.experience || data.work_experience || data.workExperience || data.employment || [];
  const experience = Array.isArray(rawExp)
    ? rawExp
        .map((exp: any) => {
          const description = str(exp.description);
          const rawHighlights = Array.isArray(exp.highlights)
            ? exp.highlights
            : Array.isArray(exp.bullet_points)
            ? exp.bullet_points
            : Array.isArray(exp.responsibilities)
            ? exp.responsibilities
            : description
            ? [description]
            : [];

          return {
            company: str(exp.company, exp.organization, exp.company_name),
            role: str(exp.role, exp.title, exp.job_title, exp.jobTitle),
            duration: str(exp.duration, exp.dates, exp.period, exp.years),
            location: str(exp.location),
            description,
            highlights: rawHighlights.map((h: any) => str(h)).filter(Boolean),
          };
        })
        // Profile schema requires both company and role — dropping partial rows here
        // keeps a single incomplete LLM entry from failing the whole save.
        .filter((e: any) => e.company && e.role)
    : [];

  const rawProjects = data.projects || data.key_projects || data.keyProjects || [];
  const projects = Array.isArray(rawProjects)
    ? rawProjects
        .map((p: any) => {
          const rawTech = Array.isArray(p.techStack)
            ? p.techStack
            : Array.isArray(p.tech_stack)
            ? p.tech_stack
            : Array.isArray(p.technologies)
            ? p.technologies
            : [];

          return {
            name: str(p.name, p.title, p.project_name),
            description: str(p.description, p.summary, p.overview),
            techStack: rawTech.map((t: any) => str(t.name, t)).filter(Boolean),
            link: str(p.link, p.url, p.github),
          };
        })
        .filter((p: any) => p.name && p.description)
    : [];

  const rawEdu = data.education || data.academics || data.degrees || [];
  const education = Array.isArray(rawEdu)
    ? rawEdu
        .map((e: any) => ({
          institution: str(e.institution, e.university, e.college, e.school),
          degree: str(e.degree, e.major ? `Degree in ${str(e.major)}` : ""),
          year: str(e.year, e.graduation_year, e.graduationYear, e.duration),
          gpa: str(e.gpa, e.score, e.grade),
        }))
        .filter((e: any) => e.institution && e.degree)
    : [];

  const rawCerts = data.certifications || data.certificates || data.awards || [];
  const certifications = Array.isArray(rawCerts)
    ? rawCerts.map((c: any) => str(c.name, c.title, c)).filter(Boolean)
    : [];

  return {
    name: name || undefined,
    email: email || undefined,
    phone: phone || undefined,
    location: location || undefined,
    summary: summary || undefined,
    socialLinks,
    skills,
    experience,
    projects,
    education,
    certifications,
  };
}

export async function parseResumeText(rawText: string): Promise<ExtractedResumeData> {
  const userPrompt = `RESUME TEXT / DOCUMENT CONTENT:\n\n${rawText.slice(0, 25000)}`;

  let lastError: unknown = null;

  for (const modelId of ATS_MODELS) {
    try {
      const res = await generateText({
        model: google(modelId),
        system: RESUME_ATS_PARSER_SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature: 0.1,
      });

      const jsonMatch = res.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      const cleanJson = (jsonMatch ? jsonMatch[1] : res.text).trim();

      const parsed = JSON.parse(cleanJson);
      const normalized = normalizeExtractedResume(parsed);

      return normalized;
    } catch (err) {
      console.warn(`[parseResumeText] Model ${modelId} failed:`, err);
      lastError = err;
    }
  }

  // Fallback: regex heuristics if LLM failed
  console.warn("[parseResumeText] All LLM models failed, using heuristic fallback");
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  return {
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    socialLinks: {
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
      github: githubMatch ? githubMatch[0] : undefined,
    },
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
  };
}
