'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, CheckCircle2, CreditCard, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const MOCK_PETS = [
  { id: 'p1', name: '胖虎', breed: '英国短毛猫', age: '3岁', gender: '公（已绝育）', photo: '🐱' },
  { id: 'p2', name: '小橘', breed: '中华田园猫', age: '1岁', gender: '母（已绝育）', photo: '🧡' },
]

const SITTER_INFO: Record<string, any> = {
  '1': { name: '林晓雨', priceBoarding: 60, priceFeeding: 30, additionalCatPrice: 20 },
  '2': { name: '王建辉', priceBoarding: 75, priceFeeding: undefined, additionalCatPrice: 25 },
  '3': { name: '张美玲', priceBoarding: 50, priceFeeding: 25, additionalCatPrice: 18 },
}

function BookingNewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const sitterId = searchParams.get('sitter') || '1'
  const service = searchParams.get('service') || 'cat_boarding'
  const startDate = searchParams.get('start') || ''
  const endDate = searchParams.get('end') || ''
  const numCats = Number(searchParams.get('cats') || 1)

  const sitter = SITTER_INFO[sitterId] || SITTER_INFO['1']

  const [step, setStep] = useState<'pets' | 'details' | 'confirm'>('pets')
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('payid')
  const [submitting, setSubmitting] = useState(false)

  const daysRaw = startDate && endDate
    ? (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    : 0
  const days = Math.max(1, isNaN(daysRaw) ? 1 : daysRaw)
  const basePrice = service === 'cat_boarding' ? sitter.priceBoarding : sitter.priceFeeding
  const totalPrice = basePrice
    ? (service === 'cat_boarding'
        ? Math.round(basePrice * days + (numCats - 1) * sitter.additionalCatPrice * days)
        : basePrice)
    : 0
  const platformFee = Math.round(totalPrice * 0.1)
  const finalTotal = totalPrice

  const togglePet = (petId: string) => {
    setSelectedPets(prev =>
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    )
  }

  const handleSubmit = async () => {
    if (selectedPets.length === 0) { toast.error('请选择要寄养的猫咪'); return }
    setSubmitting(true)

    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))

    toast.success('预订请求已发送！等待铲屎官确认。')
    router.push('/dashboard/bookings?success=true')
    setSubmitting(false)
  }

  const serviceLabel = service === 'cat_boarding' ? '猫咪寄养' : '上门喂猫'

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> 返回
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">确认预订</h1>
        <p className="text-gray-500 text-sm mb-8">
          {sitter.name} · {serviceLabel} · {startDate} 至 {endDate}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {['选择猫咪', '填写信息', '确认支付'].map((label, i) => {
            const stepKey = ['pets', 'details', 'confirm'][i] as typeof step
            const isActive = step === stepKey
            const isDone = ['pets', 'details', 'confirm'].indexOf(step) > i
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' :
                  isDone ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone ? 'bg-green-500 text-white' :
                    isActive ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
              </div>
            )
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5 order-2 md:order-1">
            {/* Step 1: Select pets */}
            {step === 'pets' && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">选择要照顾的猫咪</h2>
                <div className="space-y-3 mb-6">
                  {MOCK_PETS.map(pet => (
                    <label key={pet.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedPets.includes(pet.id)
                          ? 'border-brand-400 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input type="checkbox" checked={selectedPets.includes(pet.id)}
                        onChange={() => togglePet(pet.id)} className="sr-only" />
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {pet.photo}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{pet.name}</p>
                        <p className="text-sm text-gray-500">{pet.breed} · {pet.age} · {pet.gender}</p>
                      </div>
                      {selectedPets.includes(pet.id) && (
                        <CheckCircle2 size={20} className="text-brand-500 flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>

                <Link href="/dashboard/pets/add"
                  className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 border border-brand-200 rounded-xl px-4 py-3 hover:bg-brand-50 transition-colors mb-6">
                  <Plus size={16} /> 添加新猫咪档案
                </Link>

                <button
                  onClick={() => { if (selectedPets.length === 0) { toast.error('请至少选择一只猫咪'); return } setStep('details') }}
                  className="btn-primary w-full py-3.5">
                  下一步 →
                </button>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 'details' && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">填写服务信息</h2>

                <div className="mb-5">
                  <label className="label">特殊说明 <span className="text-gray-400 font-normal">(选填)</span></label>
                  <textarea
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="例如：猫咪每天早8点、晚6点各喂一次，食量半碗。猫砂盆在洗手间，每天需要清理一次。猫咪比较怕生，刚到会躲起来，请耐心等待..."
                  />
                </div>

                <div className="mb-6">
                  <label className="label">紧急联系人</label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    className="input-field"
                    placeholder="紧急情况联系电话（非本人）"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('pets')}
                    className="btn-secondary flex-1 py-3">← 上一步</button>
                  <button onClick={() => setStep('confirm')}
                    className="btn-primary flex-1 py-3">下一步 →</button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm & Pay */}
            {step === 'confirm' && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">确认并支付</h2>

                {/* Order summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">订单详情</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>服务类型</span><span>{serviceLabel}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>铲屎官</span><span>{sitter.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>日期</span><span>{startDate} 至 {endDate}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>猫咪</span>
                      <span>{MOCK_PETS.filter(p => selectedPets.includes(p.id)).map(p => p.name).join('、')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                      <span>合计</span><span className="text-brand-600">A${finalTotal}</span>
                    </div>
                    <p className="text-xs text-gray-400">平台服务费（10%）A${platformFee} 已包含在内</p>
                  </div>
                </div>

                {/* Payment method */}
                <div className="mb-6">
                  <label className="label">支付方式</label>
                  <div className="space-y-2">
                    {[
                      { value: 'payid', label: 'PayID / 银行转账', icon: '🏦' },
                      { value: 'card', label: '信用卡 / 借记卡', icon: '💳' },
                      { value: 'wechat', label: '微信支付', icon: '💚' },
                      { value: 'alipay', label: '支付宝', icon: '💙' },
                    ].map(method => (
                      <label key={method.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === method.value ? 'border-brand-400 bg-brand-50' : 'border-gray-200'
                        }`}>
                        <input type="radio" name="payment" value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value)} className="accent-brand-500" />
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-sm font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Trust notice */}
                <div className="flex items-start gap-3 bg-teal-50 rounded-xl p-4 mb-5">
                  <Shield size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-teal-700">
                    <p className="font-semibold mb-0.5">资金安全托管</p>
                    <p className="text-xs text-teal-600">您的付款将由平台托管，服务完成并确认后才会转给铲屎官。</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('details')}
                    className="btn-secondary flex-1 py-3">← 上一步</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="btn-primary flex-1 py-3 disabled:opacity-60">
                    {submitting ? '处理中...' : `支付 A$${finalTotal}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: summary */}
          <div className="md:col-span-1 order-1 md:order-2">
            <div className="card p-5 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">预订摘要</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">铲屎官</span>
                  <span className="font-medium">{sitter.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">服务</span>
                  <span className="font-medium">{serviceLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">开始</span>
                  <span className="font-medium">{startDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">结束</span>
                  <span className="font-medium">{endDate || '—'}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="text-gray-500">合计</span>
                  <span className="font-bold text-brand-600 text-base">A${finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingNewPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 pt-20"><p className="text-gray-400">加载中...</p></div>}>
      <BookingNewContent />
    </Suspense>
  )
}
