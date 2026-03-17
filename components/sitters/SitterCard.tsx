import Link from 'next/link'
import { Star, MapPin, CheckCircle2, Heart } from 'lucide-react'

interface SitterCardData {
  id: string
  name: string
  avatar: string
  title: string
  district: string
  city: string
  rating: number
  reviewCount: number
  completedBookings: number
  yearsExp: number
  priceBoarding?: number
  priceFeeding?: number
  services: string[]
  tags: string[]
  coverPhoto: string
  idVerified: boolean
  backgroundChecked: boolean
}

export default function SitterCard({ sitter }: { sitter: SitterCardData }) {
  return (
    <Link href={`/sitters/${sitter.id}`} className="group card-hover block">
      {/* Cover */}
      <div className="relative h-44 md:h-48 lg:h-52 overflow-hidden">
        <img
          src={sitter.coverPhoto}
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
        {/* Favorite button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart size={15} className="text-gray-400 hover:text-red-400" />
        </button>
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <img
            src={sitter.avatar}
            alt={sitter.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 text-sm">{sitter.name}</h3>
              {sitter.idVerified && <CheckCircle2 size={13} className="text-teal-500" />}
            </div>
            <p className="text-xs text-gray-500 truncate">{sitter.title}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} className={i <= Math.round(sitter.rating) ? 'star-filled' : 'star-empty'} />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-900">{sitter.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({sitter.reviewCount})</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-400">{sitter.completedBookings}次</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <MapPin size={11} />
          <span>{sitter.city} {sitter.district}</span>
          <span className="mx-0.5">·</span>
          <span>{sitter.yearsExp}年经验</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {sitter.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-3">
            {sitter.priceBoarding && (
              <div>
                <p className="text-xs text-gray-400">寄养</p>
                <p className="text-sm font-bold text-gray-900">A${sitter.priceBoarding}<span className="text-xs font-normal text-gray-400">/晚</span></p>
              </div>
            )}
            {sitter.priceFeeding && (
              <div>
                <p className="text-xs text-gray-400">上门</p>
                <p className="text-sm font-bold text-gray-900">A${sitter.priceFeeding}<span className="text-xs font-normal text-gray-400">/次</span></p>
              </div>
            )}
          </div>
          <span className="text-brand-600 text-xs font-medium">查看详情 →</span>
        </div>
      </div>
    </Link>
  )
}
