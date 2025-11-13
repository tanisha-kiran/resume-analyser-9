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

const Index = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescText, setJobDescText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
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

      // Convert similarity to ATS score (0-100)
      const atsScore = Math.round(similarity * 100);
      const matchLikelihood = Math.min(100, atsScore + 5);

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

        {/* Analyze Button */}
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
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
        </div>

        {/* Results */}
        {results && <AnalysisResults results={results} />}
      </main>
    </div>
  );
};

export default Index;
