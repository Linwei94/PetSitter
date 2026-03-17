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
  { id: 'drivers_lic',   label: "驾照 (Driver's Licence)",   category: 'secondary',  points: 40, examples: '驾照号码' },
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
