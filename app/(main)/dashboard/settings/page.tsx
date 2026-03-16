'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { CITIES } from '@/lib/utils'

export default function SettingsPage() {
  const supabase = createClient()
  const [saving, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '', phone: '', wechatId: '', city: '上海', bio: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm({
        fullName: data.full_name || '',
        phone: data.phone || '',
        wechatId: data.wechat_id || '',
        city: data.city || '上海',
        bio: data.bio || '',
      })
    }
    load()
  }, [])

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('请先登录'); return }

    const { error } = await supabase.from('profiles').update({
      full_name: form.fullName,
      phone: form.phone || null,
      wechat_id: form.wechatId || null,
      city: form.city,
      bio: form.bio || null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) toast.error('保存失败，请重试')
    else toast.success('设置已保存')
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">账户设置</h1>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-900">个人信息</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">姓名</label>
              <input value={form.fullName} onChange={e => update('fullName', e.target.value)}
                className="input-field" placeholder="您的姓名" />
            </div>
            <div>
              <label className="label">手机号码</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)}
                className="input-field" placeholder="13800138000" />
            </div>
            <div>
              <label className="label">微信号</label>
              <input value={form.wechatId} onChange={e => update('wechatId', e.target.value)}
                className="input-field" placeholder="可选" />
            </div>
            <div>
              <label className="label">所在城市</label>
              <select value={form.city} onChange={e => update('city', e.target.value)} className="input-field">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">个人简介（可选）</label>
            <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="简单介绍一下自己..." />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="btn-primary py-3 px-8 disabled:opacity-60">
          {saving ? '保存中...' : '保存设置'}
        </button>
      </form>
    </div>
  )
}
