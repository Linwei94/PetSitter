'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ShieldCheck, Users, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard, exact: true },
  { href: '/admin/verifications', label: '认证审核', icon: ShieldCheck },
  { href: '/admin/users', label: '用户管理', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminName, setAdminName] = useState('管理员')
  const [pendingCount, setPendingCount] = useState(0)
  const [checking, setChecking] = useState(!IS_DEMO)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  useEffect(() => {
    if (IS_DEMO) { setChecking(false); return }
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_admin')
          .eq('id', user.id)
          .single()

        if (!profile?.is_admin) { router.push('/'); return }

        if (profile.full_name) setAdminName(profile.full_name)

        // Load pending count
        const { count } = await supabase
          .from('id_verification_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        setPendingCount(count || 0)
      } catch {
        // Supabase error: allow in demo
      } finally {
        setChecking(false)
      }
    }
    checkAdmin()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">验证管理员身份...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-gray-900 text-white h-12 flex items-center px-4 gap-4">
        <span className="font-bold text-sm text-white/90">🐾 喵管家管理后台</span>
        <span className="text-white/30 text-xs ml-auto">管理员：{adminName}</span>
        {IS_DEMO && (
          <span className="bg-yellow-500 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded">演示模式</span>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3rem)] p-4 flex flex-col">
          <nav className="space-y-1 flex-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive(item)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}>
                <item.icon size={16} />
                {item.label}
                {item.href === '/admin/verifications' && pendingCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
                {isActive(item) && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 pt-3">
            <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mb-2 px-3">
              ← 返回前台
            </Link>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={14} /> 退出登录
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
