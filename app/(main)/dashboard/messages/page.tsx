'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Search, ArrowLeft, Phone, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'

type Message = { id: string; senderId: string; text: string; time: string; isMe: boolean }
type Conversation = {
  id: string; sitterName: string; sitterAvatar: string
  lastMessage: string; lastTime: string; unread: number; bookingId: string
  messages: Message[]
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', sitterName: '林晓雨', sitterAvatar: 'L',
    lastMessage: '好的，我已经确认了您的预订！猫咪明天几点送过来？',
    lastTime: '14:32', unread: 2, bookingId: 'b1',
    messages: [
      { id: 'm1', senderId: 'sitter', text: '您好！收到您的预订请求了。', time: '12:00', isMe: false },
      { id: 'm2', senderId: 'me', text: '您好林老师！我家两只猫需要从12月20日寄养到25日，可以吗？', time: '12:05', isMe: true },
      { id: 'm3', senderId: 'sitter', text: '完全没问题！请问猫咪的日常喂食和猫砂情况是怎样的？', time: '12:10', isMe: false },
      { id: 'm4', senderId: 'me', text: '胖虎每天早晚各喂半碗干粮，小橘自由采食。都用豆腐猫砂。', time: '12:15', isMe: true },
      { id: 'm5', senderId: 'sitter', text: '好的，我已经确认了您的预订！猫咪明天几点送过来？', time: '14:32', isMe: false },
    ],
  },
  {
    id: 'c2', sitterName: '张美玲', sitterAvatar: 'Z',
    lastMessage: '服务已完成，胖虎今天吃得很好！已发照片给您。',
    lastTime: '昨天', unread: 0, bookingId: 'b2',
    messages: [
      { id: 'm1', senderId: 'sitter', text: '上门完毕！胖虎今天很活跃，多吃了一点 😄', time: '10:30', isMe: false },
      { id: 'm2', senderId: 'me', text: '太好了！照片收到了，看起来很开心！', time: '11:00', isMe: true },
      { id: 'm3', senderId: 'sitter', text: '服务已完成，胖虎今天吃得很好！已发照片给您。', time: '18:45', isMe: false },
    ],
  },
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string>(INITIAL_CONVERSATIONS[0].id)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  // Mobile: show list (true) or chat (false)
  const [mobileShowList, setMobileShowList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeConv = conversations.find(c => c.id === activeId)!

  const filteredConvs = conversations.filter(c =>
    c.sitterName.includes(search) || c.lastMessage.includes(search)
  )

  // Auto-scroll to bottom within the messages container only (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [activeConv?.messages, activeId])

  // Clear unread on open
  useEffect(() => {
    setConversations(prev => prev.map(c =>
      c.id === activeId ? { ...c, unread: 0 } : c
    ))
  }, [activeId])

  const selectConversation = (id: string) => {
    setActiveId(id)
    setMobileShowList(false)
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const msg: Message = {
      id: `m${Date.now()}`,
      senderId: 'me',
      text: newMessage.trim(),
      time: timeStr,
      isMe: true,
    }
    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastTime: timeStr }
        : c
    ))
    setNewMessage('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="space-y-0">
      <h1 className="text-xl font-bold text-gray-900 mb-5">
        消息
        {totalUnread > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white text-xs rounded-full font-bold">
            {totalUnread}
          </span>
        )}
      </h1>

      <div className="card overflow-hidden" style={{ height: '68vh', minHeight: '500px' }}>
        <div className="flex h-full">

          {/* Conversation list — hidden on mobile when chat is open */}
          <div className={`
            border-r border-gray-100 flex flex-col flex-shrink-0
            w-full sm:w-64
            ${mobileShowList ? 'flex' : 'hidden sm:flex'}
          `}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-brand-300"
                  placeholder="搜索对话"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredConvs.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">没有匹配的对话</div>
              ) : (
                filteredConvs.map(conv => (
                  <button key={conv.id} onClick={() => selectConversation(conv.id)}
                    className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                      activeId === conv.id && !mobileShowList ? 'bg-brand-50' : ''
                    }`}>
                    <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative">
                      {conv.sitterAvatar}
                      {conv.unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                          {conv.sitterName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{conv.lastTime}</span>
                      </div>
                      <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area — hidden on mobile when list is showing */}
          <div className={`
            flex-1 flex flex-col min-w-0
            ${!mobileShowList ? 'flex' : 'hidden sm:flex'}
          `}>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              {/* Back button on mobile */}
              <button
                onClick={() => setMobileShowList(true)}
                className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {activeConv.sitterAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{activeConv.sitterName}</p>
                <p className="text-xs text-gray-400">铲屎官 · 预订 #{activeConv.bookingId}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toast('语音通话功能即将上线')} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <Phone size={16} />
                </button>
                <button onClick={() => toast('更多功能即将上线')} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConv.messages.map((msg, idx) => {
                const showTime = idx === 0 || activeConv.messages[idx - 1].isMe !== msg.isMe
                return (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isMe && showTime && (
                      <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mr-2 mt-auto">
                        {activeConv.sitterAvatar}
                      </div>
                    )}
                    {!msg.isMe && !showTime && <div className="w-7 mr-2 flex-shrink-0" />}
                    <div className={`max-w-[72%] sm:max-w-xs ${msg.isMe ? '' : ''}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.isMe
                          ? 'bg-brand-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      <p className={`text-[11px] mt-1 ${msg.isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 flex gap-2 items-center">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                placeholder="输入消息… (Enter 发送)"
                maxLength={500}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white hover:bg-brand-600 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
