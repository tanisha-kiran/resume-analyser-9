import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import type { AnalysisResult } from "@/pages/Index";

interface AnalysisResultsProps {
  results: AnalysisResult;
}

export const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70)
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          Excellent Match
        </Badge>
      );
    if (score >= 50)
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          Good Match
        </Badge>
      );
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
        Needs Improvement
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ATS Score */}
        <Card className="p-6 shadow-lg border-border/50 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">ATS Score</h3>
            </div>
            {getScoreBadge(results.atsScore)}
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-bold ${getScoreColor(
                  results.atsScore
                )}`}
              >
                {results.atsScore}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Progress
              value={results.atsScore}
              className="h-3"
              indicatorClassName={
                results.atsScore >= 70
                  ? "bg-success"
                  : results.atsScore >= 50
                  ? "bg-warning"
                  : "bg-destructive"
              }
            />
          </div>
        </Card>

        {/* Match Likelihood */}
        <Card className="p-6 shadow-lg border-border/50 hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Job Match Likelihood</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-bold ${getScoreColor(
                  results.matchLikelihood
                )}`}
              >
                {results.matchLikelihood}%
              </span>
            </div>
            <Progress
              value={results.matchLikelihood}
              className="h-3"
              indicatorClassName={
                results.matchLikelihood >= 70
                  ? "bg-success"
                  : results.matchLikelihood >= 50
                  ? "bg-warning"
                  : "bg-destructive"
              }
            />
          </div>
        </Card>
      </div>

      {/* AI Feedback */}
      <Card className="p-6 shadow-lg border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">AI-Generated Feedback</h3>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {results.feedback}
          </p>
        </div>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        {results.keyStrengths && results.keyStrengths.length > 0 && (
          <Card className="p-6 shadow-lg border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {results.keyStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Areas for Improvement */}
        {results.improvements && results.improvements.length > 0 && (
          <Card className="p-6 shadow-lg border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {results.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">
                    {improvement}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};
