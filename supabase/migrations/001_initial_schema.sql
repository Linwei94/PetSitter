-- ============================================================
-- 喵管家 - 猫咪寄养平台数据库 Schema
-- ============================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- 可选：用于地理位置搜索

-- ============================================================
-- 用户档案表 (扩展 Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT UNIQUE,
  wechat_id   TEXT,
  city        TEXT DEFAULT '上海',
  district    TEXT,
  bio         TEXT,
  is_sitter   BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户时自动创建档案
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 铲屎官档案表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sitters (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  title                 TEXT,                          -- 头衔，如 "专业猫咪保姆"
  description           TEXT,                          -- 详细介绍
  years_experience      INT DEFAULT 0,
  home_type             TEXT,                          -- 'apartment'公寓, 'house'别墅, 'other'其他
  home_size             TEXT,                          -- 'small'小型, 'medium'中型, 'large'大型
  has_outdoor_space     BOOLEAN DEFAULT FALSE,
  has_children          BOOLEAN DEFAULT FALSE,
  has_own_pets          BOOLEAN DEFAULT FALSE,
  own_pets_description  TEXT,
  max_cats              INT DEFAULT 2,
  accepts_kittens       BOOLEAN DEFAULT TRUE,
  accepts_senior_cats   BOOLEAN DEFAULT TRUE,
  accepts_special_needs BOOLEAN DEFAULT FALSE,
  emergency_contact     TEXT,
  certificate_url       TEXT,                          -- 资质证书
  id_verified           BOOLEAN DEFAULT FALSE,
  background_checked    BOOLEAN DEFAULT FALSE,
  rating                DECIMAL(3,2) DEFAULT 0.0,
  review_count          INT DEFAULT 0,
  response_rate         INT DEFAULT 100,
  response_time_hours   INT DEFAULT 24,               -- 平均响应时间（小时）
  completed_bookings    INT DEFAULT 0,
  city                  TEXT DEFAULT '上海',
  district              TEXT,
  address_detail        TEXT,
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 铲屎官提供的服务
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sitter_services (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id            UUID REFERENCES public.sitters(id) ON DELETE CASCADE NOT NULL,
  service_type         TEXT NOT NULL, -- 'cat_home_feeding' 上门喂猫, 'cat_boarding' 猫咪寄养
  is_active            BOOLEAN DEFAULT TRUE,
  price_per_night      DECIMAL(10, 2),  -- 寄养每晚价格
  price_per_visit      DECIMAL(10, 2),  -- 上门每次价格
  additional_cat_price DECIMAL(10, 2) DEFAULT 30, -- 额外每只猫加价
  min_nights           INT DEFAULT 1,
  max_nights           INT DEFAULT 30,
  visits_per_day       INT DEFAULT 1,   -- 每天上门次数（上门喂猫服务）
  visit_duration_mins  INT DEFAULT 30,  -- 每次上门时长（分钟）
  included_services    TEXT[],          -- 包含的服务项目
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sitter_id, service_type)
);

-- ============================================================
-- 铲屎官相册
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sitter_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id   UUID REFERENCES public.sitters(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  caption     TEXT,
  is_cover    BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 铲屎官可用时间
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sitter_availability (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id    UUID REFERENCES public.sitters(id) ON DELETE CASCADE NOT NULL,
  date         DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  notes        TEXT,
  UNIQUE(sitter_id, date)
);

-- ============================================================
-- 宠物档案表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'cat',  -- 'cat', 'dog'
  breed                TEXT,                          -- 品种
  age_years            INT DEFAULT 0,
  age_months           INT DEFAULT 0,
  weight_kg            DECIMAL(5, 2),
  gender               TEXT,                          -- 'male' 公, 'female' 母
  is_neutered          BOOLEAN DEFAULT FALSE,          -- 绝育
  is_vaccinated        BOOLEAN DEFAULT FALSE,          -- 疫苗
  vaccination_date     DATE,
  microchip_number     TEXT,
  medical_conditions   TEXT,                           -- 健康状况
  medications          TEXT,                           -- 用药情况
  dietary_restrictions TEXT,                           -- 饮食禁忌
  feeding_schedule     TEXT,                           -- 喂食时间安排
  litter_box_notes     TEXT,                           -- 猫砂盆使用情况
  behavior_notes       TEXT,                           -- 行为特征
  photo_url            TEXT,
  emergency_vet        TEXT,                           -- 紧急兽医联系方式
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 预订表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number       TEXT UNIQUE NOT NULL DEFAULT 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6)),
  owner_id             UUID REFERENCES public.profiles(id) NOT NULL,
  sitter_id            UUID REFERENCES public.sitters(id) NOT NULL,
  service_type         TEXT NOT NULL,                  -- 'cat_home_feeding', 'cat_boarding'
  pet_ids              UUID[] NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  num_visits_per_day   INT DEFAULT 1,                  -- 上门喂猫每天次数
  pickup_needed        BOOLEAN DEFAULT FALSE,
  dropoff_needed       BOOLEAN DEFAULT FALSE,
  special_instructions TEXT,
  emergency_contact    TEXT,
  status               TEXT DEFAULT 'pending',         -- pending, confirmed, active, completed, cancelled
  cancelled_by         UUID REFERENCES public.profiles(id),
  cancel_reason        TEXT,
  total_amount         DECIMAL(10, 2),
  platform_fee         DECIMAL(10, 2),
  sitter_payout        DECIMAL(10, 2),
  payment_status       TEXT DEFAULT 'unpaid',          -- unpaid, paid, refunded
  payment_method       TEXT,                           -- 'wechat', 'alipay', 'card'
  payment_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 评价表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id       UUID REFERENCES public.bookings(id) UNIQUE NOT NULL,
  owner_id         UUID REFERENCES public.profiles(id) NOT NULL,
  sitter_id        UUID REFERENCES public.sitters(id) NOT NULL,
  rating           INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  sitter_response  TEXT,
  photo_urls       TEXT[],
  is_visible       BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 消息表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID REFERENCES public.bookings(id),
  sender_id    UUID REFERENCES public.profiles(id) NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
  content      TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT FALSE,
  attachments  TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 通知表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL,  -- 'booking_request', 'booking_confirmed', 'booking_cancelled', 'new_review', 'new_message'
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 收藏表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sitter_id  UUID REFERENCES public.sitters(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, sitter_id)
);

-- ============================================================
-- 更新 sitters.rating 的触发器
-- ============================================================
CREATE OR REPLACE FUNCTION update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sitters
  SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE sitter_id = NEW.sitter_id AND is_visible = TRUE),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE sitter_id = NEW.sitter_id AND is_visible = TRUE)
  WHERE id = NEW.sitter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created_or_updated
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_sitter_rating();

-- 完成预订后更新铲屎官完成数
CREATE OR REPLACE FUNCTION update_sitter_completed_bookings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.sitters
    SET completed_bookings = completed_bookings + 1
    WHERE id = NEW.sitter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_completed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_sitter_completed_bookings();

-- ============================================================
-- Row Level Security (RLS) 策略
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户可查看所有档案" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "用户只能更新自己的档案" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- sitters
ALTER TABLE public.sitters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可查看铲屎官" ON public.sitters FOR SELECT USING (TRUE);
CREATE POLICY "铲屎官只能更新自己的档案" ON public.sitters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "认证用户可创建铲屎官档案" ON public.sitters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- sitter_services
ALTER TABLE public.sitter_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可查看服务" ON public.sitter_services FOR SELECT USING (TRUE);
CREATE POLICY "铲屎官管理自己的服务" ON public.sitter_services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sitters WHERE id = sitter_id AND user_id = auth.uid())
);

-- sitter_photos
ALTER TABLE public.sitter_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可查看照片" ON public.sitter_photos FOR SELECT USING (TRUE);
CREATE POLICY "铲屎官管理自己的照片" ON public.sitter_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sitters WHERE id = sitter_id AND user_id = auth.uid())
);

-- sitter_availability
ALTER TABLE public.sitter_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可查看可用时间" ON public.sitter_availability FOR SELECT USING (TRUE);
CREATE POLICY "铲屎官管理自己的可用时间" ON public.sitter_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sitters WHERE id = sitter_id AND user_id = auth.uid())
);

-- pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "宠物主人可查看自己的宠物" ON public.pets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "宠物主人管理自己的宠物" ON public.pets FOR ALL USING (auth.uid() = owner_id);
-- 允许铲屎官查看预订相关的宠物
CREATE POLICY "铲屎官可查看预订宠物" ON public.pets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.sitters s ON b.sitter_id = s.id
    WHERE s.user_id = auth.uid()
    AND owner_id = b.owner_id
  )
);

-- bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户查看自己的预订" ON public.bookings FOR SELECT USING (
  auth.uid() = owner_id
  OR EXISTS (SELECT 1 FROM public.sitters WHERE id = sitter_id AND user_id = auth.uid())
);
CREATE POLICY "用户创建预订" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "相关方更新预订" ON public.bookings FOR UPDATE USING (
  auth.uid() = owner_id
  OR EXISTS (SELECT 1 FROM public.sitters WHERE id = sitter_id AND user_id = auth.uid())
);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可查看评价" ON public.reviews FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "宠物主创建评价" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "评价方更新评价" ON public.reviews FOR UPDATE USING (
  auth.uid() = owner_id
  OR EXISTS (SELECT 1 FROM public.sitters WHERE id = sitter_id AND user_id = auth.uid())
);

-- messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "消息收发方可查看消息" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "认证用户发送消息" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "收件人标记已读" ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户查看自己的通知" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户更新自己的通知" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户管理自己的收藏" ON public.favorites FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- 创建索引提升查询性能
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sitters_city ON public.sitters(city);
CREATE INDEX IF NOT EXISTS idx_sitters_rating ON public.sitters(rating DESC);
CREATE INDEX IF NOT EXISTS idx_sitters_is_active ON public.sitters(is_active);
CREATE INDEX IF NOT EXISTS idx_sitter_services_type ON public.sitter_services(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_sitter ON public.bookings(sitter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reviews_sitter ON public.reviews(sitter_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_pets_owner ON public.pets(owner_id);

-- ============================================================
-- 插入示例数据（开发测试用）
-- ============================================================
-- 注意：真实项目中通过应用程序创建，此处仅为演示数据库结构
