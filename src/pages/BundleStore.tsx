/**
 * BundleStore.tsx
 * 套餐商城 —— 浏览所有已上架套餐，支持购买（积分 / 现金）
 */
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface BundleItem {
  productId: number
  slug: string
  name: string
  nameEn: string
  priceUsdd: string
  qty: number
  images: string[]
  category: string
}

interface Bundle {
  id: string
  creator_id: string
  name: string
  description: string | null
  cover_image: string | null
  tags: string[]
  items: BundleItem[]
  price_cny: number | null
  price_points: number | null
  original_cost_usdd: number
  view_count: number
  order_count: number
  status: string
  is_featured: boolean
  created_at: string
  // joined
  creator?: { nickname: string; avatar_url: string | null }
}

interface BundleDetailProps {
  bundle: Bundle
  onClose: () => void
  currentUserId: string | null
  walletBalance: number
  onBuy: (bundle: Bundle, payType: 'points' | 'cash') => void
}

function BundleDetail({ bundle, onClose, currentUserId, walletBalance, onBuy }: BundleDetailProps) {
  const C = { bg: '#0c0d10', card: '#1c1f28', border: 'rgba(255,255,255,0.08)', accent: '#f6c90e', text: '#f0f2f8', muted: '#9ba3b8' }
  const totalItems = bundle.items.reduce((s, i) => s + i.qty, 0)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 20, width: '100%', maxWidth: 560, overflow: 'hidden' }}>
        {/* Cover */}
        <div style={{ width: '100%', height: 220, background: '#252836', position: 'relative', overflow: 'hidden' }}>
          {bundle.cover_image ? (
            <img src={bundle.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>📦</div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.6)', border: 'none', color: C.text, borderRadius: 99, width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>✕</button>
          {bundle.is_featured && <span style={{ position: 'absolute', top: 14, left: 14, background: C.accent, color: C.bg, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>精选套餐</span>}
        </div>

        <div style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: C.text }}>{bundle.name}</h2>
          {bundle.description && <p style={{ color: C.muted, fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>{bundle.description}</p>}

          {/* Tags */}
          {bundle.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {bundle.tags.map(t => <span key={t} style={{ background: '#252836', borderRadius: 99, padding: '3px 10px', fontSize: 12, color: C.muted }}>#{t}</span>)}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 13, color: C.muted }}>
            <span>👁 {bundle.view_count} 次浏览</span>
            <span>🛍 {bundle.order_count} 次购买</span>
            <span>📦 {totalItems} 件商品</span>
          </div>

          {/* Items list */}
          <div style={{ background: '#252836', borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.text }}>套餐内容</div>
            {bundle.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: i < bundle.items.length - 1 ? 10 : 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: C.card, overflow: 'hidden', flexShrink: 0 }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 18 }}>📦</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{item.category} · ${parseFloat(item.priceUsdd).toFixed(2)} × {item.qty}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Price & Buy */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {bundle.price_cny && (
              <button
                onClick={() => onBuy(bundle, 'cash')}
                style={{ flex: 1, minWidth: 140, background: C.accent, color: C.bg, border: 'none', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}
              >
                <div>¥{bundle.price_cny.toFixed(2)}</div>
                <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>现金购买</div>
              </button>
            )}
            {bundle.price_points && (
              <button
                onClick={() => onBuy(bundle, 'points')}
                disabled={walletBalance < bundle.price_points}
                style={{
                  flex: 1, minWidth: 140,
                  background: walletBalance >= bundle.price_points ? 'rgba(246,201,14,0.15)' : '#252836',
                  color: walletBalance >= bundle.price_points ? C.accent : C.muted,
                  border: `2px solid ${walletBalance >= bundle.price_points ? C.accent : C.border}`,
                  borderRadius: 12, padding: '14px 16px', cursor: walletBalance >= bundle.price_points ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 16,
                }}
              >
                <div>{bundle.price_points.toLocaleString()} pt</div>
                <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>
                  {walletBalance >= bundle.price_points ? '积分兑换' : `积分不足（当前 ${walletBalance}`}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────
export default function BundleStore() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Bundle | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [filter, setFilter] = useState<'all' | 'featured'>('all')
  const [searchQ, setSearchQ] = useState('')
  const [myOnly, setMyOnly] = useState(false)

  const C = { bg: '#0c0d10', card: '#1c1f28', border: 'rgba(255,255,255,0.08)', accent: '#f6c90e', text: '#f0f2f8', muted: '#9ba3b8' }

  useEffect(() => {
    loadUser()
    loadBundles()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)
    const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single()
    if (data) setWalletBalance(data.balance)
  }

  const loadBundles = async () => {
    setLoading(true)
    try {
      let q = supabase
        .from('bundles')
        .select('*, creator:profiles!creator_id(nickname, avatar_url)')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(60)

      const { data, error } = await q
      if (error) throw error
      setBundles(data || [])
    } catch (err: any) {
      toast.error('加载套餐失败：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBundle = async (bundle: Bundle) => {
    setSelected(bundle)
    // 增加浏览量
    await supabase.rpc('increment_bundle_view', { p_id: bundle.id })
  }

  const handleBuy = async (bundle: Bundle, payType: 'points' | 'cash') => {
    if (!currentUserId) { toast.error('请先登录'); return }

    if (payType === 'points') {
      if (!bundle.price_points) return
      if (walletBalance < bundle.price_points) { toast.error('积分不足'); return }

      const snapshot = { ...bundle }
      const { error: orderErr } = await supabase.from('bundle_orders').insert({
        bundle_id: bundle.id,
        buyer_id: currentUserId,
        pay_type: 'points',
        points_used: bundle.price_points,
        cash_paid: 0,
        bundle_snapshot: snapshot,
        status: 'paid',
      })
      if (orderErr) { toast.error('下单失败：' + orderErr.message); return }

      // 扣积分
      await supabase.from('wallets').update({ balance: walletBalance - bundle.price_points, total_spent: walletBalance }).eq('user_id', currentUserId)
      setWalletBalance(prev => prev - bundle.price_points!)

      // 增加订单数
      await supabase.from('bundles').update({ order_count: bundle.order_count + 1 }).eq('id', bundle.id)

      toast.success('🎉 兑换成功！')
      setSelected(null)
    } else {
      // 现金支付 —— 跳转支付页面（待对接）
      toast('现金支付即将上线，敬请期待 😊', { icon: '💡' })
    }
  }

  // 过滤
  const filtered = bundles.filter(b => {
    if (filter === 'featured' && !b.is_featured) return false
    if (myOnly && b.creator_id !== currentUserId) return false
    if (searchQ) {
      const q = searchQ.toLowerCase()
      return b.name.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.tags?.some(t => t.includes(q))
    }
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>🏪 套餐商城</h1>
          <p style={{ color: C.muted, margin: 0, fontSize: 13 }}>达人精选 · 组合好货 · 积分兑换</p>
        </div>

        {/* 搜索 + 筛选 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <input
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="搜索套餐..."
            style={{ flex: 1, minWidth: 180, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14 }}
          />
          {[
            { v: 'all', label: '全部' },
            { v: 'featured', label: '⭐ 精选' },
          ].map(opt => (
            <button key={opt.v} onClick={() => setFilter(opt.v as any)}
              style={{ padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: filter === opt.v ? 700 : 400, background: filter === opt.v ? C.accent : C.card, color: filter === opt.v ? C.bg : C.muted, border: `1px solid ${C.border}` }}>
              {opt.label}
            </button>
          ))}
          {currentUserId && (
            <button onClick={() => setMyOnly(!myOnly)}
              style={{ padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: myOnly ? 700 : 400, background: myOnly ? 'rgba(246,201,14,0.15)' : C.card, color: myOnly ? C.accent : C.muted, border: `2px solid ${myOnly ? C.accent : C.border}` }}>
              👤 我的套餐
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: C.muted }}>加载中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <p>暂无套餐</p>
            <a href="/product-selection" style={{ color: C.accent, textDecoration: 'none', fontSize: 14 }}>去选品中心创建第一个套餐 →</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.map(bundle => {
              const totalItems = bundle.items.reduce((s, i) => s + i.qty, 0)
              return (
                <div
                  key={bundle.id}
                  onClick={() => handleViewBundle(bundle)}
                  style={{ background: C.card, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${C.border}`, transition: 'transform 0.15s, border 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(246,201,14,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = C.border }}
                >
                  {/* Cover */}
                  <div style={{ width: '100%', paddingTop: '65%', position: 'relative', background: '#252836', overflow: 'hidden' }}>
                    {bundle.cover_image ? (
                      <img src={bundle.cover_image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📦</div>
                    )}
                    {bundle.is_featured && (
                      <span style={{ position: 'absolute', top: 10, left: 10, background: C.accent, color: C.bg, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>精选</span>
                    )}
                    {/* item mini previews */}
                    <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 4 }}>
                      {bundle.items.slice(0, 3).map((item, i) => item.images?.[0] && (
                        <div key={i} style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', background: '#252836' }}>
                          <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{bundle.name}</div>

                    {/* Meta */}
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                      {totalItems} 件商品 · {bundle.view_count} 次浏览
                      {bundle.creator?.nickname && ` · by ${bundle.creator.nickname}`}
                    </div>

                    {/* Tags */}
                    {bundle.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                        {bundle.tags.slice(0, 3).map(t => (
                          <span key={t} style={{ background: '#252836', borderRadius: 99, padding: '2px 8px', fontSize: 11, color: C.muted }}>#{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {bundle.price_cny && (
                        <span style={{ background: C.accent, color: C.bg, borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 15 }}>¥{bundle.price_cny.toFixed(2)}</span>
                      )}
                      {bundle.price_points && (
                        <span style={{ border: `1.5px solid ${C.accent}`, color: C.accent, borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 13 }}>{bundle.price_points.toLocaleString()} pt</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <BundleDetail
          bundle={selected}
          onClose={() => setSelected(null)}
          currentUserId={currentUserId}
          walletBalance={walletBalance}
          onBuy={handleBuy}
        />
      )}
    </div>
  )
}
