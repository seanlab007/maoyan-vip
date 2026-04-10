import React, { useState, useMemo } from 'react'
import { getDailyFortune, type DailyFortuneResult } from '@/lib/fortune/daily'
import { motion } from 'framer-motion'

function FortuneBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.6 }}
          style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
    </div>
  )
}

export default function FortuneDaily() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [result, setResult] = useState<DailyFortuneResult | null>(null)
  const [loading, setLoading] = useState(false)

  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const submit = () => {
    if (!year || !month || !day || hour === '') return
    setLoading(true)
    setTimeout(() => {
      setResult(getDailyFortune(+year, +month, +day, +hour))
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>每日运势</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>今天的运势早知道，好运不缺席</p>
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
          style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#22d3ee,#6366f1)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: (!year || !month || !day || hour === '') ? 0.5 : 1 }}>
          {loading ? '占卜中...' : '查看今日运势'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 总体运势 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 28, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{result.overall.emoji}</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 4 }}>{today}</div>
            <div style={{ fontSize: 42, fontWeight: 900, background: 'linear-gradient(135deg,#22d3ee,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '8px 0' }}>{result.overall.score}</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 12 }}>今日综合运势</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{result.overall.desc}</p>
          </div>

          {/* 四维运势 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>运势详情</h3>
            <FortuneBar label="爱情运" score={result.love.score} color="#f472b6" />
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14, marginLeft: 60 }}>{result.love.desc}</p>
            <FortuneBar label="事业运" score={result.career.score} color="#fbbf24" />
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14, marginLeft: 60 }}>{result.career.desc}</p>
            <FortuneBar label="财运" score={result.wealth.score} color="#4ade80" />
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14, marginLeft: 60 }}>{result.wealth.desc}</p>
            <FortuneBar label="健康运" score={result.health.score} color="#60a5fa" />
            <p style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 60 }}>{result.health.desc}</p>
          </div>

          {/* 幸运元素 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--gold)' }}>今日幸运元素</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '🎨', label: '幸运颜色', value: result.lucky.color },
                { icon: '🔢', label: '幸运数字', value: result.lucky.number },
                { icon: '🧭', label: '幸运方位', value: result.lucky.direction },
                { icon: '🍰', label: '幸运美食', value: result.lucky.food },
                { icon: '⭐', label: '贵人星座', value: result.lucky.constellation },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 每日小贴士 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>今日小贴士</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{result.tip}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
