import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STATIC_DRAMAS = [
  { id: 1, title: '念念有词', genre: '穿书', view_count: 3000000000, rating: 9.6, investor_count: 12500, cover_emoji: '📚', hot: true, desc: '穿越古代的学霸女主，用现代知识改变命运，甜虐交织' },
  { id: 2, title: '盛夏芬德拉', genre: '甜宠', view_count: 1000000000, rating: 9.4, investor_count: 8900, cover_emoji: '🌸', hot: true, desc: '夏天里的浪漫邂逅，青春与成长的动人故事' },
  { id: 3, title: '家里家外', genre: '都市', view_count: 800000000, rating: 9.2, investor_count: 6700, cover_emoji: '🏠', hot: false, desc: '都市家庭的情感纠葛，真实反映现代生活' },
  { id: 4, title: '昭然赴礼', genre: '职场', view_count: 500000000, rating: 9.5, investor_count: 5400, cover_emoji: '💼', hot: true, desc: '体制内大佬与大学老师的极限拉扯，性张力拉满' },
  { id: 5, title: '深情诱引', genre: '悬疑', view_count: 300000000, rating: 9.1, investor_count: 4200, cover_emoji: '🔍', hot: false, desc: '层层反转的悬疑剧情，每个角色都有秘密' },
  { id: 6, title: '逆袭之路', genre: '爽文', view_count: 250000000, rating: 9.0, investor_count: 3800, cover_emoji: '⚡', hot: false, desc: '从底层逆袭的热血故事，每一集都让人热血沸腾' },
]

const INVEST_TIERS = [
  { name: '体验投资', price: 1, returns: '收益分成', desc: '小额试水，按播放量阶梯分成', icon: '🌱', color: '#22d3a0' },
  { name: '普通投资', price: 100, returns: '8–15%', desc: '标准投资档位，稳定收益', icon: '💰', color: '#4a9eff' },
  { name: '黄金投资', price: 1000, returns: '12–20% + 出演', desc: '高额回报 + 角色出演机会', icon: '⭐', color: '#f6c90e', featured: true },
  { name: '铂金出演', price: 5000, returns: '15–25% + 主演', desc: '出演重要配角，全程植入', icon: '🎬', color: '#9d6dff' },
  { name: '品牌植入', price: 50000, returns: '定制方案', desc: '品牌全程植入，主演级曝光', icon: '👑', color: '#f066aa' },
]

const ROLE_TIERS = [
  { role: '路人甲', price: 1000, desc: '出现在背景中，有镜头', slots: 50, left: 23 },
  { role: '配角', price: 5000, desc: '有台词，出现3集以上', slots: 20, left: 7 },
  { role: '重要配角', price: 20000, desc: '出现10集以上，有剧情线', slots: 5, left: 2 },
  { role: '主演', price: 100000, desc: '主角之一，全程出演', slots: 2, left: 1 },
]

function formatViews(n: number) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(0) + '万'
  return n.toString()
}

export default function DramaPage() {
  const [dramas, setDramas] = useState<any[]>(STATIC_DRAMAS)
  const [selectedDrama, setSelectedDrama] = useState<any>(null)
  const [investAmount, setInvestAmount] = useState(1)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'invest' | 'role'>('invest')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchDramas() }, [])

  async function fetchDramas() {
    const { data } = await supabase.from('drama_projects').select('*').order('investor_count', { ascending: false })
    if (data && data.length > 0) setDramas(data)
  }

  function openInvest(drama: any) {
    setSelectedDrama(drama)
    setShowInvestModal(true)
    setInvestAmount(1)
  }

  async function handleInvest() {
    if (!selectedDrama) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); setLoading(false); return }
      const { error } = await supabase.from('group_buy_orders').insert({
        user_id: user.id,
        product_id: `drama_${selectedDrama.id}`,
        product_name: selectedDrama.title,
        original_price: investAmount,
        final_price: investAmount,
        dark_reward: investAmount * 0.05,
        status: 'paid',
      })
      if (error) throw error
      toast.success(`🎬 投资成功！¥${investAmount} 投入《${selectedDrama.title}》，获得 ${(investAmount * 0.05).toFixed(2)} DARK`)
      setShowInvestModal(false)
    } catch (e: any) { toast.error(e.message || '投资失败') }
    setLoading(false)
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 16px' },
    wrap: { maxWidth: 1100, margin: '0 auto' },
    title: { fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    statsRow: { display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' as const },
    statCard: { flex: '1 1 120px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' as const },
    tabBtnActive: { padding: '10px 24px', borderRadius: 24, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', background: '#f6c90e', color: '#0c0d10', transition: 'all 0.2s' } as React.CSSProperties,
    tabBtnInactive: { padding: '10px 24px', borderRadius: 24, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', background: 'var(--bg2)', color: 'var(--text2)', transition: 'all 0.2s' } as React.CSSProperties,
    tiersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 },
    dramaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
    roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
    modal: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
    modalBox: { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%' },
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 40 }}>🎬</div>
          <div>
            <h1 style={s.title}>短剧投资中心</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>1元起投 · 参与分红 · 1000元起出演角色 · 50万起品牌植入</p>
          </div>
        </div>

        <div style={s.statsRow}>
          {[['👁','56亿+','累计播放'],['👥','37,700+','投资人数'],['📈','18.5%','平均收益率'],['🎞','128部','已上映短剧']].map(([icon,val,label],i) => (
            <div key={i} style={s.statCard}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f6c90e' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button style={activeTab === 'invest' ? s.tabBtnActive : s.tabBtnInactive} onClick={() => setActiveTab('invest')}>💰 投资短剧</button>
          <button style={activeTab === 'role' ? s.tabBtnActive : s.tabBtnInactive} onClick={() => setActiveTab('role')}>🎭 出演角色</button>
        </div>

        {activeTab === 'invest' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>投资阶梯</h2>
            <div style={s.tiersGrid}>
              {INVEST_TIERS.map((tier: any, i) => (
                <div key={i} style={{ background: tier.featured ? 'linear-gradient(135deg,rgba(246,201,14,0.15),rgba(246,201,14,0.05))' : 'var(--bg2)', border: `1px solid ${tier.featured ? 'rgba(246,201,14,0.5)' : 'var(--border)'}`, borderRadius: 16, padding: 20, position: 'relative' }}>
                  {tier.featured && <div style={{ position: 'absolute', top: -10, right: 16, background: '#f6c90e', color: '#0c0d10', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>推荐</div>}
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{tier.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{tier.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: tier.color, marginBottom: 4 }}>¥{tier.price.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: '#22d3a0', marginBottom: 8 }}>预期收益：{tier.returns}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{tier.desc}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔥 热门短剧</h2>
            <div style={s.dramaGrid}>
              {dramas.map((drama, i) => (
                <div key={drama.id || i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg,var(--bg3),var(--bg2))', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                    {drama.cover_emoji || '🎬'}
                    {drama.hot && <div style={{ position: 'absolute', top: 10, right: 10, background: '#E53935', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>🔥 HOT</div>}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{drama.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{drama.genre}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#f6c90e', fontWeight: 700 }}>⭐ {drama.rating}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{drama.desc || drama.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, color: 'var(--text3)' }}>
                      <span>👁 {formatViews(drama.view_count || 0)}</span>
                      <span>👥 {(drama.investor_count || 0).toLocaleString()}人</span>
                    </div>
                    <button onClick={() => openInvest(drama)} style={{ width: '100%', padding: '10px 0', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 14 }}>
                      ¥1 起投资
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'role' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🎭 出演角色</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 24, fontSize: 14 }}>投资达到门槛，即可出演即将上映的短剧角色。价格阶梯制，主演最贵，名额有限。</p>
            <div style={s.roleGrid}>
              {ROLE_TIERS.map((role, i) => (
                <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${role.left <= 2 ? 'rgba(240,102,170,0.5)' : 'var(--border)'}`, borderRadius: 16, padding: 24 }}>
                  {role.left <= 2 && <div style={{ background: '#f066aa', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 12 }}>仅剩 {role.left} 个名额</div>}
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{role.role}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#f6c90e', marginBottom: 8 }}>¥{role.price.toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>{role.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                    <span>总名额：{role.slots}</span><span>剩余：{role.left}</span>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 6, marginBottom: 16 }}>
                    <div style={{ background: '#f6c90e', height: '100%', borderRadius: 4, width: `${((role.slots - role.left) / role.slots) * 100}%` }} />
                  </div>
                  <button onClick={() => toast.success(`已提交《${role.role}》申请，24小时内联系您`)}
                    style={{ width: '100%', padding: '10px 0', background: role.left <= 2 ? 'linear-gradient(135deg,#f066aa,#9d6dff)' : 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: role.left <= 2 ? '#fff' : '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 14 }}>
                    立即申请出演
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showInvestModal && selectedDrama && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>投资《{selectedDrama.title}》</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>每投入 ¥1 获得 0.05 DARK 代币奖励</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>投资金额（元）</label>
              <input type="number" min={1} value={investAmount} onChange={e => setInvestAmount(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--text)', fontSize: 18, fontWeight: 700 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[1, 100, 1000, 10000].map(v => (
                <button key={v} onClick={() => setInvestAmount(v)}
                  style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${investAmount === v ? '#f6c90e' : 'var(--border)'}`, background: investAmount === v ? 'rgba(246,201,14,0.15)' : 'var(--bg3)', color: investAmount === v ? '#f6c90e' : 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
                  ¥{v.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text3)' }}>投资金额</span>
                <span style={{ fontWeight: 700 }}>¥{investAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text3)' }}>DARK 奖励</span>
                <span style={{ color: '#f6c90e', fontWeight: 700 }}>+{(investAmount * 0.05).toFixed(2)} DARK</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowInvestModal(false)} style={{ flex: 1, padding: '12px 0', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600 }}>取消</button>
              <button onClick={handleInvest} disabled={loading} style={{ flex: 2, padding: '12px 0', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 15 }}>
                {loading ? '处理中...' : `确认投资 ¥${investAmount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
