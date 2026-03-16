import Link from 'next/link'
import { Camera, Clock, Shield, MapPin, CheckCircle2, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '上门喂猫 - 铲屎官上门服务',
  description: '喵管家上门喂猫服务，让您的猫咪留在熟悉的家中，由专业认证铲屎官上门喂食、铲猫砂、拍照更新。',
}

const features = [
  { icon: Heart, title: '猫咪不离家', desc: '猫咪在自己熟悉的环境中生活，减少应激反应，更健康舒适' },
  { icon: Camera, title: '每次拍照打卡', desc: '铲屎官每次上门后发送照片，您随时知道猫咪的状态' },
  { icon: Clock, title: '灵活时间安排', desc: '每天1次或2次上门，每次30-60分钟，按需选择' },
  { icon: Shield, title: '保险保障', desc: '平台为每次服务提供保险保障，意外情况有据可查' },
  { icon: MapPin, title: '附近铲屎官', desc: '匹配您附近的铲屎官，上门方便快捷，响应及时' },
  { icon: CheckCircle2, title: '可喂药护理', desc: '需要定期喂药的猫咪也可以得到专业的照顾' },
]

export default function CatFeedingPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-r from-teal-50 to-cyan-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-teal-700 shadow-sm mb-6">
            🚪 猫咪不离家的最佳选择
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            上门喂猫服务
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            铲屎官登门拜访，在您猫咪最熟悉的家中提供喂食、清洁和陪伴服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sitters?service=cat_home_feeding" className="btn-teal px-8 py-4 text-lg">
              立即预约上门服务
            </Link>
            <Link href="/sitters/become" className="btn-secondary px-8 py-4 text-lg border-teal-500 text-teal-700 hover:bg-teal-50">
              提供上门喂猫
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">起价 A$50/次 · 含30分钟陪伴</p>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">每次上门包含</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              '🥣 按您的要求喂食和换水',
              '🪣 清理猫砂盆',
              '📸 拍照上传，实时汇报',
              '🧸 玩耍和互动陪伴（30分钟）',
              '👁 观察猫咪健康状况',
              '💊 按需喂药（需提前说明）',
              '🪴 简单照顾室内植物（可选）',
              '📬 取信/收快递（可选）',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl">
                <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">上门喂猫的优势</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <f.icon size={22} className="text-teal-600" />
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

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">简单透明的定价</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card p-6 border-2 border-teal-200">
              <div className="text-3xl mb-3">🌅</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">每天1次上门</h3>
              <p className="text-3xl font-bold text-teal-700 mb-4">A$50<span className="text-base font-normal text-gray-500">/次起</span></p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-teal-500" /> 约30-45分钟服务</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-teal-500" /> 喂食 + 换水 + 铲砂</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-teal-500" /> 照片汇报</li>
              </ul>
            </div>
            <div className="card p-6 border-2 border-brand-400 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">推荐</div>
              <div className="text-3xl mb-3">🌅🌇</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">每天2次上门</h3>
              <p className="text-3xl font-bold text-brand-700 mb-4">A$90<span className="text-base font-normal text-gray-500">/天起</span></p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-500" /> 早晚各一次</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-500" /> 更多陪伴时间</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-500" /> 适合幼猫/老年猫</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">具体价格由铲屎官设定，以上为参考价格</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">找到您家附近的铲屎官</h2>
          <p className="text-teal-100 mb-8">猫咪安心留在家，您放心出门</p>
          <Link href="/sitters?service=cat_home_feeding"
            className="bg-white text-teal-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition-colors inline-block">
            立即预约上门喂猫
          </Link>
        </div>
      </section>
    </div>
  )
}
