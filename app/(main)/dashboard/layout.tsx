'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, Heart, MessageSquare, Settings, ChevronRight, LogOut, Cat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings', label: '我的预订', icon: Calendar },
  { href: '/dashboard/pets', label: '我的猫咪', icon: Heart },
  { href: '/dashboard/messages', label: '消息', icon: MessageSquare },
  { href: '/dashboard/sitter', label: '铲屎官中心', icon: Cat },
  { href: '/dashboard/settings', label: '账户设置', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('用户')
  const [userEmail, setUserEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // Demo 模式：未连接 Supabase 时不跳转，直接展示演示界面
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) return
          router.push('/auth/login')
          return
        }
        setUserEmail(user.email || '')
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single() as { data: { full_name: string | null } | null, error: unknown }
        if (profile?.full_name) setUserName(profile.full_name)
      } catch {
        // Supabase 未配置时静默失败，保留演示数据
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 mb-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {userName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive(item)
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}>
                    <item.icon size={16} />
                    {item.label}
                    {isActive(item) && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                ))}
              </nav>
            </div>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={16} /> 退出登录
            </button>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
