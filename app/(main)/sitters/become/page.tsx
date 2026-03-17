'use client'

import Link from 'next/link'

export default function BecomeSitterPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="card p-8 text-center space-y-6">
          <div className="text-5xl">🐾</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">成为喵管家认证铲屎官</h1>
            <p className="text-gray-500 text-sm">加入我们，与更多猫咪建立连接</p>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-xl">
              <span className="text-xl">🕐</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">自定义工作时间</p>
                <p className="text-xs text-gray-500">按自己的节奏接单，灵活安排工作日程</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">额外收入</p>
                <p className="text-xs text-gray-500">做自己热爱的事，同时获得可观的额外收入</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl">
              <span className="text-xl">🐱</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">与猫咪相处</p>
                <p className="text-xs text-gray-500">每天与可爱的猫咪互动，充满治愈感</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/auth/register" className="btn-primary block w-full text-center py-3 text-sm">
              立即注册
            </Link>
            <p className="text-sm text-gray-500">
              已有账户？{' '}
              <Link href="/auth/login" className="text-brand-600 hover:underline font-medium">
                登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
