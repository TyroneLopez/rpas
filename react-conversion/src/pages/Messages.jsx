import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatDate, timeAgo, getInitials } from '../lib/utils'
import { cn } from '../lib/utils'
import Button from '../components/ui/Button'
import { ArrowLeft, Send } from 'lucide-react'

const ALDER_WEBHOOK = "https://automation.aci-rpas.cloud/webhook/alder-chatbot"

const INITIAL_ALDER_MESSAGE = "Hi! I'm Alder, your RPAS assistant 🦁 I can answer questions about our services, check your request status, or connect you with the admin. What can I help you with today?"

export default function Messages() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('requests')
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [alderInput, setAlderInput] = useState('')
  const [alderHistory, setAlderHistory] = useState([{ role: 'bot', text: INITIAL_ALDER_MESSAGE }])
  const [alderTyping, setAlderTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, alderHistory, alderTyping])

  async function loadConversations() {
    setLoading(true)

    // Load service requests with conversation info
    let query = supabase
      .from('service_requests')
      .select('id, service_type, title, status, researcher:researcher_id(full_name, avatar_url), analyst:analyst_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (profile?.role === 'researcher') {
      query = query.eq('researcher_id', profile.id)
    } else if (profile?.role === 'analyst') {
      query = query.eq('analyst_id', profile.id)
    }

    const { data } = await query

    if (data) {
      // Get latest message for each conversation
      const convsWithPreview = await Promise.all(
        data.map(async (req) => {
          const { data: msgData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('request_id', req.id)
            .order('created_at', { ascending: false })
            .limit(1)

          return {
            ...req,
            lastMessage: msgData?.[0] || null,
          }
        })
      )
      setConversations(convsWithPreview)
    }

    setLoading(false)
  }

  async function loadMessages(requestId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
    }
  }

  async function handleSendMessage() {
    const text = messageInput.trim()
    if (!text || !activeConvId) return

    setMessageInput('')

    await supabase.from('messages').insert({
      request_id: activeConvId,
      sender_id: profile.id,
      content: text,
    })

    await loadMessages(activeConvId)
    await loadConversations()
  }

  async function handleSendAlder() {
    const text = alderInput.trim()
    if (!text || alderTyping) return

    setAlderInput('')
    setAlderHistory((prev) => [...prev, { role: 'user', text }])
    setAlderTyping(true)

    try {
      const response = await fetch(ALDER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: profile?.id,
          userRole: profile?.role,
          userName: profile?.full_name || 'User',
          history: alderHistory.slice(-6),
        }),
      })

      const data = await response.json()
      const reply = data.reply || data.message || data.text ||
        "I'm having trouble connecting right now. Please message the RPAS office directly or try again soon."

      setAlderHistory((prev) => [...prev, { role: 'bot', text: reply }])
    } catch (error) {
      setAlderHistory((prev) => [...prev, {
        role: 'bot',
        text: "I'm having trouble connecting right now. Please message the RPAS office directly or try again soon."
      }])
    } finally {
      setAlderTyping(false)
    }
  }

  function openConversation(requestId) {
    setActiveConvId(requestId)
    loadMessages(requestId)
  }

  const activeConversation = conversations.find(c => c.id === activeConvId)

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4">
      {/* Sidebar / Tabs */}
      <div className="lg:w-80 flex flex-col bg-white rounded-card border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              'flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors',
              activeTab === 'requests'
                ? 'text-green-brand border-green-brand'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('office')}
            className={cn(
              'flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors',
              activeTab === 'office'
                ? 'text-green-brand border-green-brand'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            RPAS Office
          </button>
          <button
            onClick={() => setActiveTab('alder')}
            className={cn(
              'flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1',
              activeTab === 'alder'
                ? 'text-green-brand border-green-brand'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            <img
              src="/assets/Alder/alder-head.png"
              alt="Alder"
              className="w-5 h-auto"
              onError={(e) => e.target.style.display = 'none'}
            />
            Ask Alder
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'alder' ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              🦁 Alder is in the chat area →
            </div>
          ) : activeTab === 'office' ? (
            <button
              onClick={() => setActiveTab('office-chat')}
              className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-green-dark text-white flex items-center justify-center text-lg">
                🏛
              </div>
              <div>
                <div className="font-semibold text-gray-900">RPAS Office</div>
                <div className="text-xs text-gray-500">General inquiries</div>
              </div>
            </button>
          ) : (
            <>
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm text-gray-500">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = profile?.role === 'researcher' ? conv.analyst : conv.researcher
                  const name = other?.full_name || 'RPAS'
                  const isActive = activeConvId === conv.id

                  return (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv.id)}
                      className={cn(
                        'w-full p-4 flex items-center gap-3 transition-colors text-left border-b border-gray-100',
                        isActive ? 'bg-green-light' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gold-light text-green-dark flex items-center justify-center font-semibold flex-shrink-0">
                        {other?.avatar_url ? (
                          <img src={other.avatar_url} alt={name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          getInitials(name)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{name}</div>
                        <div className="text-xs text-gray-500">{conv.service_type}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {conv.lastMessage && timeAgo(conv.lastMessage.created_at)}
                      </div>
                    </button>
                  )
                })
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-card border border-gray-200 overflow-hidden flex flex-col">
        {/* Alder Chat */}
        {activeTab === 'alder' || activeTab === 'office' ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <img
                src="/assets/Alder/alder-head.png"
                alt="Alder"
                className="w-12 h-auto"
              />
              <div>
                <div className="font-bold text-gray-900">Alder</div>
                <div className="text-xs text-gray-500">RPAS AI Assistant • ACI</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alderHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm',
                      msg.role === 'user'
                        ? 'bg-green-dark text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                </div>
              ))}

              {alderTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 flex gap-1">
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <textarea
                value={alderInput}
                onChange={(e) => setAlderInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendAlder()
                  }
                }}
                placeholder="Ask Alder anything..."
                rows={1}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-brand resize-none max-h-24"
              />
              <Button
                size="icon"
                onClick={handleSendAlder}
                disabled={!alderInput.trim() || alderTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light text-green-dark flex items-center justify-center font-semibold">
                {(() => {
                  const other = profile?.role === 'researcher'
                    ? activeConversation.analyst
                    : activeConversation.researcher
                  const name = other?.full_name || 'RPAS'
                  return other?.avatar_url ? (
                    <img src={other.avatar_url} alt={name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    getInitials(name)
                  )
                })()}
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {(() => {
                    const other = profile?.role === 'researcher'
                      ? activeConversation.analyst
                      : activeConversation.researcher
                    return other?.full_name || 'RPAS'
                  })()}
                </div>
                <div className="text-xs text-gray-500">{activeConversation.service_type}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === profile?.id
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        isMine ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className="max-w-[80%]">
                        <div
                          className={cn(
                            'px-4 py-2.5 rounded-2xl text-sm',
                            isMine
                              ? 'bg-green-dark text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          )}
                        >
                          {msg.content}
                        </div>
                        <div className={cn(
                          'text-[10px] text-gray-400 mt-1',
                          isMine && 'text-right'
                        )}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-brand resize-none max-h-24"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}