import { auth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ── Kit API ───────────────────────────────────────────────── */

export interface KitSummary {
  _id: string;
  name: string;
  jobRole: string;
  companyWebsite: string;
  status: string;
  statusMessage: string;
  interviewDate?: string;
  createdAt: string;
  crawlData?: { careersFound: boolean };
}

export interface KitStatus {
  status: string;
  statusMessage: string;
  errorMessage?: string;
  careersFound?: boolean;
}

/* ── Appendix A Types ──────────────────────────────────────── */

export interface KitSource {
  company: string;
  company_url: string;
  role: string;
  location: string;
  jd_chars: number;
  researched_at: string;
  pages_used: string[];
}

export interface CompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export interface Requirement {
  id: string;
  text: string;
  kind: "technical" | "behavioural" | "domain";
  priority: "must" | "nice";
}

export interface Role {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: Requirement[];
}

export interface Question {
  id: string;
  requirement_ids: string[];
  category: "technical" | "behavioural" | "system-design" | "company-fit";
  prompt: string;
  answer_outline: string;
  difficulty: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
}

export interface ScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
}

export interface Schedule {
  days_available: number;
  days: ScheduleDay[];
}

export interface Coverage {
  uncovered_requirement_ids?: string[];
  total_requirements?: number;
  covered_requirements?: number;
  coverage_rate?: number;
  passes?: number;
}

export interface KitContent {
  source?: KitSource;
  company_brief?: CompanyBrief;
  role?: Role;
  questions?: Question[];
  flashcards?: Flashcard[];
  schedule?: Schedule;
  coverage?: Coverage;

  // Legacy fallback fields for backward compatibility
  companyBrief?: string;
  roleBreakdown?: string;
  keyRequirements?: string[];
  studyPlan?: string;
  interviewTips?: string[];
}

export interface KitProgress {
  practiced_question_ids: string[];
  completed_checklist_keys: string[];
  last_studied_at?: string;
}

export interface FullKit extends KitSummary {
  linkedinPage?: string;
  notes?: string;
  kit: Partial<KitContent>;
  progress?: KitProgress;
  errorMessage?: string;
}

export const api = {
  kits: {
    create: (data: {
      name: string;
      jobRole: string;
      companyWebsite: string;
      linkedinPage?: string;
      interviewDate?: string;
      notes?: string;
    }) =>
      apiFetch<{ id: string; status: string }>("/api/kits", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    list: () => apiFetch<{ kits: KitSummary[] }>("/api/kits"),

    getStatus: (id: string) =>
      apiFetch<KitStatus>(`/api/kits/${id}/status`),

    getById: (id: string) =>
      apiFetch<{ kit: FullKit }>(`/api/kits/${id}`),

    updateProgress: (
      id: string,
      progress: {
        practiced_question_ids: string[];
        completed_checklist_keys: string[];
      }
    ) =>
      apiFetch<{ success: boolean; progress: KitProgress }>(
        `/api/kits/${id}/progress`,
        {
          method: "PATCH",
          body: JSON.stringify(progress),
        }
      ),

    regenerateSection: (
      id: string,
      section: "questions" | "flashcards" | "schedule"
    ) =>
      apiFetch<{ success: boolean; kit: FullKit["kit"] }>(
        `/api/kits/${id}/regenerate-section`,
        {
          method: "POST",
          body: JSON.stringify({ section }),
        }
      ),

    updateQuestions: (id: string, questions: Question[]) =>
      apiFetch<{ success: boolean; questions: Question[] }>(
        `/api/kits/${id}/questions`,
        {
          method: "PATCH",
          body: JSON.stringify({ questions }),
        }
      ),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/kits/${id}`, { method: "DELETE" }),
  },
};
