import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { pointsApi, lotteryApi, linkApi, type UserPoints, type Lottery, type DrawRecord } from '@/lib/daiizenApi'
import toast from 'react-hot-toast'

// ── 工具函数 ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString() }

// ── 抽奖动画圆盘 ──────────────────────────────────────────────────────────────
function WheelAnimation({ spinning, result }: { spinning: boolean; result: string | null }) {
  const [angle, setAngle] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef(0)
  const spinningRef = useRef(false)

  useEffect(() => {
    if (spinning) {
      spinningRef.current = true
      startRef.current = performance.now()
      const animate = (now: number) => {
        const elapsed = now - startRef.current
        const speed = Math.max(2, 20 - elapsed / 200)
        setAngle(a => (a + speed) % 360)
        if (spinningRef.current) rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    } else {
      spinningRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => { spinningRef.current = false; if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [spinning])

  const emojis = ['🎁', '🪙', '⭐', '🎀', '💎', '🎯', '🏆', '🎊']
  return (
    <div style={{ width: 200, height: 200, position: 'relative', margin: '0 auto' }}>
      {/* wheel */}
      <div style={{
        width: 200, height: 200, borderRadius: '50%',
        background: 'conic-gradient(#f6c90e 0deg 45deg, #1c1f28 45deg 90deg, #f6c90e 90deg 135deg, #1c1f28 135deg 180deg, #f6c90e 180deg 225deg, #1c1f28 225deg 270deg, #f6c90e 270deg 315deg, #1c1f28 315deg 360deg)',
        transform: `rotate(${angle}deg)`,
        transition: spinning ? 'none' : 'transform 0.5s ease-out',
        boxShadow: '0 0 30px rgba(246,201,14,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {emojis.map((e, i) => (
          <div key={i} style={{
            position: 'absolute',
            transform: `rotate(${i * 45}deg) translateY(-68px)`,
            fontSize: 22,
          }}>{e}</div>
        ))}
      </div>
      {/* center */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 50, height: 50, borderRadius: '50%', background: '#0c0d10',
        border: '4px solid #f6c90e', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, zIndex: 10,
      }}>
        {spinning ? '⏳' : (result ? '🎉' : '🎯')}
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
export default function DaiizenPoints() {
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'lottery' | 'history' | 'rules'>('overview')

  // 积分数据
  const [pointsData, setPointsData] = useState<UserPoints | null>(null)
  const [linked, setLinked] = useState(false)

  // 身份绑定
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [daiizenUserId, setDaiizenUserId] = useState('')
  const [linking, setLinking] = useState(false)

  // 抽奖
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [lastResult, setLastResult] = useState<{ isWin: boolean; prizeName: string; prizeValue: string; newBalance: number } | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  // 历史
  const [history, setHistory] = useState<DrawRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => { if (user?.id) loadAll() }, [user])

  const loadAll = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [pointsRes, lotteriesRes] = await Promise.allSettled([
        pointsApi.getByMaoyan(user.id),
        lotteryApi.getAll(),
      ])

      if (pointsRes.status === 'fulfilled') {
        setPointsData(pointsRes.value.data)
        setLinked(pointsRes.value.linked)
      }
      if (lotteriesRes.status === 'fulfilled') {
        setLotteries(lotteriesRes.value.data)
        if (lotteriesRes.value.data.length > 0) {
          setSelectedLottery(lotteriesRes.value.data[0])
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    if (!user?.id) return
    setLoadingHistory(true)
    try {
      const res = await lotteryApi.getHistoryByMaoyan(user.id, 30)
      setHistory(res.data)
    } catch (err: any) {
      toast.error('加载历史失败: ' + err.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history' && user?.id) loadHistory()
  }, [activeTab])

  // ── 身份绑定 ────────────────────────────────────────────────────────────────
  const handleLink = async () => {
    if (!user?.id) return
    const uid = parseInt(daiizenUserId.trim())
    if (!uid || isNaN(uid)) { toast.error('请输入有效的 daiizen 用户 ID（纯数字）'); return }
    setLinking(true)
    try {
      await linkApi.link(uid, user.id, user.email || undefined)
      toast.success('账号关联成功！积分数据同步中...')
      setShowLinkDialog(false)
      setDaiizenUserId('')
      setTimeout(loadAll, 1000)
    } catch (err: any) {
      toast.error('关联失败: ' + err.message)
    } finally {
      setLinking(false)
    }
  }

  // ── 抽奖 ────────────────────────────────────────────────────────────────────
  const handleDraw = async () => {
    if (!user?.id || !selectedLottery) return
    if (!linked) { toast.error('请先关联 daiizen 账号'); setShowLinkDialog(true); return }
    if ((pointsData?.balance ?? 0) < selectedLottery.costPoints) {
      toast.error(`积分不足，需要 ${fmt(selectedLottery.costPoints)} 积分`)
      return
    }

    setSpinning(true)
    setLastResult(null)
    try {
      const res = await lotteryApi.draw({ lotteryId: selectedLottery.id, maoyanOpenId: user.id })
      // 让动画至少跑 2.5s
      await new Promise(r => setTimeout(r, 2500))
      setSpinning(false)
      setLastResult({
        isWin: res.isWin,
        prizeName: res.prize.name,
        prizeValue: res.prize.value,
        newBalance: res.newBalance,
      })
      setShowResultModal(true)
      // 更新积分
      setPointsData(prev => prev ? { ...prev, balance: res.newBalance } : prev)
    } catch (err: any) {
      setSpinning(false)
      toast.error('抽奖失败: ' + err.message)
    }
  }

  const handleClaim = async (drawId: number) => {
    try {
      const res = await lotteryApi.claim(drawId)
      toast.success(`已领取：${res.prizeName} - ${res.prizeValue}`)
      setHistory(prev => prev.map(d => d.id === drawId ? { ...d, isClaimed: 1 } : d))
    } catch (err: any) {
      toast.error('领奖失败: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0c0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ba3b8' }}>
        加载中...
      </div>
    )
  }

  const balance = pointsData?.balance ?? 0
  const totalEarned = pointsData?.totalEarned ?? 0
  const totalSpent = pointsData?.totalSpent ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#0c0d10', color: '#f0f2f8', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>🛍️ daiizen 积分 & 抽奖</h1>
          <p style={{ color: '#9ba3b8', margin: 0, fontSize: 13 }}>
            在 daiizen 购物积累积分，用积分参与抽奖赢大奖
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#1c1f28', borderRadius: 12, padding: 4 }}>
          {(['overview', 'lottery', 'history', 'rules'] as const).map(tab => {
            const labels = { overview: '积分概览', lottery: '参与抽奖', history: '抽奖历史', rules: '积分规则' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === tab ? '#f6c90e' : 'transparent',
                  color: activeTab === tab ? '#0c0d10' : '#9ba3b8',
                  fontWeight: activeTab === tab ? 700 : 400, fontSize: 13,
                  transition: 'all 0.2s',
                }}
              >{labels[tab]}</button>
            )
          })}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Linked status banner */}
            {!linked && (
              <div style={{
                background: 'rgba(246,201,14,0.1)', border: '1px solid rgba(246,201,14,0.3)',
                borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ fontSize: 28 }}>🔗</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>尚未关联 daiizen 账号</div>
                  <div style={{ color: '#9ba3b8', fontSize: 13 }}>关联后即可查看积分余额并参与抽奖</div>
                </div>
                <button
                  onClick={() => setShowLinkDialog(true)}
                  style={{ background: '#f6c90e', color: '#0c0d10', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 }}
                >立即关联</button>
              </div>
            )}

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '🪙', value: fmt(balance), label: '当前积分', highlight: true },
                { icon: '📈', value: fmt(totalEarned), label: '累计获得' },
                { icon: '🎯', value: fmt(totalSpent), label: '已消耗' },
              ].map(card => (
                <div key={card.label} style={{
                  background: '#1c1f28', borderRadius: 12, padding: 16, textAlign: 'center',
                  border: card.highlight ? '1px solid rgba(246,201,14,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: card.highlight ? '#f6c90e' : '#f0f2f8' }}>{card.value}</div>
                  <div style={{ color: '#9ba3b8', fontSize: 12, marginTop: 2 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => window.open('https://daiizen.com', '_blank')}
                style={{
                  background: '#1c1f28', border: '1px solid rgba(246,201,14,0.3)',
                  borderRadius: 10, padding: '14px', cursor: 'pointer', color: '#f6c90e',
                  fontWeight: 700, fontSize: 14,
                }}
              >🛍️ 去 daiizen 购物</button>
              <button
                onClick={() => setActiveTab('lottery')}
                style={{
                  background: '#f6c90e', border: 'none',
                  borderRadius: 10, padding: '14px', cursor: 'pointer', color: '#0c0d10',
                  fontWeight: 700, fontSize: 14,
                }}
              >🎰 参与抽奖</button>
            </div>

            {linked && (
              <div style={{
                background: '#1c1f28', borderRadius: 12, padding: 14,
                border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: '#4ade80', fontSize: 18 }}>✓</span>
                <span style={{ color: '#9ba3b8', fontSize: 13 }}>已关联 daiizen 账号，积分实时同步</span>
              </div>
            )}
          </div>
        )}

        {/* ── Lottery Tab ── */}
        {activeTab === 'lottery' && (
          <div>
            {/* Lottery selector */}
            {lotteries.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {lotteries.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLottery(l)}
                    style={{
                      flexShrink: 0, padding: '8px 18px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                      background: selectedLottery?.id === l.id ? '#f6c90e' : '#1c1f28',
                      color: selectedLottery?.id === l.id ? '#0c0d10' : '#9ba3b8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontWeight: selectedLottery?.id === l.id ? 700 : 400,
                    }}
                  >{l.title}</button>
                ))}
              </div>
            )}

            {selectedLottery ? (
              <div>
                {/* Info card */}
                <div style={{
                  background: '#1c1f28', borderRadius: 16, padding: 20, marginBottom: 20,
                  border: '1px solid rgba(246,201,14,0.2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{selectedLottery.title}</h3>
                      <p style={{ color: '#9ba3b8', fontSize: 13, margin: 0 }}>{selectedLottery.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f6c90e', fontWeight: 800, fontSize: 22 }}>{fmt(selectedLottery.costPoints)}</div>
                      <div style={{ color: '#9ba3b8', fontSize: 12 }}>积分/次</div>
                    </div>
                  </div>
                  {selectedLottery.type === 'prize_pool' && selectedLottery.poolAmount && (
                    <div style={{
                      background: 'rgba(246,201,14,0.1)', borderRadius: 8, padding: '8px 14px',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span>💰</span>
                      <span style={{ fontWeight: 700 }}>奖金池：{selectedLottery.poolCurrency} {selectedLottery.poolAmount}</span>
                    </div>
                  )}
                </div>

                {/* Wheel */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <WheelAnimation spinning={spinning} result={lastResult?.prizeName ?? null} />
                  <div style={{ marginTop: 20 }}>
                    <div style={{ color: '#9ba3b8', fontSize: 13, marginBottom: 4 }}>
                      当前积分：<span style={{ color: '#f6c90e', fontWeight: 700 }}>{fmt(balance)}</span>
                      {!linked && <span style={{ color: '#ff6b6b', marginLeft: 8 }}>（未关联账号）</span>}
                    </div>
                    <button
                      onClick={handleDraw}
                      disabled={spinning || !linked || balance < selectedLottery.costPoints}
                      style={{
                        background: spinning ? '#9ba3b8' : '#f6c90e',
                        color: '#0c0d10', border: 'none', borderRadius: 12,
                        padding: '16px 48px', cursor: spinning ? 'not-allowed' : 'pointer',
                        fontWeight: 800, fontSize: 18, marginTop: 8,
                        opacity: (!linked || balance < selectedLottery.costPoints) && !spinning ? 0.5 : 1,
                        boxShadow: spinning ? 'none' : '0 4px 20px rgba(246,201,14,0.35)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {spinning ? '抽奖中...' : `🎰 抽一次（${fmt(selectedLottery.costPoints)} 积分）`}
                    </button>
                    {!linked && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={() => setShowLinkDialog(true)}
                          style={{ background: 'none', border: '1px solid #f6c90e', color: '#f6c90e', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}
                        >🔗 先关联 daiizen 账号</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prizes table */}
                {selectedLottery.prizes && (
                  <div style={{ background: '#1c1f28', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, fontSize: 14 }}>🏆 奖品列表</div>
                    {selectedLottery.prizes.map(p => (
                      <div key={p.rank} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 99, fontWeight: 700, fontSize: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: p.rank === 1 ? '#f6c90e' : p.rank === 2 ? '#c0c0c0' : p.rank === 3 ? '#cd7f32' : '#252836',
                            color: p.rank <= 3 ? '#0c0d10' : '#9ba3b8',
                          }}>{p.rank}</div>
                          <span style={{ fontWeight: p.rank <= 3 ? 700 : 400 }}>{p.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: p.rank <= 2 ? '#f6c90e' : '#f0f2f8', fontSize: 13, fontWeight: 600 }}>{p.value}</div>
                          <div style={{ color: '#9ba3b8', fontSize: 11 }}>{(p.probability * 100).toFixed(1)}% 概率</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ba3b8' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎰</div>
                <p>暂无进行中的抽奖活动</p>
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (
          <div>
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ba3b8' }}>加载中...</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ba3b8' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p>还没有抽奖记录</p>
              </div>
            ) : (
              history.map(draw => (
                <div key={draw.id} style={{
                  background: '#1c1f28', borderRadius: 10, padding: 14, marginBottom: 10,
                  border: draw.result === 'win' ? '1px solid rgba(246,201,14,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                      {draw.result === 'win' ? `🎉 ${draw.prizeName}` : '😢 未中奖'}
                    </div>
                    <div style={{ color: '#9ba3b8', fontSize: 12 }}>
                      消耗 {fmt(draw.pointsSpent)} 积分 · {new Date(draw.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                    {draw.result === 'win' && draw.prizeValue && (
                      <div style={{ color: '#f6c90e', fontSize: 13, marginTop: 2 }}>{draw.prizeValue}</div>
                    )}
                  </div>
                  {draw.result === 'win' && draw.isClaimed === 0 && (
                    <button
                      onClick={() => handleClaim(draw.id)}
                      style={{
                        background: '#f6c90e', color: '#0c0d10', border: 'none',
                        borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0,
                      }}
                    >领取</button>
                  )}
                  {draw.result === 'win' && draw.isClaimed === 1 && (
                    <span style={{ color: '#4ade80', fontSize: 13, flexShrink: 0 }}>✓ 已领取</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Rules Tab ── */}
        {activeTab === 'rules' && (
          <div>
            {[
              { icon: '🛒', title: '购物返积分', desc: '在 daiizen 每消费 $1，获得 10 积分' },
              { icon: '🎁', title: '签到奖励', desc: '每日签到获得 5 积分，连续签到额外奖励' },
              { icon: '👥', title: '邀请好友', desc: '邀请好友注册，双方各获得 50 积分' },
              { icon: '⭐', title: '评价奖励', desc: '购物后撰写评价获得 15 积分' },
              { icon: '🎯', title: '积分有效期', desc: '积分自获得日起 12 个月内有效' },
              { icon: '🔄', title: '跨平台互通', desc: '关联 maoyan 账号后可在两个平台之间使用积分' },
            ].map(rule => (
              <div key={rule.title} style={{
                display: 'flex', gap: 14, padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{rule.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{rule.title}</div>
                  <div style={{ color: '#9ba3b8', fontSize: 14 }}>{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Link Account Dialog ── */}
      {showLinkDialog && (
        <div
          onClick={() => setShowLinkDialog(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1c1f28', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}
          >
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>🔗 关联 daiizen 账号</h2>
            <p style={{ color: '#9ba3b8', fontSize: 13, margin: '0 0 20px' }}>
              输入你在 daiizen.com 个人中心的用户 ID（数字），完成跨站身份关联
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#9ba3b8' }}>daiizen 用户 ID</label>
              <input
                autoFocus
                type="number"
                value={daiizenUserId}
                onChange={e => setDaiizenUserId(e.target.value)}
                placeholder="例如：12345"
                style={{
                  width: '100%', background: '#252836', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, padding: '12px 14px', color: '#f0f2f8', fontSize: 16,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ background: 'rgba(246,201,14,0.08)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#9ba3b8' }}>
              💡 在 daiizen.com → 个人中心 → 账号设置 中查找你的用户 ID
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLinkDialog(false)}
                style={{ flex: 1, background: '#252836', border: '1px solid rgba(255,255,255,0.1)', color: '#9ba3b8', borderRadius: 10, padding: '12px', cursor: 'pointer' }}
              >取消</button>
              <button
                onClick={handleLink}
                disabled={linking || !daiizenUserId}
                style={{
                  flex: 2, background: linking ? '#9ba3b8' : '#f6c90e', color: '#0c0d10',
                  border: 'none', borderRadius: 10, padding: '12px', cursor: linking ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                }}
              >{linking ? '关联中...' : '确认关联'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Draw Result Modal ── */}
      {showResultModal && lastResult && (
        <div
          onClick={() => setShowResultModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1c1f28', borderRadius: 20, padding: 36, width: '100%', maxWidth: 380,
              textAlign: 'center',
              border: lastResult.isWin ? '2px solid #f6c90e' : '2px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>{lastResult.isWin ? '🎉' : '😢'}</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>
              {lastResult.isWin ? '恭喜中奖！' : '下次好运'}
            </h2>
            <div style={{ color: lastResult.isWin ? '#f6c90e' : '#9ba3b8', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {lastResult.prizeName}
            </div>
            {lastResult.isWin && (
              <div style={{ color: '#9ba3b8', fontSize: 14, marginBottom: 16 }}>{lastResult.prizeValue}</div>
            )}
            <div style={{ color: '#9ba3b8', fontSize: 13, marginBottom: 24 }}>
              当前余额：<span style={{ color: '#f6c90e', fontWeight: 700 }}>{fmt(lastResult.newBalance)} 积分</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {lastResult.isWin && (
                <button
                  onClick={() => { setShowResultModal(false); setActiveTab('history') }}
                  style={{ flex: 1, background: '#252836', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f2f8', borderRadius: 10, padding: '12px', cursor: 'pointer', fontSize: 13 }}
                >查看历史</button>
              )}
              <button
                onClick={() => setShowResultModal(false)}
                style={{
                  flex: 2, background: '#f6c90e', color: '#0c0d10', border: 'none',
                  borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 700,
                }}
              >再来一次</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
