export type Stage = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";

export type Priority = "Low" | "Medium" | "High";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  priority: Priority;
  jobDescription: string;
  resumeText: string;
  followUpDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}
