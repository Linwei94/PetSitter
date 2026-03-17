'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, MapPin, Search, X, ChevronDown } from 'lucide-react'
import SitterCard from '@/components/sitters/SitterCard'
import { SYDNEY_SUBURBS } from '@/lib/utils'

// Mock data for demonstration
const ALL_SITTERS = [
  {
    id: '1',
    name: '林晓雨',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: '资深猫咪照护师 · 5年经验',
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
    coverPhoto: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=350&fit=crop',
    idVerified: true,
    backgroundChecked: true,
  },
  {
    id: '2',
    name: '王建辉',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    title: '专职猫咪寄养 · 独立房间',
    city: '悉尼',
    district: 'Hurstville',
    rating: 4.95,
    reviewCount: 89,
    completedBookings: 142,
    yearsExp: 10,
    priceBoarding: 75,
    priceFeeding: undefined,
    services: ['cat_boarding'],
    tags: ['独立房间', '安防摄像', '节假日不涨价'],
    coverPhoto: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=500&h=350&fit=crop',
    idVerified: true,
    backgroundChecked: true,
  },
  {
    id: '3',
    name: '张美玲',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    title: '上门喂猫专家 · 动物医学在读',
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
    coverPhoto: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&h=350&fit=crop',
    idVerified: true,
    backgroundChecked: false,
  },
  {
    id: '4',
    name: '陈思远',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    title: '全职铲屎官 · 最多同时照顾4只',
    city: '悉尼',
    district: 'Eastwood',
    rating: 4.87,
    reviewCount: 52,
    completedBookings: 79,
    yearsExp: 4,
    priceBoarding: 55,
    priceFeeding: 28,
    services: ['cat_boarding', 'cat_home_feeding'],
    tags: ['可接老猫', '特殊需求', '大空间'],
    coverPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=350&fit=crop',
    idVerified: true,
    backgroundChecked: true,
  },
  {
    id: '5',
    name: '刘艺婷',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    title: '上门喂猫 · 每天两次打卡',
    city: '悉尼',
    district: 'Rhodes',
    rating: 4.92,
    reviewCount: 73,
    completedBookings: 110,
    yearsExp: 2,
    priceBoarding: undefined,
    priceFeeding: 22,
    services: ['cat_home_feeding'],
    tags: ['两次上门', '猫砂清理', '拍照更新'],
    coverPhoto: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=500&h=350&fit=crop',
    idVerified: true,
    backgroundChecked: false,
  },
  {
    id: '6',
    name: '赵小明',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    title: '猫咪爱好者 · 家有两只猫',
    city: '悉尼',
    district: 'Strathfield',
    rating: 4.85,
    reviewCount: 38,
    completedBookings: 56,
    yearsExp: 2,
    priceBoarding: 45,
    priceFeeding: 24,
    services: ['cat_boarding', 'cat_home_feeding'],
    tags: ['有伴', '温馨环境', '实时汇报'],
    coverPhoto: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&h=350&fit=crop',
    idVerified: false,
    backgroundChecked: false,
  },
]

const SORT_OPTIONS = [
  { value: 'rating', label: '评分最高' },
  { value: 'reviews', label: '评价最多' },
  { value: 'price_low', label: '价格最低' },
  { value: 'price_high', label: '价格最高' },
  { value: 'completed', label: '完成最多' },
]

function SittersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [service, setService] = useState(searchParams.get('service') || 'all')
  const [suburb, setSuburb] = useState(searchParams.get('suburb') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating')
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice') || 500))
  const [onlyVerified, setOnlyVerified] = useState(searchParams.get('verified') === 'true')

  useEffect(() => {
    const params = new URLSearchParams()
    if (service !== 'all') params.set('service', service)
    if (suburb !== 'all') params.set('suburb', suburb)
    if (sortBy !== 'rating') params.set('sort', sortBy)
    if (maxPrice !== 500) params.set('maxPrice', String(maxPrice))
    if (onlyVerified) params.set('verified', 'true')
    const query = params.toString()
    router.replace(query ? `/sitters?${query}` : '/sitters', { scroll: false })
  }, [service, suburb, sortBy, maxPrice, onlyVerified])

  const filteredSitters = ALL_SITTERS
    .filter(s => {
      if (service !== 'all' && !s.services.includes(service)) return false
      if (suburb !== 'all' && s.district !== suburb) return false
      if (onlyVerified && !s.idVerified) return false
      const price = service === 'cat_home_feeding' ? s.priceFeeding : s.priceBoarding
      if (price && price > maxPrice) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount
      if (sortBy === 'completed') return b.completedBookings - a.completedBookings
      if (sortBy === 'price_low') {
        const pa = (service === 'cat_home_feeding' ? a.priceFeeding : a.priceBoarding) || 999
        const pb = (service === 'cat_home_feeding' ? b.priceFeeding : b.priceBoarding) || 999
        return pa - pb
      }
      if (sortBy === 'price_high') {
        const pa = (service === 'cat_home_feeding' ? a.priceFeeding : a.priceBoarding) || 0
        const pb = (service === 'cat_home_feeding' ? b.priceFeeding : b.priceBoarding) || 0
        return pb - pa
      }
      return 0
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Service filter */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: '全部服务' },
            { value: 'cat_boarding', label: '🏠 猫咪寄养' },
            { value: 'cat_home_feeding', label: '🚪 上门喂猫' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setService(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                service === opt.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Suburb */}
        <div className="relative flex-1 min-w-[120px]">
          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={suburb}
            onChange={e => setSuburb(e.target.value)}
            className="input-field pl-8 py-2 text-sm w-full appearance-none pr-7"
          >
            <option value="all">全部区域</option>
            {SYDNEY_SUBURBS.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative flex-1 min-w-[110px]">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field py-2 text-sm w-full appearance-none pr-7"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* More filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            showFilters ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={15} />
          筛选
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <label className="label text-sm">最高价格: A${maxPrice}/{service === 'cat_home_feeding' ? '次' : '晚'}</label>
              <input
                type="range"
                min={30}
                max={500}
                step={10}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-40 accent-brand-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={e => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
              <span className="text-sm font-medium text-gray-700">仅显示实名认证</span>
            </label>
          </div>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600 text-sm">
          在 <strong className="text-gray-900">{suburb === 'all' ? '悉尼全区' : suburb}</strong> 找到{' '}
          <strong className="text-gray-900">{filteredSitters.length}</strong> 位铲屎官
        </p>
      </div>

      {/* Grid */}
      {filteredSitters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSitters.map(sitter => (
            <SitterCard key={sitter.id} sitter={sitter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">😿</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无符合条件的铲屎官</h3>
          <p className="text-gray-500 text-sm">试试调整筛选条件或换个区域</p>
        </div>
      )}
    </div>
  )
}

export default function SittersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">找铲屎官</h1>
          <p className="text-gray-500 text-sm mt-1">浏览并联系附近最专业的猫咪照护专家</p>
        </div>
      </div>
      <Suspense fallback={<div className="flex justify-center py-20"><div className="text-gray-400">加载中...</div></div>}>
        <SittersContent />
      </Suspense>
    </div>
  )
}
