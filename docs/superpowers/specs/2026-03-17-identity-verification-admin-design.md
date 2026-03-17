# 澳洲100分身份认证 + 管理员后台 — 设计规格

**日期：** 2026-03-17
**项目：** PetSitter（猫咪寄养平台）
**状态：** 已批准，待实现

---

## 1. 背景与目标

铲屎官需要完成澳洲100分身份认证才能获得"已认证"徽章，提升平台信任度。同时需要一个管理员后台来审核证件申请、管理用户，并查看平台关键指标。

---

## 2. 数据库 Schema

### 2.1 修改 `profiles` 表
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

注：`profiles.is_verified` 字段不在本功能范围内，不修改。认证状态仅通过 `sitters.id_verified` 反映。

### 2.2 新增 `id_verification_submissions` 表
```sql
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE id_verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status verification_status NOT NULL DEFAULT 'pending',
  total_points INTEGER NOT NULL CHECK (total_points BETWEEN 0 AND 500), -- 前端计算，管理员审核为最终把关
  documents JSONB NOT NULL, -- [{type, name, number, points, category}]
  photo_urls JSONB NOT NULL DEFAULT '[]', -- ["path/in/storage", ...]（存储路径，非 URL）
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id), -- 审核时由应用层写入 auth.uid()
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每个用户最多一条 pending 或 approved 记录（防止重复提交覆盖已通过状态）
CREATE UNIQUE INDEX one_active_submission_per_user
  ON id_verification_submissions (user_id)
  WHERE status IN ('pending', 'approved');

-- updated_at 自动维护
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER id_verification_updated_at
  BEFORE UPDATE ON id_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2.3 RLS 策略
```sql
ALTER TABLE id_verification_submissions ENABLE ROW LEVEL SECURITY;

-- 用户查看自己的申请
CREATE POLICY "Users can view own submissions"
  ON id_verification_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- 用户提交新申请（确保 user_id 为自己）
CREATE POLICY "Users can insert own submissions"
  ON id_verification_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理员全权操作（SELECT/INSERT/UPDATE/DELETE）
CREATE POLICY "Admins can do everything"
  ON id_verification_submissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
```

### 2.4 触发器：审核后同步 `sitters.id_verified`
```sql
CREATE OR REPLACE FUNCTION sync_id_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- 同时处理 INSERT 和 UPDATE（防止管理员直接插入 approved 状态的记录时漏触发）
  IF (TG_OP = 'UPDATE' AND NEW.status = OLD.status) THEN
    RETURN NEW; -- 状态未变，跳过
  END IF;

  IF NEW.status = 'approved' THEN
    -- 只更新已存在的 sitters 行；应用层需确保用户先创建铲屎官档案
    UPDATE sitters SET id_verified = TRUE WHERE user_id = NEW.user_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE sitters SET id_verified = FALSE WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_verification_status_change
  AFTER INSERT OR UPDATE OF status ON id_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION sync_id_verified();
```

**重要约束：** 用户必须先在铲屎官中心创建铲屎官档案（存在 `sitters` 行），才能提交身份认证。应用层在提交前检查此条件。

### 2.5 Supabase Storage RLS（`verification-docs` bucket）
```sql
-- 在 Supabase Dashboard 创建 bucket: verification-docs（非公开）

-- 用户只能上传/查看自己目录下的文件（路径格式：{user_id}/{filename}）
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 管理员可查看所有文件
CREATE POLICY "Admins can view all files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
```

---

## 3. 澳洲100分证件体系

| 类别 | 证件 | 分值 |
|------|------|------|
| 主要证件（category: primary，最多计1个） | 护照 | 70分 |
| | 出生证明 | 70分 |
| 次要证件（category: secondary） | 驾照 | 40分 |
| | 政府ID卡 | 40分 |
| 辅助证件（category: supporting，可多个） | Medicare卡 | 25分 |
| | 银行对账单 | 25分 |
| | 水电煤账单 | 25分 |

**积分计算规则（在 `lib/id-verification.ts` 中实现）：**
1. 遍历已选证件，主要证件只取积分最高的一个（其余主要证件积分计0）
2. 次要证件和辅助证件各自正常累加
3. 返回总积分，达到100才允许提交
4. 每种证件类型只能添加一次（前端去重检查）

---

## 4. 铲屎官端：身份认证流程

### 4.1 页面结构
- **前置条件：** 用户已创建铲屎官档案（`sitters` 行存在）
- 入口：`/dashboard/sitter` → "身份认证"状态卡片 → 点击进入
- 表单页：`/dashboard/sitter/verification`（新页面）

### 4.2 页面组件树
```
VerificationPage
├── StatusBanner          ← 显示当前状态（无/审核中/已通过/已拒绝+原因）
├── PointsProgress        ← 实时积分进度条（0/100）
├── DocumentForm          ← 添加证件（仅 status=null 或 rejected 时显示）
│   ├── DocumentTypeSelect ← 选择证件类型（已选的禁用）
│   ├── DocumentNumberInput ← 填写证件号码
│   └── PhotoUpload       ← 上传正面/背面照片（降级：演示模式跳过）
├── DocumentList          ← 已添加证件列表（可删除）
└── SubmitButton          ← 达到100分且有铲屎官档案才激活
```

### 4.3 状态流转
```
无申请记录
  ↓ 用户提交（total_points >= 100）
pending（审核中）
  ↓ 管理员审核（写入 reviewed_by = admin uid，admin_note）
approved → sitters.id_verified = TRUE   |   rejected → 可重新提交
```

### 4.4 降级模式（Supabase 未配置）
- 表单正常显示，本地 state 模拟状态流转
- 照片上传显示提示："演示模式，照片不会实际上传"
- 提交后本地状态变为 pending

---

## 5. 管理员后台

### 5.1 路由结构
```
/admin                      ← 权限检查在 layout.tsx（client-side）
/admin                      ← 数据概览仪表盘
/admin/verifications        ← 认证申请列表
/admin/verifications/[id]   ← 申请详情 + 审核操作
/admin/users                ← 用户管理列表
```

### 5.2 权限保护（Client-Side，兼容静态导出）

项目使用 `output: 'export'`，Next.js middleware 在静态导出模式下不工作。权限检查在 `app/admin/layout.tsx` 的 `useEffect` 中实现：

```typescript
// app/admin/layout.tsx
'use client'
useEffect(() => {
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles')
      .select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) { router.push('/'); return }
  }
  checkAdmin()
}, [])
```

降级模式（Supabase 未配置）：显示演示数据，不做权限检查。

### 5.3 第一个管理员的创建

通过 Supabase Dashboard 的 SQL Editor 手动执行（`profiles` 表无 email 字段，需通过 `auth.users` 关联）：
```sql
UPDATE profiles SET is_admin = TRUE
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### 5.4 仪表盘 `/admin`
- 指标卡片：总用户数、铲屎官数、待审核数、本月新增用户
- 最近5条待审申请快速列表（点击跳转详情）

### 5.5 认证审核 `/admin/verifications`
- 列表：申请人姓名、提交时间、总积分、状态
- 状态筛选：全部 / 待审核 / 已通过 / 已拒绝
- 详情页 `/admin/verifications/[id]`：
  - 查看证件列表（类型、号码、积分）
  - 查看证件照片：`photo_urls` 存储 object 路径，详情页组件调用 `supabase.storage.from('verification-docs').createSignedUrl(path, 3600)` 生成有效期1小时的临时访问链接
  - 填写审核备注（admin_note）
  - 通过/拒绝按钮 → UPDATE status + reviewed_by = auth.uid()

### 5.6 用户管理 `/admin/users`
- 列表：用户名、邮箱、注册时间、角色
- 搜索功能
- 封禁功能预留（future）

### 5.7 管理员布局
- 独立 layout，与 `/dashboard` 完全分离
- 左侧侧边栏：仪表盘、认证审核（pending 数量红点）、用户管理
- 顶栏：管理员信息、退出

---

## 6. 文件结构

```
app/
├── (main)/
│   └── dashboard/
│       └── sitter/
│           ├── page.tsx              ← 更新：加认证状态卡片
│           └── verification/
│               └── page.tsx          ← 新建：认证表单页
├── admin/                            ← 新建：管理员后台（静态导出兼容）
│   ├── layout.tsx                    ← client-side 权限检查
│   ├── page.tsx                      ← 仪表盘
│   ├── verifications/
│   │   ├── page.tsx                  ← 申请列表
│   │   └── [id]/
│   │       └── page.tsx              ← 申请详情
│   └── users/
│       └── page.tsx                  ← 用户列表
lib/
└── id-verification.ts                ← 证件类型定义、积分计算（含主要证件上限逻辑）
supabase/
└── migrations/
    └── 004_id_verification.sql       ← 上述所有 SQL
```

**注：** 实现后需同步更新 `lib/supabase/database.types.ts`，加入 `id_verification_submissions` 表类型和 `profiles.is_admin` 字段，以消除 TypeScript 错误。

---

## 7. 技术约束

- **静态导出兼容：** 管理员后台全部使用 client-side rendering（`'use client'`）
- **图片上传：** Supabase Storage bucket `verification-docs`，路径格式 `{user_id}/{filename}`
- **降级兼容：** Supabase 未配置时所有页面显示 mock 数据，不报错

---

## 8. 范围外（Future）

- 邮件通知（审核结果通知铲屎官）
- 封禁账户功能
- 管理员操作日志
- 批量审核
- `profiles.is_verified` 字段联动
