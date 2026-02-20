import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin } from "lucide-react";
import { AIMatch } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MatchModalProps {
  matches: AIMatch[];
  onClose: () => void;
}

const MatchModal = ({ matches, onClose }: MatchModalProps) => {
  if (matches.length === 0) return null;

  return (
    <Dialog open={matches.length > 0} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">
            Your AI Matches
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={`${match.company}-${match.title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-border bg-card p-5 hover:border-foreground/20 transition-colors"
            >
              {/* Match Score Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {match.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {match.company} • {match.location}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-secondary"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - match.match_score / 100)}`}
                        className="text-match"
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - match.match_score / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-xl font-bold text-foreground">
                      {match.match_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason Section */}
              <div className="rounded-lg bg-secondary/40 border border-border/40 p-4 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Why you match
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {match.reason}
                </p>
              </div>

              {/* Action Button */}
              {match.link && (
                <a
                  href={match.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground text-sm font-medium transition-colors"
                >
                  <span>View Job</span>
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors font-medium text-sm"
          >
            Browse More Jobs
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
