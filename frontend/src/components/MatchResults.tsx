import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { MatchResult } from "@/lib/types";
import MatchScoreRing from "./MatchScoreRing";

interface MatchResultsProps {
  results: MatchResult[];
  onReset: () => void;
}

const MatchResults = ({ results, onReset }: MatchResultsProps) => {
  if (results.length === 0) return null;

  const topMatch = results[0];
  const others = results.slice(1);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-match" />
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Your AI Matches
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Browse all jobs
        </button>
      </div>

      {/* Top recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-xl p-6 md:p-8 mb-6"
      >
        <div className="flex items-center gap-1.5 text-match text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-match" />
          Top Recommendation
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-foreground mb-1">
              {topMatch.job.title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{topMatch.job.location}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {topMatch.job.skills.map((skill) => (
                <span key={skill} className="pill-tag">{skill}</span>
              ))}
            </div>

            {/* Why you match */}
            <div className="rounded-lg bg-secondary/60 border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Why you match
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {topMatch.reasoning}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center">
            <MatchScoreRing score={topMatch.score} size={96} />
          </div>
        </div>
      </motion.div>

      {/* Other matches */}
      {others.length > 0 && (
        <>
          <h3 className="text-lg font-display font-medium text-foreground mb-4">
            Other relevant roles
          </h3>
          <div className="space-y-3">
            {others.map((match, i) => (
              <motion.div
                key={match.job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="glass-card rounded-lg p-4 flex items-center gap-4 cursor-pointer"
              >
                <MatchScoreRing score={match.score} size={52} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-display font-semibold text-foreground">
                    {match.job.title}
                  </h4>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{match.job.location}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {match.job.skills.slice(0, 3).map((s) => (
                    <span key={s} className="pill-tag text-[10px]">{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default MatchResults;
