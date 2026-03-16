# 🐱 喵管家 - 悉尼华人猫咪照护平台

专为悉尼华人社区打造的猫咪上门喂养、寄养预订平台，参考 MadPaws 设计，服务悉尼各华人聚居区（Chatswood、Hurstville、Burwood、Eastwood 等）。

## 功能特色

- 🏠 **猫咪寄养** - 铲屎官家中寄养，全天候照顾
- 🚪 **上门喂猫** - 铲屎官到您家上门服务
- 👤 **用户认证** - Supabase Auth 邮箱注册/登录
- 🐾 **宠物档案** - 详细的猫咪信息管理
- 📅 **预订系统** - 完整的预订→确认→支付流程
- ⭐ **评价体系** - 真实用户评价
- 💬 **站内消息** - 主人与铲屎官实时沟通
- 🛡️ **资金托管** - 服务完成后才放款
- 📱 **响应式设计** - 完美支持手机端

## 覆盖区域

服务悉尼各华人聚居区，包括：

Chatswood · Hurstville · Burwood · Eastwood · Rhodes · Strathfield · Parramatta · Ashfield · Campsie · Kingsford · Randwick · Auburn · Blacktown · Haymarket · Kogarah · Rockdale · Lane Cove · North Sydney · Hornsby · Liverpool · Bankstown · Mascot · Zetland · Bondi · Surry Hills

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL + RLS)
- **认证**: Supabase Auth
- **部署**: GitHub Pages (静态导出)

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/Linwei94/PetSitter.git
cd PetSitter
npm install
```

### 2. 配置 Supabase

1. 前往 [supabase.com](https://supabase.com) 创建新项目
2. 在 SQL Editor 中运行 `supabase/migrations/001_initial_schema.sql`
3. 复制 `.env.local.example` 为 `.env.local`，填入您的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 启动开发服务器
```bash
npm run dev
# 访问 http://localhost:3000
```

### 4. 构建静态版本
```bash
npm run build
# 生成 /out 目录，可部署到 GitHub Pages
```

## 部署到 GitHub Pages

1. 在 GitHub 仓库 Settings → Secrets 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`（您的 GitHub Pages URL，如 `https://linwei94.github.io/PetSitter`）

2. 推送到 `main` 分支，GitHub Actions 自动构建并部署

3. 在 Settings → Pages 中选择 GitHub Actions 作为来源

## 数据库 Schema

主要表结构：

| 表名 | 说明 |
|------|------|
| `profiles` | 用户档案（扩展 Supabase auth） |
| `sitters` | 铲屎官档案 |
| `sitter_services` | 铲屎官提供的服务和定价 |
| `sitter_photos` | 铲屎官相册 |
| `pets` | 宠物档案 |
| `bookings` | 预订记录 |
| `reviews` | 用户评价 |
| `messages` | 站内消息 |
| `notifications` | 系统通知 |
| `favorites` | 收藏的铲屎官 |

## 项目结构

```
├── app/
│   ├── (main)/             # 主布局（含 Header/Footer）
│   │   ├── page.tsx        # 首页
│   │   ├── sitters/        # 搜索 & 详情页
│   │   ├── services/       # 服务介绍页
│   │   ├── booking/        # 预订流程
│   │   └── dashboard/      # 用户中心
│   ├── auth/               # 登录/注册
│   └── globals.css
├── components/
│   ├── layout/             # Header, Footer
│   ├── home/               # 首页各模块
│   └── sitters/            # 铲屎官卡片等
├── lib/
│   ├── supabase/           # Supabase 客户端 & 类型
│   └── utils.ts
└── supabase/
    └── migrations/         # 数据库 SQL
```

## 后续计划

- [ ] 狗狗服务（遛狗、寄养）
- [ ] 微信/支付宝/PayID 支付集成
- [ ] 实时消息（Supabase Realtime）
- [ ] 地图搜索（Google Maps API）
- [ ] 铲屎官服务报告（含多张照片）
- [ ] 定期预订（每周固定上门）
- [ ] 手机 App（React Native）
- [ ] 扩展至墨尔本、布里斯班华人社区
