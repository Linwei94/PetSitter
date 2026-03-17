'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, CheckCircle2, Clock, XCircle, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  DOCUMENT_TYPES,
  POINTS_REQUIRED,
  calculatePoints,
  isDocumentSelected,
  type SelectedDocument,
} from '@/lib/id-verification'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | null

export default function VerificationPage() {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<SubmissionStatus>(null)
  const [adminNote, setAdminNote] = useState<string | null>(null)
  const [hasSitterProfile, setHasSitterProfile] = useState(false)

  // Form state
  const [selectedDocs, setSelectedDocs] = useState<SelectedDocument[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  const totalPoints = calculatePoints(selectedDocs)
  const canSubmit = (totalPoints >= POINTS_REQUIRED) && (status === null || status === 'rejected')

  useEffect(() => {
    const load = async () => {
      if (IS_DEMO) { setLoading(false); setHasSitterProfile(true); return }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        // Check sitter profile
        const { data: sitter } = await supabase.from('sitters').select('id').eq('user_id', user.id).single()
        setHasSitterProfile(!!sitter)

        // Load existing submission
        const { data: sub } = await supabase
          .from('id_verification_submissions')
          .select('status, admin_note, documents')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (sub) {
          setStatus(sub.status as SubmissionStatus)
          setAdminNote(sub.admin_note)
          if (sub.status === 'rejected') {
            const docs = sub.documents as SelectedDocument[]
            if (Array.isArray(docs)) setSelectedDocs(docs)
          }
        }
      } catch {
        // Genuine DB error — keep hasSitterProfile false
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addDocument = () => {
    if (!selectedType || !docNumber.trim()) {
      toast.error('请选择证件类型并填写证件号码')
      return
    }
    if (isDocumentSelected(selectedDocs, selectedType)) {
      toast.error('该证件类型已添加')
      return
    }
    const docType = DOCUMENT_TYPES.find(d => d.id === selectedType)!
    setSelectedDocs(prev => [...prev, {
      type: docType.id,
      name: docType.label,
      number: docNumber.trim(),
      points: docType.points,
      category: docType.category,
    }])
    setSelectedType('')
    setDocNumber('')
  }

  const removeDocument = (typeId: string) => {
    setSelectedDocs(prev => prev.filter(d => d.type !== typeId))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    try {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 800))
        setStatus('pending')
        toast.success('申请已提交，等待审核！（演示模式）')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); return }

      // Upload photos to Supabase Storage
      const photoUrls: string[] = []
      for (const file of photoFiles) {
        const path = `${user.id}/${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('verification-docs').upload(path, file)
        if (error) throw error
        photoUrls.push(path)
      }

      // Delete old rejected submission first
      await supabase.from('id_verification_submissions')
        .delete().eq('user_id', user.id).eq('status', 'rejected')

      const { error } = await supabase.from('id_verification_submissions').insert({
        user_id: user.id,
        total_points: totalPoints,
        documents: selectedDocs,
        photo_urls: photoUrls,
      })
      if (error) throw error

      setStatus('pending')
      setPhotoFiles([])
      toast.success('身份认证申请已提交！')
    } catch (err) {
      toast.error('提交失败，请重试')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>

  if (!hasSitterProfile) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/sitter" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> 返回铲屎官中心
        </Link>
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">请先创建铲屎官档案</h2>
          <p className="text-gray-500 text-sm mb-4">完成身份认证前，需要先创建您的铲屎官服务档案。</p>
          <Link href="/sitters/become" className="btn-teal inline-flex">前往创建档案</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sitter" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">澳洲100分身份认证</h1>
      </div>

      {/* Status Banner */}
      {status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Clock size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">审核中</p>
            <p className="text-yellow-700 text-xs mt-0.5">我们正在审核您提交的证件，通常1-3个工作日内完成。</p>
          </div>
        </div>
      )}
      {status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">认证已通过 ✓</p>
            <p className="text-green-700 text-xs mt-0.5">您的身份认证已通过，铲屎官档案显示&ldquo;已认证&rdquo;徽章。</p>
          </div>
        </div>
      )}
      {status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">审核未通过，请重新提交</p>
            {adminNote && <p className="text-red-700 text-xs mt-1">审核备注：{adminNote}</p>}
          </div>
        </div>
      )}

      {/* Points Progress */}
      {(status === null || status === 'rejected') && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">当前积分</h2>
            <span className={`text-2xl font-bold ${totalPoints >= POINTS_REQUIRED ? 'text-green-600' : 'text-brand-600'}`}>
              {totalPoints} / {POINTS_REQUIRED}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${totalPoints >= POINTS_REQUIRED ? 'bg-green-500' : 'bg-brand-500'}`}
              style={{ width: `${Math.min(100, (totalPoints / POINTS_REQUIRED) * 100)}%` }}
            />
          </div>
          {totalPoints >= POINTS_REQUIRED && (
            <p className="text-green-600 text-xs mt-2 font-medium">✓ 已达到100分，可以提交申请</p>
          )}
        </div>
      )}

      {/* Document Form */}
      {(status === null || status === 'rejected') && (
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">添加证件</h2>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
            <p className="font-medium">证件积分说明：</p>
            <p>• 主要证件（护照/出生证明）：70分，最多计1个</p>
            <p>• 次要证件（驾照/政府ID）：40分</p>
            <p>• 辅助证件（Medicare/银行/水电）：25分，可多个</p>
          </div>

          <div className="space-y-3">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="input-field text-sm w-full"
            >
              <option value="">选择证件类型</option>
              {DOCUMENT_TYPES.map(dt => (
                <option key={dt.id} value={dt.id} disabled={isDocumentSelected(selectedDocs, dt.id)}>
                  {dt.label}（{dt.points}分）{isDocumentSelected(selectedDocs, dt.id) ? ' ✓ 已添加' : ''}
                </option>
              ))}
            </select>

            {selectedType && (
              <p className="text-xs text-gray-400">
                示例：{DOCUMENT_TYPES.find(d => d.id === selectedType)?.examples}
              </p>
            )}

            <input
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              className="input-field text-sm w-full"
              placeholder="填写证件号码"
              onKeyDown={e => e.key === 'Enter' && addDocument()}
            />

            <button onClick={addDocument} className="btn-secondary flex items-center gap-2 text-sm w-full justify-center">
              <Plus size={15} /> 添加此证件
            </button>
          </div>

          {/* Photo Upload */}
          <div className="border-t border-gray-100 pt-4">
            <label className="label text-sm mb-2 block">上传证件照片（可选，建议上传以加快审核）</label>
            {IS_DEMO && (
              <p className="text-xs text-orange-500 mb-2">演示模式：照片不会实际上传</p>
            )}
            <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-300 transition-colors">
              <Upload size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {photoFiles.length > 0 ? `已选择 ${photoFiles.length} 个文件` : '点击选择照片（支持 JPG/PNG）'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => setPhotoFiles(Array.from(e.target.files || []))}
              />
            </label>
          </div>
        </div>
      )}

      {/* Document List */}
      {selectedDocs.length > 0 && (status === null || status === 'rejected') && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">已添加的证件</h2>
          <div className="space-y-2">
            {selectedDocs.map(doc => (
              <div key={doc.type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">证件号：{doc.number}</p>
                </div>
                <span className="text-sm font-bold text-brand-600 flex-shrink-0">{doc.points}分</span>
                <button
                  onClick={() => removeDocument(doc.type)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {(status === null || status === 'rejected') && (
        <button
          onClick={handleSubmit}
          disabled={totalPoints < POINTS_REQUIRED || submitting}
          className="w-full btn-teal py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? '提交中...' : `提交身份认证申请（${totalPoints}分）`}
        </button>
      )}

      {status === 'approved' && (
        <Link href="/dashboard/sitter" className="btn-teal w-full py-3.5 text-center text-base inline-block">
          返回铲屎官中心
        </Link>
      )}
    </div>
  )
}
