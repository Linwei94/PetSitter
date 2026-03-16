import Link from 'next/link'
import { CheckCircle2, Star, Shield, Camera, Clock, Heart, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '猫咪寄养 - 找到最专业的猫咪保姆',
  description: '在喵管家找到附近最专业的猫咪寄养服务。认证铲屎官在自己家中提供温馨的照顾，全程照片更新，资金安全托管。',
}

const features = [
  { icon: Home, title: '温馨家庭环境', desc: '在铲屎官温馨的家中，猫咪享受比笼养更自由舒适的空间' },
  { icon: Camera, title: '每日照片更新', desc: '铲屎官每天发送至少5张照片，让您随时了解猫咪状态' },
  { icon: Shield, title: '认证保障', desc: '所有铲屎官经过实名认证和背景审核，安全可靠' },
  { icon: Heart, title: '个性化照顾', desc: '根据您猫咪的饮食习惯、性格特点提供定制化照顾' },
  { icon: Clock, title: '全天候关注', desc: '铲屎官全天在家，随时陪伴照顾您的猫咪' },
  { icon: Star, title: '真实评价', desc: '查看来自其他猫咪主人的真实评价，放心选择' },
]

const faqs = [
  {
    q: '猫咪寄养和猫咪酒店有什么区别？',
    a: '喵管家的寄养服务由真实家庭提供，猫咪可以在温馨的家庭环境中自由活动，而不是待在笼子里。铲屎官会和猫咪生活在同一空间，给予更多陪伴和关注。',
  },
  {
    q: '如何确保铲屎官的可靠性？',
    a: '所有铲屎官须经过实名认证、背景审核等多重审核。您还可以查看其他主人的评价和评分，并在预订前先与铲屎官聊天沟通。',
  },
  {
    q: '如果猫咪出现健康问题怎么办？',
    a: '铲屎官会立即联系您，并在必要时带猫咪就医（您授权后）。建议您在预订时提供紧急联系人和常用兽医信息。',
  },
  {
    q: '可以送猫去看一看环境吗？',
    a: '当然可以！我们建议在正式寄养前先进行一次"见面会"，让猫咪熟悉环境，您也可以当面了解铲屎官和住所情况。',
  },
  {
    q: '如果对服务不满意可以退款吗？',
    a: '我们有完善的退款政策。如果铲屎官未能按约定提供服务，或猫咪在寄养期间出现问题，您可以申请退款。具体条款请查看服务条款。',
  },
]

export default function CatBoardingPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand-50 to-orange-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-brand-700 shadow-sm mb-6">
            🏠 最受欢迎的服务
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            猫咪寄养
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            出门旅行时，让您的猫咪住在认证铲屎官温暖的家中，享受和在自己家一样的照顾
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sitters?service=cat_boarding" className="btn-primary px-8 py-4 text-lg">
              立即找铲屎官
            </Link>
            <Link href="/sitters/become" className="btn-secondary px-8 py-4 text-lg">
              提供寄养服务
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">起价 ¥80/晚 · 5,000+ 认证铲屎官</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">为什么选择喵管家寄养？</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <f.icon size={22} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">预订流程</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: '搜索附近铲屎官', desc: '输入您的城市，查看附近提供猫咪寄养服务的铲屎官，浏览他们的档案、照片和评价。' },
              { step: '02', title: '联系沟通', desc: '联系心仪的铲屎官，了解他们的居住环境和照顾方式，也可以安排线下见面会。' },
              { step: '03', title: '提交预订', desc: '填写猫咪信息，选择日期，提交预订。资金由平台托管，铲屎官确认后才扣款。' },
              { step: '04', title: '享受安心旅行', desc: '铲屎官每天发送照片和更新，您也可以随时发消息询问猫咪状态，彻底放心出行。' },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 pb-6 border-b border-gray-200 last:border-0">
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">常见问题</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="card p-5 group">
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between list-none">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform ml-4 flex-shrink-0">▼</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-500">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">开始为猫咪找合适的家</h2>
          <p className="text-brand-100 mb-8">数千位认证铲屎官等待为您的猫咪提供最贴心的照顾</p>
          <Link href="/sitters?service=cat_boarding" className="bg-white text-brand-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition-colors inline-block">
            立即搜索铲屎官
          </Link>
        </div>
      </section>
    </div>
  )
}
