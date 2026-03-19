import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ============================================================
// 4 个真实品牌商品（认购包 + 万人团购 合并）
// ============================================================
const BRAND_PRODUCTS = [
  {
    id: 'oneface',
    brand: 'ONE FACE 肖像大师',
    logo: '🎨',
    tagline: '专业肖像摄影 · 一次拍摄，终身传奇',
    desc: '顶级摄影棚、专业化妆造型、精修后期，打造属于你的传奇肖像。万人团购享最低价，还可领取小猫奖励。',
    category: '摄影美学',
    color: '#f6c90e',
    bgGradient: 'linear-gradient(135deg,rgba(246,201,14,0.15),rgba(255,217,74,0.05))',
    borderColor: 'rgba(246,201,14,0.4)',
    hot: true,
    tag: '猫眼独家',
    tagColor: '#f6c90e',
    // 万人团购
    groupPrice: 1980,
    originalPrice: 3800,
    currentCount: 2341,
    target: 5000,
    darkReward: 200,
    // 认购包
    subscribeDeposit: 198,
    subscribeTotal: 1980,
    subscribeMonthly: '1次/年（全年肖像更新服务）',
    subscribeDesc: '预付10%押金，锁定年度肖像拍摄名额，价格永不涨价',
    subscribers: 876,
    refundPenalty: '退单扣除押金20%作为违约金',
    img: 'https://pub-6e8836a5e9a44e7b9e0d1b2f3c4d5e6f.r2.dev/oneface-portrait.jpg',
    imgFallback: '🎨',
  },
  {
    id: 'concept180',
    brand: '西班牙概念180',
    logo: '✨',
    tagline: '西班牙口服美容专研品牌 · 根源修愈 缔造年轻',
    desc: '来自西班牙的高端口服美容品牌，超300家高端医美诊所推荐，登上《VOGUE》杂志。主打反重力胶囊、回春胶囊、填充胶囊，从内而外抵御衰老。',
    category: '口服美容',
    color: '#c084fc',
    bgGradient: 'linear-gradient(135deg,rgba(192,132,252,0.15),rgba(139,92,246,0.05))',
    borderColor: 'rgba(192,132,252,0.4)',
    hot: true,
    tag: '西班牙原装',
    tagColor: '#c084fc',
    // 万人团购
    groupPrice: 680,
    originalPrice: 1280,
    currentCount: 1876,
    target: 3000,
    darkReward: 80,
    // 认购包
    subscribeDeposit: 68,
    subscribeTotal: 680,
    subscribeMonthly: '1盒/月（反重力胶囊 30粒装）',
    subscribeDesc: '预付10%押金，锁定月度配送，享受长期抗衰美容计划',
    subscribers: 543,
    refundPenalty: '退单扣除押金20%作为违约金',
    img: 'https://pub-6e8836a5e9a44e7b9e0d1b2f3c4d5e6f.r2.dev/concept180.jpg',
    imgFallback: '✨',
  },
  {
    id: 'biba',
    brand: '碧芭宝贝纸巾',
    logo: '🌿',
    tagline: '天然竹浆纸巾 · 宝宝专用 · 10年用量一次锁定',
    desc: '碧芭宝贝采用100%天然竹浆，无荧光剂、无添加，专为婴幼儿设计。柔软亲肤，呵护宝宝每一次。万人团购享批量折扣，认购包锁定10年价格。',
    category: '母婴日用',
    color: '#22d3a0',
    bgGradient: 'linear-gradient(135deg,rgba(34,211,160,0.15),rgba(16,185,129,0.05))',
    borderColor: 'rgba(34,211,160,0.4)',
    hot: true,
    tag: '刚需首选',
    tagColor: '#22d3a0',
    // 万人团购
    groupPrice: 89,
    originalPrice: 168,
    currentCount: 3102,
    target: 10000,
    darkReward: 15,
    // 认购包
    subscribeDeposit: 36,
    subscribeTotal: 360,
    subscribeMonthly: '3提/月（婴儿柔巾+湿巾+厨房纸各1提）',
    subscribeDesc: '预付10%押金，锁定10年用量，按月配送到家，价格永不涨',
    subscribers: 2341,
    refundPenalty: '退单扣除押金20%作为违约金',
    img: 'https://pub-6e8836a5e9a44e7b9e0d1b2f3c4d5e6f.r2.dev/biba-tissue.jpg',
    imgFallback: '🌿',
  },
  {
    id: 'mitoq',
    brand: 'MitoQ 保健品',
    logo: '⚡',
    tagline: '新西兰顶级线粒体营养品 · 细胞级抗氧化',
    desc: 'MitoQ 是全球首个能够直接进入线粒体的抗氧化剂，比普通辅酶Q10效果强800倍。来自新西兰，全球顶尖科学家研发，专为高端健康管理人群设计。',
    category: '高端保健',
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(234,88,12,0.05))',
    borderColor: 'rgba(249,115,22,0.4)',
    hot: false,
    tag: '新西兰原装',
    tagColor: '#f97316',
    // 万人团购
    groupPrice: 580,
    originalPrice: 980,
    currentCount: 987,
    target: 2000,
    darkReward: 60,
    // 认购包
    subscribeDeposit: 58,
    subscribeTotal: 580,
    subscribeMonthly: '1瓶/月（MitoQ 5mg 60粒装）',
    subscribeDesc: '预付10%押金，锁定月度供应，持续守护细胞健康',
    subscribers: 312,
    refundPenalty: '退单扣除押金20%作为违约金',
    img: 'https://pub-6e8836a5e9a44e7b9e0d1b2f3c4d5e6f.r2.dev/mitoq.jpg',
    imgFallback: '⚡',
  },
]

// 11级阶梯折扣
const DISCOUNT_TIERS = [
  { min: 1, max: 9, discount: 0, label: '原价' },
  { min: 10, max: 49, discount: 5, label: '95折' },
  { min: 50, max: 99, discount: 10, label: '9折' },
  { min: 100, max: 199, discount: 15, label: '85折' },
  { min: 200, max: 499, discount: 20, label: '8折' },
  { min: 500, max: 999, discount: 25, label: '75折' },
  { min: 1000, max: 1999, discount: 30, label: '7折' },
  { min: 2000, max: 4999, discount: 35, label: '65折' },
  { min: 5000, max: 9999, discount: 40, label: '6折' },
  { min: 10000, max: 49999, discount: 45, label: '55折' },
  { min: 50000, max: Infinity, discount: 50, label: '5折' },
]

function getDiscount(count: number) {
  return DISCOUNT_TIERS.find(t => count >= t.min && count <= t.max) || DISCOUNT_TIERS[0]
}

function getNextTier(count: number) {
  const idx = DISCOUNT_TIERS.findIndex(t => count >= t.min && count <= t.max)
  return idx < DISCOUNT_TIERS.length - 1 ? DISCOUNT_TIERS[idx + 1] : null
}

export default function GroupBuyPage() {
  const [products, setProducts] = useState(BRAND_PRODUCTS)
  const [activeMode, setActiveMode] = useState<'group' | 'subscribe'>('group')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'group' | 'subscribe'>('group')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [myOrders, setMyOrders] = useState<any[]>([])

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('group_buy_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    if (data) setMyOrders(data)
  }

  function openModal(p: any, mode: 'group' | 'subscribe') {
    setSelectedProduct(p)
    setModalMode(mode)
    setQty(1)
    setShowModal(true)
  }

  async function handleConfirm() {
    if (!selectedProduct) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); setLoading(false); return }

      if (modalMode === 'group') {
        const tier = getDiscount(selectedProduct.currentCount + qty)
        const discountedPrice = selectedProduct.groupPrice * (1 - tier.discount / 100)
        const { error } = await supabase.from('group_buy_orders').insert({
          user_id: user.id,
          product_id: selectedProduct.id,
          product_name: selectedProduct.brand,
          group_id: `group_${selectedProduct.id}`,
          participant_count: selectedProduct.currentCount + qty,
          discount_pct: tier.discount,
          original_price: selectedProduct.groupPrice,
          final_price: discountedPrice * qty,
          dark_reward: selectedProduct.darkReward * qty,
          status: 'paid',
        })
        if (error) throw error
        setProducts(ps => ps.map(p => p.id === selectedProduct.id ? { ...p, currentCount: p.currentCount + qty } : p))
        toast.success(`🎉 成功参团！享受 ${tier.label}，领到 ${selectedProduct.darkReward * qty} 只小猫🐱`)
      } else {
        const { error } = await supabase.from('group_buy_orders').insert({
          user_id: user.id,
          product_id: selectedProduct.id,
          product_name: `${selectedProduct.brand} 认购包`,
          group_id: `subscribe_${selectedProduct.id}`,
          participant_count: selectedProduct.subscribers + 1,
          discount_pct: 0,
          original_price: selectedProduct.subscribeDeposit,
          final_price: selectedProduct.subscribeDeposit,
          dark_reward: Math.floor(selectedProduct.darkReward * 0.5),
          status: 'deposit_paid',
        })
        if (error) throw error
        setProducts(ps => ps.map(p => p.id === selectedProduct.id ? { ...p, subscribers: p.subscribers + 1 } : p))
        toast.success(`🎉 认购成功！已支付押金 ¥${selectedProduct.subscribeDeposit}，领到 ${Math.floor(selectedProduct.darkReward * 0.5)} 只小猫🐱`)
      }
      setShowModal(false)
      fetchOrders()
    } catch (e: any) { toast.error(e.message || '操作失败') }
    setLoading(false)
  }

  const modalTier = selectedProduct && modalMode === 'group' ? getDiscount(selectedProduct.currentCount + qty) : null
  const nextTier = selectedProduct && modalMode === 'group' ? getNextTier(selectedProduct.currentCount + qty) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* 页头 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 40 }}>🛒</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              品牌团购 & 认购中心
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>4大精选品牌 · 万人团购享最低折扣 · 认购包锁定长期价格</p>
          </div>
        </div>

        {/* 模式切换 */}
        <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 12, padding: 4, marginBottom: 28, gap: 4, maxWidth: 420 }}>
          {[
            { key: 'group', label: '🛒 万人团购', desc: '人越多折扣越大' },
            { key: 'subscribe', label: '📦 认购包预锁定', desc: '预付押金锁定价格' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveMode(t.key as any)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeMode === t.key ? 'linear-gradient(135deg,#f6c90e,#ffd94a)' : 'transparent',
                color: activeMode === t.key ? '#0c0d10' : 'var(--text2)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              }}>
              <div>{t.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* 万人团购模式 */}
        {activeMode === 'group' && (
          <>
            {/* 折扣阶梯说明 */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>📊 折扣阶梯 — 人越多折扣越大，最高5折</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DISCOUNT_TIERS.map((t, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '6px 12px', fontSize: 12, textAlign: 'center', minWidth: 60 }}>
                    <div style={{ color: '#f6c90e', fontWeight: 700 }}>{t.label}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 11 }}>{t.min >= 50000 ? '5万+' : `${t.min}人`}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 品牌商品网格 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {products.map((p) => {
                const tier = getDiscount(p.currentCount)
                const next = getNextTier(p.currentCount)
                const progress = Math.min(100, (p.currentCount / p.target) * 100)
                const discountedPrice = p.groupPrice * (1 - tier.discount / 100)
                return (
                  <div key={p.id} style={{ background: p.bgGradient, border: `1px solid ${p.borderColor}`, borderRadius: 20, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'default' }}>
                    {/* 品牌头部 */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px 16px 16px', position: 'relative' }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>{p.logo}</div>
                      {p.hot && (
                        <div style={{ position: 'absolute', top: 12, right: 12, background: '#E53935', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                          🔥 热门
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: `${p.tagColor}22`, border: `1px solid ${p.tagColor}88`, color: p.tagColor, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                        {p.tag}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{p.category}</div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{p.brand}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{p.tagline}</div>
                    </div>

                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>{p.desc}</div>

                      {/* 价格区 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>当前团购价</div>
                          <div style={{ fontSize: 26, fontWeight: 800, color: p.color }}>
                            ¥{discountedPrice.toFixed(0)}
                          </div>
                          {tier.discount > 0 && (
                            <div style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'line-through' }}>¥{p.originalPrice}</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color, fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                            {tier.label}
                          </div>
                          <div style={{ fontSize: 11, color: '#22d3a0', marginTop: 4 }}>+{p.darkReward}🐱小猫</div>
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>
                          <span>{p.currentCount.toLocaleString()} / {p.target.toLocaleString()} 人</span>
                          {next && <span style={{ color: p.color }}>再 {(next.min - p.currentCount).toLocaleString()} 人 → {next.label}</span>}
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 4, height: 6 }}>
                          <div style={{ background: `linear-gradient(90deg,${p.color},${p.color}aa)`, height: '100%', borderRadius: 4, width: `${progress}%`, transition: 'width 0.5s' }} />
                        </div>
                      </div>

                      <button onClick={() => openModal(p, 'group')}
                        style={{ width: '100%', padding: '11px 0', background: `linear-gradient(135deg,${p.color},${p.color}cc)`, color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 14 }}>
                        立即参团 · {tier.label}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* 认购包预锁定模式 */}
        {activeMode === 'subscribe' && (
          <>
            {/* 说明卡片 */}
            <div style={{ background: 'linear-gradient(135deg,rgba(246,201,14,0.1),rgba(34,211,160,0.1))', border: '1px solid rgba(246,201,14,0.3)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📦 认购包预锁定 — 如何运作？</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { icon: '💰', title: '只需预付10%押金', desc: '锁定长期用量，价格永不涨价' },
                  { icon: '🚚', title: '按月/年配送到家', desc: '无需囤货，定期自动发货' },
                  { icon: '🐱', title: '领取小猫奖励', desc: '认购即领小猫，喵值兑换猫粮商品' },
                  { icon: '⚠️', title: '退单规则', desc: '退单扣押金20%作违约金，剩余退还' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 认购包网格 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {products.map((p) => (
                <div key={p.id} style={{ background: p.bgGradient, border: `1px solid ${p.borderColor}`, borderRadius: 20, overflow: 'hidden' }}>
                  {/* 品牌头部 */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px 16px 16px', position: 'relative' }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>{p.logo}</div>
                    {p.hot && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: '#E53935', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                        🔥 热门
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: `${p.tagColor}22`, border: `1px solid ${p.tagColor}88`, color: p.tagColor, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                      {p.tag}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{p.category}</div>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{p.brand}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{p.tagline}</div>
                  </div>

                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>{p.subscribeDesc}</div>

                    {/* 价格对比 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>今日只需押金</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: p.color }}>¥{p.subscribeDeposit}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>锁定总价 ¥{p.subscribeTotal.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>🐱 小猫奖励</div>
                        <div style={{ color: '#22d3a0', fontWeight: 700, fontSize: 15 }}>+{Math.floor(p.darkReward * 0.5)}只</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{p.subscribers.toLocaleString()} 人已认购</div>
                      </div>
                    </div>

                    {/* 配送信息 */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text3)' }}>配送频率</span>
                        <span style={{ fontWeight: 600 }}>{p.subscribeMonthly}</span>
                      </div>
                    </div>

                    <button onClick={() => openModal(p, 'subscribe')}
                      style={{ width: '100%', padding: '11px 0', background: `linear-gradient(135deg,${p.color},${p.color}cc)`, color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 14 }}>
                      预付押金 ¥{p.subscribeDeposit} 认购
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 我的订单 */}
        {myOrders.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>📋 我的订单记录</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myOrders.map((o, i) => (
                <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.product_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {new Date(o.created_at).toLocaleDateString()} · {o.status === 'deposit_paid' ? '认购包' : `${o.discount_pct}% 折扣`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>¥{o.final_price?.toFixed(0)}</div>
                    <div style={{ fontSize: 12, color: '#22d3a0' }}>+{o.dark_reward}🐱小猫</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 统一弹窗 */}
      {showModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'var(--bg2)', border: `1px solid ${selectedProduct.borderColor}`, borderRadius: 20, padding: 28, maxWidth: 440, width: '100%' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{selectedProduct.logo}</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              {selectedProduct.brand} {modalMode === 'subscribe' ? '认购包' : '万人团购'}
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
              {modalMode === 'group' ? `当前 ${selectedProduct.currentCount.toLocaleString()} 人参团` : selectedProduct.subscribeDesc}
            </p>

            {modalMode === 'group' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>购买数量</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 18 }}>-</button>
                  <span style={{ fontSize: 20, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 18 }}>+</button>
                </div>
              </div>
            )}

            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              {modalMode === 'group' && modalTier ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13 }}>当前折扣</span>
                    <span style={{ color: selectedProduct.color, fontWeight: 700 }}>{modalTier.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13 }}>单价</span>
                    <span style={{ fontWeight: 700 }}>¥{(selectedProduct.groupPrice * (1 - modalTier.discount / 100)).toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13 }}>合计</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: selectedProduct.color }}>¥{(selectedProduct.groupPrice * (1 - modalTier.discount / 100) * qty).toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13 }}>🐱 小猫奖励</span>
                    <span style={{ color: '#22d3a0', fontWeight: 700 }}>+{selectedProduct.darkReward * qty}只</span>
                  </div>
                  {nextTier && (
                    <div style={{ marginTop: 12, padding: '8px 12px', background: `${selectedProduct.color}15`, borderRadius: 8, fontSize: 12, color: selectedProduct.color }}>
                      💡 再邀 {nextTier.min - selectedProduct.currentCount - qty} 人可升至 {nextTier.label}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {[
                    ['锁定总价值', `¥${selectedProduct.subscribeTotal.toLocaleString()}`],
                    ['今日预付押金（10%）', `¥${selectedProduct.subscribeDeposit}`],
                    ['配送频率', selectedProduct.subscribeMonthly],
                    ['🐱 小猫奖励', `+${Math.floor(selectedProduct.darkReward * 0.5)}只`],
                  ].map(([label, value], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 3 ? 10 : 0 }}>
                      <span style={{ color: 'var(--text3)', fontSize: 13 }}>{label}</span>
                      <span style={{ fontWeight: 700, color: String(label).includes('小猫') ? '#22d3a0' : String(label).includes('押金') ? selectedProduct.color : 'var(--text)' }}>{value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {modalMode === 'subscribe' && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#fca5a5' }}>
                ⚠️ <strong>退单规则：</strong>{selectedProduct.refundPenalty}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px 0', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600 }}>取消</button>
              <button onClick={handleConfirm} disabled={loading}
                style={{ flex: 2, padding: '12px 0', background: `linear-gradient(135deg,${selectedProduct.color},${selectedProduct.color}cc)`, color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 15 }}>
                {loading ? '处理中...' : modalMode === 'group' ? '确认参团' : `确认认购 · 支付 ¥${selectedProduct.subscribeDeposit}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
