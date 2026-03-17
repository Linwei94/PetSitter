'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, ShieldCheck, Cat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const MOCK_USERS = [
  { id: '1', name: '林晓雨', isSitter: true, isAdmin: false, joinDate: '2025-10-01' },
  { id: '2', name: '王建辉', isSitter: true, isAdmin: false, joinDate: '2025-11-15' },
  { id: '3', name: '张美玲', isSitter: false, isAdmin: false, joinDate: '2025-12-01' },
  { id: '4', name: '管理员', isSitter: false, isAdmin: true, joinDate: '2025-09-01' },
  { id: '5', name: '陈思远', isSitter: true, isAdmin: false, joinDate: '2026-01-10' },
]

export default function AdminUsersPage() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [users, setUsers] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, is_sitter, is_admin, created_at')
          .order('created_at', { ascending: false })
          .limit(100)

        if (data) {
          setUsers(data.map((p: any) => ({
            id: p.id,
            name: p.full_name || '未命名',
            isSitter: p.is_sitter || false,
            isAdmin: p.is_admin || false,
            joinDate: p.created_at?.slice(0, 10),
          })))
        }
      } catch { /* use mock */ }
    }
    load()
  }, [])

  const filtered = users.filter(u =>
    !search || u.name.includes(search)
  )

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">用户管理</h1>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="搜索用户名"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="col-span-1">用户</div>
          <div className="text-center">角色</div>
          <div className="text-right">注册日期</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">没有找到用户</div>
        ) : (
          filtered.map(user => (
            <div key={user.id} className="grid grid-cols-3 items-center px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                  {user.name[0]}
                </div>
                <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {user.isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck size={10} /> 管理员
                  </span>
                )}
                {user.isSitter && (
                  <span className="flex items-center gap-1 text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                    <Cat size={10} /> 铲屎官
                  </span>
                )}
                {!user.isAdmin && !user.isSitter && (
                  <span className="text-xs text-gray-400">普通用户</span>
                )}
              </div>
              <div className="text-right text-sm text-gray-400">{user.joinDate}</div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        共 {filtered.length} 位用户
      </p>
    </div>
  )
}
