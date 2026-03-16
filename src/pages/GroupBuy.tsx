import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// 11级阶梯折扣（来自参考代码）
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

const SAMPLE_PRODUCTS = [
  { id: 'p1', name: '猫眼 × 华糖联名礼盒', price: 299, category: '食品', current_count: 1247, target: 2000, dark_reward: 15, img: '🎁', hot: true, desc: '华糖万商大会专供，限量联名款' },
  { id: 'p2', name: '毛智库战略简报年卡', price: 999, category: '知识', current_count: 456, target: 1000, dark_reward: 50, img: '📊', hot: true, desc: '全年52期战略简报，含重大预测报告' },
  { id: 'p3', name: '短剧出演体验套餐', price: 1999, category: '娱乐', current_count: 89, target: 200, dark_reward: 100, img: '🎬', hot: false, desc: '路人甲出演名额 + 幕后探班 + 剧组合影' },
  { id: 'p4', name: 'DARK 代币预售包', price: 500, category: '数字资产', current_count: 3421, target: 5000, dark_reward: 200, img: '🪙', hot: true, desc: '预售价购入 DARK，上线后自动到账' },
  { id: 'p5', name: '猫眼达人孵化课程', price: 2999, category: '教育', current_count: 234, target: 500, dark_reward: 150, img: '🚀', hot: false, desc: '从0到百万粉丝，猫眼顶级达人亲授' },
]

function getDiscount(count: number) {
  return DISCOUNT_TIERS.find(t => count >= t.min && count <= t.max) || DISCOUNT_TIERS[0]
}

function getNextTier(count: number) {
  const idx = DISCOUNT_TIERS.findIndex(t => count >= t.min && count <= t.max)
  return idx < DISCOUNT_TIERS.length - 1 ? DISCOUNT_TIERS[idx + 1] : null
}

export default function GroupBuyPage() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
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

  function openProduct(p: any) {
    setSelectedProduct(p)
    setQty(1)
    setShowModal(true)
  }

  async function handleJoin() {
    if (!selectedProduct) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); setLoading(false); return }
      const tier = getDiscount(selectedProduct.current_count + qty)
      const discountedPrice = selectedProduct.price * (1 - tier.discount / 100)
      const { error } = await supabase.from('group_buy_orders').insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        group_id: `group_${selectedProduct.id}`,
        participant_count: selectedProduct.current_count + qty,
        discount_pct: tier.discount,
        original_price: selectedProduct.price,
        final_price: discountedPrice,
        dark_reward: selectedProduct.dark_reward * qty,
        status: 'paid',
      })
      if (error) throw error
      // 更新本地计数（模拟）
      setProducts(ps => ps.map(p => p.id === selectedProduct.id ? { ...p, current_count: p.current_count + qty } : p))
      toast.success(`🎉 成功参团！享受 ${tier.label}，获得 ${selectedProduct.dark_reward * qty} DARK`)
      setShowModal(false)
      fetchOrders()
    } catch (e: any) { toast.error(e.message || '参团失败') }
    setLoading(false)
  }

  const modalTier = selectedProduct ? getDiscount(selectedProduct.current_count + qty) : null
  const nextTier = selectedProduct ? getNextTier(selectedProduct.current_count + qty) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* 页头 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 40 }}>🛒</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>万人团购</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>人越多折扣越大 · 最高5折 · 参团获 DARK 代币奖励</p>
          </div>
        </div>

        {/* 折扣阶梯说明 */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>📊 折扣阶梯（人数越多折扣越大）</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DISCOUNT_TIERS.map((t, i) => (
              <div key={i} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '6px 12px', fontSize: 12, textAlign: 'center' }}>
                <div style={{ color: '#f6c90e', fontWeight: 700 }}>{t.label}</div>
                <div style={{ color: 'var(--text3)', fontSize: 11 }}>{t.min >= 50000 ? '5万+人' : `${t.min}人`}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 商品列表 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 32 }}>
          {products.map((p, i) => {
            const tier = getDiscount(p.current_count)
            const next = getNextTier(p.current_count)
            const progress = Math.min(100, (p.current_count / p.target) * 100)
            return (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${p.hot ? 'rgba(246,201,14,0.3)' : 'var(--border)'}`, borderRadius: 18, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,var(--bg3),var(--bg2))', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                  {p.img}
                  {p.hot && <div style={{ position: 'absolute', top: 10, right: 10, background: '#E53935', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>🔥 热门</div>}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(246,201,14,0.2)', border: '1px solid rgba(246,201,14,0.5)', color: '#f6c90e', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                    {tier.label}
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{p.category}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{p.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#f6c90e' }}>
                        ¥{(p.price * (1 - tier.discount / 100)).toFixed(0)}
                      </div>
                      {tier.discount > 0 && <div style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'line-through' }}>¥{p.price}</div>}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12 }}>
                      <div style={{ color: '#22d3a0', fontWeight: 600 }}>+{p.dark_reward} DARK</div>
                      <div style={{ color: 'var(--text3)' }}>{p.current_count.toLocaleString()} 人已参团</div>
                    </div>
                  </div>
                  {/* 进度条 */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                      <span>{p.current_count.toLocaleString()} / {p.target.toLocaleString()} 人</span>
                      {next && <span style={{ color: '#f6c90e' }}>再 {next.min - p.current_count} 人 → {next.label}</span>}
                    </div>
                    <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 6 }}>
                      <div style={{ background: 'linear-gradient(90deg,#f6c90e,#ffd94a)', height: '100%', borderRadius: 4, width: `${progress}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <button onClick={() => openProduct(p)}
                    style={{ width: '100%', padding: '10px 0', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 14 }}>
                    立即参团
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 我的订单 */}
        {myOrders.length > 0 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>我的团购记录</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myOrders.map((o, i) => (
                <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.product_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(o.created_at).toLocaleDateString()} · {o.discount_pct}% 折扣</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>¥{o.final_price?.toFixed(0)}</div>
                    <div style={{ fontSize: 12, color: '#22d3a0' }}>+{o.dark_reward} DARK</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 参团弹窗 */}
      {showModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selectedProduct.name}</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>当前 {selectedProduct.current_count.toLocaleString()} 人参团</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>购买数量</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 18 }}>-</button>
                <span style={{ fontSize: 20, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 18 }}>+</button>
              </div>
            </div>
            {modalTier && (
              <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>当前折扣</span>
                  <span style={{ color: '#f6c90e', fontWeight: 700 }}>{modalTier.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>单价</span>
                  <span style={{ fontWeight: 700 }}>¥{(selectedProduct.price * (1 - modalTier.discount / 100)).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>合计</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#f6c90e' }}>¥{(selectedProduct.price * (1 - modalTier.discount / 100) * qty).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>DARK 奖励</span>
                  <span style={{ color: '#22d3a0', fontWeight: 700 }}>+{selectedProduct.dark_reward * qty} DARK</span>
                </div>
                {nextTier && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(246,201,14,0.1)', borderRadius: 8, fontSize: 12, color: '#f6c90e' }}>
                    💡 再邀 {nextTier.min - selectedProduct.current_count - qty} 人可升至 {nextTier.label}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px 0', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600 }}>取消</button>
              <button onClick={handleJoin} disabled={loading} style={{ flex: 2, padding: '12px 0', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 15 }}>
                {loading ? '处理中...' : '确认参团'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
