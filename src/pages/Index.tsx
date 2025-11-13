import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Briefcase, Sparkles } from "lucide-react";
import { ResumeInput } from "@/components/resume/ResumeInput";
import { JobDescriptionInput } from "@/components/resume/JobDescriptionInput";
import { AnalysisResults } from "@/components/resume/AnalysisResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface AnalysisResult {
  atsScore: number;
  matchLikelihood: number;
  feedback: string;
  keyStrengths: string[];
  improvements: string[];
}

export interface JobSuggestion {
  title: string;
  description: string;
  matchReason: string;
}

const Index = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescText, setJobDescText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggestingJobs, setIsSuggestingJobs] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [jobSuggestions, setJobSuggestions] = useState<JobSuggestion[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both resume and job description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      // Import transformers dynamically
      const { pipeline } = await import("@huggingface/transformers");

      // Create feature extraction pipeline for semantic similarity
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        { device: "webgpu" }
      );

      // Compute embeddings
      const [resumeEmbedding, jobEmbedding] = await extractor(
        [resumeText, jobDescText],
        { pooling: "mean", normalize: true }
      );

      // Calculate cosine similarity
      const similarity = cosineSimilarity(
        resumeEmbedding.data,
        jobEmbedding.data
      );

      // Improved ATS scoring algorithm
      // Normalize similarity to be more realistic (0.3-0.9 range mapped to 20-95)
      const normalizedSimilarity = Math.max(0, Math.min(1, similarity));
      const atsScore = Math.round(20 + (normalizedSimilarity * 75));
      
      // Match likelihood considers multiple factors
      const lengthRatio = Math.min(resumeText.length, jobDescText.length) / 
                         Math.max(resumeText.length, jobDescText.length);
      const lengthPenalty = lengthRatio < 0.3 ? 10 : 0;
      const matchLikelihood = Math.max(10, Math.min(95, atsScore - lengthPenalty));

      // Get AI feedback
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            resume: resumeText,
            jobDescription: jobDescText,
            semanticScore: atsScore,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI feedback");
      }

      const data = await response.json();

      setResults({
        atsScore,
        matchLikelihood,
        feedback: data.feedback,
        keyStrengths: data.strengths || [],
        improvements: data.improvements || [],
      });

      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestJobs = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your resume to get job suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsSuggestingJobs(true);
    setJobSuggestions([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ resume: resumeText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get job suggestions");
      }

      const data = await response.json();
      setJobSuggestions(data.suggestions || []);

      toast({
        title: "Job Suggestions Ready",
        description: "AI has suggested relevant jobs based on your resume",
      });
    } catch (error) {
      console.error("Job suggestion error:", error);
      toast({
        title: "Suggestion Failed",
        description: "There was an error suggesting jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingJobs(false);
    }
  };

  const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Resume Analyzer
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered semantic matching & feedback
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Resume Input */}
          <Card className="p-6 shadow-md border-border/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Resume</h2>
            </div>
            <ResumeInput onTextChange={setResumeText} />
          </Card>

          {/* Job Description Input */}
          <Card className="p-6 shadow-md border-border/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Job Description</h2>
            </div>
            <JobDescriptionInput onTextChange={setJobDescText} />
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !resumeText.trim() || !jobDescText.trim()}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-primary-foreground px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>

          <Button
            size="lg"
            onClick={handleSuggestJobs}
            disabled={isSuggestingJobs || !resumeText.trim()}
            variant="outline"
            className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all border-primary/30 hover:bg-primary/5"
          >
            {isSuggestingJobs ? (
              <>
                <Briefcase className="mr-2 h-5 w-5 animate-pulse" />
                Finding Jobs...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-5 w-5" />
                Suggest Jobs
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results && <AnalysisResults results={results} />}

        {/* Job Suggestions */}
        {jobSuggestions.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-6 shadow-lg border-border/50">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Recommended Jobs</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobSuggestions.map((job, index) => (
                  <Card
                    key={index}
                    className="p-5 border-border/40 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-lg mb-2 text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {job.description}
                    </p>
                    <div className="flex items-start gap-2 pt-3 border-t border-border/30">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground/70 italic">
                        {job.matchReason}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
