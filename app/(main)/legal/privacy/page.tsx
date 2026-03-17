import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:text-brand-700 mb-8 inline-block">← 返回首页</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">隐私政策</h1>
        <p className="text-gray-400 text-sm mb-8">最后更新：2025年1月</p>
        <div className="card p-8 space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. 信息收集</h2>
            <p>我们收集您在注册、预订和使用服务过程中提供的信息，包括姓名、联系方式和宠物信息，用于提供和改善我们的服务。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. 信息使用</h2>
            <p>您的个人信息仅用于：匹配铲屎官服务、处理预订和付款、发送服务通知、改善平台体验。我们不会将您的信息出售给第三方。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. 信息安全</h2>
            <p>我们采用行业标准的安全措施保护您的个人信息，包括数据加密和访问控制。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Cookie 使用</h2>
            <p>我们使用 Cookie 来保持您的登录状态和改善用户体验。您可以在浏览器设置中管理 Cookie 偏好。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. 联系我们</h2>
            <p>如有隐私相关问题，请发送邮件至 help@miaoguanjia.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
