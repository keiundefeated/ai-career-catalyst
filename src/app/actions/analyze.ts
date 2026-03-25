"use server"

export interface AnalysisResult {
  matchScore: number
  missingSkills: string[]
  actionPlan: string[]
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  try {
    const analysis = await getAIAnalysis(resumeText, jobDescription)
    return analysis
  } catch (error) {
    console.error("AI Analysis failed, using fallback:", error)
    return getFallbackAnalysis(resumeText, jobDescription)
  }
}

async function getAIAnalysis(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("API key not found")
  }

  const prompt = `You are a career analyst. Analyze this resume against the job description.

Resume: ${resumeText.slice(0, 3000)}
Job Description: ${jobDescription.slice(0, 2000)}

Respond ONLY with JSON:
{"matchScore": number, "missingSkills": [strings], "actionPlan": [strings]}`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://ai-career-catalyst.vercel.app",
      "X-Title": "AI Career Catalyst",
    },
    body: JSON.stringify({
      model: "qwen/qwen-2.5-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API Error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) throw new Error("Empty response")

  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Invalid JSON")

  const result = JSON.parse(match[0])
  return {
    matchScore: Math.min(100, Math.max(0, Math.round(result.matchScore))),
    missingSkills: result.missingSkills?.slice(0, 5) || ["Communication", "Leadership"],
    actionPlan: result.actionPlan?.slice(0, 3) || ["Practice interviews", "Build portfolio"]
  }
}

function getFallbackAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeLower = resumeText.toLowerCase()
  const jobLower = jobDescription.toLowerCase()
  
  const skills = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'java']
  const foundSkills = skills.filter(s => resumeLower.includes(s))
  
  const missingSkills = [
    "Cloud platforms (AWS/Azure/GCP)",
    "System design",
    "Leadership skills",
    "Communication"
  ].slice(0, 3 + Math.floor(Math.random() * 2))
  
  const baseScore = Math.floor(50 + foundSkills.length * 7)
  const matchScore = Math.min(85, baseScore)

  return {
    matchScore,
    missingSkills,
    actionPlan: [
      "Complete an online course in cloud platforms (AWS/Azure)",
      "Build a full-stack project to demonstrate your skills",
      "Practice system design and behavioral interviews"
    ]
  }
}
