import React, { useState } from 'react'
import { analyzeWealth, type WealthResult } from '@/lib/fortune/wealth'
import { motion } from 'framer-motion'

const WX_ICON: Record<string, string> = { '金': '🪙', '木': '🌿', '水': '💧', '火': '🔥', '土': '🏔️' }

export default function FortuneWealth() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [result, setResult] = useState<WealthResult | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = () => {
    if (!year || !month || !day || hour === '') return
    setLoading(true)
    setTimeout(() => {
      setResult(analyzeWealth(+year, +month, +day, +hour))
      setLoading(false)
    }, 800)
  }

  const tagStyle = (color: string) => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: 13,
    background: `${color}15`, border: `1px solid ${color}30`, color,
    margin: '3px 4px 3px 0',
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>💰</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>财运分析</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>了解你的财富密码和最佳发展方向</p>
          </div>
        </div>
      </motion.div>

      {/* 输入 */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: '年', value: year, set: setYear, ph: '1995' },
            { label: '月', value: month, set: setMonth, ph: '6' },
            { label: '日', value: day, set: setDay, ph: '15' },
            { label: '时辰', value: hour, set: setHour, ph: '14' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input type="text" value={f.value} onChange={e => f.set(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={f.ph} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
            </div>
          ))}
        </div>
        <button onClick={submit} disabled={loading}
          style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#000', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: (!year || !month || !day || hour === '') ? 0.5 : 1 }}>
          {loading ? '分析中...' : '查看财运'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 财运指数 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 28, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{result.score}</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 4 }}>财运指数</div>
            <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontSize: 14, fontWeight: 600, marginTop: 8 }}>{result.type}</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginTop: 16, textAlign: 'left' }}>{result.summary}</p>
          </div>

          {/* 方位、颜色、行业 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>有利方位</h3>
              <div>{result.directions.map(d => <span key={d} style={tagStyle('#60a5fa')}>{d}</span>)}</div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>幸运颜色</h3>
              <div>{result.colors.map(c => <span key={c} style={tagStyle('#c084fc')}>{c}</span>)}</div>
            </div>
          </div>

          {/* 适合行业 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>适合行业</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {result.industries.map(ind => (
                <div key={ind} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg3)', fontSize: 13, color: 'var(--text2)', border: '1px solid rgba(255,255,255,0.06)' }}>{ind}</div>
              ))}
            </div>
          </div>

          {/* 流年财运 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>近三年财运趋势</h3>
            {result.periods.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', width: 60 }}>{p.period}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: p.fortune === '大吉' ? 'rgba(74,222,128,0.15)' : p.fortune === '吉利' ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.15)',
                  color: p.fortune === '大吉' ? '#4ade80' : p.fortune === '吉利' ? '#fbbf24' : '#94a3b8',
                }}>{p.fortune}</span>
                <span style={{ fontSize: 13, color: 'var(--text3)', flex: 1 }}>{p.desc}</span>
              </div>
            ))}
          </div>

          {/* 建议 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>财运建议</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{result.advice}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
