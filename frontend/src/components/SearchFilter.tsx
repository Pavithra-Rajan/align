import { useState } from "react";

interface SearchFilterProps {
  onSearch: (searchTerm: string, seniorityLevel: string) => void;
  isLoading?: boolean;
}

const SENIORITY_OPTIONS = [
  "Entry level",
  "Mid-Senior level",
  "Not Applicable",
  "Internship",
  "Associate",
];

const SearchFilter = ({ onSearch, isLoading = false }: SearchFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() || seniorityLevel) {
      onSearch(searchTerm, seniorityLevel);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:gap-3">
        {/* Search Bar */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs by title, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-900 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Seniority Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={seniorityLevel}
            onChange={(e) => setSeniorityLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">All Levels</option>
            {SENIORITY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading || (!searchTerm.trim() && !seniorityLevel)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default SearchFilter;
