import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">😿</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
        <p className="text-xl text-gray-600 mb-2">页面找不到了</p>
        <p className="text-gray-400 text-sm mb-8">您访问的页面不存在或已被移除</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-2.5 text-sm">回到首页</Link>
          <Link href="/sitters" className="btn-secondary px-6 py-2.5 text-sm">找铲屎官</Link>
        </div>
      </div>
    </div>
  )
}
