import React, { useState } from 'react'
import { calculateMarriage, type MarriageResult } from '@/lib/fortune/marriage'
import { motion } from 'framer-motion'

function ScoreRing({ score, size = 120, color = '#f472b6' }: { score: number; size?: number; color?: string }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill={color} fontSize={28} fontWeight={900}
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{score}</text>
    </svg>
  )
}

export default function FortuneMarriage() {
  const [y1, setY1] = useState(''); const [m1, setM1] = useState(''); const [d1, setD1] = useState(''); const [h1, setH1] = useState('')
  const [y2, setY2] = useState(''); const [m2, setM2] = useState(''); const [d2, setD2] = useState(''); const [h2, setH2] = useState('')
  const [result, setResult] = useState<MarriageResult | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = () => {
    if (!y1 || !m1 || !d1 || h1 === '' || !y2 || !m2 || !d2 || h2 === '') return
    setLoading(true)
    setTimeout(() => {
      setResult(calculateMarriage(+y1, +m1, +d1, +h1, +y2, +m2, +d2, +h2))
      setLoading(false)
    }, 1000)
  }

  const inputField = (label: string, value: string, set: (v: string) => void, ph: string, max = 4) => (
    <div key={label}>
      <label style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, display: 'block' }}>{label}</label>
      <input type="text" value={value} onChange={e => set(e.target.value.replace(/\D/g, '').slice(0, max))}
        placeholder={ph} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
    </div>
  )

  const scoreColor = (s: number) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>💕</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>姻缘测算</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>输入双方的出生信息，测测缘分指数</p>
          </div>
        </div>
      </motion.div>

      {/* 双方输入 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { title: '甲方信息', y: y1, mY: m1, dY: d1, hY: h1, sY: setY1, sM: setM1, sD: setD1, sH: setH1 },
          { title: '乙方信息', y: y2, mY: m2, dY: d2, hY: h2, sY: setY2, sM: setM2, sD: setD2, sH: setH2 },
        ].map(info => (
          <div key={info.title} style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>{info.title}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {inputField('年', info.y, info.sY, '1995')}
              {inputField('月', info.mY, info.sM, '6', 2)}
              {inputField('日', info.dY, info.sD, '15', 2)}
              {inputField('时', info.hY, info.sH, '14', 2)}
            </div>
          </div>
        ))}
      </div>

      <button onClick={submit} disabled={loading}
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#f472b6,#fb7185)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'wait' : 'pointer', marginBottom: 24 }}>
        {loading ? '缘分计算中...' : '测算缘分'}
      </button>

      {/* 结果 */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 总分 */}
          <div style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: 16, padding: 32, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <ScoreRing score={result.score} size={140} color={scoreColor(result.score)} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>综合配对指数</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginTop: 12 }}>{result.summary}</p>
          </div>

          {/* 分项 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>配对详情</h3>
            {result.dimensions.map((dim, i) => (
              <div key={i} style={{ marginBottom: i < result.dimensions.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{dim.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(dim.score) }}>{dim.score}分</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${dim.score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${scoreColor(dim.score)}88, ${scoreColor(dim.score)})` }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{dim.desc}</p>
              </div>
            ))}
          </div>

          {/* 建议 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>缘分建议</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{result.advice}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
