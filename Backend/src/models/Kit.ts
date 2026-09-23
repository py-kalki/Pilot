import mongoose, { Schema, Document } from "mongoose";

/* ── Appendix A Schema Types ──────────────────────────────── */

export interface IKitSource {
  company: string;
  company_url: string;
  role: string;
  location: string;
  jd_chars: number;
  researched_at: string;
  pages_used: string[];
}

export interface ICompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export interface IRequirement {
  id: string;
  text: string;
  kind: "technical" | "behavioural" | "domain";
  priority: "must" | "nice";
}

export interface IRole {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: IRequirement[];
}

export interface IQuestion {
  id: string;
  requirement_ids: string[];
  category: "technical" | "behavioural" | "system-design" | "company-fit";
  prompt: string;
  answer_outline: string;
  difficulty: number; // 1 | 2 | 3
}

export interface IFlashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
}

export interface IScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
}

export interface ISchedule {
  days_available: number;
  days: IScheduleDay[];
}

export interface ICoverage {
  uncovered_requirement_ids: string[];
  passes: number;
}

export interface IKitAppendixA {
  source: IKitSource;
  company_brief: ICompanyBrief;
  role: IRole;
  questions: IQuestion[];
  flashcards: IFlashcard[];
  schedule: ISchedule;
  coverage: ICoverage;
}

export interface ICrawlData {
  companyOverview: string;
  careersPage: string;
  jobListing: string;
  careersFound: boolean;
  jobRoleFound?: boolean;
  careersUrl?: string;
  jobUrl?: string;
  pagesUsed?: string[];
}

export type KitStatus = "queued" | "crawling" | "analyzing" | "generating" | "done" | "error";

export interface IKit extends Document {
  userId: string;
  name: string;
  jobRole: string;
  companyWebsite: string;
  linkedinPage?: string;
  interviewDate?: Date;
  notes?: string;
  status: KitStatus;
  statusMessage: string;
  crawlData: ICrawlData;
  kit: Partial<IKitAppendixA>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema<IRequirement>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  kind: { type: String, enum: ["technical", "behavioural", "domain"], required: true },
  priority: { type: String, enum: ["must", "nice"], required: true },
});

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  requirement_ids: [{ type: String }],
  category: {
    type: String,
    enum: ["technical", "behavioural", "system-design", "company-fit"],
    required: true,
  },
  prompt: { type: String, required: true },
  answer_outline: { type: String, required: true },
  difficulty: { type: Number, min: 1, max: 3, required: true },
});

const FlashcardSchema = new Schema<IFlashcard>({
  id: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  requirement_ids: [{ type: String }],
});

const ScheduleDaySchema = new Schema<IScheduleDay>({
  day: { type: Number, required: true },
  focus: { type: String, required: true },
  question_ids: [{ type: String }],
  minutes: { type: Number, required: true },
});

const KitSchema = new Schema<IKit>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    jobRole: { type: String, required: true, trim: true },
    companyWebsite: { type: String, required: true, trim: true },
    linkedinPage: { type: String, trim: true },
    interviewDate: { type: Date },
    notes: { type: String },
    status: {
      type: String,
      enum: ["queued", "crawling", "analyzing", "generating", "done", "error"],
      default: "queued",
    },
    statusMessage: { type: String, default: "Your prep kit is queued for generation." },
    crawlData: {
      companyOverview: { type: String, default: "" },
      careersPage: { type: String, default: "" },
      jobListing: { type: String, default: "" },
      careersFound: { type: Boolean, default: false },
      jobRoleFound: { type: Boolean, default: false },
      careersUrl: { type: String, default: "" },
      jobUrl: { type: String, default: "" },
      pagesUsed: [{ type: String }],
    },
    kit: {
      source: {
        company: { type: String },
        company_url: { type: String },
        role: { type: String },
        location: { type: String },
        jd_chars: { type: Number },
        researched_at: { type: String },
        pages_used: [{ type: String }],
      },
      company_brief: {
        summary: { type: String },
        what_they_do: { type: String },
        sources: [{ type: String }],
      },
      role: {
        title: { type: String },
        seniority: { type: String },
        responsibilities: [{ type: String }],
        requirements: [RequirementSchema],
      },
      questions: [QuestionSchema],
      flashcards: [FlashcardSchema],
      schedule: {
        days_available: { type: Number },
        days: [ScheduleDaySchema],
      },
      coverage: {
        uncovered_requirement_ids: [{ type: String }],
        passes: { type: Number },
      },
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Kit = mongoose.model<IKit>("Kit", KitSchema);
