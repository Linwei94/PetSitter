'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Heart, Star, MessageSquare, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MOCK_RECENT_BOOKINGS = [
  {
    id: 'b1', bookingNumber: 'BK20241201ABC',
    sitterName: '林晓雨', service: '猫咪寄养',
    startDate: '2024-12-20', endDate: '2024-12-25',
    status: 'confirmed', amount: 600, petNames: ['胖虎', '小橘'],
  },
  {
    id: 'b2', bookingNumber: 'BK20241115XYZ',
    sitterName: '张美玲', service: '上门喂猫',
    startDate: '2024-11-15', endDate: '2024-11-18',
    status: 'completed', amount: 150, petNames: ['胖虎'],
  },
]

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  active:    'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '待确认', confirmed: '已确认', active: '服务中', completed: '已完成', cancelled: '已取消',
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('用户')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (data?.full_name) setUserName(data.full_name)
    }
    load()
  }, [])

  const stats = [
    { label: '历史预订', value: '8次', icon: Calendar, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: '我的猫咪', value: '2只', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: '收到好评', value: '6条', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: '未读消息', value: '3条', icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-6 text-white">
        <p className="text-brand-100 text-sm mb-1">欢迎回来 👋</p>
        <h1 className="text-2xl font-bold">{userName}</h1>
        <p className="text-brand-100 mt-1 text-sm">您有 1 个即将到来的预订</p>
        <Link href="/dashboard/bookings"
          className="inline-flex items-center gap-1 mt-4 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          查看预订 <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/sitters?service=cat_boarding', icon: '🏠', label: '找寄养铲屎官' },
            { href: '/sitters?service=cat_home_feeding', icon: '🚪', label: '找上门铲屎官' },
            { href: '/dashboard/pets/add', icon: '🐱', label: '添加猫咪档案' },
            { href: '/dashboard/sitter', icon: '💼', label: '管理铲屎官档案' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-brand-200 hover:bg-brand-50 transition-colors text-center">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">近期预订</h2>
          <Link href="/dashboard/bookings" className="text-sm text-brand-600 hover:text-brand-700">
            查看全部 →
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_RECENT_BOOKINGS.map(b => (
            <Link key={b.id} href={`/dashboard/bookings/${b.id}`}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-bold flex-shrink-0">
                {b.service === '猫咪寄养' ? '🏠' : '🚪'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900">{b.sitterName}</p>
                  <span className={`badge text-xs ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {b.service} · {b.startDate} → {b.endDate} · {b.petNames.join('、')}
                </p>
              </div>
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">¥{b.amount}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
