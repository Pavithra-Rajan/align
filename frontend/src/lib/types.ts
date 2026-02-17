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

export type AppState = "discovery" | "analyzing" | "matched";
