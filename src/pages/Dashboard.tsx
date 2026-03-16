import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getTransactions, dailyCheckin } from '@/api/wallet'
import type { Transaction } from '@/types/database'
import { LEVEL_CONFIG } from '@/types/database'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { Sparkles, TrendingUp, Gift, Video, Play } from 'lucide-react'

// 热门短剧数据
const HOT_SHORT_PLAYS = [
  { id: 1, name: '念念有词', views: '30亿+', genre: '穿书', hot: true },
  { id: 2, name: '盛夏芬德拉', views: '10亿+', genre: '甜宠', hot: true },
  { id: 3, name: '家里家外', views: '8亿+', genre: '都市', hot: true },
  { id: 4, name: '昭然赴礼', views: '5亿+', genre: '职场', hot: true },
  { id: 5, name: '深情诱引', views: '3亿+', genre: '悬疑', hot: true },
]

export default function DashboardPage() {
  const { user, profile, wallet, loadUserData } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  const levelConfig = profile ? LEVEL_CONFIG[profile.level] : LEVEL_CONFIG.newbie

  useEffect(() => {
    if (!user) return
    loadUserData(user.id)
    loadTransactions()
    checkTodayCheckin()
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    try {
      const { data } = await getTransactions(user.id, 1, 10)
      setTransactions(data)
    } catch (e) {
      console.error(e)
    }
  }

  const checkTodayCheckin = async () => {
    const today = new Date().toISOString().split('T')[0]
    const lastCheckin = wallet?.last_checkin_at?.split('T')[0]
    setHasCheckedIn(lastCheckin === today)
  }

  const handleCheckin = async () => {
    if (!user || isCheckingIn || hasCheckedIn) return
    setIsCheckingIn(true)
    try {
      const result = await dailyCheckin(user.id)
      if (result.success) {
        toast.success(result.message)
        setHasCheckedIn(true)
        loadUserData(user.id)
        loadTransactions()
        trackEvent('daily_checkin', { streak: result.streak })
      } else {
        toast(result.message)
        setHasCheckedIn(true)
      }
    } catch {
      toast.error('签到失败，请重试')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+${amount}` : `${amount}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="dashboard">
      {/* 顶部财神卡片 */}
      <div className="cishen-header">
        <div className="cishen-left">
          <div className="avatar-wrapper">
            <div className="avatar-ring"></div>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="avatar" />
              : <div className="avatar-placeholder">{profile?.nickname?.[0] || '🐱'}</div>}
          </div>
          <div className="user-info">
            <h2 className="gold-text">{profile?.nickname || '猫眼达人'}</h2>
            <div className="user-meta">
              <span className="level-badge" style={{ background: levelConfig.color }}>
                {levelConfig.icon} {levelConfig.label}
              </span>
              <span className="referral-code">邀请码: <code>{profile?.referral_code}</code></span>
            </div>
          </div>
        </div>
        <button
          className={`checkin-btn ${hasCheckedIn ? 'checked' : ''}`}
          onClick={handleCheckin}
          disabled={isCheckingIn || hasCheckedIn}
        >
          {hasCheckedIn ? (
            <>✅ 已签到 <span className="checkin-reward">+10 积分</span></>
          ) : isCheckingIn ? (
            '签到中...'
          ) : (
            <>🧧 每日签到 <span className="checkin-reward">+10 积分</span></>
          )}
        </button>
      </div>

      {/* 积分钱包大卡片 */}
      <div className="wallet-hero">
        <div className="wallet-content">
          <div className="wallet-header">
            <div className="wallet-title">
              <Sparkles className="gold-icon" size={24} />
              <span>积分钱包</span>
            </div>
            <a href="/wallet" className="view-detail-btn">查看详情 →</a>
          </div>
          <div className="wallet-balance">
            <div className="balance-label">可用积分</div>
            <div className="balance-value gold-text">{wallet?.balance?.toLocaleString() || 0}</div>
            <div className="balance-actions">
              <a href="/wallet" className="action-btn primary">积分兑换</a>
              <a href="/wallet" className="action-btn secondary">积分明细</a>
            </div>
          </div>
          <div className="wallet-tips">
            <span className="tip-item">🎉 注册奖励 +100</span>
            <span className="tip-item">👥 推荐好友 +200</span>
            <span className="tip-item">📅 每日签到 +10</span>
          </div>
        </div>
        <div className="wallet-decoration">
          <div className="yuanbao">💰</div>
          <div className="fu-icon">福</div>
        </div>
      </div>

      {/* 短剧投资板块 */}
      <div className="short-drama-section">
        <div className="section-header">
          <h3 className="section-title">
            <Video className="section-icon" size={20} />
            热门短剧投资
          </h3>
          <a href="/drama" className="see-all">查看全部 →</a>
        </div>

        <div className="drama-investment">
          {/* 投资选项 */}
          <div className="investment-options">
            <div className="investment-card small">
              <div className="inv-header">
                <span className="inv-label">小额体验</span>
                <span className="inv-amount">¥1</span>
              </div>
              <div className="inv-desc">投资热门短剧，按收益分成</div>
              <button className="inv-btn">立即投资</button>
            </div>
            <div className="investment-card featured">
              <div className="inv-badge">限时优惠</div>
              <div className="inv-header">
                <span className="inv-label">角色体验</span>
                <span className="inv-amount">¥1000</span>
              </div>
              <div className="inv-desc">参演热门短剧角色，品牌深度植入</div>
              <button className="inv-btn featured-btn">预约名额</button>
              <div className="inv-features">
                <span>🎬 参演 1 集内容</span>
                <span>📺 品牌出镜机会</span>
                <span>💰 收益阶梯分成</span>
              </div>
            </div>
          </div>

          {/* 热门短剧列表 */}
          <div className="hot-dramas">
            <div className="hot-list">
              {HOT_SHORT_PLAYS.map(drama => (
                <div key={drama.id} className="drama-item">
                  <div className="drama-info">
                    {drama.hot && <span className="hot-badge">HOT</span>}
                    <h4 className="drama-name">{drama.name}</h4>
                    <p className="drama-meta">{drama.genre} · {drama.views}</p>
                  </div>
                  <button className="drama-invest-btn">
                    <Play size={16} />
                    投资
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 最近流水 */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>
            <TrendingUp className="section-icon" size={20} />
            最近流水
          </h3>
          <a href="/wallet" className="see-all">查看全部 →</a>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <Gift size={48} className="empty-icon" />
            <p>暂无积分流水，快去签到、推荐好友赚取积分吧！</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-icon">
                  {tx.type === 'earn' ? '📥' : '📤'}
                </div>
                <div className="tx-info">
                  <div className="tx-desc">{tx.description}</div>
                  <div className="tx-date">{formatDate(tx.created_at)}</div>
                </div>
                <div className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                  {formatAmount(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
