import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'yyyy年M月d日') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: zhCN })
}

export function formatPrice(amount: number) {
  return `A$${amount.toFixed(0)}`
}

export function calculateBookingDays(startDate: string, endDate: string) {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) || 1
}

export function calculateTotalPrice(
  pricePerNight: number,
  startDate: string,
  endDate: string,
  numCats = 1,
  additionalCatPrice = 30
) {
  const days = calculateBookingDays(startDate, endDate)
  const basePrice = pricePerNight * days
  const additionalPrice = numCats > 1 ? (numCats - 1) * additionalCatPrice * days : 0
  return basePrice + additionalPrice
}

export function getAvatarUrl(name: string, avatarUrl?: string | null) {
  if (avatarUrl) return avatarUrl
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '用户')}&background=f97316&color=fff&size=128`
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const CITIES = ['悉尼']

export const SYDNEY_SUBURBS = [
  'Chatswood', 'Hurstville', 'Burwood', 'Eastwood', 'Rhodes', 'Strathfield',
  'Parramatta', 'Ashfield', 'Campsie', 'Kingsford', 'Randwick', 'Auburn',
  'Blacktown', 'Haymarket', 'Kogarah', 'Rockdale', 'Lane Cove', 'North Sydney',
  'Hornsby', 'Liverpool', 'Bankstown', 'Mascot', 'Zetland', 'Bondi', 'Surry Hills',
]

export const CAT_BREEDS = [
  '中华田园猫', '英国短毛猫', '美国短毛猫', '布偶猫', '波斯猫', '暹罗猫',
  '缅因猫', '挪威森林猫', '苏格兰折耳猫', '俄罗斯蓝猫', '孟加拉猫',
  '阿比西尼亚猫', '索马里猫', '缅甸猫', '土耳其安哥拉猫', '其他',
]
