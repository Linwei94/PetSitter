'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const STATUS_LABELS = {
  pending: { label: '待审核', class: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', class: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', class: 'bg-red-100 text-red-700' },
}

const MOCK_SUBMISSIONS = [
  { id: '1', name: '陈小明', status: 'pending', points: 110, date: '2026-03-17', docs: 3 },
  { id: '2', name: '王芳',   status: 'approved', points: 100, date: '2026-03-14', docs: 2 },
  { id: '3', name: '李雷',   status: 'rejected', points: 85,  date: '2026-03-10', docs: 2 },
  { id: '4', name: '张华',   status: 'pending', points: 135, date: '2026-03-16', docs: 4 },
  { id: '5', name: '刘洋',   status: 'approved', points: 110, date: '2026-03-12', docs: 3 },
]

export default function VerificationsPage() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS)

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        let query = supabase
          .from('id_verification_submissions')
          .select('id, status, total_points, created_at, documents, profiles(full_name)')
          .order('created_at', { ascending: false })

        if (filter !== 'all') query = query.eq('status', filter)

        const { data } = await query
        if (data) {
          setSubmissions(data.map((s: any) => ({
            id: s.id,
            name: s.profiles?.full_name || '未知用户',
            status: s.status,
            points: s.total_points,
            date: s.created_at?.slice(0, 10),
            docs: Array.isArray(s.documents) ? s.documents.length : 0,
          })))
        }
      } catch { /* use mock */ }
    }
    load()
  }, [filter])

  const filtered = submissions.filter(s =>
    (filter === 'all' || s.status === filter) && (!search || s.name.includes(search))
  )

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">身份认证审核</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}>
              {s === 'all' ? '全部' : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="搜索用户名"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="col-span-2">申请人</div>
          <div className="text-center">积分</div>
          <div className="text-center">状态</div>
          <div className="text-right">提交日期</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">暂无符合条件的申请</div>
        ) : (
          filtered.map(sub => (
            <Link key={sub.id} href={`/admin/verifications/${sub.id}`}
              className="grid grid-cols-5 items-center px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                  {sub.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{sub.name}</p>
                  <p className="text-xs text-gray-400">{sub.docs} 件证件</p>
                </div>
              </div>
              <div className="text-center font-bold text-brand-600">{sub.points}分</div>
              <div className="text-center">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_LABELS[sub.status as keyof typeof STATUS_LABELS].class)}>
                  {STATUS_LABELS[sub.status as keyof typeof STATUS_LABELS].label}
                </span>
              </div>
              <div className="text-right text-sm text-gray-500">{sub.date}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
