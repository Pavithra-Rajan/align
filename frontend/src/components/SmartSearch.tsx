import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface SmartSearchProps {
  query: string;
  onChange: (query: string) => void;
}

const SmartSearch = ({ query, onChange }: SmartSearchProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-200 ${focused ? "ring-2 ring-foreground/10" : ""} rounded-lg`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search by title, skill, or location..."
        className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {query && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SmartSearch;
