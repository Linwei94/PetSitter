'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const MOCK_DETAIL: {
  id: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  totalPoints: number
  adminNote: string | null
  date: string
  documents: { type: string; name: string; number: string; points: number; category: string }[]
  photoUrls: string[]
} = {
  id: '1',
  name: '陈小明',
  status: 'pending',
  totalPoints: 110,
  adminNote: null as string | null,
  date: '2026-03-17',
  documents: [
    { type: 'passport', name: '护照 (Passport)', number: 'PA1234567', points: 70, category: 'primary' },
    { type: 'medicare', name: 'Medicare 卡', number: '1234567890', points: 25, category: 'supporting' },
    { type: 'bank_stmt', name: '银行对账单', number: '6789', points: 25, category: 'supporting' },
  ],
  photoUrls: [] as string[],
}

export default function VerificationDetailClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [sub, setSub] = useState(MOCK_DETAIL)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(!IS_DEMO)
  const [acting, setActing] = useState(false)
  const [signedUrls, setSignedUrls] = useState<string[]>([])

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('id_verification_submissions')
          .select('*, profiles(full_name)')
          .eq('id', id)
          .single()

        if (error || !data) { router.push('/admin/verifications'); return }

        setSub({
          id: data.id,
          name: (data.profiles as any)?.full_name || '未知用户',
          status: data.status,
          totalPoints: data.total_points,
          adminNote: data.admin_note,
          date: data.created_at?.slice(0, 10),
          documents: Array.isArray(data.documents) ? data.documents : [],
          photoUrls: Array.isArray(data.photo_urls) ? data.photo_urls : [],
        })
        setNote(data.admin_note || '')

        if (Array.isArray(data.photo_urls) && data.photo_urls.length > 0) {
          const urls = await Promise.all(
            data.photo_urls.map(async (path: string) => {
              const { data: signed } = await supabase.storage
                .from('verification-docs')
                .createSignedUrl(path, 3600)
              return signed?.signedUrl || ''
            })
          )
          setSignedUrls(urls.filter(Boolean))
        }
      } catch {
        // use mock
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleAction = async (action: 'approved' | 'rejected') => {
    setActing(true)
    try {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 500))
        setSub(prev => ({ ...prev, status: action, adminNote: note || null }))
        toast.success(action === 'approved' ? '已通过认证申请' : '已拒绝认证申请')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); return }

      const { error } = await supabase
        .from('id_verification_submissions')
        .update({
          status: action,
          admin_note: note || null,
          reviewed_by: user.id,
        })
        .eq('id', id)

      if (error) throw error

      setSub(prev => ({ ...prev, status: action, adminNote: note || null }))
      toast.success(action === 'approved' ? '已通过认证申请' : '已拒绝认证申请')
      setTimeout(() => router.push('/admin/verifications'), 1500)
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setActing(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>

  const STATUS_BADGE = {
    pending:  <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"><Clock size={12} />待审核</span>,
    approved: <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle2 size={12} />已通过</span>,
    rejected: <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"><XCircle size={12} />已拒绝</span>,
  }

  const CATEGORY_LABELS: Record<string, string> = {
    primary: '主要证件',
    secondary: '次要证件',
    supporting: '辅助证件',
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/verifications" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">认证申请详情</h1>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg flex-shrink-0">
          {sub.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{sub.name}</p>
          <p className="text-sm text-gray-400">提交日期：{sub.date}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {STATUS_BADGE[sub.status]}
          <span className="text-2xl font-bold text-brand-600">{sub.totalPoints}分</span>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">提交的证件</h2>
        <div className="space-y-2">
          {sub.documents.map((doc: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                <p className="text-xs text-gray-500">证件号：{doc.number}</p>
              </div>
              <span className="text-sm font-bold text-brand-600 flex-shrink-0">{doc.points}分</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {CATEGORY_LABELS[doc.category] || doc.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      {(signedUrls.length > 0 || IS_DEMO) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">证件照片</h2>
          {IS_DEMO ? (
            <p className="text-sm text-gray-400 text-center py-4">演示模式 — 无照片</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {signedUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`证件照片 ${i + 1}`} className="w-full h-40 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Action */}
      {sub.status === 'pending' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">审核操作</h2>
          <div>
            <label className="label text-sm mb-1.5 block">审核备注（可选）</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full input-field text-sm resize-none"
              rows={3}
              placeholder="如拒绝，请说明原因（用户将看到此备注）"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('approved')}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {acting ? '处理中...' : '通过认证'}
            </button>
            <button
              onClick={() => handleAction('rejected')}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <XCircle size={16} />
              {acting ? '处理中...' : '拒绝申请'}
            </button>
          </div>
        </div>
      )}

      {/* Previous decision note */}
      {sub.status !== 'pending' && sub.adminNote && (
        <div className={`rounded-2xl border p-4 ${sub.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-sm font-medium text-gray-700">审核备注：</p>
          <p className="text-sm text-gray-600 mt-1">{sub.adminNote}</p>
        </div>
      )}
    </div>
  )
}
