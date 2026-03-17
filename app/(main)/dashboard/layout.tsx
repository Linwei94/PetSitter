'use client'

import { useState, useEffect, useRef } from 'react'
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

// Bottom nav shows a subset (most used items)
const bottomNavItems = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings', label: '预订', icon: Calendar },
  { href: '/dashboard/messages', label: '消息', icon: MessageSquare },
  { href: '/dashboard/pets', label: '猫咪', icon: Heart },
  { href: '/dashboard/settings', label: '设置', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('用户')
  const [userEmail, setUserEmail] = useState('')
  const [unreadMessages, setUnreadMessages] = useState(2)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar — desktop only */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="card p-5 mb-4 sticky top-20">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {userName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail || '演示账户'}</p>
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
                    {item.href === '/dashboard/messages' && unreadMessages > 0 && (
                      <span className="ml-auto w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {unreadMessages}
                      </span>
                    )}
                    {isActive(item) && item.href !== '/dashboard/messages' && (
                      <ChevronRight size={14} className="ml-auto" />
                    )}
                  </Link>
                ))}
              </nav>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-3 pt-3 border-t border-gray-100">
                <LogOut size={16} /> 退出登录
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {bottomNavItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors relative',
                  active ? 'text-brand-600' : 'text-gray-400'
                )}>
                <div className="relative">
                  <item.icon size={20} />
                  {item.href === '/dashboard/messages' && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                      {unreadMessages}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-8 h-0.5 bg-brand-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
