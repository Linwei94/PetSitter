'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { CAT_BREEDS } from '@/lib/utils'

export default function AddPetPage() {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    breed: '',
    ageYears: 0,
    ageMonths: 0,
    gender: 'female',
    weightKg: '',
    isNeutered: false,
    isVaccinated: false,
    vaccinationDate: '',
    microchipNumber: '',
    medicalConditions: '',
    medications: '',
    dietaryRestrictions: '',
    feedingSchedule: '',
    litterBoxNotes: '',
    behaviorNotes: '',
    emergencyVet: '',
  })

  const update = (k: string, v: string | boolean | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('请输入猫咪名字'); return }
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('请先登录'); router.push('/auth/login'); return }

    const { error } = await supabase.from('pets').insert({
      owner_id: user.id,
      name: form.name,
      type: 'cat',
      breed: form.breed || null,
      age_years: form.ageYears,
      age_months: form.ageMonths,
      gender: form.gender,
      weight_kg: form.weightKg ? Number(form.weightKg) : null,
      is_neutered: form.isNeutered,
      is_vaccinated: form.isVaccinated,
      vaccination_date: form.vaccinationDate || null,
      microchip_number: form.microchipNumber || null,
      medical_conditions: form.medicalConditions || null,
      medications: form.medications || null,
      dietary_restrictions: form.dietaryRestrictions || null,
      feeding_schedule: form.feedingSchedule || null,
      litter_box_notes: form.litterBoxNotes || null,
      behavior_notes: form.behaviorNotes || null,
      emergency_vet: form.emergencyVet || null,
    })

    if (error) {
      toast.error('保存失败，请重试')
    } else {
      toast.success(`${form.name}的档案已添加！`)
      router.push('/dashboard/pets')
    }
    setSubmitting(false)
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft size={16} /> 返回
      </button>
      <h1 className="text-xl font-bold text-gray-900">添加猫咪档案</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <Section title="🐱 基本信息">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">猫咪名字 *</label>
              <input value={form.name} onChange={e => update('name', e.target.value)}
                className="input-field" placeholder="例如：胖虎" required />
            </div>
            <div>
              <label className="label">品种</label>
              <select value={form.breed} onChange={e => update('breed', e.target.value)}
                className="input-field">
                <option value="">请选择品种</option>
                {CAT_BREEDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">性别</label>
              <select value={form.gender} onChange={e => update('gender', e.target.value)}
                className="input-field">
                <option value="female">母猫</option>
                <option value="male">公猫</option>
              </select>
            </div>
            <div>
              <label className="label">体重（kg）</label>
              <input type="number" step="0.1" min="0" max="20"
                value={form.weightKg} onChange={e => update('weightKg', e.target.value)}
                className="input-field" placeholder="例如：4.5" />
            </div>
            <div>
              <label className="label">年龄</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input type="number" min="0" max="25"
                    value={form.ageYears} onChange={e => update('ageYears', Number(e.target.value))}
                    className="input-field pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">岁</span>
                </div>
                <div className="relative flex-1">
                  <input type="number" min="0" max="11"
                    value={form.ageMonths} onChange={e => update('ageMonths', Number(e.target.value))}
                    className="input-field pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">月</span>
                </div>
              </div>
            </div>
            <div>
              <label className="label">芯片号</label>
              <input value={form.microchipNumber} onChange={e => update('microchipNumber', e.target.value)}
                className="input-field" placeholder="可选" />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isNeutered}
                onChange={e => update('isNeutered', e.target.checked)}
                className="w-4 h-4 accent-brand-500" />
              <span className="text-sm font-medium text-gray-700">已绝育</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVaccinated}
                onChange={e => update('isVaccinated', e.target.checked)}
                className="w-4 h-4 accent-brand-500" />
              <span className="text-sm font-medium text-gray-700">已接种疫苗</span>
            </label>
          </div>
          {form.isVaccinated && (
            <div>
              <label className="label">最近接种日期</label>
              <input type="date" value={form.vaccinationDate}
                onChange={e => update('vaccinationDate', e.target.value)}
                className="input-field" />
            </div>
          )}
        </Section>

        {/* Health */}
        <Section title="🏥 健康状况">
          <div>
            <label className="label">健康问题 / 过敏史</label>
            <textarea value={form.medicalConditions}
              onChange={e => update('medicalConditions', e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="例如：有慢性肾病，需要吃肾处方粮；或填写"无特殊情况"" />
          </div>
          <div>
            <label className="label">目前用药情况</label>
            <textarea value={form.medications}
              onChange={e => update('medications', e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="例如：每天早上口服X药一颗，喂药时可以藏在零食里" />
          </div>
          <div>
            <label className="label">饮食禁忌</label>
            <input value={form.dietaryRestrictions}
              onChange={e => update('dietaryRestrictions', e.target.value)}
              className="input-field" placeholder="例如：对鸡肉过敏，只能喂鱼味粮" />
          </div>
          <div>
            <label className="label">紧急兽医联系方式</label>
            <input value={form.emergencyVet}
              onChange={e => update('emergencyVet', e.target.value)}
              className="input-field" placeholder="兽医医院名称和电话" />
          </div>
        </Section>

        {/* Daily routine */}
        <Section title="📋 日常习惯">
          <div>
            <label className="label">喂食时间安排</label>
            <textarea value={form.feedingSchedule}
              onChange={e => update('feedingSchedule', e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="例如：每天早8点晚6点各喂半碗干粮，早上加半罐主食罐头" />
          </div>
          <div>
            <label className="label">猫砂盆使用说明</label>
            <textarea value={form.litterBoxNotes}
              onChange={e => update('litterBoxNotes', e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="例如：使用豆腐猫砂，猫砂盆在卫生间，每天至少铲一次" />
          </div>
          <div>
            <label className="label">性格 & 行为特点</label>
            <textarea value={form.behaviorNotes}
              onChange={e => update('behaviorNotes', e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="例如：比较内向怕生，刚到新环境会躲起来，耐心等候几小时就会出来。喜欢被摸头和背，不喜欢抱。爱玩逗猫棒。" />
          </div>
        </Section>

        <button type="submit" disabled={submitting}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
          {submitting ? '保存中...' : '保存猫咪档案'}
        </button>
      </form>
    </div>
  )
}
