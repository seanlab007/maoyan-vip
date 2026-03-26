import React, { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getTransactions, redeemProduct } from '@/api/wallet'
import { getMaoWalletSummary, getMaoTransactions, getCrossPlatformOrders } from '@/api/cross-platform'
import { supabase } from '@/lib/supabase'
import type { Transaction, Product } from '@/types/database'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const { user, wallet, profile, loadUserData } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'transactions' | 'cross_platform' | 'redeem'>('transactions')
  const [loading, setLoading] = useState(false)
  // MAO 积分（跨平台积分）
  const [maoBalance, setMaoBalance] = useState(0)
  const [maoTransactions, setMaoTransactions] = useState<Record<string, unknown>[]>([])
  const [crossOrders, setCrossOrders] = useState<Record<string, unknown>[]>([])

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [txRes, prodRes, maoSummary, maoTxs, orders] = await Promise.all([
        getTransactions(user.id, page, 20),
        supabase.from('products').select('*').eq('is_active', true).order('sort_order'),
        getMaoWalletSummary(),
        getMaoTransactions(20),
        getCrossPlatformOrders(20),
      ])
      setTransactions(txRes.data)
      setTotal(txRes.count)
      if (prodRes.data) setProducts(prodRes.data as Product[])
      if (maoSummary) setMaoBalance(maoSummary.maoBalance)
      setMaoTransactions(maoTxs as Record<string, unknown>[])
      setCrossOrders(orders as Record<string, unknown>[])
    } finally {
      setLoading(false)
    }
  }, [user, page])

  useEffect(() => { loadData() }, [loadData])

  const handleRedeem = async (product: Product) => {
    if (!user) return
    if (!product.points_price) { toast.error('该商品暂不支持积分兑换'); return }
    if ((wallet?.balance || 0) < product.points_price) {
      toast.error(`积分不足，还需 ${product.points_price - (wallet?.balance || 0)} 积分`)
      return
    }
    const confirmed = window.confirm(`确认用 ${product.points_price} 积分兑换「${product.name}」？`)
    if (!confirmed) return

    const result = await redeemProduct(user.id, product.id)
    if (result.success) {
      toast.success(result.message)
      loadData()
      loadUserData(user.id)
    } else {
      toast.error(result.message)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="wallet-page">
      {/* 钱包卡片 */}
      <div className="wallet-card">
        <div className="wallet-bg-pattern" />
        <div className="wallet-top">
          <div>
            <div className="wallet-label">积分余额</div>
            <div className="wallet-balance">{wallet?.balance?.toLocaleString() || 0}</div>
            <div className="wallet-sub">积分只可消费，不可提现</div>
          </div>
          <div className="wallet-stats-mini">
            <div>
              <div className="mini-label">累计获得</div>
              <div className="mini-val">{wallet?.total_earned?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="mini-label">累计消费</div>
              <div className="mini-val">{wallet?.total_spent?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
        <div className="wallet-user">
          <span>{profile?.nickname}</span>
          <span className="wallet-code">{profile?.referral_code}</span>
        </div>
      </div>

      {/* MAO 跨平台积分卡 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1400, #2a2000)',
        border: '1px solid #C9A84C40',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, color: '#C9A84C90', marginBottom: 4 }}>🪙 MAO 跨平台积分</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#C9A84C', fontFamily: 'monospace' }}>
            {maoBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
            在 Daiizen、Lacelle1802、WhalePictures 等平台消费自动返 10%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#C9A84C60' }}>1 USD 消费 = 10 MAO</div>
        </div>
      </div>

      {/* 如何赚积分 */}
      <div className="earn-methods">
        <h3>赚积分方式</h3>
        <div className="earn-grid">
          {[
            { icon: '📅', label: '每日签到', pts: '+10~50' },
            { icon: '👥', label: '推荐好友', pts: '+200' },
            { icon: '🛍️', label: '带货成交', pts: '1%佣金' },
            { icon: '📣', label: '分享朋友圈', pts: '+5' },
          ].map(item => (
            <div key={item.label} className="earn-item">
              <span className="earn-icon">{item.icon}</span>
              <span className="earn-label">{item.label}</span>
              <span className="earn-pts">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="wallet-tabs">
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >积分明细</button>
        <button
          className={`tab-btn ${activeTab === 'cross_platform' ? 'active' : ''}`}
          onClick={() => setActiveTab('cross_platform')}
        >🌐 MAO 跨平台</button>
        <button
          className={`tab-btn ${activeTab === 'redeem' ? 'active' : ''}`}
          onClick={() => setActiveTab('redeem')}
        >积分兑换</button>
      </div>

      {/* MAO 跨平台流水 */}
      {activeTab === 'cross_platform' && (
        <div style={{ padding: '0 0 16px' }}>
          <h4 style={{ fontSize: 13, color: '#C9A84C', marginBottom: 12, fontWeight: 600 }}>
            跨平台消费记录（每笔消费返 10% MAO 积分）
          </h4>
          {crossOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555', fontSize: 13 }}>
              暂无跨平台消费记录<br/>
              <span style={{ fontSize: 11, color: '#444', marginTop: 8, display: 'block' }}>
                在 Daiizen / Lacelle1802 等合作平台消费后，积分将自动出现在这里
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {crossOrders.map((o, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: '#111', borderRadius: 8,
                  border: '1px solid #1e1e1e',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#ddd', fontWeight: 500 }}>
                      {String(o.platform).toUpperCase()} — 订单 #{String(o.platform_order_id)}
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      消费 ${String(o.order_amount_usd)} {String(o.currency)} ·{' '}
                      {new Date(String(o.created_at)).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, color: '#C9A84C', fontWeight: 700 }}>
                      +{Number(o.mao_reward).toLocaleString()} MAO
                    </div>
                    <div style={{ fontSize: 10, color: o.status === 'credited' ? '#4CAF50' : '#888', marginTop: 2 }}>
                      {o.status === 'credited' ? '✓ 已到账' : '⏳ 结算中'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 积分明细 */}
      {activeTab === 'transactions' && (
        <div className="tx-section">
          {loading ? <div className="loading">加载中...</div> : (
            <>
              {transactions.length === 0
                ? <div className="empty">暂无积分记录</div>
                : transactions.map(tx => (
                  <div key={tx.id} className="tx-row">
                    <div className="tx-desc">{tx.description || tx.source}</div>
                    <div className="tx-right">
                      <span className={`tx-amt ${tx.amount >= 0 ? 'pos' : 'neg'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </span>
                      <span className="tx-time">{formatDate(tx.created_at)}</span>
                    </div>
                  </div>
                ))
              }
              {total > 20 && (
                <div className="pagination">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</button>
                  <span>第 {page} / {Math.ceil(total / 20)} 页</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>下一页</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 积分兑换商城 */}
      {activeTab === 'redeem' && (
        <div className="redeem-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-img">
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} />
                  : <span className="product-emoji">🎁</span>
                }
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                {product.description && <div className="product-desc">{product.description}</div>}
                <div className="product-price">
                  {product.points_price && (
                    <span className="price-points">🪙 {product.points_price.toLocaleString()}</span>
                  )}
                  {product.points_price && product.price && (
                    <span className="price-cash" style={{textDecoration:'line-through', opacity:0.5, fontSize:'0.85em'}}>市价¥{product.price}</span>
                  )}
                </div>
                <div className="product-stock">库存 {product.stock}</div>
              </div>
              <button
                className="redeem-btn"
                onClick={() => handleRedeem(product)}
                disabled={!product.points_price || (wallet?.balance || 0) < (product.points_price || 0)}
              >
                {!product.points_price ? '暂不支持积分兑换' :
                  (wallet?.balance || 0) < (product.points_price || 0) ? '积分不足' : '立即兑换'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
