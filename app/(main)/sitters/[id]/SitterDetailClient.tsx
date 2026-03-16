'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Star, MapPin, CheckCircle2, Shield, Clock, Award, Heart,
  ChevronLeft, CalendarDays, MessageSquare, Share2, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

const SITTER_DATA: Record<string, any> = {
  '1': {
    id: '1',
    name: '林晓雨',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    title: '资深猫咪照护师',
    city: '上海',
    district: '静安区',
    rating: 4.98,
    reviewCount: 127,
    completedBookings: 186,
    yearsExp: 5,
    responseRate: 99,
    responseTime: '2小时内',
    priceBoarding: 120,
    priceFeeding: 60,
    additionalCatPrice: 40,
    services: ['cat_boarding', 'cat_home_feeding'],
    idVerified: true,
    backgroundChecked: true,
    homeType: '公寓',
    homeSize: '100㎡',
    hasOutdoorSpace: false,
    hasOwnPets: true,
    ownPetsDesc: '家中有2只已绝育的英短猫',
    hasChildren: false,
    maxCats: 3,
    bio: `我是一名热爱猫咪的资深铲屎官，有超过5年专职照顾猫咪的经验。曾在宠物医院担任助理2年，具备基础医疗知识，可以处理猫咪的日常健康问题。

我家环境温馨舒适，专门为寄养猫咪准备了独立的活动空间，配备了多个猫爬架、抓板和玩具。我深知每只猫咪的性格都不同，会根据猫咪的习性提供个性化照顾。

每天会发送至少5张照片和1条视频更新，让您出行无忧！`,
    includedServices: [
      '每日喂食和清水更换',
      '猫砂盆清洁（每日至少一次）',
      '每日至少5张照片更新',
      '玩耍和互动陪伴',
      '日常健康观察',
      '基本梳理',
    ],
    photos: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=400&fit=crop',
    ],
    reviews: [
      {
        id: '1', ownerName: '晨晨妈妈', ownerAvatar: 'C', rating: 5,
        date: '2024年11月', service: '猫咪寄养', petName: '晨晨',
        text: '太棒了！这是我第三次找林晓雨寄养了，每次都超满意。猫咪回来状态特别好，每天都收到很多照片，出差在外完全不担心。',
      },
      {
        id: '2', ownerName: '小饼干主人', ownerAvatar: '饼', rating: 5,
        date: '2024年10月', service: '猫咪寄养', petName: '小饼干',
        text: '小饼干比较认生，但是在林老师那里居然还挺开心的！每天发来的视频都能看到它玩玩具，真的很放心。',
      },
    ],
    tags: ['有自家猫', '兽医助理', '绝育推荐', '长期回头客'],
  },
  '2': {
    id: '2', name: '王建辉', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    title: '专职猫咪寄养 · 10年经验', city: '上海', district: '徐汇区',
    rating: 4.95, reviewCount: 89, completedBookings: 142, yearsExp: 10,
    responseRate: 97, responseTime: '1小时内', priceBoarding: 150, priceFeeding: undefined,
    additionalCatPrice: 50, services: ['cat_boarding'], idVerified: true, backgroundChecked: true,
    homeType: '别墅', homeSize: '180㎡', hasOutdoorSpace: true, hasOwnPets: false,
    hasChildren: false, maxCats: 4,
    bio: '专职猫咪照顾者，10年经验。家中有专门的猫咪活动室和阳台花园，猫咪可以晒太阳。安装了全屋监控，您可以随时查看。',
    includedServices: ['每日喂食', '猫砂清洁', '照片更新', '玩耍陪伴', '健康检查'],
    photos: ['https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&h=400&fit=crop'],
    reviews: [], tags: ['独立房间', '安防摄像', '节假日不涨价'],
  },
}

function getSitter(id: string) {
  return SITTER_DATA[id] || SITTER_DATA['1']
}

export default function SitterDetailClient({ id }: { id: string }) {
  const sitter = getSitter(id)
  const router = useRouter()

  const [activePhoto, setActivePhoto] = useState(0)
  const [selectedService, setSelectedService] = useState(sitter.services[0])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [numCats, setNumCats] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)

  const calculatePrice = () => {
    const price = selectedService === 'cat_boarding' ? sitter.priceBoarding : sitter.priceFeeding
    if (!price || !startDate || !endDate) return null
    const days = Math.max(1, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    if (selectedService === 'cat_boarding') {
      return Math.round(price * days + (numCats - 1) * sitter.additionalCatPrice * days)
    }
    return price
  }

  const handleBooking = () => {
    if (!startDate || !endDate) { toast.error('请选择服务日期'); return }
    router.push(`/booking/new?sitter=${sitter.id}&service=${selectedService}&start=${startDate}&end=${endDate}&cats=${numCats}`)
  }

  const price = calculatePrice()

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ChevronLeft size={16} /> 返回搜索
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-72 sm:h-96">
                <img src={sitter.photos[activePhoto]} alt="照片"
                  className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setIsFavorited(!isFavorited)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                      isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                    }`}>
                    <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-600">
                    <Share2 size={18} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full">
                  <Camera size={13} /> {activePhoto + 1}/{sitter.photos.length}
                </div>
              </div>
              <div className="flex gap-2 p-3 bg-gray-50">
                {sitter.photos.map((photo: string, i: number) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activePhoto === i ? 'border-brand-500' : 'border-transparent'
                    }`}>
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <img src={sitter.avatar} alt={sitter.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{sitter.name}</h1>
                    {sitter.idVerified && <CheckCircle2 size={20} className="text-teal-500" />}
                  </div>
                  <p className="text-gray-500 mb-3">{sitter.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {sitter.idVerified && (
                      <span className="badge bg-teal-50 text-teal-700"><Shield size={12} /> 实名认证</span>
                    )}
                    {sitter.backgroundChecked && (
                      <span className="badge bg-blue-50 text-blue-700"><Award size={12} /> 背景审核</span>
                    )}
                    <span className="badge bg-gray-100 text-gray-700">
                      <MapPin size={12} /> {sitter.city} · {sitter.district}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                {[
                  { val: sitter.rating, label: '平均评分' },
                  { val: sitter.reviewCount, label: '用户评价' },
                  { val: sitter.completedBookings, label: '完成预订' },
                  { val: `${sitter.yearsExp}年`, label: '照猫经验' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{s.val}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">关于我</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{sitter.bio}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">居住环境</h3>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p>🏠 {sitter.homeType} · {sitter.homeSize}</p>
                    <p>{sitter.hasOutdoorSpace ? '✅' : '❌'} 室外空间</p>
                    <p>{sitter.hasChildren ? '👶 有小孩' : '🚫 无小孩'}</p>
                    <p>{sitter.hasOwnPets ? `🐱 ${sitter.ownPetsDesc}` : '🚫 无自养宠物'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">可接受</h3>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p>🐱 最多同时 {sitter.maxCats} 只猫</p>
                    <p>✅ 幼猫 · ✅ 老年猫 · ✅ 特殊需求</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Included */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">服务包含</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {sitter.includedServices.map((s: string) => (
                  <div key={s} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">用户评价 ({sitter.reviewCount})</h2>
                <div className="flex items-center gap-2">
                  <Star size={18} className="star-filled" />
                  <span className="text-xl font-bold text-gray-900">{sitter.rating}</span>
                  <span className="text-gray-400">/ 5.0</span>
                </div>
              </div>
              <div className="space-y-5">
                {sitter.reviews.map((review: any) => (
                  <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {review.ownerAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.ownerName}</span>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={11} className="star-filled" />)}
                          </div>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{review.service} · 猫咪：{review.petName}</p>
                        <p className="text-sm text-gray-600">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">预订服务</h3>

                {/* Service */}
                <div className="mb-5">
                  <label className="label">选择服务</label>
                  <div className="space-y-2">
                    {sitter.services.includes('cat_boarding') && (
                      <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedService === 'cat_boarding' ? 'border-brand-400 bg-brand-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="service" value="cat_boarding"
                            checked={selectedService === 'cat_boarding'}
                            onChange={() => setSelectedService('cat_boarding')} className="accent-brand-500" />
                          <span className="text-sm font-medium">🏠 猫咪寄养</span>
                        </div>
                        <span className="text-sm font-bold text-brand-600">¥{sitter.priceBoarding}/晚</span>
                      </label>
                    )}
                    {sitter.services.includes('cat_home_feeding') && (
                      <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedService === 'cat_home_feeding' ? 'border-brand-400 bg-brand-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="service" value="cat_home_feeding"
                            checked={selectedService === 'cat_home_feeding'}
                            onChange={() => setSelectedService('cat_home_feeding')} className="accent-brand-500" />
                          <span className="text-sm font-medium">🚪 上门喂猫</span>
                        </div>
                        <span className="text-sm font-bold text-brand-600">¥{sitter.priceFeeding}/次</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="label text-xs">开始日期</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} className="input-field text-sm py-2.5" />
                  </div>
                  <div>
                    <label className="label text-xs">结束日期</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      min={startDate} className="input-field text-sm py-2.5" />
                  </div>
                </div>

                {/* Num cats */}
                <div className="mb-5">
                  <label className="label text-xs">猫咪数量</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setNumCats(Math.max(1, numCats - 1))}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-50">−</button>
                    <span className="w-8 text-center font-semibold">{numCats}</span>
                    <button onClick={() => setNumCats(Math.min(sitter.maxCats, numCats + 1))}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-50">+</button>
                    <span className="text-xs text-gray-400">最多{sitter.maxCats}只</span>
                  </div>
                  {numCats > 1 && <p className="text-xs text-gray-400 mt-1">每只额外猫咪 +¥{sitter.additionalCatPrice}/晚</p>}
                </div>

                {/* Price */}
                {price !== null && (
                  <div className="bg-brand-50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">预计费用</span>
                      <span className="font-bold text-brand-600 text-xl">¥{price}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">最终价格在确认预订时确定</p>
                  </div>
                )}

                <button onClick={handleBooking} className="btn-primary w-full py-3.5 text-base mb-3">
                  <CalendarDays size={18} /> 立即预订
                </button>
                <button className="btn-secondary w-full py-3 text-sm">
                  <MessageSquare size={16} /> 先发消息沟通
                </button>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={13} />
                  <span>通常{sitter.responseTime}内回复 · 响应率{sitter.responseRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
