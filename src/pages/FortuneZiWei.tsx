import React, { useState } from 'react'
import { calculateZiWei, type ZiWeiResult } from '@/lib/fortune/ziwei'
import { motion } from 'framer-motion'

const WX_COLORS: Record<string, string> = { '金': '#fbbf24', '木': '#4ade80', '水': '#60a5fa', '火': '#f87171', '土': '#d4a574' }

export default function FortuneZiWei() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [result, setResult] = useState<ZiWeiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'palaces' | 'dayun'>('overview')

  const submit = () => {
    if (!year || !month || !day || hour === '') return
    setLoading(true)
    setTimeout(() => {
      setResult(calculateZiWei(+year, +month, +day, +hour))
      setLoading(false)
    }, 900)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none',
    background: active ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'var(--bg3)',
    color: active ? '#fff' : 'var(--text3)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🌌</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>紫微斗数</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>千年星命之术，以星入命，洞察人生格局</p>
          </div>
        </div>
      </motion.div>

      {/* 输入 */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: '出生年', value: year, set: setYear, ph: '1995' },
            { label: '出生月', value: month, set: setMonth, ph: '6' },
            { label: '出生日', value: day, set: setDay, ph: '15' },
            { label: '时辰(0-23)', value: hour, set: setHour, ph: '14' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={e => f.set(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={f.ph}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={loading || !year || !month || !day || hour === ''}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#c084fc)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
            cursor: (!year || !month || !day || hour === '') ? 'not-allowed' : 'pointer',
            opacity: (!year || !month || !day || hour === '') ? 0.5 : 1,
          }}
        >
          {loading ? '推算紫微命盘中...' : '✦ 起盘排命'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 命宫总览 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 28, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>命主星</div>
                <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {result.mingGong.mainStar}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                  命宫坐 <span style={{ color: '#a78bfa', fontWeight: 700 }}>{result.mingGong.zhi}</span> 宫
                  &nbsp;·&nbsp; 身宫在 <span style={{ color: '#fbbf24', fontWeight: 700 }}>{result.shenGong.palace}</span>
                </div>
              </div>
              {/* 评分圈 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: `conic-gradient(#c084fc ${result.mingGong.score}%, rgba(255,255,255,0.06) 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(192,132,252,0.3)',
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'var(--bg2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900, color: '#c084fc',
                  }}>{result.mingGong.score}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>命格评分</div>
              </div>
            </div>

            {/* 吉星凶星 */}
            {(result.mingGong.auspicious.length > 0 || result.mingGong.inauspicious.length > 0) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {result.mingGong.auspicious.map(s => (
                  <span key={s} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>✦ {s}</span>
                ))}
                {result.mingGong.inauspicious.map(s => (
                  <span key={s} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>⚡ {s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'overview', label: '✦ 命格解读' },
              { key: 'palaces', label: '🏯 十二宫位' },
              { key: 'dayun', label: '🔮 大运流年' },
            ].map(t => (
              <button key={t.key} style={tabStyle(activeTab === t.key)} onClick={() => setActiveTab(t.key as any)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* 命格解读 */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#c084fc', marginBottom: 16 }}>主星特质 · {result.mainStarDesc.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: '✦ 性格特质', value: result.mainStarDesc.trait },
                    { label: '🌟 五行属性', value: `${result.mainStarDesc.wuxing}行` },
                    { label: '💼 事业方向', value: result.mainStarDesc.career },
                    { label: '💕 感情特质', value: result.mainStarDesc.love },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 12 }}>性格分析</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{result.personality}</p>
              </div>

              <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#60a5fa', marginBottom: 12 }}>命运格局</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{result.lifePattern}</p>
              </div>
            </motion.div>
          )}

          {/* 十二宫位 */}
          {activeTab === 'palaces' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {result.palaceStars.slice(0, 12).map((p, i) => (
                  <div
                    key={p.zhi}
                    style={{
                      background: i === 0 ? 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1))' : 'var(--bg2)',
                      borderRadius: 12, padding: 14,
                      border: i === 0 ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? '#c084fc' : 'var(--text)' }}>{p.palace}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.zhi}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.stars.length === 0 ? (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>空宫</span>
                      ) : p.stars.map(s => (
                        <span key={s} style={{
                          fontSize: 11, padding: '2px 6px', borderRadius: 6,
                          background: s.startsWith('⚡') ? 'rgba(248,113,113,0.1)' : 'rgba(192,132,252,0.1)',
                          color: s.startsWith('⚡') ? '#f87171' : '#c084fc',
                          border: `1px solid ${s.startsWith('⚡') ? 'rgba(248,113,113,0.2)' : 'rgba(192,132,252,0.2)'}`,
                        }}>{s.replace('⚡', '')}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 大运流年 */}
          {activeTab === 'dayun' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 12 }}>流年一览</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.yearFortune.map((y, i) => (
                    <div key={y.year} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', minWidth: 48 }}>{y.year}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${y.score}%`, borderRadius: 2, background: `linear-gradient(90deg,#7c3aed,#c084fc)` }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#c084fc', minWidth: 24 }}>{y.score}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', flex: 2 }}>{y.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
