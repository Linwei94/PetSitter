import Link from 'next/link'

const ownerSteps = [
  {
    step: '01',
    icon: '🔍',
    title: '搜索铲屎官',
    desc: '输入城市和服务类型，浏览附近铲屎官。查看详细档案、评价和照片。',
  },
  {
    step: '02',
    icon: '💬',
    title: '联系沟通',
    desc: '与铲屎官在线聊天，了解服务详情，确认您的猫咪需求。',
  },
  {
    step: '03',
    icon: '📅',
    title: '提交预订',
    desc: '选择日期，填写猫咪信息，确认预订。资金由平台托管保障安全。',
  },
  {
    step: '04',
    icon: '📸',
    title: '全程安心',
    desc: '铲屎官每次服务后发送照片和更新，让您随时了解猫咪状态。',
  },
]

const sitterSteps = [
  {
    step: '01',
    icon: '📝',
    title: '创建档案',
    desc: '填写您的个人信息、居住环境和养猫经验，上传照片。',
  },
  {
    step: '02',
    icon: '✅',
    title: '通过认证',
    desc: '完成实名认证和背景审核，获得认证铲屎官标识。',
  },
  {
    step: '03',
    icon: '💰',
    title: '设置服务',
    desc: '选择提供的服务类型，设置价格和可接受的猫咪类型。',
  },
  {
    step: '04',
    icon: '🎉',
    title: '开始接单',
    desc: '接受预订请求，提供专业服务，建立好评口碑，增加收入。',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">如何使用</h2>
          <p className="section-subtitle">简单4步，轻松预订</p>
        </div>

        {/* Owner Flow */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🐱
            </div>
            <h3 className="text-xl font-bold text-gray-900">我是猫咪主人</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {ownerSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < ownerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-brand-100 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="bg-white rounded-2xl p-6 xl:p-7 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <div className="text-xs font-bold text-brand-400 mb-1">STEP {step.step}</div>
                  <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sitter Flow */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🏠
            </div>
            <h3 className="text-xl font-bold text-gray-900">我想成为铲屎官</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {sitterSteps.map((step) => (
              <div key={step.step} className="bg-white rounded-2xl p-6 xl:p-7 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="text-xs font-bold text-teal-500 mb-1">STEP {step.step}</div>
                <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/sitters/become"
              className="btn-teal inline-flex">
              立即成为铲屎官，开始赚钱 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
