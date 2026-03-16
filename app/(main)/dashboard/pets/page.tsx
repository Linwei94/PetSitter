'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'

const MOCK_PETS = [
  {
    id: 'p1',
    name: '胖虎',
    breed: '英国短毛猫',
    ageYears: 3,
    ageMonths: 0,
    gender: 'male',
    weightKg: 5.2,
    isNeutered: true,
    isVaccinated: true,
    vaccinationDate: '2024-03-15',
    medicalConditions: '无',
    feedingSchedule: '每天早8点、晚6点各喂半碗干粮，早上加少许罐头',
    litterBoxNotes: '使用矿物猫砂，猫砂盆在洗手间门口',
    behaviorNotes: '性格温顺，喜欢被摸头。比较怕生，新环境需要几小时适应。',
    photo: '🐱',
    microchipNumber: '900182000123456',
  },
  {
    id: 'p2',
    name: '小橘',
    breed: '中华田园猫（橘色）',
    ageYears: 1,
    ageMonths: 6,
    gender: 'female',
    weightKg: 3.8,
    isNeutered: true,
    isVaccinated: true,
    vaccinationDate: '2024-06-20',
    medicalConditions: '无',
    feedingSchedule: '自由采食，保证猫碗有干粮，每天一包主食罐',
    litterBoxNotes: '使用豆腐猫砂',
    behaviorNotes: '活泼好动，爱玩逗猫棒。食欲很好，见到零食就来找人。',
    photo: '🧡',
    microchipNumber: '',
  },
]

export default function PetsPage() {
  const [pets, setPets] = useState(MOCK_PETS)
  const [expandedPet, setExpandedPet] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">我的猫咪</h1>
        <Link href="/dashboard/pets/add" className="btn-primary text-sm py-2 px-4">
          <Plus size={16} /> 添加猫咪
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🐱</div>
          <h3 className="font-semibold text-gray-900 mb-2">还没有添加猫咪档案</h3>
          <p className="text-gray-500 text-sm mb-4">添加猫咪档案后，预订时铲屎官可以更好地了解您的猫咪需求</p>
          <Link href="/dashboard/pets/add" className="btn-primary text-sm py-2 px-5">添加第一只猫咪</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pets.map(pet => (
            <div key={pet.id} className="card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedPet(expandedPet === pet.id ? null : pet.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {pet.photo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">{pet.name}</h3>
                    <span className="text-sm text-gray-500">{pet.gender === 'male' ? '公' : '母'}</span>
                    {pet.isNeutered && <span className="badge bg-green-50 text-green-700 text-xs">已绝育</span>}
                    {pet.isVaccinated && <span className="badge bg-blue-50 text-blue-700 text-xs">已打疫苗</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {pet.breed} · {pet.ageYears}岁{pet.ageMonths > 0 ? `${pet.ageMonths}个月` : ''} · {pet.weightKg}kg
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/pets/edit/${pet.id}`}
                    onClick={e => e.stopPropagation()}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Edit2 size={15} />
                  </Link>
                  <button onClick={e => { e.stopPropagation(); setPets(prev => prev.filter(p => p.id !== pet.id)) }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  <span className={`text-gray-400 transition-transform duration-200 ${expandedPet === pet.id ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </button>

              {/* Expanded details */}
              {expandedPet === pet.id && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="grid sm:grid-cols-2 gap-5 pt-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">基本信息</h4>
                      <div className="space-y-1.5 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="text-gray-400">疫苗接种</span>
                          <span className="flex items-center gap-1">
                            {pet.isVaccinated
                              ? <><CheckCircle2 size={13} className="text-green-500" /> 已接种 ({pet.vaccinationDate})</>
                              : <><XCircle size={13} className="text-red-400" /> 未接种</>}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">绝育状态</span>
                          <span className="flex items-center gap-1">
                            {pet.isNeutered
                              ? <><CheckCircle2 size={13} className="text-green-500" /> 已绝育</>
                              : <><XCircle size={13} className="text-red-400" /> 未绝育</>}
                          </span>
                        </div>
                        {pet.microchipNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">芯片号</span>
                            <span className="font-mono text-xs">{pet.microchipNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">健康状况</span>
                          <span>{pet.medicalConditions}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">饮食 & 日常</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-400 block mb-0.5">喂食安排</span>
                          <span>{pet.feedingSchedule}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-0.5">猫砂盆</span>
                          <span>{pet.litterBoxNotes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">性格 & 行为</h4>
                      <p className="text-sm text-gray-600">{pet.behaviorNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
