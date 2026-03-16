'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Calendar, Star, DollarSign, CheckCircle2, AlertCircle,
  Plus, Edit2, ToggleLeft, ToggleRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const MOCK_SITTER_STATS = {
  totalEarnings: 3240,
  thisMonthEarnings: 840,
  completedBookings: 28,
  rating: 4.95,
  reviewCount: 23,
  responseRate: 98,
  pendingRequests: 2,
}

const MOCK_PENDING = [
  {
    id: 'r1', ownerName: '李小明', ownerAvatar: '李',
    service: '猫咪寄养', petName: '橘橘',
    startDate: '2024-12-22', endDate: '2024-12-28', nights: 6,
    amount: 720, requestedAt: '30分钟前',
  },
  {
    id: 'r2', ownerName: '王芳', ownerAvatar: '王',
    service: '上门喂猫', petName: '雪球',
    startDate: '2024-12-20', endDate: '2024-12-23', nights: 3,
    amount: 180, requestedAt: '2小时前',
  },
]

export default function SitterDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [hasSitterProfile, setHasSitterProfile] = useState<boolean | null>(null)
  const [services, setServices] = useState([
    { type: 'cat_boarding', label: '猫咪寄养', price: 120, isActive: true, icon: '🏠' },
    { type: 'cat_home_feeding', label: '上门喂猫', price: 60, isActive: true, icon: '🚪' },
  ])

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // Demo 模式：未登录时直接展示"成为铲屎官"界面
          setHasSitterProfile(false)
          return
        }
        const { data } = await supabase.from('sitters').select('id').eq('user_id', user.id).single()
        setHasSitterProfile(!!data)
      } catch {
        setHasSitterProfile(false)
      }
    }
    check()
  }, [])

  const toggleService = (type: string) => {
    setServices(prev => prev.map(s =>
      s.type === type ? { ...s, isActive: !s.isActive } : s
    ))
    toast.success('服务状态已更新')
  }

  const handleRequest = (id: string, action: 'accept' | 'decline') => {
    toast.success(action === 'accept' ? '已确认预订！' : '已拒绝预订')
  }

  if (hasSitterProfile === null) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>
  }

  if (!hasSitterProfile) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-gray-900">铲屎官中心</h1>
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">成为专业铲屎官，开始赚钱</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            加入5000+认证铲屎官行列，用您的爱猫经验帮助更多猫咪主人，同时增加收入。
            平均铲屎官月收入 A$2,000+。
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '📝', title: '创建档案', desc: '填写您的信息和经验' },
              { icon: '✅', title: '完成认证', desc: '实名认证和背景审核' },
              { icon: '🎉', title: '开始接单', desc: '设置价格，接受预订' },
            ].map(s => (
              <div key={s.title} className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="font-semibold text-sm text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/sitters/become" className="btn-teal inline-flex px-8 py-3.5">
            立即申请成为铲屎官
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">铲屎官中心</h1>
        <Link href="/sitters/1" className="text-sm text-brand-600 hover:text-brand-700">
          查看我的主页 →
        </Link>
      </div>

      {/* Pending requests alert */}
      {MOCK_PENDING.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm font-medium text-yellow-800">
            您有 <strong>{MOCK_PENDING.length}</strong> 个待确认的预订请求，请尽快处理！
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '本月收入', value: `A$${MOCK_SITTER_STATS.thisMonthEarnings}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '完成订单', value: `${MOCK_SITTER_STATS.completedBookings}次`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '平均评分', value: MOCK_SITTER_STATS.rating.toString(), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: '响应率', value: `${MOCK_SITTER_STATS.responseRate}%`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
        ].map(s => (
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

      {/* Pending booking requests */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">待确认预订 ({MOCK_PENDING.length})</h2>
        {MOCK_PENDING.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">暂无待确认的预订</p>
        ) : (
          <div className="space-y-4">
            {MOCK_PENDING.map(req => (
              <div key={req.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {req.ownerAvatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{req.ownerName}</p>
                    <p className="text-sm text-gray-500">
                      {req.service} · {req.petName} · {req.startDate} → {req.endDate} ({req.nights}晚)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">A${req.amount}</p>
                    <p className="text-xs text-gray-400">{req.requestedAt}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRequest(req.id, 'accept')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors">
                    <CheckCircle2 size={15} /> 确认接单
                  </button>
                  <button onClick={() => handleRequest(req.id, 'decline')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                    婉拒
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service management */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">我的服务</h2>
          <Link href="/dashboard/sitter/edit" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <Edit2 size={14} /> 编辑档案
          </Link>
        </div>
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.type} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{s.label}</p>
                <p className="text-sm text-gray-500">A${s.price}{s.type === 'cat_boarding' ? '/晚' : '/次'}</p>
              </div>
              <button onClick={() => toggleService(s.type)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  s.isActive
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {s.isActive
                  ? <><ToggleRight size={16} /> 接单中</>
                  : <><ToggleLeft size={16} /> 已暂停</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings overview */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">收入概览</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-700 mb-1">累计收入</p>
            <p className="text-3xl font-bold text-green-800">A${MOCK_SITTER_STATS.totalEarnings}</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-4">
            <p className="text-sm text-brand-700 mb-1">本月收入</p>
            <p className="text-3xl font-bold text-brand-800">A${MOCK_SITTER_STATS.thisMonthEarnings}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">平台手续费10%已扣除，收入在服务完成后7个工作日内到账</p>
      </div>
    </div>
  )
}
