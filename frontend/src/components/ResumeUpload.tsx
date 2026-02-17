import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles } from "lucide-react";

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const ResumeUpload = ({ onUpload, isAnalyzing }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-xl border border-hero-foreground/10 bg-hero-foreground/5 p-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4 w-10 h-10 flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-hero-foreground/80" />
            </motion.div>
            <p className="text-hero-foreground font-display font-medium text-sm">
              Analyzing your professional background...
            </p>
            <div className="mt-4 h-1 w-48 mx-auto rounded-full bg-hero-foreground/10 overflow-hidden">
              <motion.div
                className="h-full bg-hero-foreground/40 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`block rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200 ${
              isDragging
                ? "border-hero-foreground/40 bg-hero-foreground/10"
                : "border-hero-foreground/15 bg-hero-foreground/[0.03] hover:border-hero-foreground/25 hover:bg-hero-foreground/[0.06]"
            }`}
          >
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-hero-foreground/10 flex items-center justify-center">
                {isDragging ? (
                  <FileText className="w-5 h-5 text-hero-foreground/70" />
                ) : (
                  <Upload className="w-5 h-5 text-hero-foreground/70" />
                )}
              </div>
              <div>
                <p className="text-sm font-display font-medium text-hero-foreground">
                  Magic Match
                </p>
                <p className="text-xs text-hero-muted mt-1">
                  Upload your resume to let our AI find your perfect fit
                </p>
              </div>
            </div>
          </motion.label>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumeUpload;
