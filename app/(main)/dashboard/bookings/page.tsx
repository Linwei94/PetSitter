'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Star, MessageSquare, RefreshCw } from 'lucide-react'

const MOCK_BOOKINGS = [
  {
    id: 'b1', bookingNumber: 'BK20241201ABC',
    sitterName: '林晓雨', sitterAvatar: 'L',
    service: 'cat_boarding', serviceLabel: '猫咪寄养',
    startDate: '2024-12-20', endDate: '2024-12-25',
    status: 'confirmed', amount: 600, platformFee: 60,
    petNames: ['胖虎', '小橘'], nights: 5,
    reviewed: false,
  },
  {
    id: 'b2', bookingNumber: 'BK20241115XYZ',
    sitterName: '张美玲', sitterAvatar: 'Z',
    service: 'cat_home_feeding', serviceLabel: '上门喂猫',
    startDate: '2024-11-15', endDate: '2024-11-18',
    status: 'completed', amount: 150, platformFee: 15,
    petNames: ['胖虎'], nights: 3,
    reviewed: true,
  },
  {
    id: 'b3', bookingNumber: 'BK20241020DEF',
    sitterName: '王建辉', sitterAvatar: 'W',
    service: 'cat_boarding', serviceLabel: '猫咪寄养',
    startDate: '2024-10-01', endDate: '2024-10-07',
    status: 'completed', amount: 900, platformFee: 90,
    petNames: ['胖虎'], nights: 6,
    reviewed: true,
  },
  {
    id: 'b4', bookingNumber: 'BK20241205GHI',
    sitterName: '陈思远', sitterAvatar: 'C',
    service: 'cat_boarding', serviceLabel: '猫咪寄养',
    startDate: '2024-12-05', endDate: '2024-12-08',
    status: 'cancelled', amount: 300, platformFee: 0,
    petNames: ['小橘'], nights: 3,
    reviewed: false,
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

function BookingsList() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const [filter, setFilter] = useState('all')

  const filtered = MOCK_BOOKINGS.filter(b => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return ['pending','confirmed','active'].includes(b.status)
    if (filter === 'completed') return b.status === 'completed'
    if (filter === 'cancelled') return b.status === 'cancelled'
    return true
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">我的预订</h1>
        <Link href="/sitters" className="btn-primary text-sm py-2 px-4">
          + 新预订
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-green-800">预订请求已发送！</p>
            <p className="text-sm text-green-600">等待铲屎官确认，确认后您将收到通知。</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: '全部' },
          { value: 'upcoming', label: '即将到来' },
          { value: 'completed', label: '已完成' },
          { value: 'cancelled', label: '已取消' },
        ].map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-brand-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-semibold text-gray-900 mb-2">暂无预订记录</h3>
          <p className="text-gray-500 text-sm mb-4">开始为您的猫咪找一位专业铲屎官吧！</p>
          <Link href="/sitters" className="btn-primary text-sm py-2 px-5">找铲屎官</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {b.sitterAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{b.sitterName}</h3>
                    <span className={`badge text-xs ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    <span className="text-xs text-gray-400 font-mono">{b.bookingNumber}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {b.serviceLabel} · {b.startDate} → {b.endDate} ({b.nights}晚)
                  </p>
                  <p className="text-sm text-gray-500">
                    猫咪：{b.petNames.join('、')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg text-gray-900">A${b.amount}</p>
                  <p className="text-xs text-gray-400">含服务费 A${b.platformFee}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {b.status === 'completed' && !b.reviewed && (
                  <button className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Star size={14} /> 写评价
                  </button>
                )}
                {['confirmed', 'active'].includes(b.status) && (
                  <Link href={`/dashboard/messages`}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                    <MessageSquare size={14} /> 联系铲屎官
                  </Link>
                )}
                {b.status === 'completed' && (
                  <Link href={`/sitters/1`}
                    className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                    <RefreshCw size={14} /> 再次预订
                  </Link>
                )}
                {b.status === 'pending' && (
                  <button className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                    取消预订
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-8 text-center">加载中...</div>}>
      <BookingsList />
    </Suspense>
  )
}
