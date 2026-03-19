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
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      {/* 页头 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(246,201,14,0.15), rgba(246,201,14,0.05))',
        border: '1px solid rgba(246,201,14,0.3)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🏆</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: '#f6c90e' }}>达人排行榜</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>基于 GMV 影响力综合排名，每小时更新</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>排行榜加载中...</div>
        </div>
      ) : (leaders || []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🐱</div>
          <div>暂无排行数据</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(leaders || []).map((p, i) => {
            const level = LEVEL_CONFIG[p.level] || LEVEL_CONFIG.newbie
            const isTop3 = i < 3
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 48px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  background: isTop3
                    ? `linear-gradient(135deg, rgba(246,201,14,0.08), rgba(246,201,14,0.03))`
                    : 'var(--bg2)',
                  border: `1px solid ${isTop3 ? 'rgba(246,201,14,0.25)' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  transition: 'all 0.2s',
                }}
              >
                {/* 排名 */}
                <div style={{ textAlign: 'center' }}>
                  {rankEmoji ? (
                    <span style={{ fontSize: 24 }}>{rankEmoji}</span>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text3)' }}>#{i + 1}</span>
                  )}
                </div>

                {/* 头像 */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${level.color}40, ${level.color}20)`,
                  border: `2px solid ${level.color}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 18, fontWeight: 700, color: level.color }}>{p.nickname?.[0] || '🐱'}</span>
                  }
                </div>

                {/* 信息 */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.nickname || '猫眼达人'}
                  </div>
                  <div style={{ fontSize: 12, color: level.color, marginTop: 2 }}>
                    {level.icon} {level.label} · 信任分 {p.trust_score || 0}
                  </div>
                </div>

                {/* GMV */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#f6c90e' }}>
                    ¥{(p.gmv_total || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>累计 GMV</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
