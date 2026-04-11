import React, { useState } from 'react'
import { calculateBazi, type BaziResult, type Gender } from '@/lib/fortune/bazi'
import { motion } from 'framer-motion'

const WX_COLORS: Record<string, string> = { '金': '#fbbf24', '木': '#4ade80', '水': '#60a5fa', '火': '#f87171', '土': '#d4a574' }
const WX_LABELS = ['金', '木', '水', '火', '土'] as const

function GenderPicker({ value, onChange }: { value: Gender | ''; onChange: (g: Gender) => void }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      {([['male', '👨 男', '#60a5fa'], ['female', '👩 女', '#f472b6']] as const).map(([g, label, color]) => (
        <button key={g} onClick={() => onChange(g)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            background: value === g ? `${color}22` : 'var(--bg3)',
            border: value === g ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
            color: value === g ? color : 'var(--text3)',
            transition: 'all 0.15s',
          }}
        >{label}</button>
      ))}
    </div>
  )
}

export default function FortuneBazi() {
  const [gender, setGender] = useState<Gender | ''>('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [result, setResult] = useState<BaziResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!gender || !year || !month || !day || hour === '') return
    setLoading(true)
    setTimeout(() => {
      const r = calculateBazi(+year, +month, +day, +hour, gender)
      setResult(r)
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🔮</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>八字排盘</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>输入出生日期和时间，解读你的命理密码</p>
          </div>
        </div>
      </motion.div>

      {/* 输入表单 */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        <label style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8, display: 'block', fontWeight: 600 }}>选择性别</label>
        <GenderPicker value={gender} onChange={setGender} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: '年', value: year, set: setYear, placeholder: '1995', max: 4 },
            { label: '月', value: month, set: setMonth, placeholder: '6', max: 2 },
            { label: '日', value: day, set: setDay, placeholder: '15', max: 2 },
            { label: '时辰', value: hour, set: setHour, placeholder: '14', max: 2 },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={e => f.set(e.target.value.replace(/\D/g, '').slice(0, f.max))}
                placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text)', fontSize: 15, outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !gender || !year || !month || !day || hour === ''}
          style={{
            width: '100%', marginTop: 16, padding: '12px', borderRadius: 12,
            background: 'linear-gradient(135deg,#c084fc,#f472b6)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'wait' : 'pointer',
            opacity: (!gender || !year || !month || !day || hour === '') ? 0.5 : 1,
          }}
        >
          {loading ? '排盘中...' : '开始排盘'}
        </button>
      </div>

      {/* 结果 */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 四柱 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>四柱八字</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: '年柱', data: result.year },
                { label: '月柱', data: result.month },
                { label: '日柱', data: result.day },
                { label: '时柱', data: result.hour },
              ].map(col => (
                <div key={col.label} style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 12, padding: '16px 8px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{col.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{col.data.gan}{col.data.zhi}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: WX_COLORS[col.data.wx[0]] }}>{col.data.wx[0]}</span>
                    <span style={{ fontSize: 12, color: WX_COLORS[col.data.wx[1]] }}>{col.data.wx[1]}</span>
                  </div>
                  {col.data.naYin && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{col.data.naYin}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 20, justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>日主：<b style={{ color: 'var(--text)' }}>{result.riGan}（{result.riWx}）</b></span>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>生肖：<b style={{ color: 'var(--text)' }}>{result.shengXiao}</b></span>
            </div>
          </div>

          {/* 五行分析 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>五行分布</h3>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {WX_LABELS.map(wx => {
                const count = result.wuXingCount[wx] || 0
                return (
                  <div key={wx} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: count > 0 ? `${WX_COLORS[wx]}22` : 'var(--bg3)',
                      border: `2px solid ${count > 0 ? WX_COLORS[wx] : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 800, color: count > 0 ? WX_COLORS[wx] : 'var(--text3)',
                    }}>{count}</div>
                    <div style={{ fontSize: 13, color: count > 0 ? WX_COLORS[wx] : 'var(--text3)', marginTop: 6, fontWeight: 600 }}>{wx}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 十神 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>十神分析</h3>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {result.shiShen.map(s => (
                <div key={s.pos} style={{
                  background: 'var(--bg3)', borderRadius: 10, padding: '10px 16px', textAlign: 'center',
                  border: s.pos === '日干' ? '1px solid var(--gold)' : '1px solid transparent',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.pos}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '4px 0' }}>{s.gan}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.pos === '日干' ? 'var(--gold)' : '#c084fc' }}>{s.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 解读 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gold)' }}>命理解读</h3>
            {result.summary.split('\n\n').map((p, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: i < 2 ? 12 : 0 }}>{p}</p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
