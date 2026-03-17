'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, CalendarDays, ChevronDown } from 'lucide-react'
import { SYDNEY_SUBURBS } from '@/lib/utils'

const SERVICE_OPTIONS = [
  { value: 'cat_boarding', label: '🏠 猫咪寄养', desc: '铲屎官家中寄养' },
  { value: 'cat_home_feeding', label: '🚪 上门喂猫', desc: '铲屎官到您家上门' },
]

const today = new Date().toISOString().split('T')[0]

export default function HeroSection() {
  const router = useRouter()
  const [service, setService] = useState('cat_boarding')
  const [suburb, setSuburb] = useState('Chatswood')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const selectedService = SERVICE_OPTIONS.find(s => s.value === service)

  const handleStartDateChange = (v: string) => {
    setStartDate(v)
    // Auto-adjust end date if it's before the new start date
    if (endDate && endDate < v) setEndDate(v)
  }

  const handleEndDateChange = (v: string) => {
    // Reject selection if before start date
    if (startDate && v < startDate) return
    setEndDate(v)
  }

  const handleSearch = () => {
    const params = new URLSearchParams({
      service,
      suburb,
      ...(startDate && { start: startDate }),
      ...(endDate && { end: endDate }),
    })
    router.push(`/sitters?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[75vh] sm:min-h-[88vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C%2Fg%3E%3C%2Fsvg%3E\")" }}
      />

      {/* Floating decorations — hidden on small screens to avoid overflow */}
      <div className="absolute top-1/4 right-8 md:right-16 lg:right-24 text-6xl md:text-7xl lg:text-8xl animate-bounce hidden sm:block" style={{ animationDuration: '3s' }}>🐱</div>
      <div className="absolute bottom-1/3 right-12 md:right-24 lg:right-48 text-4xl tag-animate opacity-60 hidden sm:block">🐾</div>
      <div className="absolute top-1/3 right-1/3 text-3xl tag-animate opacity-40 hidden sm:block" style={{ animationDelay: '1s' }}>✨</div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 mb-6 shadow-sm border border-brand-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">500+ 位认证铲屎官在线</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
            让专业的人
            <br />
            <span className="text-brand-500">守护您的猫咪</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            悉尼华人社区专属服务。
            <br className="hidden sm:block" />
            找到身边最靠谱的猫咪保姆，让毛孩子享受最贴心的照顾。
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
            {/* Service Type Tabs */}
            <div className="flex gap-2 mb-4">
              {SERVICE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setService(opt.value)}
                  className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                    service === opt.value
                      ? 'bg-brand-50 text-brand-700 border-2 border-brand-200'
                      : 'text-gray-500 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="text-base mb-0.5">{opt.label}</div>
                  <div className="text-xs opacity-70 hidden sm:block">{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {/* Suburb */}
              <div className="relative">
                <label className="label text-xs">区域</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={suburb}
                    onChange={e => setSuburb(e.target.value)}
                    className="input-field pl-9 text-base appearance-none pr-8"
                  >
                    {SYDNEY_SUBURBS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="label text-xs">开始日期</label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    min={today}
                    className="input-field pl-9 text-base"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="label text-xs">结束日期</label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => handleEndDateChange(e.target.value)}
                    min={startDate || today}
                    className={`input-field pl-9 text-base ${!startDate ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={!startDate}
                  />
                </div>
                {!startDate && (
                  <p className="text-xs text-gray-400 mt-1">请先选择开始日期</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <Search size={18} />
              搜索铲屎官
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: '⭐', text: '4.9分好评' },
              { icon: '🔒', text: '实名认证' },
              { icon: '📸', text: '全程打卡' },
              { icon: '💰', text: '资金托管' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-1.5 text-sm text-gray-600">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
