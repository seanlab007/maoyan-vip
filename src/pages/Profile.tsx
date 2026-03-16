import React, { useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { LEVEL_CONFIG } from '@/types/database'
import { trackShare } from '@/lib/analytics'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, wallet, user } = useAuthStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const levelConfig = profile ? LEVEL_CONFIG[profile.level] : LEVEL_CONFIG.newbie

  const shareUrl = `${window.location.origin}/u/${profile?.username || profile?.referral_code}`
  const referralUrl = `${window.location.origin}/register?ref=${profile?.referral_code}`

  const copyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url)
    toast.success(`${label}已复制到剪贴板`)
    trackShare('profile', 'copy_link')
  }

  const shareCard = async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0c0d10',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `maoyan-${profile?.referral_code}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('名片已保存，发朋友圈吧！')
      trackShare('creator_card', 'download_image')
    } catch {
      toast.error('生成名片失败')
    }
  }

  return (
    <div className="profile-page">
      {/* Creator Card */}
      <div className="creator-card-wrapper">
        <h2>我的 Creator Card</h2>
        <div className="creator-card" ref={cardRef}>
          <div className="cc-header">
            <div className="cc-platform">
              <span>🐱 猫眼 MaoYan</span>
              <span className="cc-verified">✓ 已认证</span>
            </div>
            <div className="cc-level-badge" style={{ background: levelConfig.color }}>
              {levelConfig.icon} {levelConfig.label}达人
            </div>
          </div>

          <div className="cc-user">
            <div className="cc-avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" />
                : <span>{profile?.nickname?.[0] || '🐱'}</span>
              }
            </div>
            <div className="cc-user-info">
              <div className="cc-name">{profile?.nickname || '猫眼达人'}</div>
              <div className="cc-username">@{profile?.username || profile?.referral_code}</div>
              {profile?.bio && <div className="cc-bio">{profile.bio}</div>}
            </div>
          </div>

          <div className="cc-stats">
            <div className="cc-stat">
              <div className="cc-stat-val">{profile?.follower_count?.toLocaleString() || 0}</div>
              <div className="cc-stat-label">粉丝</div>
            </div>
            <div className="cc-stat">
              <div className="cc-stat-val">{profile?.engagement_rate?.toFixed(1) || 0}%</div>
              <div className="cc-stat-label">互动率</div>
            </div>
            <div className="cc-stat">
              <div className="cc-stat-val">{levelConfig.commission * 100}%</div>
              <div className="cc-stat-label">佣金率</div>
            </div>
            <div className="cc-stat">
              <div className="cc-stat-val">{profile?.trust_score || 0}</div>
              <div className="cc-stat-label">信任分</div>
            </div>
          </div>

          <div className="cc-wallet-row">
            <div className="cc-wallet-item">
              <span className="cc-wallet-icon">🪙</span>
              <div>
                <div className="cc-wallet-val">{wallet?.balance?.toLocaleString() || 0}</div>
                <div className="cc-wallet-label">积分余额</div>
              </div>
            </div>
            <div className="cc-wallet-item">
              <span className="cc-wallet-icon">💰</span>
              <div>
                <div className="cc-wallet-val">¥{profile?.commission_total?.toLocaleString() || 0}</div>
                <div className="cc-wallet-label">累计佣金</div>
              </div>
            </div>
          </div>

          <div className="cc-footer">
            <div className="cc-qr-placeholder">
              <div className="cc-qr-inner">{profile?.referral_code}</div>
              <div className="cc-qr-label">扫码关注</div>
            </div>
            <div className="cc-footer-right">
              <div className="cc-domain">maoyan.vip</div>
              <div className="cc-ref">推荐码 {profile?.referral_code}</div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="card-actions">
          <button className="btn-secondary" onClick={shareCard}>
            📸 保存名片图片
          </button>
          <button className="btn-secondary" onClick={() => copyLink(shareUrl, '名片链接')}>
            🔗 复制名片链接
          </button>
          <button className="btn-primary" onClick={() => copyLink(referralUrl, '推荐链接')}>
            👥 复制推荐链接（得200积分）
          </button>
        </div>
      </div>

      {/* 个人信息编辑 */}
      <div className="profile-edit-section">
        <h3>个人信息</h3>
        <div className="info-row">
          <span className="info-label">邮箱</span>
          <span className="info-val">{user?.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">推荐码</span>
          <span className="info-val">
            <code>{profile?.referral_code}</code>
            <button className="copy-mini" onClick={() => copyLink(profile?.referral_code || '', '推荐码')}>复制</button>
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">达人等级</span>
          <span className="info-val" style={{ color: levelConfig.color }}>
            {levelConfig.icon} {levelConfig.label}（佣金 {levelConfig.commission * 100}%）
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">累计GMV</span>
          <span className="info-val">¥{profile?.gmv_total?.toLocaleString() || 0}</span>
        </div>
      </div>
    </div>
  )
}
