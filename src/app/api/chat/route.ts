import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, resumeText } = body
    
    const apiKey = "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"

    let fullMessage = message
    
    if (resumeText && message.toLowerCase().includes("analyze")) {
      fullMessage = `You are a career expert. The user wants you to analyze their resume. 
      
Resume content:
${resumeText.slice(0, 3000)}

Please provide:
1. Overall impression of the resume
2. Strengths
3. Areas for improvement
4. Specific suggestions to make it better
5. A match score (0-100%) if applicable`
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://career-catalyst.vercel.app",
        "X-Title": "Career Catalyst AI",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: fullMessage }],
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("API Error:", err)
      return NextResponse.json({ response: "Sorry, I'm having trouble connecting. Error: " + err.slice(0, 50) })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    return NextResponse.json({ response: content || "No response" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ response: "Error: " + String(error) })
  }
}
