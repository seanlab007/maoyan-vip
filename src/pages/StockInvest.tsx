import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 227.5, change: +1.2, icon: '🍎', sector: '科技' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.3, change: -2.1, icon: '⚡', sector: '新能源' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.4, change: +3.8, icon: '🎮', sector: '半导体' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 195.6, change: +0.9, icon: '📦', sector: '电商' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 168.2, change: -0.5, icon: '🔍', sector: '科技' },
  { symbol: 'META', name: 'Meta Platforms', price: 512.8, change: +2.3, icon: '👓', sector: '社交' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.3, change: +1.7, icon: '🪟', sector: '软件' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 452.1, change: +0.3, icon: '🏦', sector: '金融' },
]

const POINT_TO_USD = 0.01 // 100积分 = $1

export default function StockInvestPage() {
  const { profile, wallet, setWallet } = useAuthStore()
  const [selected, setSelected] = useState<typeof STOCKS[0] | null>(null)
  const [points, setPoints] = useState('')
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
  const [submitting, setSubmitting] = useState(false)
  const [holdings, setHoldings] = useState<any[]>([])
  const [tab, setTab] = useState<'market' | 'holdings' | 'history'>('market')

  const usdAmount = (parseFloat(points) || 0) * POINT_TO_USD
  const shares = selected ? usdAmount / selected.price : 0

  const handleTrade = async () => {
    if (!profile?.id) { toast.error('请先登录'); return }
    if (!selected) { toast.error('请选择股票'); return }
    const pts = parseFloat(points)
    if (!pts || pts < 100) { toast.error('最少投入 100 积分（= $1）'); return }
    if (pts > (wallet?.balance || 0)) { toast.error('积分余额不足'); return }

    setSubmitting(true)
    try {
      await supabase.from('stock_investments').insert({
        user_id: profile.id,
        symbol: selected.symbol,
        name: selected.name,
        direction,
        points_used: pts,
        usd_amount: usdAmount,
        price_at_trade: selected.price,
        shares,
        status: 'active',
      })

      await supabase.from('point_transactions').insert({
        user_id: profile.id,
        type: 'stock_invest',
        amount: -pts,
        description: `${direction === 'buy' ? '买入' : '卖出'} ${selected.symbol} ${shares.toFixed(4)}股`,
        status: 'completed',
      })

      const newBalance = (wallet?.balance || 0) - pts
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
      setWallet({ ...(wallet as any), balance: newBalance })

      toast.success(`✅ ${direction === 'buy' ? '买入' : '卖出'}成功！${selected.symbol} ${shares.toFixed(4)}股`)
      setPoints('')
      setSelected(null)
    } catch (err) {
      console.error(err)
      toast.error('交易失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📈 积分投资美股</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>用积分兑换投资额度，投资美股，收益以积分形式发放</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>💡 100积分 = $1</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>📊 最低投入100积分</span>
          <span style={{ fontSize: 12, color: 'var(--gold)' }}>余额：{(wallet?.balance || 0).toLocaleString()} 积分</span>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['market', 'holdings', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 18px', borderRadius: 99, border: `1px solid ${tab === t ? '#22d3a0' : 'var(--border)'}`, background: tab === t ? 'rgba(34,211,160,0.15)' : 'transparent', color: tab === t ? '#22d3a0' : 'var(--text2)', fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
            {t === 'market' ? '🌐 市场' : t === 'holdings' ? '💼 持仓' : '📋 记录'}
          </button>
        ))}
      </div>

      {tab === 'market' && (
        <>
          {/* 股票列表 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {STOCKS.map(s => (
              <div key={s.symbol} onClick={() => setSelected(selected?.symbol === s.symbol ? null : s)}
                style={{ background: selected?.symbol === s.symbol ? 'rgba(34,211,160,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selected?.symbol === s.symbol ? '#22d3a0' : 'var(--border)'}`, borderRadius: 12, padding: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.sector}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>${s.price}</div>
                    <div style={{ fontSize: 12, color: s.change >= 0 ? '#22d3a0' : '#ff6b6b' }}>
                      {s.change >= 0 ? '+' : ''}{s.change}%
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.name}</div>
              </div>
            ))}
          </div>

          {/* 交易面板 */}
          {selected && (
            <div style={{ background: 'rgba(34,211,160,0.06)', border: '1px solid rgba(34,211,160,0.3)', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.icon} {selected.symbol} · ${selected.price}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['buy', 'sell'] as const).map(d => (
                    <button key={d} onClick={() => setDirection(d)}
                      style={{ padding: '6px 16px', borderRadius: 99, border: `1px solid ${direction === d ? (d === 'buy' ? '#22d3a0' : '#ff6b6b') : 'var(--border)'}`, background: direction === d ? (d === 'buy' ? 'rgba(34,211,160,0.2)' : 'rgba(255,107,107,0.2)') : 'transparent', color: direction === d ? (d === 'buy' ? '#22d3a0' : '#ff6b6b') : 'var(--text2)', cursor: 'pointer', fontWeight: direction === d ? 700 : 400, fontSize: 13 }}>
                      {d === 'buy' ? '买入' : '卖出'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>投入积分</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="最少100积分"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14 }} />
                  {[500, 1000, 5000].map(n => (
                    <button key={n} onClick={() => setPoints(String(n))}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 12 }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>折算美元</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#22d3a0' }}>${usdAmount.toFixed(2)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>可买股数</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>{shares.toFixed(4)}</div>
                </div>
              </div>

              <button onClick={handleTrade} disabled={submitting}
                style={{ width: '100%', padding: '14px', borderRadius: 12, background: submitting ? 'rgba(34,211,160,0.4)' : (direction === 'buy' ? '#22d3a0' : '#ff6b6b'), color: '#000', fontWeight: 800, fontSize: 15, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? '交易中...' : `${direction === 'buy' ? '✅ 确认买入' : '📤 确认卖出'} ${selected.symbol}`}
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'holdings' && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>暂无持仓</div>
          <div style={{ fontSize: 13 }}>去市场买入第一支股票吧</div>
          <button onClick={() => setTab('market')} style={{ marginTop: 16, padding: '8px 24px', borderRadius: 99, background: '#22d3a0', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700 }}>去市场</button>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div>暂无交易记录</div>
        </div>
      )}
    </div>
  )
}
