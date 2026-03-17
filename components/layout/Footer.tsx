'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const serviceLinks = [
  { label: '上门喂猫', href: '/services/cat-feeding' },
  { label: '猫咪寄养', href: '/services/cat-boarding' },
  { label: '找铲屎官', href: '/sitters' },
  { label: '成为铲屎官', href: '/sitters/become' },
]

export default function Footer() {
  const handleComingSoon = () => {
    toast('功能即将上线', { icon: '🔔' })
  }

  const handleAbout = () => {
    toast('关于我们页面即将上线', { icon: '🔔' })
  }

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-xl">
                🐱
              </div>
              <span className="text-xl font-bold text-white">喵管家</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              悉尼华人社区专属猫咪护理平台。500+ 认证铲屎官，守护您的猫咪。
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <MessageCircle size={15} className="text-brand-400 flex-shrink-0" />
                <span>微信客服：MiaoGuanjia</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone size={15} className="text-brand-400 flex-shrink-0" />
                <span>0400-888-000（9:00-21:00）</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Mail size={15} className="text-brand-400 flex-shrink-0" />
                <span>help@miaoguanjia.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">服务</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">帮助中心</h3>
            <ul className="space-y-2.5">
              {[
                '常见问题',
                '服务保障',
                '预订指南',
                '取消政策',
              ].map((label) => (
                <li key={label}>
                  <button
                    onClick={handleComingSoon}
                    className="text-sm hover:text-white transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Badges */}
          <div>
            <h3 className="text-white font-semibold mb-4">服务保障</h3>
            <div className="space-y-3">
              {[
                { icon: '🛡️', title: '实名认证', desc: '所有铲屎官实名验证' },
                { icon: '📸', title: '全程打卡', desc: '喂养全程拍照上传' },
                { icon: '💰', title: '资金托管', desc: '服务完成后自动放款' },
                { icon: '⭐', title: '评价保障', desc: '真实用户评价体系' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © 2024 喵管家 版权所有 · 悉尼，澳大利亚
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy"
              className="text-sm hover:text-white transition-colors">
              隐私政策
            </Link>
            <Link href="/legal/terms"
              className="text-sm hover:text-white transition-colors">
              服务条款
            </Link>
            <button
              onClick={handleAbout}
              className="text-sm hover:text-white transition-colors">
              关于我们
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
