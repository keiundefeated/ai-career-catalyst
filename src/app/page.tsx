"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Briefcase, FileText, MessageSquare, ChevronRight, Star, Zap, Shield, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  typing?: boolean
}

interface Report {
  id: number
  createdAt: string
  matchScore: number
  jobDescription: string
}

// PDF extraction disabled - use text paste instead
async function extractTextFromPDF(file: File): Promise<string> {
  throw new Error("Please paste your resume text instead of uploading a PDF file.")
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Hello! I'm your AI Career Consultant. I can help you with resume analysis, interview preparation, career guidance, skill development, and more. Tell me about your career goals or upload your resume!" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resumeText, setResumeText] = useState("")
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState("")
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch recent reports on mount
  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => setRecentReports(data.reports || []))
      .catch(console.error)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setExtractionError("PDF upload is currently disabled. Please paste your resume text in the text box below.")
    
    // Clear the file input
    e.target.value = ""
  }

  const handlePasteResume = () => {
    setShowResumeModal(true)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "", typing: true }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          resumeText: resumeText,
          jobDescription: "",
          history: messages.filter(m => !m.typing).slice(-10)
        })
      })

      const data = await response.json()

      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: data.response || "I apologize, but I couldn't process that. Could you try again?"
        }]
      })
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again."
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { icon: FileText, label: "Analyze Resume", prompt: "Please analyze my resume and tell me what improvements I need." },
    { icon: Briefcase, label: "Career Path", prompt: "What career path should I take for my field?" },
    { icon: MessageSquare, label: "Interview Prep", prompt: "Help me prepare for a technical interview." },
    { icon: Zap, label: "Skill Advice", prompt: "What skills should I learn to advance my career?" },
  ]

  const features = [
    { icon: Bot, title: "AI-Powered", desc: "Smart chatbot that understands your career needs" },
    { icon: FileText, title: "Resume Review", desc: "Get expert feedback on your resume" },
    { icon: Briefcase, title: "Career Guidance", desc: "Personalized career path recommendations" },
    { icon: Shield, title: "Private & Secure", desc: "Your data stays confidential" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
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
              {resumeText && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Resume loaded
                </span>
              )}
              <Button
                onClick={() => setShowResumeModal(true)}
                variant="outline"
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Resume
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your AI-Powered
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Career Consultant </span>
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Get personalized career guidance, resume feedback, interview prep, and more - all through an intelligent AI that understands your professional journey.
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => setInput(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-violet-500/30 transition-all"
                >
                  <action.icon className="w-4 h-4 text-violet-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Career Consultant AI</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-violet-600" : "bg-white/10"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/10 text-gray-200"}`}>
                      {msg.typing ? (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me about your career..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
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

      {/* Recent Analyses Section */}
      {recentReports.length > 0 && (
        <section className="py-12 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                Recent Analyses
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {recentReports.slice(0, 6).map((report) => (
                  <div key={report.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-sm font-bold ${
                        report.matchScore >= 70 ? 'text-green-400' : 
                        report.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {report.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {report.jobDescription || "Resume Analysis"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121a] rounded-2xl border border-white/10 max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Paste Your Resume</h3>
              <button onClick={() => setShowResumeModal(false)} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">Copy and paste your resume text below for analysis.</p>
            
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none mb-4"
            />
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (resumeText.trim()) {
                    setInput(`Please analyze my resume and provide feedback. Here's my resume:\n\n${resumeText.slice(0, 1000)}`)
                    setShowResumeModal(false)
                  }
                }}
                disabled={!resumeText.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                Analyze Text
              </Button>
              <Button
                onClick={() => setShowResumeModal(false)}
                variant="outline"
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
