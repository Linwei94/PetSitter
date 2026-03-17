const stats = [
  { value: '5,000+', label: '认证铲屎官', icon: '👤' },
  { value: '50,000+', label: '成功预订', icon: '📅' },
  { value: '4.9分', label: '平均好评', icon: '⭐' },
  { value: '30+', label: '覆盖城市', icon: '🌆' },
]

const reviews = [
  {
    name: '晨晨妈妈',
    avatar: 'C',
    rating: 5,
    date: '2024年11月',
    service: '猫咪寄养',
    text: '这是我第三次找林晓雨寄养了！猫咪回来状态特别好，还发现多吃了不少东西哈哈。每天都收到照片，出差在外完全不担心。',
  },
  {
    name: '胖橘的爸爸',
    avatar: '橘',
    rating: 5,
    date: '2024年10月',
    service: '上门喂猫',
    text: '王老师真的很专业！我家胖橘比较认生，但是几天下来就跟她混熟了。每次上门都拍很多照片，还帮猫整理了一下猫砂盆，太用心了！',
  },
  {
    name: '可可的主人',
    avatar: '可',
    rating: 5,
    date: '2024年12月',
    service: '猫咪寄养',
    text: '真的找到宝藏铲屎官了！可可是只需要特殊喂药的猫，张老师提前特别仔细地了解情况，整个寄养期间每天汇报，非常安心。',
  },
]

export default function TrustSection() {
  return (
    <>
      {/* Stats */}
      <section className="py-16 bg-brand-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-orange-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">主人们都说好</h2>
            <p className="section-subtitle">真实铲屎官，真实评价</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                  <span className="ml-2 text-xs text-gray-500">{review.date} · {review.service}</span>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-5 lg:max-w-sm">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">已验证预订</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            开始让猫咪得到最好的照顾
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            加入5万+信任我们的猫咪主人
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/sitters" className="bg-white text-teal-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition-colors">
              立即找铲屎官
            </a>
            <a href="/sitters/become" className="border-2 border-white text-white font-bold py-3.5 px-8 rounded-xl hover:bg-white/10 transition-colors">
              成为铲屎官
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
