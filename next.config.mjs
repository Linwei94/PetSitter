/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 静态导出
  output: 'export',
  trailingSlash: true,
  // 如果部署到 /repo-name/ 而非根目录，取消注释并修改：
  // basePath: '/PetSitter',
  // assetPrefix: '/PetSitter/',
  images: {
    unoptimized: true, // GitHub Pages 不支持 Next.js Image Optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
};

export default nextConfig;
