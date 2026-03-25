"use client"

import { useState } from "react"
import { Sparkles, Send, Bot, User, FileText, Upload, X, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface CareerAgentProps {
  resumeText: string
  jobDescription: string
  onComplete: (result: any) => void
}

export function CareerAgent({ resumeText, jobDescription, onComplete }: CareerAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Career AI Agent. Upload your resume and paste a job description, and I'll analyze your skills, find gaps, and create a personalized learning roadmap for you. Let's get started!" }
  ])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [showChat, setShowChat] = useState(true)

  const handleSend = async () => {
    if (!input.trim() || isThinking) return
    
    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsThinking(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          resumeText,
          jobDescription,
          history: messages
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader 
        className="cursor-pointer border-b border-border/50" 
        onClick={() => setShowChat(!showChat)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>Career AI Agent</span>
          </div>
          {showChat ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </CardTitle>
      </CardHeader>
      
      {showChat && (
        <CardContent className="p-0">
          <div className="h-[300px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary/10" : "bg-secondary/50"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 border-t border-border/50 p-4">
            <Textarea
              placeholder="Ask me about your career path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[60px] resize-none"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isThinking} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
