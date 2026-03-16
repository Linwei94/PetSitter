'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { SYDNEY_SUBURBS } from '@/lib/utils'

const STEPS = ['基本信息', '居住环境', '服务设置', '提交认证']

export default function BecomeSitterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    // Step 0: Basic
    title: '',
    description: '',
    yearsExperience: 0,
    city: '悉尼',
    district: '',
    // Step 1: Home
    homeType: 'apartment',
    homeSize: 'medium',
    hasOutdoorSpace: false,
    hasOwnPets: false,
    ownPetsDescription: '',
    hasChildren: false,
    maxCats: 2,
    acceptsKittens: true,
    acceptsSeniorCats: true,
    acceptsSpecialNeeds: false,
    // Step 2: Services
    offersBoarding: true,
    priceBoarding: 100,
    offersFeeding: false,
    priceFeeding: 50,
    additionalCatPrice: 30,
    includedServices: [] as string[],
    // Step 3: Verification
    agreeTerms: false,
  })

  const update = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleIncluded = (item: string) => {
    setForm(prev => ({
      ...prev,
      includedServices: prev.includedServices.includes(item)
        ? prev.includedServices.filter(s => s !== item)
        : [...prev.includedServices, item],
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('请先登录'); router.push('/auth/login'); return }

    const { data: sitter, error: sitterError } = await supabase.from('sitters').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      years_experience: form.yearsExperience,
      city: form.city,
      district: form.district,
      home_type: form.homeType,
      home_size: form.homeSize,
      has_outdoor_space: form.hasOutdoorSpace,
      has_own_pets: form.hasOwnPets,
      own_pets_description: form.ownPetsDescription || null,
      has_children: form.hasChildren,
      max_cats: form.maxCats,
      accepts_kittens: form.acceptsKittens,
      accepts_senior_cats: form.acceptsSeniorCats,
      accepts_special_needs: form.acceptsSpecialNeeds,
    }).select('id').single()

    if (sitterError || !sitter) {
      toast.error('提交失败，请重试')
      setSubmitting(false)
      return
    }

    // Insert services
    const serviceInserts = []
    if (form.offersBoarding) {
      serviceInserts.push({
        sitter_id: sitter.id,
        service_type: 'cat_boarding',
        price_per_night: form.priceBoarding,
        additional_cat_price: form.additionalCatPrice,
        included_services: form.includedServices,
      })
    }
    if (form.offersFeeding) {
      serviceInserts.push({
        sitter_id: sitter.id,
        service_type: 'cat_home_feeding',
        price_per_visit: form.priceFeeding,
        additional_cat_price: form.additionalCatPrice,
        included_services: form.includedServices,
      })
    }
    if (serviceInserts.length > 0) {
      await supabase.from('sitter_services').insert(serviceInserts)
    }

    await supabase.from('profiles').update({ is_sitter: true }).eq('id', user.id)

    toast.success('申请已提交！我们将在24小时内完成审核。')
    router.push('/dashboard/sitter')
    setSubmitting(false)
  }

  const inputCls = 'input-field'
  const labelCls = 'label'

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> 返回首页
        </Link>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900">成为喵管家铲屎官</h1>
          <p className="text-gray-500 mt-1">分享您对猫咪的爱，同时获得额外收入</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < step ? 'bg-brand-500 border-brand-500 text-white' :
                  i === step ? 'border-brand-500 text-brand-600' :
                  'border-gray-200 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-5">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">基本信息</h2>
              <div>
                <label className={labelCls}>铲屎官头衔 *</label>
                <input value={form.title} onChange={e => update('title', e.target.value)}
                  className={inputCls} placeholder="例如：专业猫咪照护师，5年经验" required />
              </div>
              <div>
                <label className={labelCls}>自我介绍 *</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  className={`${inputCls} min-h-[140px] resize-none`}
                  placeholder="介绍您的养猫经历、照护理念、居住环境等。详细的介绍可以帮助主人了解您，增加预订率。" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>照猫经验年限</label>
                  <select value={form.yearsExperience} onChange={e => update('yearsExperience', Number(e.target.value))}
                    className={inputCls}>
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n === 0 ? '不足1年' : `${n}年以上`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>所在区域 (Suburb)</label>
                  <select value={form.district} onChange={e => update('district', e.target.value)} className={inputCls}>
                    <option value="">请选择</option>
                    {SYDNEY_SUBURBS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Home Environment */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">居住环境</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>住宅类型</label>
                  <select value={form.homeType} onChange={e => update('homeType', e.target.value)} className={inputCls}>
                    <option value="apartment">公寓</option>
                    <option value="house">别墅/独栋</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>居住面积</label>
                  <select value={form.homeSize} onChange={e => update('homeSize', e.target.value)} className={inputCls}>
                    <option value="small">小（60㎡以下）</option>
                    <option value="medium">中（60-120㎡）</option>
                    <option value="large">大（120㎡以上）</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>最多同时接受猫咪数量</label>
                  <select value={form.maxCats} onChange={e => update('maxCats', Number(e.target.value))} className={inputCls}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}只</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'hasOutdoorSpace', label: '有阳台/室外空间' },
                  { key: 'hasChildren', label: '家中有小孩' },
                  { key: 'hasOwnPets', label: '家中有自养宠物' },
                  { key: 'acceptsKittens', label: '可接受幼猫（1岁以下）' },
                  { key: 'acceptsSeniorCats', label: '可接受老年猫（10岁以上）' },
                  { key: 'acceptsSpecialNeeds', label: '可接受特殊需求猫咪（需喂药等）' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form[item.key as keyof typeof form] as boolean}
                      onChange={e => update(item.key, e.target.checked)}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
              {form.hasOwnPets && (
                <div>
                  <label className={labelCls}>自养宠物描述</label>
                  <input value={form.ownPetsDescription} onChange={e => update('ownPetsDescription', e.target.value)}
                    className={inputCls} placeholder="例如：家有2只绝育英短猫，性格温顺" />
                </div>
              )}
            </>
          )}

          {/* Step 2: Service Setup */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">服务设置</h2>
              <div className="space-y-4">
                {/* Boarding */}
                <div className={`border-2 rounded-xl p-4 transition-colors ${form.offersBoarding ? 'border-brand-300 bg-brand-50' : 'border-gray-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={form.offersBoarding}
                      onChange={e => update('offersBoarding', e.target.checked)}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="font-semibold text-gray-900">🏠 猫咪寄养（在您家中）</span>
                  </label>
                  {form.offersBoarding && (
                    <div>
                      <label className={labelCls}>每晚价格（¥）</label>
                      <input type="number" min={30} max={500}
                        value={form.priceBoarding} onChange={e => update('priceBoarding', Number(e.target.value))}
                        className={inputCls} />
                    </div>
                  )}
                </div>

                {/* Home Feeding */}
                <div className={`border-2 rounded-xl p-4 transition-colors ${form.offersFeeding ? 'border-teal-300 bg-teal-50' : 'border-gray-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={form.offersFeeding}
                      onChange={e => update('offersFeeding', e.target.checked)}
                      className="w-4 h-4 accent-teal-500" />
                    <span className="font-semibold text-gray-900">🚪 上门喂猫（去主人家）</span>
                  </label>
                  {form.offersFeeding && (
                    <div>
                      <label className={labelCls}>每次上门价格（¥）</label>
                      <input type="number" min={20} max={300}
                        value={form.priceFeeding} onChange={e => update('priceFeeding', Number(e.target.value))}
                        className={inputCls} />
                    </div>
                  )}
                </div>

                {/* Additional cat price */}
                <div>
                  <label className={labelCls}>额外每只猫咪加价（¥）</label>
                  <input type="number" min={0}
                    value={form.additionalCatPrice} onChange={e => update('additionalCatPrice', Number(e.target.value))}
                    className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">接受第2只及以后猫咪时每天/每次额外收取</p>
                </div>

                {/* Included services */}
                <div>
                  <label className={labelCls}>服务包含（可多选）</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '每日喂食和换水', '猫砂盆清洁', '每日照片更新', '视频/直播',
                      '玩耍和互动', '梳毛', '基础护理', '喂药服务',
                    ].map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox"
                          checked={form.includedServices.includes(item)}
                          onChange={() => toggleIncluded(item)}
                          className="w-4 h-4 accent-brand-500" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">提交认证</h2>
              <div className="bg-teal-50 rounded-xl p-4">
                <h3 className="font-semibold text-teal-800 mb-3">认证流程</h3>
                <div className="space-y-2">
                  {[
                    { icon: '📋', title: '资料审核（1-2工作日）', desc: '我们将审核您提交的信息' },
                    { icon: '📱', title: '实名认证', desc: '通过手机号完成实名认证' },
                    { icon: '🎉', title: '开始接单', desc: '认证通过后即可在平台接单' },
                  ].map(s => (
                    <div key={s.title} className="flex items-start gap-3">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-teal-800">{s.title}</p>
                        <p className="text-xs text-teal-600">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile photo upload hint */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">上传个人照片（可选）</p>
                <p className="text-xs text-gray-400 mt-0.5">有照片的铲屎官预订率高3倍</p>
                <button className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium">选择照片</button>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreeTerms}
                  onChange={e => update('agreeTerms', e.target.checked)}
                  className="w-4 h-4 accent-brand-500 mt-0.5" />
                <span className="text-sm text-gray-600">
                  我已阅读并同意喵管家的{' '}
                  <Link href="/legal/sitter-terms" className="text-brand-600 hover:underline">铲屎官服务协议</Link>
                  {' '}，承诺提供专业、负责任的宠物照护服务。
                </span>
              </label>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1 py-3">← 上一步</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => {
                if (step === 0 && !form.title.trim()) { toast.error('请填写铲屎官头衔'); return }
                if (step === 2 && !form.offersBoarding && !form.offersFeeding) { toast.error('请至少选择一项服务'); return }
                setStep(step + 1)
              }} className="btn-primary flex-1 py-3">下一步 →</button>
            ) : (
              <button onClick={handleSubmit}
                disabled={submitting || !form.agreeTerms}
                className="btn-primary flex-1 py-3 disabled:opacity-60">
                {submitting ? '提交中...' : '提交申请'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
