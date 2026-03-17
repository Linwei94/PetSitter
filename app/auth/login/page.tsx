'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? '邮箱或密码错误，请重试'
        : `登录失败: ${error.message}`
      )
    } else {
      toast.success('登录成功！')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🐱</div>
            <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
            <p className="text-gray-500 mt-1 text-sm">登录您的喵管家账户</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">邮箱地址</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">密码</label>
                <button type="button" onClick={() => toast('密码重置功能即将上线，请联系客服')} className="text-xs text-brand-600 hover:text-brand-700">
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="请输入密码"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">还没有账户？</span>
            </div>
          </div>

          <Link href="/auth/register"
            className="block w-full text-center py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors">
            免费注册账户
          </Link>

          <p className="text-xs text-gray-400 text-center mt-6">
            登录即表示同意{' '}
            <Link href="/legal/terms" className="text-gray-600 hover:text-brand-600">服务条款</Link>
            {' '}和{' '}
            <Link href="/legal/privacy" className="text-gray-600 hover:text-brand-600">隐私政策</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
