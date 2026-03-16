import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile, Wallet } from '@/types/database'
import { LEVEL_CONFIG } from '@/types/database'
import { Link } from 'react-router-dom'

export default function CreatorCardPage() {
  const { username } = useParams<{ username: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['creator-card', username],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.eq.${username},referral_code.eq.${username}`)
        .single()
      if (!profile) return null
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance, total_earned')
        .eq('user_id', profile.id)
        .single()
      return { profile: profile as Profile, wallet: wallet as Wallet }
    },
  })

  if (isLoading) return <div className="loading-screen"><div className="loading-logo">🐱</div></div>
  if (!data) return (
    <div className="not-found">
      <h2>达人不存在</h2>
      <Link to="/">返回首页</Link>
    </div>
  )

  const { profile, wallet } = data
  const level = LEVEL_CONFIG[profile.level]

  return (
    <div className="creator-card-public">
      <div className="public-card">
        <div className="pc-header">
          <div className="pc-platform">🐱 猫眼 MaoYan</div>
          <div className="pc-level" style={{ background: level.color }}>{level.icon} {level.label}</div>
        </div>

        <div className="pc-user">
          <div className="pc-avatar">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" />
              : <span>{profile.nickname?.[0] || '🐱'}</span>
            }
          </div>
          <div>
            <h1 className="pc-name">{profile.nickname}</h1>
            <p className="pc-bio">{profile.bio || '这个达人很神秘，还没有简介'}</p>
          </div>
        </div>

        <div className="pc-stats">
          <div className="pc-stat">
            <div className="pc-stat-val">{profile.follower_count?.toLocaleString()}</div>
            <div className="pc-stat-label">粉丝</div>
          </div>
          <div className="pc-stat">
            <div className="pc-stat-val">{profile.engagement_rate?.toFixed(1)}%</div>
            <div className="pc-stat-label">互动率</div>
          </div>
          <div className="pc-stat">
            <div className="pc-stat-val">¥{profile.gmv_total?.toLocaleString()}</div>
            <div className="pc-stat-label">累计 GMV</div>
          </div>
          <div className="pc-stat">
            <div className="pc-stat-val">{profile.trust_score}</div>
            <div className="pc-stat-label">信任分</div>
          </div>
        </div>

        <div className="pc-cta">
          <Link
            to={`/register?ref=${profile.referral_code}`}
            className="btn-primary pc-join-btn"
          >
            👥 通过 {profile.nickname} 的邀请加入猫眼
          </Link>
          <p className="pc-reward">注册即得 <strong>100积分</strong>，推荐人获得 <strong>200积分</strong></p>
        </div>

        <div className="pc-footer">
          <div>maoyan.vip</div>
          <div>推荐码：{profile.referral_code}</div>
        </div>
      </div>
    </div>
  )
}
