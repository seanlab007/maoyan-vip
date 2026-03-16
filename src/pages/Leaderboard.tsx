import React from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import type { Profile } from '@/types/database'
import { LEVEL_CONFIG } from '@/types/database'

export default function LeaderboardPage() {
  const { data: leaders, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, level, trust_score, gmv_total, follower_count, commission_total')
        .order('gmv_total', { ascending: false })
        .limit(50)
      return (data as Profile[]) || []
    },
    staleTime: 60000,
  })

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>🏆 达人排行榜</h1>
        <p>基于 GMV 影响力综合排名，每小时更新</p>
      </div>

      {isLoading ? (
        <div className="loading">排行榜加载中...</div>
      ) : (
        <div className="leaderboard-list">
          {(leaders || []).map((p, i) => {
            const level = LEVEL_CONFIG[p.level]
            return (
              <div key={p.id} className={`leader-row rank-${i + 1}`}>
                <div className="rank-num">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="leader-avatar">
                  {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{p.nickname?.[0] || '🐱'}</span>}
                </div>
                <div className="leader-info">
                  <div className="leader-name">{p.nickname}</div>
                  <div className="leader-level" style={{ color: level.color }}>
                    {level.icon} {level.label} · 信任分 {p.trust_score}
                  </div>
                </div>
                <div className="leader-stats">
                  <div className="leader-gmv">¥{p.gmv_total?.toLocaleString() || 0}</div>
                  <div className="leader-gmv-label">累计 GMV</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
