import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Send, Lightbulb, User, Bot, Copy, Check,
  RotateCcw, Trash2, StopCircle, Sparkles,
} from 'lucide-react'
import { chatService } from '../services/courseService'
import { ChatHistory } from '../types'
import { Card, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Navigation from '../components/Navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

function ChatPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const abortRef = useRef<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { isLoading } = useQuery<ChatHistory>({
    queryKey: ['chat', courseId],
    queryFn: async () => {
      const history = await chatService.getChatHistory(courseId!)
      if (history?.messages) {
        setMessages(history.messages as Message[])
      }
      return history
    },
    enabled: !!courseId,
  })

  const { data: suggestedQuestions } = useQuery({
    queryKey: ['chat-suggestions', courseId],
    queryFn: () => chatService.getSuggestedQuestions(courseId!),
    enabled: !!courseId,
  })

  useEffect(() => {
    if (suggestedQuestions) setSuggestions(suggestedQuestions)
  }, [suggestedQuestions])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (overrideMessage?: string) => {
    const text = overrideMessage ?? message
    if (!text.trim() || !courseId || isStreaming) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setMessage('')
    setIsStreaming(true)
    abortRef.current = false

    try {
      await chatService.streamMessage(courseId, text, (chunk) => {
        if (abortRef.current) return
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        )
      })
    } catch (err) {
      toast.error('Stream failed. Falling back to regular response.')
      try {
        const res = await chatService.sendMessage(courseId, text)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: res.content, isStreaming: false }
              : m
          )
        )
      } catch {
        toast.error('Failed to get a response.')
      }
    } finally {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      )
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }, [message, courseId, isStreaming])

  const handleStop = () => {
    abortRef.current = true
    setIsStreaming(false)
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    )
  }

  const handleRegenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    setMessages((prev) => {
      const idx = prev.map((m) => m.role).lastIndexOf('assistant')
      return idx >= 0 ? prev.filter((_, i) => i !== idx) : prev
    })
    await handleSend(lastUser.content)
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = async () => {
    if (!courseId) return
    await chatService.clearHistory(courseId)
    setMessages([])
    toast.success('Chat history cleared')
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to={`/courses/${courseId}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
          >
            ← Back to Course
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h1 className="text-lg font-bold">AI Tutor</h1>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-3xl">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mb-4 bg-card/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                <span className="font-medium">Suggested questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    disabled={isStreaming}
                    className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[58vh] pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold text-lg">Ask the AI Tutor anything</p>
              <p className="text-sm mt-1">I only answer based on your uploaded course document.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className="group relative">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-card border border-border rounded-tl-none'
                        }`}
                      >
                        {msg.content || (
                          <span className="flex gap-1 items-center text-muted-foreground">
                            <span className="animate-bounce delay-0">●</span>
                            <span className="animate-bounce delay-100">●</span>
                            <span className="animate-bounce delay-200">●</span>
                          </span>
                        )}
                        {msg.isStreaming && (
                          <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
                        )}
                      </div>

                      {/* Action buttons on assistant messages */}
                      {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                          <button
                            onClick={handleRegenerate}
                            disabled={isStreaming}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" /> Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end sticky bottom-0 pb-2 bg-background pt-2 border-t border-border">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a question about the course..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all"
          />
          {isStreaming ? (
            <Button
              onClick={handleStop}
              variant="outline"
              className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
            >
              <StopCircle className="w-4 h-4" /> Stop
            </Button>
          ) : (
            <Button
              onClick={() => handleSend()}
              disabled={!message.trim() || isStreaming}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

export default ChatPage
