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
  const name =
    data.name ||
    data.fullName ||
    data.full_name ||
    personal.name ||
    personal.full_name ||
    personal.fullName;
  const email = data.email || personal.email;
  const phone =
    data.phone ||
    data.phoneNumber ||
    data.phone_number ||
    personal.phone ||
    personal.phoneNumber ||
    personal.phone_number;
  const location = data.location || personal.location || data.address;
  const summary =
    data.summary ||
    data.bio ||
    data.overview ||
    data.professionalSummary ||
    data.professional_summary;

  const links =
    data.socialLinks ||
    data.social_links ||
    data.links ||
    personal.links ||
    personal.social_links ||
    {};
  const socialLinks = {
    linkedin: links.linkedin || links.linkedIn || undefined,
    github: links.github || links.gitHub || undefined,
    portfolio: links.portfolio || links.website || links.site || undefined,
    twitter: links.twitter || links.x || undefined,
    other: links.other || links.blog || undefined,
  };

  let skills: string[] = [];
  if (Array.isArray(data.skills)) {
    skills = data.skills
      .map((s: any) => (typeof s === "string" ? s : s.name || s.skill || ""))
      .filter(Boolean);
  } else if (Array.isArray(data.technical_skills)) {
    skills = data.technical_skills
      .map((s: any) => (typeof s === "string" ? s : s.name || s.skill || ""))
      .filter(Boolean);
  }

  const rawExp =
    data.experience || data.work_experience || data.workExperience || data.employment || [];
  const experience = Array.isArray(rawExp)
    ? rawExp
        .map((exp: any) => ({
          company: exp.company || exp.organization || exp.company_name || "",
          role: exp.role || exp.title || exp.job_title || exp.jobTitle || "",
          duration: exp.duration || exp.dates || exp.period || exp.years || "",
          location: exp.location || "",
          description: exp.description || "",
          highlights: Array.isArray(exp.highlights)
            ? exp.highlights
            : Array.isArray(exp.bullet_points)
            ? exp.bullet_points
            : Array.isArray(exp.responsibilities)
            ? exp.responsibilities
            : exp.description
            ? [exp.description]
            : [],
        }))
        .filter((e: any) => e.company || e.role)
    : [];

  const rawProjects = data.projects || data.key_projects || data.keyProjects || [];
  const projects = Array.isArray(rawProjects)
    ? rawProjects
        .map((p: any) => ({
          name: p.name || p.title || p.project_name || "",
          description: p.description || p.summary || p.overview || "",
          techStack: Array.isArray(p.techStack)
            ? p.techStack
            : Array.isArray(p.tech_stack)
            ? p.tech_stack
            : Array.isArray(p.technologies)
            ? p.technologies
            : [],
          link: p.link || p.url || p.github || "",
        }))
        .filter((p: any) => p.name)
    : [];

  const rawEdu = data.education || data.academics || data.degrees || [];
  const education = Array.isArray(rawEdu)
    ? rawEdu
        .map((e: any) => ({
          institution: e.institution || e.university || e.college || e.school || "",
          degree: e.degree || (e.major ? `${e.degree || "Degree"} in ${e.major}` : ""),
          year: e.year || e.graduation_year || e.graduationYear || e.duration || "",
          gpa: e.gpa || e.score || e.grade || "",
        }))
        .filter((e: any) => e.institution || e.degree)
    : [];

  const rawCerts = data.certifications || data.certificates || data.awards || [];
  const certifications = Array.isArray(rawCerts)
    ? rawCerts.map((c: any) => (typeof c === "string" ? c : c.name || c.title || "")).filter(Boolean)
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
