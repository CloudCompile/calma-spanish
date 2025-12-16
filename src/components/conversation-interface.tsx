import { useState, useRef, useEffect } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import type { Message, ConversationRole } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { PaperPlaneRight, Sparkle } from '@phosphor-icons/react'

interface ConversationInterfaceProps {
  role: ConversationRole
  messages: Message[]
  onSendMessage: (content: string) => void
  onEndConversation: () => void
  isLoading?: boolean
}

export function ConversationInterface({
  role,
  messages,
  onSendMessage,
  onEndConversation,
  isLoading = false
}: ConversationInterfaceProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const roleNames: Record<ConversationRole, string> = {
    barista: 'Barista',
    friend: 'Amigo',
    coworker: 'Colega',
    traveler: 'Local',
    stranger: 'Persona',
    custom: 'Character'
  }

  return (
    <GlassCard variant="strong" className="flex flex-col h-[600px] max-w-3xl mx-auto">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkle weight="duotone" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{roleNames[role]}</h3>
              <p className="text-xs text-muted-foreground">
                Practice natural conversation
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEndConversation}>
            End & Get Feedback
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, x: message.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card/60 backdrop-blur-sm text-card-foreground rounded-bl-sm border border-border/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed font-mono">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 border border-border/50">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-6 border-t border-border/50">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe en español..."
            className="min-h-[60px] max-h-[120px] resize-none font-mono"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
            disabled={!input.trim() || isLoading}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </GlassCard>
  )
}
