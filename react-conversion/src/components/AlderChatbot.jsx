import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const ALDER_WEBHOOK = "https://automation.aci-rpas.cloud/webhook/alder-chatbot"

const INITIAL_MESSAGES = [
  {
    role: 'bot',
    text: "Roar! 🦁 Hi! I'm **Alder**, your RPAS assistant at Aldersgate College Inc. How can I help you today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    role: 'bot',
    text: "Ask me about **services, request status, submission, or anything about RPAS!** 📋",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
]

export default function AlderChatbot() {
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showGreeting, setShowGreeting] = useState(true)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Hide greeting after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  // Hide greeting when chat is opened
  useEffect(() => {
    if (isOpen) setShowGreeting(false)
  }, [isOpen])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isTyping) return

    // Add user message
    const userMessage = {
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch(ALDER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: profile?.id || 'visitor',
          userRole: profile?.role || 'unknown',
          userName: profile?.full_name || 'Visitor',
          sessionId: getSessionId(),
          context: 'rpas_aldersgate',
        }),
      })

      const data = await response.json()
      const reply = data.output || data.reply || data.text || data.message ||
        "I couldn't get a response. Please contact RPAS directly."

      const botMessage = {
        role: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        role: 'bot',
        text: "Oops! Having trouble connecting. Please try again or visit the RPAS office.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('alder_rpas_session')
    if (!sessionId) {
      sessionId = 'r' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('alder_rpas_session', sessionId)
    }
    return sessionId
  }

  return (
    <>
      {/* Chat Launcher */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Greeting Bubble */}
        <AnimatePresence>
          {showGreeting && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-[190px] right-0 bg-white border-2 border-gold rounded-2xl rounded-br-md p-4 w-56 shadow-lg mb-2"
            >
              <button
                onClick={() => setShowGreeting(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <p className="text-sm text-green-dark font-semibold">
                Roar! 🦁 Hi! I'm <span className="text-gold">Alder</span>, your RPAS assistant!<br />
                Ask me anything about our services!
              </p>
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gold" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Button (when closed) */}
        <motion.button
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={() => setIsOpen(true)}
          className={cn(
            'w-28 transition-transform hover:scale-105',
            isOpen && 'hidden'
          )}
        >
          <img
            src="/assets/Alder/alder-transparent.gif"
            alt="Alder the Lion"
            className="w-full drop-shadow-xl"
          />
        </motion.button>

        {/* Head Button (when open) */}
        <button
          onClick={() => setIsOpen(false)}
          className={cn(
            'w-14 h-14 rounded-full border-[3px] border-gold bg-green-dark overflow-visible shadow-lg',
            'hidden',
            isOpen && '!block'
          )}
          style={{
            boxShadow: '0 6px 24px rgba(26, 107, 48, 0.5)',
          }}
        >
          <img
            src="/assets/Alder/alder-moving-head.gif"
            alt="Alder"
            className="w-auto h-16 object-cover transform scale-150 -translate-y-3"
          />
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.35, ease: [0.34, 1.3, 0.64, 1] }}
            className="fixed bottom-28 right-6 z-40 w-[360px] max-h-[520px] bg-white rounded-2xl shadow-chat border border-gold/30 overflow-hidden flex flex-col"
            style={{ originX: 1, originY: 1 }}
          >
            {/* Header */}
            <div className="bg-green-dark px-5 py-4 flex items-center gap-3 border-b-2 border-gold">
              <div className="w-10 h-10 relative">
                <img
                  src="/assets/Alder/alder-head.png"
                  alt="Alder"
                  className="absolute w-16 h-auto -left-4 -top-4"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-sm font-bold">Alder — RPAS Assistant</h4>
                <span className="text-gold text-xs">🟢 Online · Powered by AI</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[300px] max-h-[340px] scrollbar-thin">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex flex-col max-w-[85%]',
                    msg.role === 'user' ? 'self-end items-end ml-auto' : 'self-start'
                  )}
                >
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-green-dark text-white rounded-br-sm'
                        : 'bg-gray-50 text-gray-800 rounded-bl-sm border border-gold/20'
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                  <span className={cn(
                    'text-[10px] text-gray-400 mt-1',
                    msg.role === 'user' && 'text-right'
                  )}>
                    {msg.time}
                  </span>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1 px-4 py-3 bg-gray-50 rounded-2xl rounded-bl-sm border border-gold/20 w-fit"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-gold rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Alder anything..."
                className="flex-1 border border-gold/30 rounded-full px-4 py-2.5 text-sm outline-none focus:border-gold bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  'w-10 h-10 rounded-full bg-green-dark flex items-center justify-center transition-transform',
                  inputValue.trim() && 'hover:scale-105 hover:bg-green-brand'
                )}
              >
                <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}