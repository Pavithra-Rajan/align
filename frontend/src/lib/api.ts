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
 * Uploads resume to S3 via presigned URL and triggers AI matching.
 * Returns the fileName for polling match results later.
 */
export async function uploadResume(file: File): Promise<string> {
  try {
    // 1. Get the presigned URL from backend
    const response = await fetch('https://e2u8nwnymd.execute-api.us-east-1.amazonaws.com/prod/upload');
    
    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.status}`);
    }
    
    const { uploadURL, fileName } = await response.json();

    // 2. Direct-to-S3 Upload using presigned URL
    const uploadResult = await fetch(uploadURL, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (!uploadResult.ok) {
      throw new Error("S3 Upload failed");
    }

    console.log("Upload successful! AI matching is triggered.");
    return fileName;
  } catch (error) {
    console.error("Error during upload:", error);
    throw error;
  }
}

/**
 * Polls for match results from the backend.
 * Call this after uploadResume returns.
 */
export async function getMatchResults(fileName: string): Promise<import('./types').AIMatch[]> {
  try {
    const response = await fetch(
      `https://e2u8nwnymd.execute-api.us-east-1.amazonaws.com/prod/results?fileName=${encodeURIComponent(fileName)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract matches array from response
    const matches = data.matches || data;
    
    // Ensure we have an array
    if (!Array.isArray(matches)) {
      throw new Error("Invalid response format: matches is not an array");
    }
    
    return matches;
  } catch (error) {
    console.error("Error fetching match results:", error);
    throw error;
  }
}
