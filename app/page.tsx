'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, RotateCcw, Gamepad2, BookOpen, Rocket, Beaker, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatResponse {
  response?: string
  status?: string
  intent_detected?: string
  metadata?: {
    topic?: string
    sentiment?: string
    requires_followup?: boolean
  }
  success?: boolean
  raw_response?: string
}

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

const AGENTS: Agent[] = [
  {
    id: '692fff4255706e8287914db6',
    name: 'Chat Agent',
    description: 'Friendly conversational assistant',
    icon: null,
  },
  {
    id: '693000af6faee4d469e87b04',
    name: 'Gaming Agent',
    description: 'Expert gaming specialist',
    icon: <Gamepad2 className="w-4 h-4" />,
  },
  {
    id: '6930054c6b01be7c2f9fc838',
    name: 'History Chat Agent',
    description: 'Expert history specialist and educator',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: '69300bfa6faee4d469e8898b',
    name: 'Space Agent',
    description: 'Expert space and astronomy specialist',
    icon: <Rocket className="w-4 h-4" />,
  },
  {
    id: '693011da2bb6b2ddb363ce7e',
    name: 'Science Agent',
    description: 'Expert science specialist across all disciplines',
    icon: <Beaker className="w-4 h-4" />,
  },
  {
    id: '69301b626b01be7c2f9fda99',
    name: 'Nature Agent',
    description: 'Expert nature and environment specialist',
    icon: <Leaf className="w-4 h-4" />,
  },
]

const getWelcomeMessage = (agentName: string): string => {
  if (agentName === 'Gaming Agent') {
    return "Welcome to Gaming Central! I'm here to discuss games, share strategies, and help with gaming recommendations. What's your gaming interest today?"
  }
  if (agentName === 'History Chat Agent') {
    return "Welcome to History Hub! I'm your expert guide through time. Ask me about historical events, civilizations, famous figures, or any era of history. What historical topic interests you?"
  }
  if (agentName === 'Space Agent') {
    return "Welcome to the Cosmos! I'm your guide through the universe. Ask me about planets, stars, galaxies, space exploration, astronomy, and all things cosmic. What celestial topic fascinates you?"
  }
  if (agentName === 'Science Agent') {
    return "Welcome to the Science Lab! I'm your guide through physics, chemistry, biology, and all scientific disciplines. Ask me about experiments, theories, discoveries, or how things work. What scientific topic intrigues you?"
  }
  if (agentName === 'Nature Agent') {
    return "Welcome to the Natural World! I'm your guide to wildlife, ecosystems, plants, and environmental topics. Ask me about animals, habitats, conservation, or natural wonders. What aspect of nature captivates you?"
  }
  return 'Hi! How can I help you today?'
}

export default function HomePage() {
  const [currentAgent, setCurrentAgent] = useState<Agent>(AGENTS[0])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(AGENTS[0].name),
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAgentChange = (agent: Agent) => {
    setCurrentAgent(agent)
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(agent.name),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setInput('')
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          agent_id: currentAgent.id,
        }),
      })

      const data: ChatResponse = await response.json()

      const assistantContent =
        data.response ??
        data.raw_response ??
        (typeof data.response === 'string' ? data.response : null) ??
        'I apologize, I encountered an issue processing your request. Please try again.'

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I apologize, but I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(currentAgent.name),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setInput('')
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">ChatBot</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                {currentAgent.icon}
                <span className="text-sm font-medium">{currentAgent.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Select Agent</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AGENTS.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => handleAgentChange(agent)}
                  className={
                    currentAgent.id === agent.id ? 'bg-blue-50' : ''
                  }
                >
                  <div className="flex items-center gap-2">
                    {agent.icon}
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{agent.name}</span>
                      <span className="text-xs text-gray-500">
                        {agent.description}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          onClick={handleNewChat}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
        >
          <RotateCcw className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-gray-900 px-4 py-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
