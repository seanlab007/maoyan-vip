import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const CARD_LEVELS = [
  { level: 'silver', name: '银牌达人', color: '#c0c0c0', bg: 'linear-gradient(135deg,#2a2a3a,#3a3a4a)', min_followers: 0, multiplier: 1 },
  { level: 'gold', name: '金牌达人', color: '#f6c90e', bg: 'linear-gradient(135deg,#1a1500,#2d2200)', min_followers: 10000, multiplier: 1.5 },
  { level: 'platinum', name: '铂金达人', color: '#9d6dff', bg: 'linear-gradient(135deg,#1a0a2e,#2a1a4e)', min_followers: 100000, multiplier: 2 },
  { level: 'diamond', name: '钻石达人', color: '#4a9eff', bg: 'linear-gradient(135deg,#001a2e,#002a4e)', min_followers: 1000000, multiplier: 3 },
  { level: 'black_elite', name: '黑金精英', color: '#f066aa', bg: 'linear-gradient(135deg,#1a0010,#2a0020)', min_followers: 10000000, multiplier: 5 },
]

const PLATFORMS = ['抖音', '小红书', 'B站', '微博', '快手', '视频号', '其他']

const SHARE_ACTIONS = [
  { action: '群发消息', points: 50, icon: '💬', desc: '发送到微信群获得积分' },
  { action: '朋友圈分享', points: 100, icon: '🌟', desc: '发朋友圈展示达人名片' },
  { action: '抖音发布', points: 200, icon: '🎵', desc: '在抖音发布相关内容' },
  { action: '小红书笔记', points: 150, icon: '📕', desc: '在小红书发布种草笔记' },
]

function formatFollowers(n: number) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return n.toString()
}

export default function CreatorCardPage() {
  const [myCard, setMyCard] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ nickname: '', platform: '抖音', follower_count: '' })
  const [loading, setLoading] = useState(false)
  const [shareLoading, setShareLoading] = useState<string | null>(null)
  const [topCreators, setTopCreators] = useState<any[]>([])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('creator_cards').select('*').eq('user_id', user.id).single()
      if (data) setMyCard(data)
    }
    const { data: top } = await supabase.from('creator_cards').select('*').order('total_points', { ascending: false }).limit(10)
    if (top) setTopCreators(top)
  }

  async function handleCreate() {
    if (!form.nickname) { toast.error('请输入昵称'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); return }
      const followers = parseInt(form.follower_count) || 0
      const level = CARD_LEVELS.slice().reverse().find(l => followers >= l.min_followers)?.level || 'silver'
      const shareLink = `https://maoyan.vip/creator/${user.id}`
      const { data, error } = await supabase.from('creator_cards').upsert({
        user_id: user.id, nickname: form.nickname, platform: form.platform,
        follower_count: followers, level, share_link: shareLink,
      }).select().single()
      if (error) throw error
      setMyCard(data)
      setShowCreate(false)
      toast.success('🎉 达人名片创建成功！')
      fetchData()
    } catch (e: any) { toast.error(e.message || '创建失败') }
    setLoading(false)
  }

  async function handleShare(action: typeof SHARE_ACTIONS[0]) {
    if (!myCard) { toast.error('请先创建达人名片'); return }
    setShareLoading(action.action)
    await new Promise(r => setTimeout(r, 800))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); return }
      await supabase.from('creator_cards').update({ total_points: (myCard.total_points || 0) + action.points }).eq('user_id', user.id)
      setMyCard((c: any) => ({ ...c, total_points: (c.total_points || 0) + action.points }))
      toast.success(`${action.icon} ${action.action}成功！+${action.points} 积分`)
    } catch (e: any) { toast.error('操作失败') }
    setShareLoading(null)
  }

  const cardLevel = CARD_LEVELS.find(l => l.level === myCard?.level) || CARD_LEVELS[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* 页头 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🎴</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>达人名片</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>创建专属名片 · 分享获积分 · 积分兑换 DARK 代币</p>
          </div>
        </div>

        {/* 我的名片 */}
        {myCard ? (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>我的达人名片</h2>
            {/* 名片卡 */}
            <div style={{ background: cardLevel.bg, border: `1px solid ${cardLevel.color}40`, borderRadius: 24, padding: 28, maxWidth: 400, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${cardLevel.color}15` }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: `${cardLevel.color}10` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: cardLevel.color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>MAOYAN CREATOR</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{myCard.nickname}</div>
                </div>
                <div style={{ background: `${cardLevel.color}20`, border: `1px solid ${cardLevel.color}60`, borderRadius: 8, padding: '4px 12px' }}>
                  <div style={{ color: cardLevel.color, fontSize: 12, fontWeight: 700 }}>{cardLevel.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>平台</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{myCard.platform}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>粉丝量</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{formatFollowers(myCard.follower_count || 0)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>总积分</div>
                  <div style={{ color: cardLevel.color, fontWeight: 700 }}>{(myCard.total_points || 0).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{myCard.share_link}</div>
            </div>

            {/* 分享获积分 */}
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>分享名片获积分</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {SHARE_ACTIONS.map((action, i) => (
                <button key={i} onClick={() => handleShare(action)} disabled={shareLoading === action.action}
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{action.icon}</div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{action.action}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{action.desc}</div>
                  <div style={{ color: '#f6c90e', fontWeight: 700, fontSize: 14 }}>+{action.points} 积分</div>
                  {shareLoading === action.action && <div style={{ fontSize: 12, color: '#22d3a0', marginTop: 4 }}>处理中...</div>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg2)', border: '2px dashed var(--border2)', borderRadius: 20, padding: 40, textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎴</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>还没有达人名片</div>
            <div style={{ color: 'var(--text2)', marginBottom: 24 }}>创建专属名片，分享到各平台获得积分</div>
            <button onClick={() => setShowCreate(true)}
              style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 14, cursor: 'pointer', border: 'none', fontSize: 15 }}>
              创建我的达人名片
            </button>
          </div>
        )}

        {/* 等级说明 */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>达人等级体系</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CARD_LEVELS.map((level, i) => (
              <div key={i} style={{ flex: '1 1 140px', background: myCard?.level === level.level ? `${level.color}15` : 'var(--bg3)', border: `1px solid ${myCard?.level === level.level ? level.color + '60' : 'var(--border)'}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ color: level.color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{level.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{level.min_followers >= 10000 ? formatFollowers(level.min_followers) + '+ 粉丝' : '新手起步'}</div>
                <div style={{ fontSize: 12, color: '#22d3a0', fontWeight: 600 }}>积分 {level.multiplier}x</div>
              </div>
            ))}
          </div>
        </div>

        {/* 排行榜 */}
        {topCreators.length > 0 && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🏆 积分排行榜</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topCreators.map((creator, i) => {
                const lvl = CARD_LEVELS.find(l => l.level === creator.level) || CARD_LEVELS[0]
                return (
                  <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: i < 3 ? 'linear-gradient(135deg,#f6c90e,#ffd94a)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i < 3 ? '#0c0d10' : 'var(--text3)', fontSize: 14, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{creator.nickname}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{creator.platform} · {formatFollowers(creator.follower_count || 0)} 粉丝</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: lvl.color, fontWeight: 700, fontSize: 13 }}>{lvl.name}</div>
                      <div style={{ color: '#f6c90e', fontWeight: 700 }}>{(creator.total_points || 0).toLocaleString()} 积分</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 创建名片弹窗 */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>创建达人名片</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>昵称 *</label>
              <input value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} placeholder="你的达人昵称"
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>主要平台</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setForm(f => ({ ...f, platform: p }))}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${form.platform === p ? '#f6c90e' : 'var(--border)'}`, background: form.platform === p ? 'rgba(246,201,14,0.15)' : 'var(--bg3)', color: form.platform === p ? '#f6c90e' : 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>粉丝量（决定等级）</label>
              <input type="number" value={form.follower_count} onChange={e => setForm(f => ({ ...f, follower_count: e.target.value }))} placeholder="0"
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
              {form.follower_count && (
                <div style={{ fontSize: 12, color: '#f6c90e', marginTop: 6 }}>
                  等级：{CARD_LEVELS.slice().reverse().find(l => parseInt(form.follower_count) >= l.min_followers)?.name || '银牌达人'}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '12px 0', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600 }}>取消</button>
              <button onClick={handleCreate} disabled={loading} style={{ flex: 2, padding: '12px 0', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 15 }}>
                {loading ? '创建中...' : '创建名片'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
