import { motion } from "framer-motion";
import { MapPin, Linkedin } from "lucide-react";
import { Job } from "@/lib/types";

const seniorityStyles: Record<Job["seniority"], string> = {
  Senior: "bg-foreground text-background",
  Mid: "bg-muted-foreground/20 text-muted-foreground",
  Entry: "bg-match/15 text-match",
};

interface JobCardProps {
  job: Job;
  index?: number;
}

const JobCard = ({ job, index = 0 }: JobCardProps) => {
  const displaySkills = job.skills?.slice(0, 3) || [];
  const moreSkillsCount = (job.skills?.length || 0) - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-lg p-5 cursor-pointer group relative flex flex-col h-full"
    >
      {/* Seniority badge */}
      <span
        className={`absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${seniorityStyles[job.seniority]}`}
      >
        {job.seniority}
      </span>

      <p className="text-xs text-muted-foreground mb-1.5">{job.department}</p>
      <h2 className="text-lg font-display font-semibold text-foreground mb-1 pr-16 leading-snug">
        {job.organization}
      </h2>
      <h3 className="text-base font-display text-foreground mb-2 pr-16 leading-snug">
        {job.title}
      </h3>

      <div className="flex items-center gap-1 text-muted-foreground mb-4">
        <MapPin className="w-3.5 h-3.5" />
        <span className="text-xs">{job.location}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {displaySkills.map((skill) => (
          <span key={skill} className="pill-tag">
            {skill}
          </span>
        ))}
        {moreSkillsCount > 0 && (
          <span className="pill-tag bg-muted-foreground/10 text-muted-foreground">
            +{moreSkillsCount}
          </span>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/60 mb-4 flex-grow">
        {job.posted}
      </p>

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground text-sm font-medium transition-colors"
        >
          <span>View Job</span>
          <Linkedin className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
};

export default JobCard;
