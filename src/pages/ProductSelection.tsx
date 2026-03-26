import { useState, useEffect, useCallback } from 'react'
import { productApi, type DaiizenProduct, type DaiizenCategory } from '@/lib/daiizenApi'
import toast from 'react-hot-toast'

interface CartItem extends DaiizenProduct {
  qty: number
}

export default function ProductSelection() {
  const [categories, setCategories] = useState<DaiizenCategory[]>([])
  const [products, setProducts] = useState<DaiizenProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showBundleDialog, setShowBundleDialog] = useState(false)
  const [bundleName, setBundleName] = useState('')

  // Filters
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts(1, true)
  }, [activeCategory, search, sort])

  const loadCategories = async () => {
    try {
      const { data } = await productApi.getCategories('zh')
      setCategories(data)
    } catch {
      // silent
    }
  }

  const loadProducts = async (p = 1, reset = false) => {
    try {
      if (p === 1) setLoading(true)
      else setLoadingMore(true)

      const res = await productApi.getProducts({
        page: p,
        limit: 20,
        category: activeCategory || undefined,
        search: search || undefined,
        sort,
        lang: 'zh',
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

  const loadMore = () => {
    if (page < totalPages && !loadingMore) loadProducts(page + 1)
  }

  // Cart helpers
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

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const newQty = i.qty + delta
      return newQty <= 0 ? { ...i, qty: 1 } : { ...i, qty: newQty }
    }))
  }

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.priceUsdd) * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const handleCreateBundle = () => {
    if (!bundleName.trim()) { toast.error('请输入套餐名称'); return }
    // 这里可以对接后端存储套餐，目前先导出为 JSON
    const bundle = {
      name: bundleName,
      items: cart.map(i => ({ productId: i.id, slug: i.slug, name: i.name, qty: i.qty, priceUsdd: i.priceUsdd })),
      totalUsdd: cartTotal.toFixed(2),
      createdAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bundle_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('套餐已导出！')
    setShowBundleDialog(false)
    setBundleName('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0c0d10', color: '#f0f2f8', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>🛍️ daiizen 选品中心</h1>
            <p style={{ color: '#9ba3b8', margin: '4px 0 0', fontSize: 13 }}>
              浏览 daiizen 精选商品，勾选后打包成套餐或组合
            </p>
          </div>
          {/* Cart button */}
          <button
            onClick={() => setShowCart(true)}
            style={{
              position: 'relative', background: '#1c1f28', border: '1px solid rgba(246,201,14,0.3)',
              borderRadius: 10, padding: '10px 20px', cursor: 'pointer', color: '#f0f2f8',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
            }}
          >
            🧺 我的套餐
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8, background: '#f6c90e', color: '#0c0d10',
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
            style={{
              flex: 1, minWidth: 200, background: '#1c1f28', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '10px 14px', color: '#f0f2f8', fontSize: 14,
            }}
          />
          <button type="submit" style={{
            background: '#f6c90e', color: '#0c0d10', border: 'none',
            borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700,
          }}>搜索</button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            style={{
              background: '#1c1f28', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '10px 14px', color: '#f0f2f8', fontSize: 14, cursor: 'pointer',
            }}
          >
            <option value="newest">最新</option>
            <option value="price_asc">价格↑</option>
            <option value="price_desc">价格↓</option>
          </select>
        </form>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => setActiveCategory('')}
            style={{
              padding: '6px 16px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
              background: !activeCategory ? '#f6c90e' : '#1c1f28',
              color: !activeCategory ? '#0c0d10' : '#9ba3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              fontWeight: !activeCategory ? 700 : 400,
            }}
          >全部</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              style={{
                padding: '6px 16px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                background: activeCategory === cat.slug ? '#f6c90e' : '#1c1f28',
                color: activeCategory === cat.slug ? '#0c0d10' : '#9ba3b8',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: activeCategory === cat.slug ? 700 : 400,
              }}
            >{cat.name || cat.nameEn}</button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ba3b8' }}>加载中...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ba3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p>暂无商品</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}>
              {products.map(product => {
                const inCart = cart.some(i => i.id === product.id)
                const price = parseFloat(product.priceUsdd)
                const img = product.images?.[0] || product.aiGeneratedImageUrl || ''
                return (
                  <div
                    key={product.id}
                    style={{
                      background: '#1c1f28',
                      border: inCart ? '2px solid #f6c90e' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      transition: 'border 0.2s',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '100%', paddingTop: '75%', position: 'relative',
                      background: '#252836', overflow: 'hidden',
                    }}>
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#9ba3b8',
                        }}>📦</div>
                      )}
                      {product.isFeatured && (
                        <span style={{
                          position: 'absolute', top: 8, left: 8,
                          background: '#f6c90e', color: '#0c0d10',
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        }}>精选</span>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                      }}>{product.name}</div>
                      <div style={{ color: '#9ba3b8', fontSize: 11, marginBottom: 8 }}>
                        {product.category?.name || product.category?.nameEn || '未分类'}
                        {product.stock > 0 ? ` · 库存 ${product.stock}` : ' · 缺货'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#f6c90e', fontWeight: 700, fontSize: 16 }}>
                          ${isNaN(price) ? product.priceUsdd : price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          style={{
                            background: inCart ? '#252836' : '#f6c90e',
                            color: inCart ? '#f6c90e' : '#0c0d10',
                            border: inCart ? '1px solid #f6c90e' : 'none',
                            borderRadius: 8, padding: '6px 14px',
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            fontSize: 12, fontWeight: 700,
                            opacity: product.stock === 0 ? 0.5 : 1,
                          }}
                        >{inCart ? '✓ 已选' : '+ 选品'}</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    background: '#1c1f28', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f0f2f8', borderRadius: 10, padding: '12px 32px',
                    cursor: loadingMore ? 'not-allowed' : 'pointer', fontSize: 14,
                  }}
                >{loadingMore ? '加载中...' : '加载更多'}</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div
          onClick={() => setShowCart(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
            display: 'flex', justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: Math.min(420, window.innerWidth - 32),
              height: '100%', background: '#161820', overflow: 'auto',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>🧺 我的套餐 ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: '#9ba3b8', cursor: 'pointer', fontSize: 22 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ba3b8' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                  <p>还没有选品，去左边挑几件吧</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', gap: 12, marginBottom: 16, padding: 12,
                    background: '#1c1f28', borderRadius: 10, alignItems: 'center',
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#252836', overflow: 'hidden', flexShrink: 0 }}>
                      {item.images?.[0] ? (
                        <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ba3b8' }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ color: '#f6c90e', fontWeight: 700, fontSize: 14, marginTop: 2 }}>${parseFloat(item.priceUsdd).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ background: '#252836', border: 'none', color: '#f0f2f8', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{ background: '#252836', border: 'none', color: '#f0f2f8', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>+</button>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 18, marginLeft: 4 }}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#9ba3b8' }}>合计（{cartCount} 件）</span>
                  <span style={{ color: '#f6c90e', fontWeight: 700, fontSize: 18 }}>${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { setShowCart(false); setShowBundleDialog(true) }}
                  style={{
                    width: '100%', background: '#f6c90e', color: '#0c0d10',
                    border: 'none', borderRadius: 10, padding: '14px', cursor: 'pointer',
                    fontWeight: 700, fontSize: 15,
                  }}
                >📦 打包成套餐 / 导出</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bundle Dialog */}
      {showBundleDialog && (
        <div
          onClick={() => setShowBundleDialog(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1c1f28', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>📦 打包套餐</h2>
            <div style={{ marginBottom: 12, color: '#9ba3b8', fontSize: 13 }}>
              共 {cartCount} 件商品，合计 ${cartTotal.toFixed(2)}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>套餐名称</label>
              <input
                autoFocus
                value={bundleName}
                onChange={e => setBundleName(e.target.value)}
                placeholder="例如：猫眼护肤精选套餐"
                style={{
                  width: '100%', background: '#252836', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, padding: '12px 14px', color: '#f0f2f8', fontSize: 14, boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowBundleDialog(false)}
                style={{ flex: 1, background: '#252836', border: '1px solid rgba(255,255,255,0.1)', color: '#9ba3b8', borderRadius: 10, padding: '12px', cursor: 'pointer' }}
              >取消</button>
              <button
                onClick={handleCreateBundle}
                style={{ flex: 2, background: '#f6c90e', color: '#0c0d10', border: 'none', borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 700 }}
              >导出套餐 JSON</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
