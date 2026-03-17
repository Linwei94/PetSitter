import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:text-brand-700 mb-8 inline-block">← 返回首页</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">服务条款</h1>
        <p className="text-gray-400 text-sm mb-8">最后更新：2025年1月</p>
        <div className="card p-8 space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. 服务说明</h2>
            <p>喵管家是连接猫咪主人与专业铲屎官的平台。我们提供信息撮合服务，铲屎官为独立服务提供者。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. 用户责任</h2>
            <p>用户须提供真实准确的个人信息，妥善保管账户密码，并对账户下的所有活动负责。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. 预订与付款</h2>
            <p>预订确认后，付款将由平台托管。服务完成并经双方确认后，款项才会释放给铲屎官。取消政策详见预订页面说明。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. 免责声明</h2>
            <p>喵管家平台仅提供信息撮合服务。铲屎官为独立服务提供者，平台不对服务质量承担直接责任，但会协助处理纠纷。</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. 适用法律</h2>
            <p>本条款受澳大利亚新南威尔士州法律管辖。</p>
          </section>
        </div>
      </div>
    </div>
  )
}
