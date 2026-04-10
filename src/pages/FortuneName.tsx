import React, { useState } from 'react'
import { analyzeName, type NameResult } from '@/lib/fortune/name'
import { motion } from 'framer-motion'

export default function FortuneName() {
  const [surname, setSurname] = useState('')
  const [name, setName] = useState('')
  const [result, setResult] = useState<NameResult | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = () => {
    if (!surname || !name) return
    setLoading(true)
    setTimeout(() => {
      setResult(analyzeName(name, surname))
      setLoading(false)
    }, 600)
  }

  const geLabel = (key: string) => {
    const map: Record<string, string> = { tianGe: '天格', renGe: '人格', diGe: '地格', waiGe: '外格', zongGe: '总格' }
    return map[key] || key
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🌸</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>姓名测试</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>基于五格剖象法，测测你的名字能打几分</p>
          </div>
        </div>
      </motion.div>

      {/* 输入 */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>姓氏</label>
            <input type="text" value={surname} onChange={e => setSurname(e.target.value)}
              placeholder="张" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>名字</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="婷婷" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
          </div>
        </div>
        <button onClick={submit} disabled={loading || !surname || !name}
          style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: '#000', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: (!surname || !name) ? 0.5 : 1 }}>
          {loading ? '测算中...' : '开始测试'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 总分 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 32, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 4 }}>「{result.name}」姓名评分</div>
            <div style={{ fontSize: 64, fontWeight: 900, background: result.score >= 80 ? 'linear-gradient(135deg,#4ade80,#22c55e)' : result.score >= 60 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'linear-gradient(135deg,#f87171,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{result.score}</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginTop: 16, textAlign: 'left' }}>{result.summary}</p>
          </div>

          {/* 五格分析 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>五格分析</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {(Object.keys(result.wuGe) as Array<keyof typeof result.wuGe>).map(key => {
                const ge = result.wuGe[key]
                return (
                  <div key={key} style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{geLabel(key)}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{ge.num}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{ge.meaning}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 三才配置 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>三才配置</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {[...result.sanCai].map((wx, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: `${wx === '金' ? '#fbbf24' : wx === '木' ? '#4ade80' : wx === '水' ? '#60a5fa' : wx === '火' ? '#f87171' : '#d4a574'}22`, border: `2px solid ${wx === '金' ? '#fbbf24' : wx === '木' ? '#4ade80' : wx === '水' ? '#60a5fa' : wx === '火' ? '#f87171' : '#d4a574'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: wx === '金' ? '#fbbf24' : wx === '木' ? '#4ade80' : wx === '水' ? '#60a5fa' : wx === '火' ? '#f87171' : '#d4a574' }}>{wx}</div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{result.sanCaiDesc}</p>
          </div>

          {/* 建议 */}
          {result.suggestions.length > 0 && (
            <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--gold)' }}>改善建议</h3>
              {result.suggestions.map((s, i) => (
                <p key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: i < result.suggestions.length - 1 ? 8 : 0 }}>{s}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
