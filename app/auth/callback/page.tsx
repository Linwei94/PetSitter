'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setStatus('error')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-600">正在验证您的邮箱...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">邮箱验证成功！</h2>
            <p className="text-gray-500 text-sm">正在跳转到您的主页...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">验证链接已过期</h2>
            <p className="text-gray-500 text-sm mb-6">请重新注册或联系客服</p>
            <a href="/auth/register" className="btn-primary px-6 py-2.5 text-sm">重新注册</a>
          </>
        )}
      </div>
    </div>
  )
}
