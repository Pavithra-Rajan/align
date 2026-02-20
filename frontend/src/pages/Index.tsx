import { useState, useCallback } from "react";
import { AppState, AIMatch } from "@/lib/types";
import { uploadResume, getMatchResults } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import JobGallery from "@/components/JobGallery";
import MatchModal from "@/components/MatchModal";

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 30; // 1 minute total

const Index = () => {
  const [appState, setAppState] = useState<AppState>("discovery");
  const [matchResults, setMatchResults] = useState<AIMatch[]>([]);

  const pollForResults = useCallback(
    async (fileName: string, attempt: number = 0): Promise<AIMatch[]> => {
      if (attempt >= MAX_POLLING_ATTEMPTS) {
        throw new Error("Timeout waiting for match results");
      }

      try {
        const results = await getMatchResults(fileName);
        if (results && results.length > 0) {
          return results;
        }
        
        // Results not ready yet, wait and retry
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        return pollForResults(fileName, attempt + 1);
      } catch (error) {
        // If it's a 404 or similar, results aren't ready yet
        if (attempt < MAX_POLLING_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
          return pollForResults(fileName, attempt + 1);
        }
        throw error;
      }
    },
    []
  );

  const handleUpload = useCallback(
    async (file: File) => {
      setAppState("analyzing");
      try {
        // Upload file and get fileName
        const fileName = await uploadResume(file);
        
        // Poll for results
        const results = await pollForResults(fileName);
        setMatchResults(results);
        setAppState("matched");
      } catch (error) {
        console.error("Upload/analysis failed:", error);
        setAppState("discovery");
      }
    },
    [pollForResults]
  );

  const handleReset = useCallback(() => {
    setAppState("discovery");
    setMatchResults([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        onUpload={handleUpload}
        isAnalyzing={appState === "analyzing"}
      />
      {appState === "matched" ? (
        <MatchModal matches={matchResults} onClose={handleReset} />
      ) : (
        <JobGallery />
      )}
    </div>
  );
};

export default Index;
