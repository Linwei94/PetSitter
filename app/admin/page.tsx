'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Users, ShieldCheck, Clock, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const MOCK_STATS = { users: 128, sitters: 34, pending: 5, newThisMonth: 23 }
const MOCK_PENDING = [
  { id: '1', name: '陈小明', points: 110, date: '2026-03-17' },
  { id: '2', name: '王芳',   points: 100, date: '2026-03-16' },
  { id: '3', name: '李雷',   points: 135, date: '2026-03-15' },
]

export default function AdminDashboard() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [stats, setStats] = useState(MOCK_STATS)
  const [pending, setPending] = useState(MOCK_PENDING)

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        const [
          { count: users },
          { count: sitters },
          { count: pendingCount },
          { data: pendingSubs },
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('sitters').select('id', { count: 'exact', head: true }),
          supabase.from('id_verification_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('id_verification_submissions')
            .select('id, total_points, created_at, profiles(full_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const { count: newThisMonth } = await supabase
          .from('profiles').select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart)

        setStats({
          users: users || 0,
          sitters: sitters || 0,
          pending: pendingCount || 0,
          newThisMonth: newThisMonth || 0,
        })

        if (pendingSubs) {
          setPending(pendingSubs.map((s: any) => ({
            id: s.id,
            name: s.profiles?.full_name || '未知用户',
            points: s.total_points,
            date: s.created_at?.slice(0, 10),
          })))
        }
      } catch {
        // Use mock data on error
      }
    }
    load()
  }, [])

  const statCards = [
    { label: '总用户数', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: '铲屎官数', value: stats.sitters, icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
    { label: '待审核申请', value: stats.pending, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: '本月新增', value: stats.newThisMonth, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">仪表盘</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Pending verifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">待审核申请</h2>
          <Link href="/admin/verifications" className="text-sm text-brand-600 hover:text-brand-700">
            查看全部 →
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">暂无待审核申请</p>
        ) : (
          <div className="space-y-2">
            {pending.map(item => (
              <Link key={item.id} href={`/admin/verifications/${item.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                  {item.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
                <span className="text-sm font-bold text-brand-600">{item.points}分</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">待审核</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
