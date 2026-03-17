# Identity Verification + Admin Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Australian 100-point identity verification for sitters and a full admin backend for reviewing submissions and managing users.

**Architecture:** Client-side Next.js pages backed by Supabase (PostgreSQL + Storage). Admin auth uses a `profiles.is_admin` boolean checked in `useEffect` (compatible with `output: 'export'`). No test framework exists — verify each task by running `npm run build` and visually checking the browser.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase JS client, lucide-react, react-hot-toast

**Spec:** `docs/superpowers/specs/2026-03-17-identity-verification-admin-design.md`

---

## Chunk 1: Foundation — Database, Types, and Scoring Logic

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/004_id_verification.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/004_id_verification.sql

-- 1. Add is_admin to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create verification status enum
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS public.id_verification_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       verification_status NOT NULL DEFAULT 'pending',
  total_points INTEGER NOT NULL CHECK (total_points BETWEEN 0 AND 500),
  documents    JSONB NOT NULL DEFAULT '[]',
  photo_urls   JSONB NOT NULL DEFAULT '[]',
  admin_note   TEXT,
  reviewed_by  UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Unique index: only one pending/approved per user
CREATE UNIQUE INDEX IF NOT EXISTS one_active_submission_per_user
  ON public.id_verification_submissions (user_id)
  WHERE status IN ('pending', 'approved');

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION public.update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS id_verification_updated_at ON public.id_verification_submissions;
CREATE TRIGGER id_verification_updated_at
  BEFORE UPDATE ON public.id_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_verification_updated_at();

-- 6. RLS
ALTER TABLE public.id_verification_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON public.id_verification_submissions;
CREATE POLICY "Users can view own submissions"
  ON public.id_verification_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own submissions" ON public.id_verification_submissions;
CREATE POLICY "Users can insert own submissions"
  ON public.id_verification_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can do everything" ON public.id_verification_submissions;
CREATE POLICY "Admins can do everything"
  ON public.id_verification_submissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 7. Trigger: sync sitters.id_verified on status change
CREATE OR REPLACE FUNCTION public.sync_id_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = OLD.status) THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'approved' THEN
    UPDATE public.sitters SET id_verified = TRUE WHERE user_id = NEW.user_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE public.sitters SET id_verified = FALSE WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_verification_status_change ON public.id_verification_submissions;
CREATE TRIGGER on_verification_status_change
  AFTER INSERT OR UPDATE OF status ON public.id_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_id_verified();
```

- [ ] **Step 2: Apply to Supabase**

If using Supabase CLI:
```bash
supabase db push
```

If using Supabase Dashboard: open SQL Editor, paste the file content, run it.

- [ ] **Step 3: Create Storage bucket (Supabase Dashboard)**

1. Go to Storage → New bucket
2. Name: `verification-docs`
3. Public: **OFF** (private bucket)
4. Then in SQL Editor run:

```sql
-- Storage RLS policies
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all verification files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/004_id_verification.sql
git commit -m "feat: add id_verification_submissions table and admin flag"
```

---

### Task 2: TypeScript Types

**Files:**
- Modify: `lib/supabase/database.types.ts`

- [ ] **Step 1: Add `is_admin` to profiles type**

In `lib/supabase/database.types.ts`, find the `profiles` Row/Insert/Update interfaces and add:

```typescript
// In profiles Row:
is_admin: boolean

// In profiles Insert:
is_admin?: boolean

// In profiles Update:
is_admin?: boolean
```

- [ ] **Step 2: Add `id_verification_submissions` table**

After the existing table definitions, add before the closing `}` of `Tables`:

```typescript
id_verification_submissions: {
  Row: {
    id: string
    user_id: string
    status: 'pending' | 'approved' | 'rejected'
    total_points: number
    documents: Json
    photo_urls: Json
    admin_note: string | null
    reviewed_by: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    status?: 'pending' | 'approved' | 'rejected'
    total_points: number
    documents: Json
    photo_urls?: Json
    admin_note?: string | null
    reviewed_by?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    status?: 'pending' | 'approved' | 'rejected'
    total_points?: number
    documents?: Json
    photo_urls?: Json
    admin_note?: string | null
    reviewed_by?: string | null
    updated_at?: string
  }
  Relationships: []
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/linwei/PetSitter && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or pre-existing errors only).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/database.types.ts
git commit -m "feat: add TypeScript types for id_verification_submissions"
```

---

### Task 3: Scoring Logic Library

**Files:**
- Create: `lib/id-verification.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/id-verification.ts

export type DocumentCategory = 'primary' | 'secondary' | 'supporting'

export interface DocumentType {
  id: string
  label: string
  category: DocumentCategory
  points: number
  examples: string // hint for the user
}

export interface SelectedDocument {
  type: string       // DocumentType.id
  name: string       // DocumentType.label
  number: string     // document number entered by user
  points: number     // effective points (after capping)
  category: DocumentCategory
}

export const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'passport',      label: '护照 (Passport)',           category: 'primary',    points: 70, examples: '护照号码，如 PA1234567' },
  { id: 'birth_cert',    label: '出生证明 (Birth Certificate)', category: 'primary',  points: 70, examples: '证书编号' },
  { id: 'drivers_lic',   label: '驾照 (Driver\'s Licence)',   category: 'secondary',  points: 40, examples: '驾照号码' },
  { id: 'govt_id',       label: '政府身份证 (Government ID)', category: 'secondary',  points: 40, examples: '证件编号' },
  { id: 'medicare',      label: 'Medicare 卡',                category: 'supporting', points: 25, examples: 'Medicare 卡号' },
  { id: 'bank_stmt',     label: '银行对账单',                  category: 'supporting', points: 25, examples: '账户号码后4位' },
  { id: 'utility_bill',  label: '水电煤账单',                  category: 'supporting', points: 25, examples: '账单上的账户号' },
]

/**
 * Calculate total effective points from selected documents.
 * Rule: only the highest-scoring primary document counts.
 */
export function calculatePoints(selected: SelectedDocument[]): number {
  const primaryDocs = selected.filter(d => d.category === 'primary')
  const nonPrimaryDocs = selected.filter(d => d.category !== 'primary')

  const primaryPoints = primaryDocs.length > 0
    ? Math.max(...primaryDocs.map(d => d.points))
    : 0

  const nonPrimaryPoints = nonPrimaryDocs.reduce((sum, d) => sum + d.points, 0)

  return primaryPoints + nonPrimaryPoints
}

/** Returns true if a document type is already in the selected list */
export function isDocumentSelected(selected: SelectedDocument[], typeId: string): boolean {
  return selected.some(d => d.type === typeId)
}

export const POINTS_REQUIRED = 100

export function getStatusLabel(status: 'pending' | 'approved' | 'rejected' | null): string {
  if (!status) return '未提交'
  return { pending: '审核中', approved: '已通过', rejected: '已拒绝' }[status]
}

export function getStatusColor(status: 'pending' | 'approved' | 'rejected' | null): string {
  if (!status) return 'text-gray-500'
  return {
    pending: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
  }[status]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/linwei/PetSitter && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/id-verification.ts
git commit -m "feat: add 100-point scoring logic and document type definitions"
```

---

## Chunk 2: Sitter Verification Page

### Task 4: Verification Form Page

**Files:**
- Create: `app/(main)/dashboard/sitter/verification/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
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
  getStatusLabel,
  getStatusColor,
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
            // Let user re-fill form; pre-populate from last submission
            const docs = sub.documents as SelectedDocument[]
            if (Array.isArray(docs)) setSelectedDocs(docs)
          }
        }
      } catch {
        // Genuine DB error — keep hasSitterProfile false; IS_DEMO case handled above
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

      // Insert submission (delete old rejected first)
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
            <p className="text-green-700 text-xs mt-0.5">您的身份认证已通过，铲屎官档案显示"已认证"徽章。</p>
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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1 | tail -20
```

Expected: build succeeds (no TypeScript errors from new file).

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/dashboard/sitter/verification/
git commit -m "feat: add sitter identity verification form page"
```

---

### Task 5: Update Sitter Dashboard — Add Verification Status Card

**Files:**
- Modify: `app/(main)/dashboard/sitter/page.tsx`

- [ ] **Step 1: Add import and verification card to sitter dashboard**

In `app/(main)/dashboard/sitter/page.tsx`, after the existing imports add:
```typescript
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
```

- [ ] **Step 2: Add state and load verification status**

Inside `SitterDashboardPage`, after the `services` state, add:
```typescript
const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)
```

Inside the `check` async function (after `setHasSitterProfile(!!data)`), add:
```typescript
// Load verification status
const { data: sub } = await supabase
  .from('id_verification_submissions')
  .select('status')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single()
if (sub) setVerificationStatus(sub.status as 'pending' | 'approved' | 'rejected')
```

- [ ] **Step 3: Add verification card to the sitter dashboard JSX**

The sitter page has conditional rendering: when `hasSitterProfile === false` it shows the "become a sitter" screen, and when `hasSitterProfile === true` it shows the full dashboard (line ~113: `return (<div className="space-y-6">`). Add the verification card **inside the `hasSitterProfile === true` branch**, immediately BEFORE the `{/* Stats */}` comment (around line 132):

```tsx
{/* Identity Verification Card */}
<div className={`card p-4 flex items-center gap-4 ${
  verificationStatus === 'approved' ? 'bg-green-50 border-green-200' :
  verificationStatus === 'rejected' ? 'bg-red-50 border-red-200' :
  verificationStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' :
  'bg-gray-50 border-gray-200'
}`}>
  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
    verificationStatus === 'approved' ? 'bg-green-100' :
    verificationStatus === 'rejected' ? 'bg-red-100' :
    verificationStatus === 'pending' ? 'bg-yellow-100' :
    'bg-gray-100'
  }`}>
    {verificationStatus === 'approved'
      ? <ShieldCheck size={20} className="text-green-600" />
      : verificationStatus === 'rejected'
      ? <ShieldAlert size={20} className="text-red-600" />
      : <Shield size={20} className={verificationStatus === 'pending' ? 'text-yellow-600' : 'text-gray-400'} />
    }
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-semibold text-sm text-gray-900">
      {verificationStatus === 'approved' ? '身份认证已通过 ✓'
       : verificationStatus === 'rejected' ? '身份认证未通过'
       : verificationStatus === 'pending' ? '身份认证审核中'
       : '完成身份认证'}
    </p>
    <p className="text-xs text-gray-500 mt-0.5">
      {verificationStatus === 'approved' ? '铲屎官档案显示已认证徽章'
       : verificationStatus === 'rejected' ? '请重新提交证件材料'
       : verificationStatus === 'pending' ? '通常1-3个工作日完成审核'
       : '提交澳洲100分证件，获得认证徽章'}
    </p>
  </div>
  {verificationStatus !== 'approved' && (
    <Link
      href="/dashboard/sitter/verification"
      className="text-xs font-medium text-brand-600 hover:text-brand-700 flex-shrink-0"
    >
      {verificationStatus === 'rejected' ? '重新提交 →' : verificationStatus === 'pending' ? '查看详情 →' : '立即认证 →'}
    </Link>
  )}
</div>
```

Also add `Link` import if not already present at top: `import Link from 'next/link'` (check if already imported).

- [ ] **Step 4: Verify build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/dashboard/sitter/page.tsx
git commit -m "feat: add identity verification status card to sitter dashboard"
```

---

## Chunk 3: Admin Backend

### Task 6: Admin Layout with Auth Protection

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Create admin layout**

```tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ShieldCheck, Users, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard, exact: true },
  { href: '/admin/verifications', label: '认证审核', icon: ShieldCheck },
  { href: '/admin/users', label: '用户管理', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminName, setAdminName] = useState('管理员')
  const [pendingCount, setPendingCount] = useState(0)
  const [checking, setChecking] = useState(!IS_DEMO)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  useEffect(() => {
    if (IS_DEMO) { setChecking(false); return }
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_admin')
          .eq('id', user.id)
          .single()

        if (!profile?.is_admin) { router.push('/'); return }

        if (profile.full_name) setAdminName(profile.full_name)

        // Load pending count
        const { count } = await supabase
          .from('id_verification_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        setPendingCount(count || 0)
      } catch {
        // Supabase error: allow in demo
      } finally {
        setChecking(false)
      }
    }
    checkAdmin()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">验证管理员身份...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-gray-900 text-white h-12 flex items-center px-4 gap-4">
        <span className="font-bold text-sm text-white/90">🐾 喵管家管理后台</span>
        <span className="text-white/30 text-xs ml-auto">管理员：{adminName}</span>
        {IS_DEMO && (
          <span className="bg-yellow-500 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded">演示模式</span>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3rem)] p-4 flex flex-col">
          <nav className="space-y-1 flex-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive(item)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}>
                <item.icon size={16} />
                {item.label}
                {item.href === '/admin/verifications' && pendingCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
                {isActive(item) && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 pt-3">
            <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mb-2 px-3">
              ← 返回前台
            </Link>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={14} /> 退出登录
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: add admin layout with client-side auth protection"
```

---

### Task 7: Admin Dashboard Page

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create dashboard page with mock + real data**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Users, ShieldCheck, Clock, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const MOCK_STATS = { users: 128, sitters: 34, pending: 5, newThisMonth: 23 }
const MOCK_PENDING = [
  { id: '1', name: '陈小明', points: 110, date: '2026-03-17' },
  { id: '2', name: '王芳',   points: 100, date: '2026-03-16' },
  { id: '3', name: '李雷',   points: 135, date: '2026-03-15' },
]

export default function AdminDashboard() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [stats, setStats] = useState(MOCK_STATS)
  const [pending, setPending] = useState(MOCK_PENDING)

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        const [
          { count: users },
          { count: sitters },
          { count: pendingCount },
          { data: pendingSubs },
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('sitters').select('id', { count: 'exact', head: true }),
          supabase.from('id_verification_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('id_verification_submissions')
            .select('id, total_points, created_at, profiles(full_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const { count: newThisMonth } = await supabase
          .from('profiles').select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart)

        setStats({
          users: users || 0,
          sitters: sitters || 0,
          pending: pendingCount || 0,
          newThisMonth: newThisMonth || 0,
        })

        if (pendingSubs) {
          setPending(pendingSubs.map((s: any) => ({
            id: s.id,
            name: s.profiles?.full_name || '未知用户',
            points: s.total_points,
            date: s.created_at?.slice(0, 10),
          })))
        }
      } catch {
        // Use mock data on error
      }
    }
    load()
  }, [])

  const statCards = [
    { label: '总用户数', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: '铲屎官数', value: stats.sitters, icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
    { label: '待审核申请', value: stats.pending, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: '本月新增', value: stats.newThisMonth, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">仪表盘</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Pending verifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">待审核申请</h2>
          <Link href="/admin/verifications" className="text-sm text-brand-600 hover:text-brand-700">
            查看全部 →
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">暂无待审核申请</p>
        ) : (
          <div className="space-y-2">
            {pending.map(item => (
              <Link key={item.id} href={`/admin/verifications/${item.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                  {item.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
                <span className="text-sm font-bold text-brand-600">{item.points}分</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">待审核</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add admin dashboard with stats and pending submissions"
```

---

### Task 8: Admin Verifications List + Detail Pages

**Files:**
- Create: `app/admin/verifications/page.tsx`
- Create: `app/admin/verifications/[id]/page.tsx`

- [ ] **Step 1: Create verifications list page**

```tsx
// app/admin/verifications/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const STATUS_LABELS = {
  pending: { label: '待审核', class: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', class: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', class: 'bg-red-100 text-red-700' },
}

const MOCK_SUBMISSIONS = [
  { id: '1', name: '陈小明', status: 'pending', points: 110, date: '2026-03-17', docs: 3 },
  { id: '2', name: '王芳',   status: 'approved', points: 100, date: '2026-03-14', docs: 2 },
  { id: '3', name: '李雷',   status: 'rejected', points: 85,  date: '2026-03-10', docs: 2 },
  { id: '4', name: '张华',   status: 'pending', points: 135, date: '2026-03-16', docs: 4 },
  { id: '5', name: '刘洋',   status: 'approved', points: 110, date: '2026-03-12', docs: 3 },
]

export default function VerificationsPage() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS)

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        let query = supabase
          .from('id_verification_submissions')
          .select('id, status, total_points, created_at, documents, profiles(full_name)')
          .order('created_at', { ascending: false })

        if (filter !== 'all') query = query.eq('status', filter)

        const { data } = await query
        if (data) {
          setSubmissions(data.map((s: any) => ({
            id: s.id,
            name: s.profiles?.full_name || '未知用户',
            status: s.status,
            points: s.total_points,
            date: s.created_at?.slice(0, 10),
            docs: Array.isArray(s.documents) ? s.documents.length : 0,
          })))
        }
      } catch { /* use mock */ }
    }
    load()
  }, [filter])

  const filtered = submissions.filter(s =>
    filter === 'all' || s.status === filter
  ).filter(s => !search || s.name.includes(search))

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">身份认证审核</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}>
              {s === 'all' ? '全部' : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="搜索用户名"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="col-span-2">申请人</div>
          <div className="text-center">积分</div>
          <div className="text-center">状态</div>
          <div className="text-right">提交日期</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">暂无符合条件的申请</div>
        ) : (
          filtered.map(sub => (
            <Link key={sub.id} href={`/admin/verifications/${sub.id}`}
              className="grid grid-cols-5 items-center px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                  {sub.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{sub.name}</p>
                  <p className="text-xs text-gray-400">{sub.docs} 件证件</p>
                </div>
              </div>
              <div className="text-center font-bold text-brand-600">{sub.points}分</div>
              <div className="text-center">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_LABELS[sub.status as keyof typeof STATUS_LABELS].class)}>
                  {STATUS_LABELS[sub.status as keyof typeof STATUS_LABELS].label}
                </span>
              </div>
              <div className="text-right text-sm text-gray-500">{sub.date}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create verification detail page**

```tsx
// app/admin/verifications/[id]/page.tsx
// IMPORTANT: Required for Next.js static export compatibility
export function generateStaticParams() { return [] }

'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const MOCK_DETAIL = {
  id: '1',
  name: '陈小明',
  status: 'pending' as const,
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

export default function VerificationDetailPage() {
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

        // Generate signed URLs for photos (1 hour expiry)
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
                {{ primary: '主要证件', secondary: '次要证件', supporting: '辅助证件' }[(doc.category as string)] || doc.category}
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

      {/* Previous decision */}
      {sub.status !== 'pending' && sub.adminNote && (
        <div className={`rounded-2xl border p-4 ${sub.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-sm font-medium text-gray-700">审核备注：</p>
          <p className="text-sm text-gray-600 mt-1">{sub.adminNote}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/verifications/
git commit -m "feat: add admin verifications list and detail pages"
```

---

### Task 9: Admin Users Page

**Files:**
- Create: `app/admin/users/page.tsx`

- [ ] **Step 1: Create users page**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, ShieldCheck, Cat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

const MOCK_USERS = [
  { id: '1', name: '林晓雨', email: 'lin@example.com', isSitter: true, isAdmin: false, joinDate: '2025-10-01' },
  { id: '2', name: '王建辉', email: 'wang@example.com', isSitter: true, isAdmin: false, joinDate: '2025-11-15' },
  { id: '3', name: '张美玲', email: 'zhang@example.com', isSitter: false, isAdmin: false, joinDate: '2025-12-01' },
  { id: '4', name: '管理员', email: 'admin@example.com', isSitter: false, isAdmin: true, joinDate: '2025-09-01' },
  { id: '5', name: '陈思远', email: 'chen@example.com', isSitter: true, isAdmin: false, joinDate: '2026-01-10' },
]

export default function AdminUsersPage() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [users, setUsers] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (IS_DEMO) return
    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, is_sitter, is_admin, created_at')
          .order('created_at', { ascending: false })
          .limit(100)

        if (data) {
          setUsers(data.map((p: any) => ({
            id: p.id,
            name: p.full_name || '未命名',
            email: '',  // email not in profiles table
            isSitter: p.is_sitter || false,
            isAdmin: p.is_admin || false,
            joinDate: p.created_at?.slice(0, 10),
          })))
        }
      } catch { /* use mock */ }
    }
    load()
  }, [])

  const filtered = users.filter(u =>
    !search || u.name.includes(search) || u.email.includes(search)
  )

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">用户管理</h1>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="搜索用户名或邮箱"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="col-span-2">用户</div>
          <div className="text-center">角色</div>
          <div className="text-right">注册日期</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">没有找到用户</div>
        ) : (
          filtered.map(user => (
            <div key={user.id} className="grid grid-cols-4 items-center px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                  {user.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                  {user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                {user.isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck size={10} /> 管理员
                  </span>
                )}
                {user.isSitter && (
                  <span className="flex items-center gap-1 text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                    <Cat size={10} /> 铲屎官
                  </span>
                )}
                {!user.isAdmin && !user.isSitter && (
                  <span className="text-xs text-gray-400">普通用户</span>
                )}
              </div>
              <div className="text-right text-sm text-gray-400">{user.joinDate}</div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        共 {filtered.length} 位用户 · 如需设置管理员，请在 Supabase SQL Editor 执行：
        <code className="bg-gray-100 px-1 rounded ml-1">UPDATE profiles SET is_admin = TRUE WHERE id = (SELECT id FROM auth.users WHERE email = 'xxx');</code>
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/users/page.tsx
git commit -m "feat: add admin users management page"
```

---

## Chunk 4: Final Integration

### Task 10: Final Build Verification + Push

- [ ] **Step 1: Run full build**

```bash
cd /home/linwei/PetSitter && npm run build 2>&1
```

Expected: no TypeScript errors, all pages compile successfully.

- [ ] **Step 2: Check that admin routes are in the output**

```bash
ls out/admin/ 2>/dev/null || echo "check: static export may use different structure"
```

- [ ] **Step 3: Quick smoke test in browser**

Start dev server and manually verify:
```bash
npm run dev
```
Visit:
- `http://localhost:3000/PetSitter/dashboard/sitter` — should show verification card
- `http://localhost:3000/PetSitter/dashboard/sitter/verification` — should show form with point counter
- `http://localhost:3000/PetSitter/admin` — should show dashboard (demo mode)
- `http://localhost:3000/PetSitter/admin/verifications` — should show list
- `http://localhost:3000/PetSitter/admin/users` — should show user list

- [ ] **Step 4: Final commit and push**

```bash
git push origin HEAD
```

This pushes the current branch and triggers GitHub Actions to deploy to GitHub Pages.

---

## Summary: Files Created/Modified

| File | Action |
|------|--------|
| `supabase/migrations/004_id_verification.sql` | Create |
| `lib/supabase/database.types.ts` | Modify |
| `lib/id-verification.ts` | Create |
| `app/(main)/dashboard/sitter/verification/page.tsx` | Create |
| `app/(main)/dashboard/sitter/page.tsx` | Modify |
| `app/admin/layout.tsx` | Create |
| `app/admin/page.tsx` | Create |
| `app/admin/verifications/page.tsx` | Create |
| `app/admin/verifications/[id]/page.tsx` | Create |
| `app/admin/users/page.tsx` | Create |
