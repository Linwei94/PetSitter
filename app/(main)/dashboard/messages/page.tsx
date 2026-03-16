'use client'

import { useState } from 'react'
import { Send, Search } from 'lucide-react'

const MOCK_CONVERSATIONS = [
  {
    id: 'c1',
    sitterName: '林晓雨',
    sitterAvatar: 'L',
    lastMessage: '好的，我已经确认了您的预订！猫咪明天几点送过来？',
    lastTime: '14:32',
    unread: 2,
    bookingId: 'b1',
    messages: [
      { id: 'm1', senderId: 'sitter', text: '您好！收到您的预订请求了。', time: '12:00', isMe: false },
      { id: 'm2', senderId: 'me', text: '您好林老师！我家两只猫需要从12月20日寄养到25日，可以吗？', time: '12:05', isMe: true },
      { id: 'm3', senderId: 'sitter', text: '完全没问题！请问猫咪的日常喂食和猫砂情况是怎样的？', time: '12:10', isMe: false },
      { id: 'm4', senderId: 'me', text: '胖虎每天早晚各喂半碗干粮，小橘自由采食。都用豆腐猫砂。', time: '12:15', isMe: true },
      { id: 'm5', senderId: 'sitter', text: '好的，我已经确认了您的预订！猫咪明天几点送过来？', time: '14:32', isMe: false },
    ],
  },
  {
    id: 'c2',
    sitterName: '张美玲',
    sitterAvatar: 'Z',
    lastMessage: '服务已完成，胖虎今天吃得很好！已发照片给您。',
    lastTime: '昨天',
    unread: 0,
    bookingId: 'b2',
    messages: [
      { id: 'm1', senderId: 'sitter', text: '上门完毕！胖虎今天很活跃，多吃了一点 😄', time: '10:30', isMe: false },
      { id: 'm2', senderId: 'me', text: '太好了！照片收到了，看起来很开心！', time: '11:00', isMe: true },
      { id: 'm3', senderId: 'sitter', text: '服务已完成，胖虎今天吃得很好！已发照片给您。', time: '18:45', isMe: false },
    ],
  },
]

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0])
  const [newMessage, setNewMessage] = useState('')

  const sendMessage = () => {
    if (!newMessage.trim()) return
    // In production: call supabase to insert message
    setNewMessage('')
  }

  return (
    <div className="space-y-0">
      <h1 className="text-xl font-bold text-gray-900 mb-5">消息</h1>

      <div className="card overflow-hidden" style={{ height: '65vh', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-brand-300"
                  placeholder="搜索对话" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {MOCK_CONVERSATIONS.map(conv => (
                <button key={conv.id} onClick={() => setActiveConv(conv)}
                  className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                    activeConv.id === conv.id ? 'bg-brand-50' : ''
                  }`}>
                  <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {conv.sitterAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-sm text-gray-900">{conv.sitterName}</span>
                      <span className="text-xs text-gray-400">{conv.lastTime}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                      {conv.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {activeConv.sitterAvatar}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{activeConv.sitterName}</p>
                <p className="text-xs text-gray-400">铲屎官</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConv.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isMe
                      ? 'bg-brand-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="输入消息..."
              />
              <button onClick={sendMessage}
                className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white hover:bg-brand-600 transition-colors flex-shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
