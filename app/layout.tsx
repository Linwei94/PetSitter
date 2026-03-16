import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: '喵管家 - 专业猫咪上门喂养·寄养平台',
    template: '%s | 喵管家',
  },
  description: '喵管家是中国领先的猫咪专业护理平台，提供上门喂猫、猫咪寄养等专业服务。5000+认证铲屎官，让您的猫咪得到最贴心的照顾。',
  keywords: ['猫咪寄养', '上门喂猫', '猫咪护理', '宠物寄养', '猫咪保姆', '宠物服务'],
  authors: [{ name: '喵管家' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '喵管家',
    title: '喵管家 - 专业猫咪上门喂养·寄养平台',
    description: '找到您身边最专业的猫咪护理专家',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
