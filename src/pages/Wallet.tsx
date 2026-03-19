import React, { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getTransactions, redeemProduct } from '@/api/wallet'
import { supabase } from '@/lib/supabase'
import type { Transaction, Product } from '@/types/database'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const { user, wallet, profile, loadUserData } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<'transactions' | 'redeem'>('transactions')
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [txRes, prodRes] = await Promise.all([
        getTransactions(user.id, page, 20),
        supabase.from('products').select('*').eq('is_active', true).order('sort_order'),
      ])
      setTransactions(txRes.data)
      setTotal(txRes.count)
      if (prodRes.data) setProducts(prodRes.data as Product[])
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
          className={`tab-btn ${activeTab === 'redeem' ? 'active' : ''}`}
          onClick={() => setActiveTab('redeem')}
        >积分兑换</button>
      </div>

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
