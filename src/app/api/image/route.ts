import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 })
  }

  try {
    const { prompt } = await req.json()
    
    // Use Hugging Face Inference API (free tier)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-medium",
      {
        headers: {
          Authorization: "Bearer hf_demo",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    )

    if (!response.ok) {
      // Fallback to a different model if the main one fails
      const fallbackRes = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          headers: {
            Authorization: "Bearer hf_demo",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      )

      if (!fallbackRes.ok) {
        const err = await fallbackRes.text()
        console.log("Image Error:", err)
        return NextResponse.json({ error: "Could not generate image. Please try again. 😅" })
      }

      const buffer = await fallbackRes.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      return NextResponse.json({ image: `data:image/png;base64,${base64}` })
    }

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    return NextResponse.json({ image: `data:image/png;base64,${base64}` })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error generating image. 😅" })
  }
}
