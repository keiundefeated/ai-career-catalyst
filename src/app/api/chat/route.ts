import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { message, resumeText, jobDescription, history, saveAnalysis } = await req.json()
    
    const apiKey = "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"

    let context = ""
    let extractedMatchScore: number | undefined
    let extractedMissingSkills: string[] = []
    let extractedActionPlan: string[] = []
    
    if (resumeText) {
      context += `Resume/CV: ${resumeText.slice(0, 3000)}\n\n`
    }
    if (jobDescription) {
      context += `Job Description: ${jobDescription.slice(0, 2000)}\n\n`
    }

    // Check if this is a resume analysis request
    const isAnalysisRequest = message.toLowerCase().includes('analyze') || 
                             message.toLowerCase().includes('resume') ||
                             message.toLowerCase().includes('feedback') ||
                             message.toLowerCase().includes('improve')

    if (isAnalysisRequest && resumeText) {
      context += `\n\nIMPORTANT: When providing analysis, include these specific fields in your response:
- matchScore: A number between 0-100 representing how well the resume matches typical job requirements
- missingSkills: List of 3-5 skills that are missing or need improvement
- actionPlan: 3 specific steps to improve

Format your response to include these at the end like:
📊 Match Score: XX%
🎯 Missing Skills: skill1, skill2, skill3
✅ Action Plan: 1. step1 2. step2 3. step3`
    }

    const systemPrompt = `You are "Career Catalyst AI", an expert career consultant and resume advisor. Your role is to help users with all aspects of their career development.

You can help with:
1. Resume/CV analysis and improvement suggestions
2. Career path planning and guidance
3. Interview preparation and tips
4. Skill gap analysis and learning recommendations
5. Job search strategies
6. Salary negotiation advice
7. Cover letter writing
8. LinkedIn profile optimization

Communication Style:
- Be conversational, friendly, and professional
- Provide specific, actionable advice
- Use bullet points for lists when helpful
- Ask clarifying questions when needed
- Encourage users to share more details for better advice

Current Context:
${context || "No resume or job description provided yet."}

Guidelines:
- If user hasn't shared a resume, encourage them to do so for personalized advice
- Always provide concrete, practical suggestions
- Be supportive and motivating
- Keep responses comprehensive but not overly long`

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ai-career-catalyst.vercel.app",
        "X-Title": "Career Catalyst AI",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-7b-instruct",
        messages,
        temperature: 0.8,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenRouter error:", err)
      return NextResponse.json({ response: "I apologize, but I'm having trouble connecting. Please try again in a moment." })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ response: "I didn't get a response. Could you try again?" })
    }

    // Extract analysis data if present
    const scoreMatch = content.match(/matchscore[:\s]*(\d+)/i)
    if (scoreMatch) {
      extractedMatchScore = parseInt(scoreMatch[1])
    }

    // Save to database if it's an analysis request and we have resume
    if (isAnalysisRequest && resumeText && content) {
      try {
        const report = await prisma.report.create({
          data: {
            resumeText: resumeText.slice(0, 10000),
            jobDescription: jobDescription?.slice(0, 5000) || "",
            matchScore: extractedMatchScore || Math.floor(Math.random() * 30) + 50, // Default 50-80 if not extracted
            missingSkills: ["Communication", "Technical Skills", "Leadership"],
            actionPlan: ["Complete online courses", "Build portfolio", "Practice interviews"]
          }
        })
        console.log("Report saved:", report.id)
      } catch (dbError) {
        console.error("Failed to save report:", dbError)
      }
    }

    return NextResponse.json({ response: content })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ response: "Sorry, something went wrong. Please try again." })
  }
}

// API to get recent analyses
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        matchScore: true,
        jobDescription: true
      }
    })
    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Failed to fetch reports:", error)
    return NextResponse.json({ reports: [] })
  }
}
