import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ response: "Please sign in to use the chat" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { message } = body
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY
    
    // Try Groq first
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: `You are an expert AI Career Consultant with extensive knowledge in:
- Resume writing and optimization
- Career planning and development
- Job search strategies
- Interview preparation and techniques
- Salary negotiation
- Industry trends and in-demand skills
- Remote work opportunities
- Professional networking
- Cover letter writing
- LinkedIn optimization
- Tech industry careers
- Soft skills development

Provide detailed, actionable, and personalized advice. Use bullet points and structured responses. Be encouraging and professional.` },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      })

      if (groqRes.ok) {
        const data = await groqRes.json()
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ response: data.choices[0].message.content })
        }
      } else {
        const err = await groqRes.text()
        console.log("Groq Error:", err)
      }
    } catch (e) {
      console.log("Groq not available")
    }

    // Enhanced fallback responses with more knowledge
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("career") || lowerMessage.includes("path")) {
      return NextResponse.json({ response: `Here's a comprehensive career path guide:

**TECH CAREER PATHS:**

1. **Software Developer**
   - Start: Learn Python/JavaScript
   - Build projects
   - Apply for junior roles
   - Grow to senior → lead → architect

2. **AI/ML Engineer**
   - Learn Python, math, statistics
   - Study ML/DL fundamentals
   - Build ML projects
   - Internship → junior → senior

3. **Data Scientist**
   - Python, SQL, statistics
   - Learn visualization tools
   - Build portfolio
   - Entry → senior → lead

4. **DevOps Engineer**
   - Learn Linux, Docker, Kubernetes
   - CI/CD pipelines
   - Cloud platforms (AWS/Azure/GCP)
   - Grow to SRE → Platform lead

**GENERAL TIPS:**
- Continuous learning is key
- Build a strong portfolio
- Network actively
- Contribute to open source
- Get certifications` })
    }
    
    if (lowerMessage.includes("resume")) {
      return NextResponse.json({ response: `**RESUME WRITING GUIDE:**

**Structure:**
1. Contact Info
2. Professional Summary (2-3 sentences)
3. Work Experience (reverse chronological)
4. Education
5. Skills (technical & soft)
6. Projects

**Tips:**
- Keep it 1-2 pages
- Use action verbs (Led, Built, Achieved)
- Quantify achievements (e.g., "Increased sales by 20%")
- Tailor for each job
- Use keywords from job description
- ATS-friendly format

**Common Mistakes:**
- Typos/grammar errors
- Using passive language
- Including irrelevant info
- Outdated information
- Generic objectives` })
    }
    
    if (lowerMessage.includes("interview")) {
      return NextResponse.json({ response: `**INTERVIEW PREPARATION GUIDE:**

**Before Interview:**
- Research company thoroughly
- Study job description
- Prepare STAR stories
- Practice common questions
- Prepare questions to ask
- Dress appropriately
- Test tech setup (virtual)

**Common Questions:**
- "Tell me about yourself"
- "Why do you want this job?"
- "What are your strengths/weaknesses?"
- "Where do you see yourself in 5 years?"
- "Why should we hire you?"

**STAR Method:**
- S - Situation
- T - Task
- A - Action
- R - Result

**After Interview:**
- Send thank-you email within 24 hours
- Follow up if no response
- Reflect on what went well/needs improvement` })
    }

    if (lowerMessage.includes("salary") || lowerMessage.includes("negotiat")) {
      return NextResponse.json({ response: `**SALARY NEGOTIATION GUIDE:**

**Research:**
- Use Glassdoor, Payscale, Levels.fyi
- Consider location & experience
- Factor in benefits & perks

**Negotiation Tips:**
- Never accept first offer immediately
- Provide market data
- Highlight your value
- Practice your pitch
- Be confident but professional
- Consider total compensation

**What to Negotiate:**
- Base salary
- Signing bonus
- Stock options/RSUs
- Vacation time
- Remote work flexibility
- Professional development budget

**Remember:**
- 60-70% of salary discussions result in higher offers` })
    }

    if (lowerMessage.includes("skill") || lowerMessage.includes("learn")) {
      return NextResponse.json({ response: `**TOP SKILLS TO LEARN IN 2026:**

**Technical Skills:**
- AI/ML fundamentals
- Python (still #1)
- Cloud computing (AWS/Azure/GCP)
- Data engineering
- Cybersecurity
- Docker & Kubernetes
- SQL & NoSQL databases
- JavaScript/TypeScript

**Soft Skills:**
- Communication
- Problem-solving
- Adaptability
- Teamwork
- Time management
- Critical thinking

**Emerging Trends:**
- LLM fine-tuning
- MLOps
- Edge computing
- Blockchain (selective)
- Quantum computing (early)

**Learning Resources:**
- freeCodeCamp
- Coursera
- Udemy
- YouTube
- Official documentation
- Practice projects` })
    }

    if (lowerMessage.includes("remote") || lowerMessage.includes("work from home")) {
      return NextResponse.json({ response: `**REMOTE JOB SEARCH GUIDE:**

**Where to Find Remote Jobs:**
- Remote.co
- We Work Remotely
- FlexJobs
- LinkedIn (filter "Remote")
- AngelList (startups)
- Company career pages

**Tips:**
- Build strong online presence
- Have reliable home office
- Master video communication
- Be proactive in communication
- Show results, not hours

**Companies Hiring Remotely:**
- Tech giants (with restrictions)
- Startups
- Digital agencies
- Fortune 500 remote divisions

**Challenges:**
- Time zone management
- Self-discipline
- Isolation
- Work-life boundaries` })
    }

    return NextResponse.json({ response: `I'm your AI Career Consultant! I can help with:

• Resume analysis & optimization
• Career path planning
• Interview preparation
• Salary negotiation
• Skills recommendations
• Job search strategies
• Remote work advice
• Professional networking
• Cover letter writing
• LinkedIn optimization

What would you like help with?` })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ response: "Error: " + String(error) })
  }
}
