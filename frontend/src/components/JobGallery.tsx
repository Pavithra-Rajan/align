import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import JobCard from "./JobCard";
import SmartSearch from "./SmartSearch";
import { fetchJobs } from "@/lib/api";
import { Job } from "@/lib/types";

const JobGallery = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadJobs = async (p: number) => {
    setLoading(true);
    const result = await fetchJobs(p);
    setJobs((prev) => (p === 1 ? result.jobs : [...prev, ...result.jobs]));
    setHasMore(result.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs(1);
  }, []);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadJobs(next);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter((job) => {
      const titleMatch = job.title?.toLowerCase().includes(q) || false;
      const locationMatch = job.location?.toLowerCase().includes(q) || false;
      const skillsMatch = Array.isArray(job.skills)
        ? job.skills.some((s) => s?.toLowerCase().includes(q))
        : false;
      return titleMatch || locationMatch || skillsMatch;
    });
  }, [jobs, searchQuery]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Open Positions
        </h2>
        <span className="text-sm text-muted-foreground">
          900+ roles worldwide
        </span>
      </div>

      {/* <div className="mb-8">
        <SmartSearch query={searchQuery} onChange={setSearchQuery} />
      </div> */}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">
          No jobs match "{searchQuery}". Try a different search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
        </div>
      )}

      {hasMore && !searchQuery && (
        <div className="flex justify-center mt-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-50 transition-opacity"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Load More
          </motion.button>
        </div>
      )}

      {!hasMore && jobs.length > 0 && !searchQuery && (
        <p className="text-center text-muted-foreground py-12 text-sm">
          No more results
        </p>
      )}
    </section>
  );
};

export default JobGallery;
