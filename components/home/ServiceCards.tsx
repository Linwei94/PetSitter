import Link from 'next/link'
import { ArrowRight, Home, Building } from 'lucide-react'

const services = [
  {
    id: 'cat_boarding',
    href: '/services/cat-boarding',
    icon: '🏠',
    title: '猫咪寄养',
    subtitle: '在铲屎官家中',
    description: '送猫咪去认证铲屎官家中居住，享受温馨家庭环境，全天候照顾。',
    features: ['铲屎官家中环境', '全天照顾陪伴', '每日照片更新', '最多2只同住'],
    priceFrom: 80,
    color: 'from-orange-400 to-brand-500',
    bgLight: 'bg-brand-50',
    textColor: 'text-brand-700',
    borderColor: 'border-brand-100',
    popular: true,
  },
  {
    id: 'cat_home_feeding',
    href: '/services/cat-feeding',
    icon: '🚪',
    title: '上门喂猫',
    subtitle: '铲屎官来您家',
    description: '铲屎官上门到您家中喂食、铲屎，让猫咪在熟悉环境中待着最放心。',
    features: ['猫咪不离开家', '按需上门次数', '每次拍照打卡', '可喂药护理'],
    priceFrom: 50,
    color: 'from-teal-400 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-100',
    popular: false,
  },
]

export default function ServiceCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">两大专业服务</h2>
          <p className="section-subtitle">根据您和猫咪的需求选择最合适的方式</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 xl:gap-16 max-w-5xl lg:max-w-6xl mx-auto">
          {services.map((service) => (
            <Link key={service.id} href={service.href} className="group block">
              <div className={`card h-full border-2 ${service.borderColor} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}>
                {/* Header */}
                <div className={`bg-gradient-to-r ${service.color} p-8 relative overflow-hidden`}>
                  {service.popular && (
                    <div className="absolute top-4 right-4 bg-white text-brand-600 text-xs font-bold px-3 py-1 rounded-full">
                      最受欢迎
                    </div>
                  )}
                  <div className="text-6xl mb-3">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                  <p className="text-white/80 mt-1">{service.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-xs">✓</span>
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">起价</span>
                      <div className={`text-2xl font-bold ${service.textColor}`}>
                        A${service.priceFrom}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          {service.id === 'cat_boarding' ? '/晚' : '/次'}
                        </span>
                      </div>
                    </div>
                    <div className={`${service.bgLight} ${service.textColor} font-medium text-sm px-4 py-2 rounded-xl group-hover:pr-6 transition-all duration-200 flex items-center gap-1`}>
                      立即查找
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Future services teaser */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4">
            <span className="text-2xl">🐕</span>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">狗狗服务即将上线</p>
              <p className="text-xs text-gray-500">敬请期待 · 狗狗寄养 · 上门遛狗</p>
            </div>
            <div className="bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1 rounded-full">
              即将推出
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
