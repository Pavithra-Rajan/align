export interface Job {
  id: string;
  title: string;
  location: string;
  seniority: "Senior" | "Mid" | "Entry";
  skills: string[];
  department: string;
  posted: string;
  url?: string;
}

export interface MatchResult {
  job: Job;
  score: number;
  reasoning: string;
}

export interface AIMatch {
  title: string;
  company: string;
  location: string;
  match_score: number;
  reason: string;
  link?: string;
}

export type AppState = "discovery" | "analyzing" | "matched";
