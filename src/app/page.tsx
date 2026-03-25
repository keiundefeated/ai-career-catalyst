"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Briefcase, FileText, Zap, GraduationCap, Search, TrendingUp, Users, Star, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  typing?: boolean
  image?: string
}

const quickActions = [
  { label: "Resume Review", icon: FileText, prompt: "Help me review and improve my resume" },
  { label: "Career Path", icon: TrendingUp, prompt: "What career path should I take in tech?" },
  { label: "Interview Prep", icon: Zap, prompt: "Help me prepare for a job interview" },
  { label: "Salary Info", icon: Star, prompt: "What is the average salary for software engineers?" },
  { label: "Skills to Learn", icon: GraduationCap, prompt: "What skills should I learn in 2026?" },
  { label: "Job Search", icon: Search, prompt: "How do I find remote tech jobs?" },
  { label: "Networking", icon: Users, prompt: "How do I build professional network?" },
  { label: "Cover Letter", icon: FileText, prompt: "Help me write a cover letter" },
]

export default function Home() {
  const { isSignedIn, userId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Hello! 👋 I'm your AI Career Consultant. I can help you with:\n\n📄 Resume analysis & feedback\n📈 Career path planning\n💼 Interview preparation\n💰 Salary negotiation tips\n🔍 Job search strategies\n📚 Skills recommendations\n🤝 Networking advice\n✉️ Cover letter writing\n\n🎨 I can also generate career-related images!\n\nWhat would you like help with today?" }
  ])
  const [input, setInput] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [showImageGen, setShowImageGen] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (customMessage?: string) => {
    const msgToSend = customMessage || input
    if (!msgToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: msgToSend
    }

    setMessages(prev => [...prev, userMessage])
    if (!customMessage) setInput("")
    setIsLoading(true)

    setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "", typing: true }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: msgToSend,
          resumeText: resumeText 
        })
      })

      const data = await response.json()

      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: data.response || "Sorry, I didn't get a response."
        }]
      })
    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: "Sorry, an error occurred. Please try again. 😅"
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return
    
    setIsGeneratingImage(true)
    
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: `Generate image: ${imagePrompt}`
    }
    setMessages(prev => [...prev, userMessage])
    
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "🎨 Generating your image...", typing: true }])

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt })
      })

      const data = await response.json()

      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        if (data.image) {
          return [...filtered, {
            id: Date.now() + 2,
            role: "assistant",
            content: "✨ Here's your generated image:",
            image: data.image
          }]
        }
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: data.error || "Sorry, couldn't generate image. 😔"
        }]
      })
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: "Error generating image. 😅"
        }]
      })
    } finally {
      setIsGeneratingImage(false)
      setShowImageGen(false)
      setImagePrompt("")
    }
  }

  const analyzeResume = () => {
    if (!resumeText.trim()) return
    const prompt = `Please analyze my resume and provide detailed feedback on:
1. Overall impression
2. Strengths
3. Areas for improvement
4. Specific suggestions
5. ATS compatibility score
6. Keywords missing
7. Format recommendations

Resume: ${resumeText.slice(0, 3000)}`
    sendMessage(prompt)
    setShowResume(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Career Catalyst AI</h1>
                <p className="text-xs text-gray-400">Your Personal Career Consultant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{userId?.slice(0, 8)}...</span>
                  <Button onClick={() => window.location.href = "/sign-out"} variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => window.location.href = "/sign-in"} variant="outline" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isSignedIn && showResume && (
        <div className="bg-[#12121a] border-b border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-white font-medium mb-2">Paste your resume:</h3>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none mb-3"
            />
            <div className="flex gap-2">
              <Button
                onClick={analyzeResume}
                disabled={!resumeText.trim() || isLoading}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Analyze Resume
              </Button>
              <Button
                onClick={() => setShowResume(false)}
                variant="outline"
                className="border-white/20 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSignedIn && showImageGen && (
        <div className="bg-[#12121a] border-b border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-white font-medium mb-2">🎨 Generate Career Image</h3>
            <div className="flex gap-2">
              <input
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="E.g., Professional workspace, career growth chart, modern office..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
              />
              <Button
                onClick={generateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
              </Button>
              <Button
                onClick={() => setShowImageGen(false)}
                variant="outline"
                className="border-white/20 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your AI-Powered <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Career Consultant</span> 🤖
            </h2>
            <p className="text-gray-400 mb-6">Get personalized career advice, resume feedback, and job search tips 💡</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {quickActions.map((action) => (
                <button 
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)} 
                  disabled={!isSignedIn || isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-violet-500/30 transition-all disabled:opacity-50"
                >
                  <action.icon className="w-4 h-4 text-violet-400" />{action.label}
                </button>
              ))}
            </div>

            <Button 
              onClick={() => setShowImageGen(true)}
              disabled={!isSignedIn}
              className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700"
            >
              <ImageIcon className="w-4 h-4 mr-2" />🎨 Generate Career Images
            </Button>
          </div>
        </div>
      </section>

      <section className="py-6 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Career Consultant AI</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Powered by Groq 🚀
                  </p>
                </div>
              </div>

              <div className="h-[600px] overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-violet-600" : "bg-white/10"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/10 text-gray-200"}`}>
                      {msg.typing ? (
                        <div className="flex gap-1 pt-2">
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.image && (
                            <div className="mt-3">
                              <img src={msg.image} alt="Generated" className="max-w-full rounded-lg border border-white/20" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-white/5">
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isSignedIn ? "Ask me about your career..." : "Sign in to start chatting..."}
                    disabled={!isSignedIn}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none disabled:opacity-50"
                    rows={2}
                  />
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={!input.trim() || isLoading || !isSignedIn} 
                    className="bg-violet-600 hover:bg-violet-700 px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isSignedIn && (
        <div className="fixed bottom-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm">
          Sign in to start chatting 🔐
        </div>
      )}
    </div>
  )
}
