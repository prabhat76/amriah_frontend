import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const BASE = 'https://clothing-amriah.onrender.com/api'

async function askChatbot(message: string, history: Message[]): Promise<string> {
  try {
    const res = await fetch(`${BASE}/ai/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationHistory: history.map(m => ({ role: m.role, content: m.text })),
      }),
    })
    if (!res.ok) throw new Error('API error')
    const json = await res.json()
    return json.data?.reply ?? json.data?.message ?? json.message ?? 'How can I help you today?'
  } catch {
    // Offline fallback responses
    const lower = message.toLowerCase()
    if (lower.includes('price') || lower.includes('cost')) {
      return 'Our pieces range from ₹3,499 for kurta sets to ₹12,999 for sherwanis. Custom orders are priced based on fabric and embroidery. Would you like to know about a specific item?'
    }
    if (lower.includes('custom') || lower.includes('bespoke')) {
      return 'Yes! Every piece at ASTRIMI can be customised — size, colour, fabric, and embroidery. Share your vision and our artisans will bring it to life. Visit the Custom Made page to get started.'
    }
    if (lower.includes('deliver') || lower.includes('ship')) {
      return 'Standard delivery is 5–10 business days worldwide. Custom/bespoke orders take 4–8 weeks. Express delivery (2–4 days) is available for ready-to-buy pieces.'
    }
    if (lower.includes('return') || lower.includes('refund')) {
      return 'We accept returns within 14 days on ready-to-buy pieces in original condition. Custom and bespoke orders are non-returnable as they are made to order.'
    }
    return 'I\'m here to help with ASTRIMI\'s collections, custom orders, pricing, and delivery. What would you like to know?'
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Welcome to ASTRIMI ✦ How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)
    const reply = await askChatbot(text, messages)
    setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    setLoading(false)
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] shadow-2xl flex flex-col bg-pearl border border-mist overflow-hidden"
             style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="bg-navy px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold" />
              <span className="text-pearl text-xs font-semibold tracking-widest uppercase">ASTRIMI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-stone hover:text-pearl transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] text-xs leading-relaxed px-3 py-2.5 ${
                  m.role === 'user'
                    ? 'bg-navy text-pearl'
                    : 'bg-cream text-navy border border-mist'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-cream border border-mist px-3 py-2.5 flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin text-gold" />
                  <span className="text-[10px] text-stone">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-mist px-3 py-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about our collection…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-navy placeholder-stone border-b border-mist pb-1"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-navy text-pearl flex items-center justify-center hover:bg-gold hover:text-navy transition-colors disabled:opacity-40"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-12 h-12 bg-navy text-pearl flex items-center justify-center shadow-lg hover:bg-gold hover:text-navy transition-colors"
        aria-label="Chat with us"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  )
}
