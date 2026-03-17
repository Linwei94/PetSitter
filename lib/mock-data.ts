export interface MockSitter {
  id: string
  name: string
  priceBoarding: number | undefined
  priceFeeding: number | undefined
  additionalCatPrice: number
}

export const MOCK_SITTERS: MockSitter[] = [
  { id: '1', name: '林晓雨', priceBoarding: 60, priceFeeding: 30, additionalCatPrice: 20 },
  { id: '2', name: '王建辉', priceBoarding: 75, priceFeeding: undefined, additionalCatPrice: 25 },
  { id: '3', name: '张美玲', priceBoarding: 50, priceFeeding: 25, additionalCatPrice: 18 },
  { id: '4', name: '陈思远', priceBoarding: 55, priceFeeding: 28, additionalCatPrice: 18 },
  { id: '5', name: '刘艺婷', priceBoarding: undefined, priceFeeding: 22, additionalCatPrice: 15 },
  { id: '6', name: '赵小明', priceBoarding: 45, priceFeeding: 24, additionalCatPrice: 15 },
]

export const MOCK_SITTER_MAP: Record<string, MockSitter> = Object.fromEntries(
  MOCK_SITTERS.map(s => [s.id, s])
)
