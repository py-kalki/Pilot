import mongoose, { Schema, Document } from "mongoose";

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  other?: string;
}

export interface IWorkExperience {
  company: string;
  role: string;
  duration?: string;
  location?: string;
  description?: string;
  highlights?: string[];
}

export interface IProject {
  name: string;
  description: string;
  techStack?: string[];
  link?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  year?: string;
  gpa?: string;
}

export interface IResumeFile {
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: Date;
  rawText?: string;
}

export interface IProfile extends Document {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  dob?: string;
  targetRole?: string;
  summary?: string;
  skills: string[];
  socialLinks: ISocialLinks;
  experience: IWorkExperience[];
  projects: IProject[];
  education: IEducation[];
  certifications?: string[];
  resume?: IResumeFile;
  onboardingCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinksSchema = new Schema<ISocialLinks>({
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String },
  twitter: { type: String },
  other: { type: String },
});

const WorkExperienceSchema = new Schema<IWorkExperience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String },
  location: { type: String },
  description: { type: String },
  highlights: [{ type: String }],
});

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  link: { type: String },
});

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  year: { type: String },
  gpa: { type: String },
});

const ResumeFileSchema = new Schema<IResumeFile>({
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  fileType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  rawText: { type: String },
});

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    dob: { type: String, trim: true },
    targetRole: { type: String, trim: true },
    summary: { type: String },
    skills: [{ type: String }],
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    experience: [WorkExperienceSchema],
    projects: [ProjectSchema],
    education: [EducationSchema],
    certifications: [{ type: String }],
    resume: { type: ResumeFileSchema },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
