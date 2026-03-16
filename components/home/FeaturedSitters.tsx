import Link from 'next/link'
import { Star, MapPin, Shield, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

// 示例铲屎官数据（实际从 Supabase 获取）
const MOCK_SITTERS = [
  {
    id: '1',
    name: '林晓雨',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: '资深猫咪照护师',
    city: '悉尼',
    district: 'Chatswood',
    rating: 4.98,
    reviewCount: 127,
    completedBookings: 186,
    yearsExp: 5,
    priceBoarding: 60,
    priceFeeding: 30,
    services: ['cat_boarding', 'cat_home_feeding'],
    tags: ['有自家猫', '兽医助理', '绝育推荐'],
    photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: '王建辉',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    title: '专职猫咪寄养·10年经验',
    city: '悉尼',
    district: 'Hurstville',
    rating: 4.95,
    reviewCount: 89,
    completedBookings: 142,
    yearsExp: 10,
    priceBoarding: 75,
    priceFeeding: 35,
    services: ['cat_boarding'],
    tags: ['独立房间', '安防摄像', '节假日不涨价'],
    photo: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: '张美玲',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    title: '上门喂猫 · 猫咪爱好者',
    city: '悉尼',
    district: 'Burwood',
    rating: 5.0,
    reviewCount: 64,
    completedBookings: 98,
    yearsExp: 3,
    priceBoarding: 50,
    priceFeeding: 25,
    services: ['cat_boarding', 'cat_home_feeding'],
    tags: ['每天视频', '可喂药', '宠物学专业'],
    photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=300&fit=crop',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
        />
      ))}
    </div>
  )
}

export default function FeaturedSitters() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="section-title">精选铲屎官</h2>
            <p className="section-subtitle">平台评分最高、口碑最佳的铲屎官</p>
          </div>
          <Link href="/sitters" className="text-brand-600 font-medium text-sm hover:text-brand-700 flex items-center gap-1">
            查看全部 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_SITTERS.map((sitter) => (
            <Link key={sitter.id} href={`/sitters/${sitter.id}`} className="group card-hover">
              {/* Cover photo */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={sitter.photo}
                  alt={`${sitter.name}的照片`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Service badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {sitter.services.includes('cat_boarding') && (
                    <span className="badge bg-white/90 text-gray-700 shadow-sm text-xs">🏠 寄养</span>
                  )}
                  {sitter.services.includes('cat_home_feeding') && (
                    <span className="badge bg-white/90 text-gray-700 shadow-sm text-xs">🚪 上门</span>
                  )}
                </div>
              </div>

              {/* Sitter info */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={sitter.avatar}
                    alt={sitter.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900">{sitter.name}</h3>
                      <CheckCircle2 size={15} className="text-teal-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-500 truncate">{sitter.title}</p>
                  </div>
                </div>

                {/* Rating & location */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StarRating rating={sitter.rating} />
                    <span className="text-sm font-semibold text-gray-900">{sitter.rating}</span>
                    <span className="text-sm text-gray-400">({sitter.reviewCount}条评价)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin size={12} />
                  <span>{sitter.city} · {sitter.district}</span>
                  <span className="mx-1">·</span>
                  <span>{sitter.yearsExp}年经验</span>
                  <span className="mx-1">·</span>
                  <span>{sitter.completedBookings}次完成</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {sitter.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-600 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex gap-4">
                    {sitter.services.includes('cat_boarding') && (
                      <div>
                        <p className="text-xs text-gray-400">寄养</p>
                        <p className="font-bold text-gray-900">¥{sitter.priceBoarding}<span className="text-xs font-normal text-gray-500">/晚</span></p>
                      </div>
                    )}
                    {sitter.services.includes('cat_home_feeding') && (
                      <div>
                        <p className="text-xs text-gray-400">上门</p>
                        <p className="font-bold text-gray-900">¥{sitter.priceFeeding}<span className="text-xs font-normal text-gray-500">/次</span></p>
                      </div>
                    )}
                  </div>
                  <div className="text-brand-600 text-sm font-medium group-hover:text-brand-700">
                    查看详情 →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
