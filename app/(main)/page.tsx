import HeroSection from '@/components/home/HeroSection'
import ServiceCards from '@/components/home/ServiceCards'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedSitters from '@/components/home/FeaturedSitters'
import TrustSection from '@/components/home/TrustSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '喵管家 - 专业猫咪上门喂养·寄养平台',
  description: '中国领先的猫咪专业护理平台，5000+认证铲屎官，提供上门喂猫、猫咪寄养服务。',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServiceCards />
      <HowItWorks />
      <FeaturedSitters />
      <TrustSection />
    </>
  )
}
