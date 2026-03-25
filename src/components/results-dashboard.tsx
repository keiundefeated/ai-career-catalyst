"use client"

import { CheckCircle2, Target, TrendingUp, XCircle, BookOpen, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisResult } from "@/app/actions/analyze"

interface ResultsDashboardProps {
  result: AnalysisResult
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const scoreColor = result.matchScore >= 70 ? "text-green-500" : result.matchScore >= 40 ? "text-yellow-500" : "text-red-500"
  const scoreBg = result.matchScore >= 70 ? "bg-green-500/10" : result.matchScore >= 40 ? "bg-yellow-500/10" : "bg-red-500/10"

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Match Score Card */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
            <Target className="h-5 w-5" />
            Overall Match Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-7xl font-bold ${scoreColor} mb-2`}>
            {result.matchScore}%
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreBg}`}>
            {result.matchScore >= 70 ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Strong Match</span>
              </>
            ) : result.matchScore >= 40 ? (
              <>
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Moderate Match</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Needs Improvement</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Missing Skills */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <XCircle className="h-5 w-5 text-red-400" />
            Missing Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.missingSkills.map((skill, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-foreground">{skill}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            3-Step Learning Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.actionPlan.map((step, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
                )}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0 shadow-lg shadow-primary/25">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-foreground leading-relaxed">{step}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
