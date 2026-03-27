-- ============================================================
-- maoyan-vip 套餐表（daiizen 选品 → maoyan 上架）
-- ============================================================

-- 套餐状态枚举
CREATE TYPE bundle_status AS ENUM ('draft', 'active', 'paused', 'archived');

-- 套餐主表
CREATE TABLE public.bundles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 基本信息
  name            TEXT NOT NULL,
  description     TEXT,
  cover_image     TEXT,                              -- 封面图（可手动上传或用第一件商品图）
  tags            TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- daiizen 商品快照（保存选品时的价格/信息，防止上游变更影响）
  items           JSONB NOT NULL DEFAULT '[]',
  -- items 结构：[{ productId, slug, name, nameEn, priceUsdd, qty, images, category }]

  -- maoyan 定价（创作者自定义）
  price_cny       NUMERIC(10,2),                    -- 人民币售价（null = 不支持现金购买）
  price_points    BIGINT,                            -- 积分售价（null = 不支持积分购买）
  original_cost_usdd NUMERIC(10,2),                 -- daiizen 进货成本（自动计算）

  -- 销售数据
  view_count      BIGINT NOT NULL DEFAULT 0,
  order_count     BIGINT NOT NULL DEFAULT 0,

  -- 状态
  status          bundle_status NOT NULL DEFAULT 'draft',
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 套餐订单
CREATE TABLE public.bundle_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id       UUID NOT NULL REFERENCES public.bundles(id),
  buyer_id        UUID NOT NULL REFERENCES public.profiles(id),

  pay_type        pay_type NOT NULL,                -- 'points' | 'cash' | 'mixed'
  points_used     BIGINT NOT NULL DEFAULT 0,
  cash_paid       NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- 购买时的快照（防止套餐被修改后订单信息错误）
  bundle_snapshot JSONB NOT NULL,

  status          order_status NOT NULL DEFAULT 'pending',
  remark          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_bundles_creator ON public.bundles(creator_id);
CREATE INDEX idx_bundles_status ON public.bundles(status, is_featured);
CREATE INDEX idx_bundles_created ON public.bundles(created_at DESC);
CREATE INDEX idx_bundle_orders_bundle ON public.bundle_orders(bundle_id);
CREATE INDEX idx_bundle_orders_buyer ON public.bundle_orders(buyer_id);

-- RLS
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_orders ENABLE ROW LEVEL SECURITY;

-- bundles：所有人可读 active 套餐；创作者可读写自己的套餐
CREATE POLICY "bundles_select_active" ON public.bundles
  FOR SELECT USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "bundles_insert_own" ON public.bundles
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "bundles_update_own" ON public.bundles
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "bundles_delete_own" ON public.bundles
  FOR DELETE USING (auth.uid() = creator_id);

-- bundle_orders：买家和卖家均可查看
CREATE POLICY "bundle_orders_buyer" ON public.bundle_orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "bundle_orders_seller" ON public.bundle_orders
  FOR SELECT USING (
    auth.uid() = (SELECT creator_id FROM public.bundles WHERE id = bundle_id)
  );

CREATE POLICY "bundle_orders_insert" ON public.bundle_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- updated_at 触发器
CREATE TRIGGER trg_bundles_updated_at BEFORE UPDATE ON public.bundles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bundle_orders_updated_at BEFORE UPDATE ON public.bundle_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 浏览量自增函数（供前端调用）
CREATE OR REPLACE FUNCTION public.increment_bundle_view(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.bundles SET view_count = view_count + 1 WHERE id = p_id;
END;
$$;
