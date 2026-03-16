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
  return `¥${amount.toFixed(0)}`
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

export const CITIES = [
  '上海', '北京', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州',
  '厦门', '重庆', '天津', '长沙', '郑州', '青岛', '大连', '宁波', '无锡', '福州',
]

export const SHANGHAI_DISTRICTS = [
  '浦东新区', '黄浦区', '静安区', '徐汇区', '长宁区', '普陀区',
  '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '松江区',
  '青浦区', '奉贤区', '金山区', '崇明区',
]

export const CAT_BREEDS = [
  '中华田园猫', '英国短毛猫', '美国短毛猫', '布偶猫', '波斯猫', '暹罗猫',
  '缅因猫', '挪威森林猫', '苏格兰折耳猫', '俄罗斯蓝猫', '孟加拉猫',
  '阿比西尼亚猫', '索马里猫', '缅甸猫', '土耳其安哥拉猫', '其他',
]
