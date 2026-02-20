import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AppState, AIMatch } from "@/lib/types";
import { uploadResume, getMatchResults, searchJobs } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import JobGallery from "@/components/JobGallery";
import MatchModal from "@/components/MatchModal";
import SearchFilter from "@/components/SearchFilter";
import JobCard from "@/components/JobCard";

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 30; // 1 minute total

const Index = () => {
  const [appState, setAppState] = useState<AppState>("discovery");
  const [matchResults, setMatchResults] = useState<AIMatch[]>([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentSeniorityLevel, setCurrentSeniorityLevel] = useState("");
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true);

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

  const handleSearch = useCallback(
    async (searchTerm: string, seniorityLevel: string) => {
      setIsSearching(true);
      try {
        const result = await searchJobs(searchTerm, seniorityLevel, 1);
        setSearchResults(result.jobs);
        setCurrentSearchTerm(searchTerm);
        setCurrentSeniorityLevel(seniorityLevel);
        setCurrentSearchPage(1);
        setHasMoreSearchResults(result.hasMore);
        setAppState("discovery");
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const handleLoadMoreSearch = useCallback(async () => {
    if (isSearching || (!currentSearchTerm && !currentSeniorityLevel)) return;
    
    setIsSearching(true);
    try {
      const nextPage = currentSearchPage + 1;
      const result = await searchJobs(currentSearchTerm, currentSeniorityLevel, nextPage);
      setSearchResults((prev) => [...prev, ...result.jobs]);
      setCurrentSearchPage(nextPage);
      setHasMoreSearchResults(result.hasMore);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [currentSearchTerm, currentSeniorityLevel, currentSearchPage, isSearching]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        onUpload={handleUpload}
        isAnalyzing={appState === "analyzing"}
      />
      <div className="container mx-auto px-4 py-8">
        <SearchFilter onSearch={handleSearch} isLoading={isSearching} />
      </div>
      {appState === "matched" ? (
        <MatchModal matches={matchResults} onClose={handleReset} />
      ) : searchResults.length > 0 ? (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Search Results
            </h2>
            <span className="text-sm text-muted-foreground">
              {searchResults.length} results found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((job: any, i: number) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>

          {hasMoreSearchResults && (
            <div className="flex justify-center mt-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadMoreSearch}
                disabled={isSearching}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-50 transition-opacity"
              >
                {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                Load More
              </motion.button>
            </div>
          )}

          {!hasMoreSearchResults && searchResults.length > 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              No more results
            </p>
          )}
        </section>
      ) : (
        <JobGallery />
      )}
    </div>
  );
};

export default Index;
