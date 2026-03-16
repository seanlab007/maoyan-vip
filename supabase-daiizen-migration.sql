-- ============================================================================
-- maoyan.vip Supabase - daiizen 用户数据迁移方案
-- ============================================================================
-- 说明：将 daiizen 的用户数据合并到 maoyan.vip 的 Supabase 数据库中
-- 优点：
--   1. 统一数据库管理，降低运维成本
--   2. 无需跨库调用，性能更好
--   3. 数据一致性更强
-- ============================================================================

-- ============================================================================
-- 1. daiizen 用户表（新增）
-- ============================================================================

CREATE TABLE IF NOT EXISTS daiizen_users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE NOT NULL COMMENT 'daiizen 原有的 openId',
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferred_language VARCHAR(8) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_signed_in TIMESTAMPTZ DEFAULT NOW(),

  -- 关联 maoyan.vip 用户
  maoyan_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daiizen_users_open_id ON daiizen_users(open_id);
CREATE INDEX IF NOT EXISTS idx_daiizen_users_maoyan_user_id ON daiizen_users(maoyan_user_id);
CREATE INDEX IF NOT EXISTS idx_daiizen_users_email ON daiizen_users(email);


-- ============================================================================
-- 2. daiizen 积分系统（新增）
-- ============================================================================

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS daiizen_point_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES daiizen_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'expired', 'sync_from_maoyan')),
  amount INTEGER NOT NULL,
  reason VARCHAR(255),
  order_id INTEGER,  -- daiizen 订单 ID（如果迁移订单数据）
  maoyan_tx_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daiizen_point_transactions_user_id ON daiizen_point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_daiizen_point_transactions_type ON daiizen_point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_daiizen_point_transactions_maoyan_tx_id ON daiizen_point_transactions(maoyan_tx_id);


-- ============================================================================
-- 3. daiizen 订单表（新增 - 可选，如果需要同步订单数据）
-- ============================================================================

CREATE TABLE IF NOT EXISTS daiizen_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES daiizen_users(id) ON DELETE CASCADE,
  order_number VARCHAR(32) UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'shipped', 'completed', 'cancelled')),
  total_usdd DECIMAL(18, 6) NOT NULL,
  shipping_address JSONB,
  payment_method VARCHAR(32) DEFAULT 'usdd',
  payment_tx_hash VARCHAR(128),
  payment_confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daiizen_orders_user_id ON daiizen_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_daiizen_orders_status ON daiizen_orders(status);
CREATE INDEX IF NOT EXISTS idx_daiizen_orders_order_number ON daiizen_orders(order_number);


-- ============================================================================
-- 4. daiizen 积分规则配置表（新增）
-- ============================================================================

CREATE TABLE IF NOT EXISTS daiizen_point_rules (
  id SERIAL PRIMARY KEY,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('order_completion', 'first_order', 'referral', 'product_review', 'daily_login')),
  amount INTEGER NOT NULL,
  condition_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daiizen_point_rules_rule_type ON daiizen_point_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_daiizen_point_rules_is_active ON daiizen_point_rules(is_active);


-- ============================================================================
-- 5. daiizen 用户邀请关系表（新增）
-- ============================================================================

CREATE TABLE IF NOT EXISTS daiizen_user_referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES daiizen_users(id) ON DELETE CASCADE,
  referred_id INTEGER NOT NULL REFERENCES daiizen_users(id) ON DELETE CASCADE,
  reward_points INTEGER DEFAULT 50,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daiizen_user_referrals_referrer_id ON daiizen_user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_daiizen_user_referrals_referred_id ON daiizen_user_referrals(referred_id);


-- ============================================================================
-- 6. 扩展 maoyan.vip 现有表（修改）
-- ============================================================================

-- 在 profiles 表添加 daiizen 用户关联字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daiizen_user_id INTEGER UNIQUE REFERENCES daiizen_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_daiizen_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_daiizen_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daiizen_points_synced_at TIMESTAMPTZ;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_daiizen_user_id ON profiles(daiizen_user_id);


-- ============================================================================
-- 7. 触发器：自动更新用户积分统计
-- ============================================================================

-- 创建触发器函数：更新 daiizen 用户积分统计
CREATE OR REPLACE FUNCTION update_daiizen_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daiizen_users
  SET
    total_points = (
      SELECT COALESCE(SUM(CASE WHEN type = 'earned' THEN amount ELSE 0 END), 0)
      FROM daiizen_point_transactions
      WHERE user_id = NEW.user_id
    ),
    available_points = (
      SELECT COALESCE(
        SUM(CASE WHEN type = 'earned' THEN amount ELSE 0 END) +
        SUM(CASE WHEN type = 'spent' THEN amount ELSE 0 END),
        0
      )
      FROM daiizen_point_transactions
      WHERE user_id = NEW.user_id
    )
  WHERE id = NEW.user_id;

  -- 同步到 maoyan.vip 用户
  UPDATE profiles
  SET
    total_daiizen_points = (
      SELECT COALESCE(SUM(CASE WHEN type = 'earned' THEN amount ELSE 0 END), 0)
      FROM daiizen_point_transactions
      WHERE user_id = NEW.user_id
    ),
    available_daiizen_points = (
      SELECT COALESCE(
        SUM(CASE WHEN type = 'earned' THEN amount ELSE 0 END) +
        SUM(CASE WHEN type = 'spent' THEN amount ELSE 0 END),
        0
      )
      FROM daiizen_point_transactions
      WHERE user_id = NEW.user_id
    ),
    daiizen_points_synced_at = NOW()
  WHERE daiizen_user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_daiizen_user_points ON daiizen_point_transactions;
CREATE TRIGGER trigger_update_daiizen_user_points
AFTER INSERT OR UPDATE ON daiizen_point_transactions
FOR EACH ROW
EXECUTE FUNCTION update_daiizen_user_points();


-- ============================================================================
-- 8. 视图：用户积分汇总（跨平台）
-- ============================================================================

CREATE OR REPLACE VIEW user_points_summary AS
SELECT
  p.id AS maoyan_user_id,
  p.display_name,
  p.daiizen_user_id,
  p.total_daiizen_points,
  p.available_daiizen_points,
  p.daiizen_points_synced_at,

  -- maoyan 钱包余额
  COALESCE(SUM(CASE
    WHEN wt.type = 'earn' THEN wt.amount
    WHEN wt.type = 'spend' THEN -wt.amount
    ELSE 0
  END), 0) AS maoyan_wallet_balance,

  -- 总积分（maoyan + daiizen）
  COALESCE(SUM(CASE
    WHEN wt.type = 'earn' THEN wt.amount
    WHEN wt.type = 'spend' THEN -wt.amount
    ELSE 0
  END), 0) + COALESCE(p.available_daiizen_points, 0) AS total_points,

  -- daiizen 订单统计
  COALESCE(COUNT(do.id), 0) AS daiizen_total_orders,
  COALESCE(SUM(CASE WHEN do.status = 'paid' THEN do.total_usdd ELSE 0 END), 0) AS daiizen_total_spent_usdd

FROM profiles p
LEFT JOIN wallet_transactions wt ON wt.user_id = p.id
LEFT JOIN daiizen_users du ON du.maoyan_user_id = p.id
LEFT JOIN daiizen_orders do ON do.user_id = du.id
GROUP BY p.id, p.display_name, p.daiizen_user_id, p.total_daiizen_points, p.available_daiizen_points, p.daiizen_points_synced_at;


-- ============================================================================
-- 9. 初始化积分规则数据
-- ============================================================================

INSERT INTO daiizen_point_rules (rule_type, amount, condition_data, is_active) VALUES
('first_order', 100, '{"minOrderAmount": 1, "usddCurrency": true}'::jsonb, true),
('order_completion', 1, '{"pointsPerUsdd": 1}'::jsonb, true),
('referral', 50, '{"bonusForReferrer": 50, "bonusForReferred": 20}'::jsonb, true),
('product_review', 10, '{"minReviewLength": 20, "maxDailyRewards": 5}'::jsonb, true),
('daily_login', 1, '{"consecutiveDaysBonus": [1, 3, 5, 10]}'::jsonb, false)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 10. 完成提示
-- ============================================================================

-- 查看创建的表
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'daiizen_%'
ORDER BY table_name;

-- 查看初始化的积分规则
SELECT * FROM daiizen_point_rules;

-- 查看用户积分汇总视图
SELECT * FROM user_points_summary LIMIT 10;
