import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body
    
    const apiKey = "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"

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: message }],
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("API Error:", err)
      return NextResponse.json({ response: "Error: " + err.slice(0, 100) })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    return NextResponse.json({ response: content || "No response" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ response: "Error: " + String(error) })
  }
}
