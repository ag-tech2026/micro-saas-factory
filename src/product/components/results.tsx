"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/product/schema";

interface AnalysisResultsProps {
  data: {
    result: string;
    inputUrl: string | null;
    createdAt: string;
  };
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const analysisResult = JSON.parse(data.result) as AnalysisResult;
  const formattedDate = new Date(data.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Section 1 — Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              analysisResult.difficulty_level === "beginner"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800"
            }
            variant="outline"
          >
            {analysisResult.difficulty_level === "beginner" ? "Beginner" : "Reg"}
          </Badge>
          {analysisResult.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3 text-base text-muted-foreground">
          <span>{formattedDate}</span>
          <span className="font-medium text-foreground">
            {Math.round(analysisResult.confidence_score.hero_decisions * 100)}% confidence
          </span>
        </div>
      </div>

      {/* Two-column layout: analysis left, sticky input right */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 min-w-0">
          {/* Hand Info */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{"🃏 Hand Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Stakes</p>
                  <p className="text-base font-medium">{analysisResult.hand_info.stakes}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Game Type</p>
                  <p className="text-base font-medium">{analysisResult.hand_info.game_type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Position</p>
                  <p className="text-base font-medium">{analysisResult.hand_info.hero_position}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Hero&apos;s Hand</p>
                  <p className="text-base font-medium font-mono">{analysisResult.hand_info.hero_hand}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Stack Depth</p>
                  <p className="text-base font-medium">{analysisResult.hand_info.effective_stack_bb} BB</p>
                </div>
              </div>
              {analysisResult.hand_info.assumptions.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assumptions</p>
                  <ul className="space-y-1">
                    {analysisResult.hand_info.assumptions.map((assumption, i) => (
                      <li key={i} className="text-base italic text-muted-foreground">{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Board & Action Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">{"🎯 Board"}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {analysisResult.board.flop && <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Flop</p><p className="text-base font-medium font-mono">{analysisResult.board.flop}</p></div>}
                {analysisResult.board.turn && <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Turn</p><p className="text-base font-medium font-mono">{analysisResult.board.turn}</p></div>}
                {analysisResult.board.river && <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">River</p><p className="text-base font-medium font-mono">{analysisResult.board.river}</p></div>}
                {!analysisResult.board.flop && !analysisResult.board.turn && !analysisResult.board.river && (
                  <p className="text-base text-muted-foreground italic">Preflop only — no board cards</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">{"📋 Action Summary"}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Preflop</p><p className="text-base text-foreground leading-relaxed">{analysisResult.action_summary.preflop}</p></div>
                {analysisResult.action_summary.flop && <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Flop</p><p className="text-base text-foreground leading-relaxed">{analysisResult.action_summary.flop}</p></div>}
                {analysisResult.action_summary.turn && <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Turn</p><p className="text-base text-foreground leading-relaxed">{analysisResult.action_summary.turn}</p></div>}
                {analysisResult.action_summary.river && <div><p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">River</p><p className="text-base text-foreground leading-relaxed">{analysisResult.action_summary.river}</p></div>}
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          <Card className="mb-4">
            <CardHeader className="pb-3"><CardTitle className="text-lg">{"📊 Analysis"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-foreground leading-relaxed">{analysisResult.analysis.summary}</p>
              <div className="flex gap-3 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                <div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">{"🔥 Bottom Line"}</p>
                  <p className="text-base text-foreground leading-relaxed">{analysisResult.analysis.main_takeaway}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Good Plays */}
          {analysisResult.good_plays.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-3"><CardTitle className="text-lg">{"✅ Good Plays"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.good_plays.map((play, i) => (
                  <div key={i}>
                    <p className="font-semibold text-base text-foreground mb-1">{play.label}</p>
                    <p className="text-base text-muted-foreground leading-relaxed">{play.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Areas to Improve */}
          {analysisResult.areas_to_improve.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-3"><CardTitle className="text-lg">{"❌ Areas to Improve"}</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {analysisResult.areas_to_improve.map((area, i) => (
                  <div key={i}>
                    <p className="font-semibold text-base text-foreground mb-1">{"❌ "}{area.label}</p>
                    <p className="text-base text-foreground leading-relaxed mb-2">{area.mistake}</p>
                    <p className="text-base text-muted-foreground leading-relaxed"><span className="font-medium">Recommended: </span>{area.recommended_line}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Improvement Tips */}
          {analysisResult.improvement_tips.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-3"><CardTitle className="text-lg">{"💡 Improvement Tips"}</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal list-inside">
                  {analysisResult.improvement_tips.map((tip, i) => (
                    <li key={i} className="text-base text-foreground leading-relaxed">{tip}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Input preview — mobile */}
          {data.inputUrl && (
            <div className="lg:hidden">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">{"📸 Screenshot"}</CardTitle></CardHeader>
                <CardContent>
                  <img src={data.inputUrl} alt="Uploaded file" className="w-full rounded-lg border" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right column — sticky input preview (desktop) */}
        {data.inputUrl && (
          <div className="hidden lg:block lg:w-[400px] shrink-0">
            <div className="sticky top-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">{"📸 Screenshot"}</CardTitle></CardHeader>
                <CardContent>
                  <img src={data.inputUrl} alt="Uploaded file" className="w-full rounded-lg border" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
