-- ============================================================
-- maoyan.vip 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- ── 扩展 ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ── 枚举类型 ──────────────────────────────────────────────
CREATE TYPE user_level AS ENUM ('newbie', 'silver', 'gold', 'platinum', 'diamond');
CREATE TYPE transaction_type AS ENUM ('earn', 'spend', 'transfer', 'referral_reward', 'daily_checkin', 'admin_adjust');
CREATE TYPE transaction_source AS ENUM ('register', 'daily_checkin', 'share', 'referral', 'sell_commission', 'redeem', 'daiizen_sync', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE pay_type AS ENUM ('points', 'cash', 'mixed');

-- ── 用户档案（扩展 auth.users）───────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  nickname      TEXT NOT NULL DEFAULT '猫眼达人',
  avatar_url    TEXT,
  phone         TEXT UNIQUE,
  bio           TEXT,
  level         user_level NOT NULL DEFAULT 'newbie',
  trust_score   INTEGER NOT NULL DEFAULT 0,
  -- 流量数据
  follower_count     INTEGER NOT NULL DEFAULT 0,
  engagement_rate    NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 百分比，如 3.56
  -- 变现数据
  gmv_total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_total   NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- daiizen 打通
  daiizen_user_id    TEXT,
  daiizen_linked_at  TIMESTAMPTZ,
  -- 推荐
  referral_code      TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by        UUID REFERENCES public.profiles(id),
  -- 元数据
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 积分钱包 ──────────────────────────────────────────────
CREATE TABLE public.wallets (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance          BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),       -- 可用积分
  frozen_balance   BIGINT NOT NULL DEFAULT 0 CHECK (frozen_balance >= 0), -- 冻结积分
  total_earned     BIGINT NOT NULL DEFAULT 0,
  total_spent      BIGINT NOT NULL DEFAULT 0,
  last_checkin_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 积分流水 ──────────────────────────────────────────────
CREATE TABLE public.transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        transaction_type NOT NULL,
  source      transaction_source NOT NULL,
  amount      BIGINT NOT NULL,                         -- 正数=入账，负数=出账
  balance_after BIGINT NOT NULL,
  description TEXT,
  ref_id      TEXT,                                    -- 关联单号（订单ID/推荐ID等）
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 推荐关系 ──────────────────────────────────────────────
CREATE TABLE public.referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id     UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_points   BIGINT NOT NULL DEFAULT 200,
  rewarded_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 签到记录 ──────────────────────────────────────────────
CREATE TABLE public.checkins (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak     INTEGER NOT NULL DEFAULT 1,               -- 连续签到天数
  points     INTEGER NOT NULL DEFAULT 10,
  checked_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, checked_at)
);

-- ── 商品（供应链）─────────────────────────────────────────
CREATE TABLE public.products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'general',
  price        NUMERIC(10,2),                          -- 现金价（可为空）
  points_price BIGINT,                                 -- 积分价（可为空）
  stock        INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 订单 ──────────────────────────────────────────────────
CREATE TABLE public.orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id),
  product_id   UUID NOT NULL REFERENCES public.products(id),
  quantity     INTEGER NOT NULL DEFAULT 1,
  pay_type     pay_type NOT NULL,
  points_used  BIGINT NOT NULL DEFAULT 0,
  cash_paid    NUMERIC(10,2) NOT NULL DEFAULT 0,
  status       order_status NOT NULL DEFAULT 'pending',
  address      JSONB DEFAULT '{}',
  remark       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── daiizen 积分同步日志 ──────────────────────────────────
CREATE TABLE public.daiizen_sync_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  direction       TEXT NOT NULL CHECK (direction IN ('import', 'export')),
  points_amount   BIGINT NOT NULL,
  daiizen_tx_id   TEXT,
  status          TEXT NOT NULL DEFAULT 'success',
  error_msg       TEXT,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Creator Card 达人名片 ──────────────────────────────────
CREATE TABLE public.creator_cards (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  level           TEXT NOT NULL DEFAULT 'silver' CHECK (level IN ('silver', 'gold', 'platinum', 'black_elite')),
  credit_limit    NUMERIC(10,2) NOT NULL,                    -- 信用额度（美元）
  credit_used     NUMERIC(10,2) NOT NULL DEFAULT 0,          -- 已使用额度
  social_platforms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],  -- 社交平台列表
  platform_links  JSONB DEFAULT '{}',                        -- 平台链接映射
  bio             TEXT,
  tags            TEXT[] DEFAULT ARRAY[]::TEXT[],
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_at     TIMESTAMPTZ,
  approved_by     UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 短剧内容 ──────────────────────────────────────────────
CREATE TABLE public.short_dramas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  thumbnail_url   TEXT,
  video_url       TEXT,
  duration        INTEGER,                                  -- 时长（秒）
  views           BIGINT NOT NULL DEFAULT 0,
  likes           BIGINT NOT NULL DEFAULT 0,
  shares          BIGINT NOT NULL DEFAULT 0,
  creator_id      UUID REFERENCES public.profiles(id),
  genre           TEXT[],                                   -- 类型标签
  target_amount   NUMERIC(12,2) NOT NULL,                    -- 目标融资额
  raised_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,         -- 已筹集金额
  roi_percent     NUMERIC(5,2) NOT NULL DEFAULT 50.00,      -- 预期回报率（百分比）
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'funded', 'completed', 'cancelled')),
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 短剧投资记录 ──────────────────────────────────────────
CREATE TABLE public.drama_investments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drama_id        UUID NOT NULL REFERENCES public.short_dramas(id) ON DELETE CASCADE,
  investor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2) NOT NULL,                    -- 投资金额（美元）
  roi_percent     NUMERIC(5,2) NOT NULL DEFAULT 50.00,      -- 回报率
  expected_return NUMERIC(10,2) NOT NULL,                    -- 预期回报
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'refunded')),
  investment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_date TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 内容还款记录（Dine & Post）──────────────────────────
CREATE TABLE public.content_repayments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investment_id   UUID REFERENCES public.drama_investments(id),
  amount          NUMERIC(10,2) NOT NULL,                    -- 还款金额（美元）
  platform        TEXT NOT NULL,                             -- 发布平台
  content_url     TEXT,                                      -- 内容链接
  content_type    TEXT NOT NULL CHECK (content_type IN ('video', 'post', 'story', 'live')),
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
  verified_at     TIMESTAMPTZ,
  rejection_reason TEXT,
  dark_tokens_earned BIGINT NOT NULL DEFAULT 0,              -- 获得的 DARK 代币
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 社交奖励 ──────────────────────────────────────────────
CREATE TABLE public.social_rewards (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,
  reward_type     TEXT NOT NULL CHECK (reward_type IN ('share', 'like', 'comment', 'follow', 'invite')),
  action_count    INTEGER NOT NULL DEFAULT 1,
  dark_tokens     BIGINT NOT NULL DEFAULT 10,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_level ON public.profiles(level);

-- Creator Card 索引
CREATE INDEX idx_creator_cards_user_id ON public.creator_cards(user_id);
CREATE INDEX idx_creator_cards_level ON public.creator_cards(level);
CREATE INDEX idx_creator_cards_status ON public.creator_cards(status);

-- 短剧索引
CREATE INDEX idx_short_dramas_status ON public.short_dramas(status, is_featured);
CREATE INDEX idx_short_dramas_creator ON public.short_dramas(creator_id);
CREATE INDEX idx_drama_investments_drama ON public.drama_investments(drama_id);
CREATE INDEX idx_drama_investments_investor ON public.drama_investments(investor_id);
CREATE INDEX idx_content_repayments_user ON public.content_repayments(user_id);
CREATE INDEX idx_content_repayments_status ON public.content_repayments(status);
CREATE INDEX idx_social_rewards_user ON public.social_rewards(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daiizen_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_dramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drama_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_rewards ENABLE ROW LEVEL SECURITY;

-- profiles：自己可读写，其他人可读（公开资料）
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- wallets：只能读写自己的
CREATE POLICY "wallets_own" ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- transactions：只能读自己的
CREATE POLICY "transactions_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- checkins：只能读写自己的
CREATE POLICY "checkins_own" ON public.checkins FOR ALL USING (auth.uid() = user_id);

-- referrals：只能读自己相关的
CREATE POLICY "referrals_own" ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- orders：只能读写自己的
CREATE POLICY "orders_own" ON public.orders FOR ALL USING (auth.uid() = user_id);

-- products：所有人可读
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (TRUE);

-- daiizen_sync_logs：只能读自己的
CREATE POLICY "daiizen_sync_own" ON public.daiizen_sync_logs FOR SELECT USING (auth.uid() = user_id);

-- creator_cards：只能读写自己的
CREATE POLICY "creator_cards_own" ON public.creator_cards FOR ALL USING (auth.uid() = user_id);

-- short_dramas：所有人可读
CREATE POLICY "short_dramas_select_all" ON public.short_dramas FOR SELECT USING (status = 'active');

-- drama_investments：只能读写自己的
CREATE POLICY "drama_investments_own" ON public.drama_investments FOR ALL USING (auth.uid() = investor_id);

-- content_repayments：只能读写自己的
CREATE POLICY "content_repayments_own" ON public.content_repayments FOR ALL USING (auth.uid() = user_id);

-- social_rewards：只能读写自己的
CREATE POLICY "social_rewards_own" ON public.social_rewards FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 函数与触发器
-- ============================================================

-- 自动创建 profile + wallet（注册时触发）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  ref_code TEXT;
  referrer_profile_id UUID;
BEGIN
  -- 插入 profile
  INSERT INTO public.profiles (id, nickname, avatar_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    substr(md5(NEW.id::text), 1, 8)
  );

  -- 插入钱包
  INSERT INTO public.wallets (user_id, balance, total_earned)
  VALUES (NEW.id, 100, 100);  -- 注册奖励 100 积分

  -- 写入注册积分流水
  INSERT INTO public.transactions (user_id, type, source, amount, balance_after, description)
  VALUES (NEW.id, 'earn', 'register', 100, 100, '🎉 注册奖励');

  -- 处理推荐码
  ref_code := NEW.raw_user_meta_data->>'referral_code';
  IF ref_code IS NOT NULL THEN
    SELECT id INTO referrer_profile_id FROM public.profiles WHERE referral_code = ref_code;
    IF referrer_profile_id IS NOT NULL THEN
      -- 记录推荐关系
      INSERT INTO public.referrals (referrer_id, referred_id) VALUES (referrer_profile_id, NEW.id);
      -- 给推荐人 +200 积分
      UPDATE public.wallets
        SET balance = balance + 200,
            total_earned = total_earned + 200,
            updated_at = NOW()
        WHERE user_id = referrer_profile_id;
      INSERT INTO public.transactions (user_id, type, source, amount, balance_after, description, ref_id)
      SELECT referrer_profile_id, 'earn', 'referral', 200, balance, '👥 成功推荐新用户', NEW.id::text
      FROM public.wallets WHERE user_id = referrer_profile_id;
      -- 更新推荐人被推荐记录
      UPDATE public.profiles SET referred_by = referrer_profile_id WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_creator_cards_updated_at BEFORE UPDATE ON public.creator_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_short_dramas_updated_at BEFORE UPDATE ON public.short_dramas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_drama_investments_updated_at BEFORE UPDATE ON public.drama_investments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_content_repayments_updated_at BEFORE UPDATE ON public.content_repayments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 达人等级自动升级函数
CREATE OR REPLACE FUNCTION public.update_user_level(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_gmv NUMERIC;
  v_new_level user_level;
BEGIN
  SELECT gmv_total INTO v_gmv FROM public.profiles WHERE id = p_user_id;
  v_new_level := CASE
    WHEN v_gmv >= 500000 THEN 'diamond'::user_level
    WHEN v_gmv >= 100000 THEN 'platinum'::user_level
    WHEN v_gmv >= 30000  THEN 'gold'::user_level
    WHEN v_gmv >= 5000   THEN 'silver'::user_level
    ELSE 'newbie'::user_level
  END;
  UPDATE public.profiles SET level = v_new_level WHERE id = p_user_id AND level != v_new_level;
END;
$$;

-- ============================================================
-- 示例商品数据
-- ============================================================
INSERT INTO public.products (name, description, category, price, points_price, stock, sort_order) VALUES
('星巴克咖啡券', '中杯任意饮品电子券', 'coupon', 38, 3800, 100, 1),
('京东购物卡100元', '京东E卡，全品类通用', 'gift_card', 100, 9000, 50, 2),
('美股投资额度¥500', '猫眼×大以太金融联名额度', 'finance', NULL, 45000, 20, 3),
('专业拍摄服务1小时', '猫眼合作摄影师上门拍摄', 'service', 800, 70000, 10, 4),
('积分直接提现¥10', '1000积分=¥10，T+1到账', 'cashout', 10, 1000, 9999, 5);

-- ============================================================
-- 示例短剧数据
-- ============================================================
INSERT INTO public.short_dramas (title, description, genre, target_amount, raised_amount, roi_percent, status, is_featured, views, likes, shares, duration) VALUES
('《总裁的秘密》', '霸道总裁爱上小职员，甜宠剧', ARRAY['甜宠', '职场'], 50000, 35000, 50.00, 'active', TRUE, 1250000, 89000, 45000, 1800),
('《穿越时空遇见你》', '现代女孩穿越古代，开启奇幻爱情', ARRAY['穿越', '爱情', '奇幻'], 80000, 60000, 50.00, 'active', TRUE, 2100000, 156000, 78000, 2400),
('《豪门恩怨》', '豪门世家争权夺利，商战悬疑', ARRAY['商战', '悬疑', '家族'], 100000, 75000, 50.00, 'active', TRUE, 3400000, 234000, 117000, 3600),
('《青春校园》', '校园爱情，青春励志', ARRAY['青春', '校园', '励志'], 30000, 22000, 50.00, 'active', FALSE, 890000, 67000, 33000, 1500),
('《重生逆袭》', '重生逆袭人生，爽文改编', ARRAY['重生', '逆袭', '爽文'], 60000, 45000, 50.00, 'active', FALSE, 1680000, 123000, 61000, 2100),
('《古装权谋》', '古代宫廷权谋斗争', ARRAY['古装', '权谋', '历史'], 120000, 90000, 50.00, 'active', TRUE, 4200000, 298000, 149000, 4200);
