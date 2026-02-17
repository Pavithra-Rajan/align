import { useState, useCallback } from "react";
import { AppState, MatchResult } from "@/lib/types";
import { uploadResume } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import JobGallery from "@/components/JobGallery";
import MatchResults from "@/components/MatchResults";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("discovery");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

  const handleUpload = useCallback(async (file: File) => {
    setAppState("analyzing");
    try {
      const results = await uploadResume(file);
      setMatchResults(results);
      setAppState("matched");
    } catch {
      setAppState("discovery");
    }
  }, []);

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
        <MatchResults results={matchResults} onReset={handleReset} />
      ) : (
        <JobGallery />
      )}
    </div>
  );
};

export default Index;
