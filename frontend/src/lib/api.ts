import { Job, MatchResult } from "./types";
import { mockJobs, mockMatchResults } from "./mockData";

const API_BASE_URL = "https://e2u8nwnymd.execute-api.us-east-1.amazonaws.com/prod/jobs";
const PAGE_SIZE = 6;

/**
 * Fetches jobs with pagination.
 */
export async function fetchJobs(page: number): Promise<{ jobs: Job[]; hasMore: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}?page=${page}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response:", data);
    
    // API returns array directly
    if (Array.isArray(data) && data.length > 0) {
      return {
        jobs: data,
        hasMore: true,
      };
    }
    
    // Empty array means no more results
    return {
      jobs: [],
      hasMore: false,
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return {
      jobs: [],
      hasMore: false,
    };
  }
}

/**
 * Uploads resume and returns match results.
 * Replace with: POST to S3 API Gateway + poll Bedrock results
 */
export async function uploadResume(_file: File): Promise<MatchResult[]> {
  // Simulate upload + AI processing
  await new Promise((r) => setTimeout(r, 3500));
  return mockMatchResults;
}
