"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Briefcase, FileText, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  typing?: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Hello! I'm your AI Career Consultant. Ask me anything about your career, resume, interviews, or job search!" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
        body: JSON.stringify({ message: input })
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
      setMessages(prev => {
        const filtered = prev.filter(m => !m.typing)
        return [...filtered, {
          id: Date.now() + 2,
          role: "assistant",
          content: "Sorry, an error occurred. Please try again."
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
    { icon: FileText, label: "Resume Help", prompt: "Help me improve my resume" },
    { icon: Briefcase, label: "Career Advice", prompt: "What career path should I choose?" },
    { icon: Zap, label: "Interview Tips", prompt: "Give me interview preparation tips" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Career Catalyst AI</h1>
              <p className="text-xs text-gray-400">Your Personal Career Consultant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your AI-Powered <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Career Consultant</span>
            </h2>
            <p className="text-gray-400 mb-6">Get instant answers about careers, resumes, interviews, and more.</p>
            
            <div className="flex flex-wrap justify-center gap-3">
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

      {/* Chat */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden">
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

              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-violet-600" : "bg-white/10"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/10 text-gray-200"}`}>
                      {msg.typing ? (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
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
    </div>
  )
}
