'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, CheckCircle2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: '强度：弱', color: 'bg-red-400' }
  if (score === 2) return { score, label: '强度：一般', color: 'bg-yellow-400' }
  if (score === 3) return { score, label: '强度：良好', color: 'bg-blue-400' }
  return { score, label: '强度：强', color: 'bg-green-500' }
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const router = useRouter()
  const supabase = createClient()

  const update = (key: string, value: string | boolean) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  const strength = getPasswordStrength(formData.password)

  const pwdRules = [
    { label: '至少8位字符', ok: formData.password.length >= 8 },
    { label: '包含大写字母 (A-Z)', ok: /[A-Z]/.test(formData.password) },
    { label: '包含数字 (0-9)', ok: /[0-9]/.test(formData.password) },
  ]

  const validateForm = () => {
    if (!formData.fullName.trim()) return '请输入您的姓名'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return '请输入有效的邮箱地址'
    if (formData.password.length < 8) return '密码至少需要8位字符'
    if (!/[A-Z]/.test(formData.password)) return '密码必须包含至少一个大写字母'
    if (!/[0-9]/.test(formData.password)) return '密码必须包含至少一个数字'
    if (formData.password !== formData.confirmPassword) return '两次输入的密码不一致'
    if (!formData.agreeTerms) return '请同意服务条款和隐私政策'
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateForm()
    if (err) { toast.error(err); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message === 'User already registered'
        ? '该邮箱已注册，请直接登录'
        : `注册失败: ${error.message}`
      )
    } else {
      setStep('verify')
    }
    setLoading(false)
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">请验证您的邮箱</h2>
          <p className="text-gray-500 mb-6">
            我们已向 <strong className="text-gray-700">{formData.email}</strong> 发送了验证邮件。
            <br />请点击邮件中的链接完成注册。
          </p>
          <div className="bg-brand-50 rounded-xl p-4 text-sm text-gray-600 mb-6">
            <p className="font-medium text-gray-800 mb-1">没收到邮件？</p>
            <p>请检查垃圾邮件文件夹，或等待几分钟后再试。</p>
          </div>
          <Link href="/auth/login" className="btn-primary w-full inline-block text-center py-3.5">
            前往登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🐾</div>
            <h1 className="text-2xl font-bold text-gray-900">创建账户</h1>
            <p className="text-gray-500 mt-1 text-sm">加入喵管家，找到最好的猫咪保姆</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">姓名</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  className="input-field pl-11"
                  placeholder="您的姓名"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">邮箱地址</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => update('email', e.target.value)}
                  className="input-field pl-11"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                手机号码 <span className="text-gray-400 font-normal">(选填)</span>
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="input-field pl-11"
                  placeholder="04XX XXX XXX"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="至少8位，含大写字母和数字"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bar */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strength.score <= 1 ? 'text-red-500' :
                      strength.score === 2 ? 'text-yellow-600' :
                      strength.score === 3 ? 'text-blue-600' : 'text-green-600'
                    }`}>{strength.label}</span>
                  </div>
                  <div className="space-y-1">
                    {pwdRules.map(rule => (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        {rule.ok
                          ? <Check size={12} className="text-green-500 flex-shrink-0" />
                          : <X size={12} className="text-gray-300 flex-shrink-0" />}
                        <span className={`text-xs ${rule.ok ? 'text-green-600' : 'text-gray-400'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">确认密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  className={`input-field pl-11 pr-11 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:ring-red-400'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 focus:ring-green-400'
                      : ''
                  }`}
                  placeholder="再次输入密码"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <X size={12} /> 两次密码不一致
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <Check size={12} /> 密码一致
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={e => update('agreeTerms', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-500"
              />
              <span className="text-sm text-gray-600">
                我已阅读并同意{' '}
                <Link href="/legal/terms" className="text-brand-600 hover:underline">服务条款</Link>
                {' '}和{' '}
                <Link href="/legal/privacy" className="text-brand-600 hover:underline">隐私政策</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '注册中...' : '创建账户'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">已有账户？</span>
            </div>
          </div>

          <Link href="/auth/login"
            className="block w-full text-center py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors">
            直接登录
          </Link>
        </div>
      </div>
    </div>
  )
}
