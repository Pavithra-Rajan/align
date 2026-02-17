import ResumeUpload from "./ResumeUpload";

interface HeroSectionProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const HeroSection = ({ onUpload, isAnalyzing }: HeroSectionProps) => {
  return (
    <section className="hero-gradient py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-hero-foreground tracking-tight mb-4">
          Align
        </h1>
        <p className="text-hero-muted text-base md:text-lg mb-10 max-w-lg mx-auto">
          Explore thousands of roles or let our AI match you to opportunities tailored to your experience.
        </p>
        <ResumeUpload onUpload={onUpload} isAnalyzing={isAnalyzing} />
      </div>
    </section>
  );
};

export default HeroSection;
