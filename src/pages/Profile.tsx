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
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>

      {/* ── 网红名片 ── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>我的网红卡</h2>

      <div
        ref={cardRef}
        style={{
          background: 'linear-gradient(160deg, #0a001a 0%, #0c0d10 100%)',
          border: '1px solid rgba(246,201,14,0.25)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景光晕 */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(246,201,14,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* 顶部：平台标识 + 等级 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f6c90e' }}>🐱 猫眼 MaoYan</span>
            <span style={{ fontSize: 11, background: 'rgba(34,211,160,0.15)', color: '#22d3a0', border: '1px solid rgba(34,211,160,0.3)', borderRadius: 99, padding: '2px 8px' }}>✓ 已认证</span>
          </div>
          <div style={{
            background: `${levelConfig.color}20`,
            border: `1px solid ${levelConfig.color}50`,
            borderRadius: 99,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: levelConfig.color,
          }}>
            {levelConfig.icon} {levelConfig.label}达人
          </div>
        </div>

        {/* 用户信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${levelConfig.color}40, ${levelConfig.color}20)`,
            border: `2px solid ${levelConfig.color}60`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 24, fontWeight: 700, color: levelConfig.color }}>{profile?.nickname?.[0] || '🐱'}</span>
            }
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              {profile?.nickname || '猫眼达人'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>
              @{profile?.username || profile?.referral_code}
            </div>
            {profile?.bio && (
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{profile.bio}</div>
            )}
          </div>
        </div>

        {/* 数据统计 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { val: (profile?.follower_count || 0).toLocaleString(), label: '粉丝' },
            { val: `${profile?.engagement_rate?.toFixed(1) || 0}%`, label: '互动率' },
            { val: `${levelConfig.commission * 100}%`, label: '佣金率' },
            { val: profile?.trust_score || 0, label: '信任分' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '12px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{stat.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 积分 & 奖励 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(246,201,14,0.12), rgba(246,201,14,0.05))',
            border: '1px solid rgba(246,201,14,0.25)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#f6c90e' }}>{(wallet?.balance || 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>积分余额</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>💰</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{(wallet?.total_earned || 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>累计积分奖励</div>
            </div>
          </div>
        </div>

        {/* 底部：二维码区域 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>{profile?.referral_code}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>扫码关注</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f6c90e' }}>maoyan.vip</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>推荐码 {profile?.referral_code}</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <button
          onClick={shareCard}
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          📸 保存名片图片
        </button>
        <button
          onClick={() => copyLink(shareUrl, '名片链接')}
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          🔗 复制名片链接
        </button>
      </div>
      <button
        onClick={() => copyLink(referralUrl, '推荐链接')}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #f6c90e, #ffd94a)',
          border: 'none',
          borderRadius: 12,
          padding: '14px 16px',
          fontSize: 14,
          fontWeight: 700,
          color: '#0c0d10',
          cursor: 'pointer',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        👥 复制推荐链接（得200积分）
      </button>

      {/* 个人信息 */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '20px 20px',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--text)' }}>个人信息</h3>
        {[
          { label: '邮箱', val: user?.email || '-' },
          { label: '推荐码', val: profile?.referral_code || '-', copyable: true, copyVal: profile?.referral_code },
          { label: '达人等级', val: `${levelConfig.icon} ${levelConfig.label}（佣金 ${levelConfig.commission * 100}%）`, color: levelConfig.color },
          { label: '累计GMV', val: `¥${(profile?.gmv_total || 0).toLocaleString()}` },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text3)', flexShrink: 0, marginRight: 16 }}>{row.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: row.color || 'var(--text)', fontWeight: 600, textAlign: 'right' }}>
                {row.val}
              </span>
              {row.copyable && row.copyVal && (
                <button
                  onClick={() => copyLink(row.copyVal!, row.label)}
                  style={{
                    background: 'rgba(246,201,14,0.12)',
                    border: '1px solid rgba(246,201,14,0.3)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 11,
                    color: '#f6c90e',
                    cursor: 'pointer',
                  }}
                >
                  复制
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
