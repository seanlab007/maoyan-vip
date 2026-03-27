import { useState, useEffect } from 'react'
import { productApi, type DaiizenProduct, type DaiizenCategory } from '@/lib/daiizenApi'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CartItem extends DaiizenProduct {
  qty: number
}

interface BundleFormData {
  name: string
  description: string
  priceCny: string        // 人民币售价（可为空）
  pricePoints: string     // 积分售价（可为空）
  coverImage: string
  tags: string
  status: 'draft' | 'active'
}

export default function ProductSelection() {
  const [categories, setCategories] = useState<DaiizenCategory[]>([])
  const [products, setProducts] = useState<DaiizenProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showBundleDialog, setShowBundleDialog] = useState(false)
  const [form, setForm] = useState<BundleFormData>({
    name: '',
    description: '',
    priceCny: '',
    pricePoints: '',
    coverImage: '',
    tags: '',
    status: 'active',
  })

  // Filters
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadProducts(1, true) }, [activeCategory, search, sort])

  const loadCategories = async () => {
    try {
      const { data } = await productApi.getCategories('zh')
      setCategories(data)
    } catch { /* silent */ }
  }

  const loadProducts = async (p = 1, reset = false) => {
    try {
      if (p === 1) setLoading(true)
      else setLoadingMore(true)
      const res = await productApi.getProducts({
        page: p, limit: 20,
        category: activeCategory || undefined,
        search: search || undefined,
        sort, lang: 'zh',
      })
      setProducts(prev => reset ? res.data : [...prev, ...res.data])
      setPage(p)
      setTotalPages(res.pagination.totalPages)
    } catch (err: any) {
      toast.error('加载商品失败：' + err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // ── Cart helpers ────────────────────────────────────────────
  const addToCart = (product: DaiizenProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        toast.success('数量已增加')
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      toast.success('已加入套餐')
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const newQty = i.qty + delta
      return newQty <= 0 ? { ...i, qty: 1 } : { ...i, qty: newQty }
    }))
  }

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.priceUsdd) * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  // ── 打开套餐弹窗，自动填充封面图 ──────────────────────────
  const openBundleDialog = () => {
    const firstImg = cart.find(i => i.images?.[0])?.images?.[0] || ''
    setForm(prev => ({ ...prev, coverImage: prev.coverImage || firstImg }))
    setShowCart(false)
    setShowBundleDialog(true)
  }

  // ── 保存套餐到 Supabase ─────────────────────────────────────
  const handleSaveBundle = async () => {
    if (!form.name.trim()) { toast.error('请输入套餐名称'); return }
    if (!form.priceCny && !form.pricePoints) {
      toast.error('请至少设置一种售价（CNY 或积分）'); return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('请先登录后再创建套餐'); return }

    setSaving(true)
    try {
      // 构建商品快照
      const items = cart.map(i => ({
        productId: i.id,
        slug: i.slug,
        name: i.name,
        nameEn: i.nameEn,
        priceUsdd: i.priceUsdd,
        qty: i.qty,
        images: i.images?.slice(0, 1) || [],
        category: i.category?.name || i.category?.nameEn || '',
      }))

      const payload = {
        creator_id: user.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        cover_image: form.coverImage.trim() || items[0]?.images?.[0] || null,
        tags: form.tags ? form.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [],
        items,
        price_cny: form.priceCny ? parseFloat(form.priceCny) : null,
        price_points: form.pricePoints ? parseInt(form.pricePoints) : null,
        original_cost_usdd: cartTotal,
        status: form.status,
      }

      const { data, error } = await supabase
        .from('bundles')
        .insert(payload)
        .select('id')
        .single()

      if (error) throw error

      toast.success(`套餐「${form.name}」已${form.status === 'active' ? '上架' : '存为草稿'}！`)
      setCart([])
      setForm({ name: '', description: '', priceCny: '', pricePoints: '', coverImage: '', tags: '', status: 'active' })
      setShowBundleDialog(false)
    } catch (err: any) {
      toast.error('保存失败：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  // ── 颜色常量 ────────────────────────────────────────────────
  const C = {
    bg: '#0c0d10', card: '#1c1f28', border: 'rgba(255,255,255,0.08)',
    accent: '#f6c90e', text: '#f0f2f8', muted: '#9ba3b8', deep: '#161820',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>🛍️ daiizen 选品中心</h1>
            <p style={{ color: C.muted, margin: '4px 0 0', fontSize: 13 }}>
              浏览 daiizen 精选商品 · 自由组合 · 定价上架
            </p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            style={{
              position: 'relative', background: C.card, border: `1px solid rgba(246,201,14,0.3)`,
              borderRadius: 10, padding: '10px 20px', cursor: 'pointer', color: C.text,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
            }}
          >
            🧺 我的套餐
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8, background: C.accent, color: C.bg,
                borderRadius: 99, width: 20, height: 20, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>
        </div>

        {/* Search + Sort */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="搜索商品..."
            style={{ flex: 1, minWidth: 200, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14 }}
          />
          <button type="submit" style={{ background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>搜索</button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14, cursor: 'pointer' }}
          >
            <option value="newest">最新</option>
            <option value="price_asc">价格↑</option>
            <option value="price_desc">价格↓</option>
          </select>
        </form>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[{ id: 0, slug: '', name: '全部', nameEn: 'All' }, ...categories].map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              style={{
                padding: '6px 16px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                background: activeCategory === cat.slug ? C.accent : C.card,
                color: activeCategory === cat.slug ? C.bg : C.muted,
                border: `1px solid ${C.border}`,
                fontWeight: activeCategory === cat.slug ? 700 : 400,
              }}
            >{cat.name || cat.nameEn}</button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>加载中...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p>暂无商品</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {products.map(product => {
                const inCart = cart.some(i => i.id === product.id)
                const price = parseFloat(product.priceUsdd)
                const img = product.images?.[0] || product.aiGeneratedImageUrl || ''
                return (
                  <div key={product.id} style={{
                    background: C.card,
                    border: inCart ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                    borderRadius: 12, overflow: 'hidden', transition: 'border 0.2s',
                  }}>
                    <div style={{ width: '100%', paddingTop: '75%', position: 'relative', background: '#252836', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: C.muted }}>📦</div>
                      )}
                      {product.isFeatured && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: C.accent, color: C.bg, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>精选</span>
                      )}
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{product.name}</div>
                      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>
                        {product.category?.name || product.category?.nameEn || '未分类'}
                        {product.stock > 0 ? ` · 库存 ${product.stock}` : ' · 缺货'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: C.accent, fontWeight: 700, fontSize: 16 }}>
                          ${isNaN(price) ? product.priceUsdd : price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          style={{
                            background: inCart ? '#252836' : C.accent,
                            color: inCart ? C.accent : C.bg,
                            border: inCart ? `1px solid ${C.accent}` : 'none',
                            borderRadius: 8, padding: '6px 14px',
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            fontSize: 12, fontWeight: 700, opacity: product.stock === 0 ? 0.5 : 1,
                          }}
                        >{inCart ? '✓ 已选' : '+ 选品'}</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={() => loadProducts(page + 1)} disabled={loadingMore}
                  style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: '12px 32px', cursor: loadingMore ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                  {loadingMore ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Cart Drawer ──────────────────────────────────────── */}
      {showCart && (
        <div onClick={() => setShowCart(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: Math.min(420, window.innerWidth - 32), height: '100%', background: C.deep, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>🧺 选品清单 ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                  <p>还没有选品</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: C.card, borderRadius: 10, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#252836', overflow: 'hidden', flexShrink: 0 }}>
                      {item.images?.[0]
                        ? <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginTop: 2 }}>${parseFloat(item.priceUsdd).toFixed(2)} × {item.qty}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ background: '#252836', border: 'none', color: C.text, borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{ background: '#252836', border: 'none', color: C.text, borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>+</button>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 18, marginLeft: 4 }}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
                {/* 进货成本 */}
                <div style={{ background: '#252836', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
                    <span>daiizen 进货成本</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    共 {cartCount} 件 · 你可以在套餐定价时加价
                  </div>
                </div>
                <button
                  onClick={openBundleDialog}
                  style={{ width: '100%', background: C.accent, color: C.bg, border: 'none', borderRadius: 10, padding: '14px', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
                >📦 打包定价上架</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bundle 定价弹窗 ──────────────────────────────────── */}
      {showBundleDialog && (
        <div onClick={() => !saving && setShowBundleDialog(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: C.card, borderRadius: 16, padding: 28, width: '100%', maxWidth: 520 }}>

            <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>📦 套餐定价 & 上架</h2>
            <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>
              daiizen 进货成本 ${cartTotal.toFixed(2)} · 共 {cartCount} 件商品
            </p>

            {/* 商品预览 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {cart.slice(0, 6).map(item => (
                <div key={item.id} style={{ background: '#252836', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: C.muted }}>
                  {item.name.slice(0, 12)}{item.name.length > 12 ? '…' : ''} ×{item.qty}
                </div>
              ))}
              {cart.length > 6 && <div style={{ background: '#252836', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: C.muted }}>+{cart.length - 6} 件</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 套餐名称 */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>套餐名称 *</label>
                <input
                  autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="例：猫眼护肤精选套餐"
                  style={{ width: '100%', background: '#252836', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              {/* 描述 */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>套餐简介</label>
                <textarea
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="简单描述这个套餐的特色..."
                  rows={2}
                  style={{ width: '100%', background: '#252836', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* 定价区 */}
              <div style={{ background: '#252836', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: C.accent }}>💰 你的售价（至少填一种）</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: C.muted }}>人民币售价 (¥)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.priceCny} onChange={e => setForm(p => ({ ...p, priceCny: e.target.value }))}
                      placeholder="0.00"
                      style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, boxSizing: 'border-box' }}
                    />
                    {form.priceCny && cartTotal > 0 && (
                      <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>
                        利润约 ¥{(parseFloat(form.priceCny) - cartTotal * 7.2).toFixed(2)}（按汇率 7.2）
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: C.muted }}>积分售价 (pt)</label>
                    <input
                      type="number" min="0" step="1"
                      value={form.pricePoints} onChange={e => setForm(p => ({ ...p, pricePoints: e.target.value }))}
                      placeholder="0"
                      style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, boxSizing: 'border-box' }}
                    />
                    {form.pricePoints && (
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                        ≈ ¥{(parseInt(form.pricePoints) / 100).toFixed(2)}（1000pt=¥10）
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>标签</label>
                <input
                  value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="用逗号分隔，如：护肤,美妆,精选"
                  style={{ width: '100%', background: '#252836', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              {/* 封面图 URL */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>封面图 URL（可选）</label>
                <input
                  value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
                  placeholder="留空则自动用第一件商品的图"
                  style={{ width: '100%', background: '#252836', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              {/* 状态 */}
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>发布状态</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ v: 'active', label: '🚀 立即上架', desc: '所有用户可见' }, { v: 'draft', label: '📝 保存草稿', desc: '仅自己可见' }].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setForm(p => ({ ...p, status: opt.v as any }))}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        background: form.status === opt.v ? 'rgba(246,201,14,0.15)' : '#252836',
                        border: form.status === opt.v ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                        color: C.text, fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowBundleDialog(false)} disabled={saving}
                style={{ flex: 1, background: '#252836', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: '13px', cursor: 'pointer' }}
              >取消</button>
              <button
                onClick={handleSaveBundle} disabled={saving}
                style={{ flex: 2, background: saving ? '#a89500' : C.accent, color: C.bg, border: 'none', borderRadius: 10, padding: '13px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15 }}
              >{saving ? '保存中...' : (form.status === 'active' ? '🚀 上架套餐' : '📝 保存草稿')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
