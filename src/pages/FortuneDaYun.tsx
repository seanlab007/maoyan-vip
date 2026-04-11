import React, { useState } from 'react'
import { calculateDaYun, type DaYunResult, type DaYunItem } from '@/lib/fortune/dayun'
import { type Gender } from '@/lib/fortune/bazi'
import { motion } from 'framer-motion'

const WX_COLORS: Record<string, string> = { '金': '#fbbf24', '木': '#4ade80', '水': '#60a5fa', '火': '#f87171', '土': '#d4a574' }

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flex: 1 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6 }}
        style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg,${color}88,${color})` }}
      />
    </div>
  )
}

export default function FortuneDaYun() {
  const [gender, setGender] = useState<Gender | ''>('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [result, setResult] = useState<DaYunResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDaYun, setSelectedDaYun] = useState<number>(0)

  const currentYear = new Date().getFullYear()

  const submit = () => {
    if (!gender || !year || !month || !day || hour === '') return
    setLoading(true)
    setTimeout(() => {
      const r = calculateDaYun(+year, +month, +day, +hour, gender as Gender)
      setResult(r)
      // 找到当前大运的索引
      const idx = r.daYunList.findIndex(dy => dy === r.currentDaYun)
      setSelectedDaYun(idx >= 0 ? idx : 0)
      setLoading(false)
    }, 900)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  }

  const active = result?.daYunList[selectedDaYun]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🌊</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>大运流年</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>以十年为一大运，洞察人生各阶段的运势走向</p>
          </div>
        </div>
      </motion.div>

      {/* 输入 */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* 性别选择 */}
        <label style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8, display: 'block', fontWeight: 600 }}>性别</label>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {([['male', '👨 男', '#60a5fa'], ['female', '👩 女', '#f472b6']] as const).map(([g, label, color]) => (
            <button key={g} onClick={() => setGender(g)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              background: gender === g ? `${color}22` : 'var(--bg3)',
              border: gender === g ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
              color: gender === g ? color : 'var(--text3)',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: '出生年', value: year, set: setYear, ph: '1995' },
            { label: '出生月', value: month, set: setMonth, ph: '6' },
            { label: '出生日', value: day, set: setDay, ph: '15' },
            { label: '时辰', value: hour, set: setHour, ph: '14' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input type="text" value={f.value}
                onChange={e => f.set(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={f.ph} style={inputStyle} />
            </div>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={loading || !gender || !year || !month || !day || hour === ''}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
            cursor: (!gender || !year || !month || !day || hour === '') ? 'not-allowed' : 'pointer',
            opacity: (!gender || !year || !month || !day || hour === '') ? 0.5 : 1,
          }}
        >
          {loading ? '推算大运中...' : '🌊 排大运查流年'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 起运信息 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>起运年龄</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0ea5e9' }}>{result.qiYunAge}<span style={{ fontSize: 14 }}>岁</span></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>起运年份</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#6366f1' }}>{result.qiYunYear}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>{result.summary}</p>
            </div>
          </div>

          {/* 大运时间轴 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0ea5e9', marginBottom: 16 }}>八步大运</h3>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {result.daYunList.map((dy, i) => {
                const isCurrent = dy === result.currentDaYun
                const isSelected = i === selectedDaYun
                const wxColor = WX_COLORS[dy.wx[0]] || '#a78bfa'
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDaYun(i)}
                    style={{
                      flex: '0 0 auto',
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      background: isSelected ? `${wxColor}22` : 'var(--bg3)',
                      border: `2px solid ${isCurrent ? wxColor : isSelected ? wxColor : 'rgba(255,255,255,0.1)'}`,
                      textAlign: 'center', minWidth: 72,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900, color: wxColor }}>{dy.gan}{dy.zhi}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{dy.age}岁起</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{dy.year}年</div>
                    {isCurrent && <div style={{ fontSize: 10, color: wxColor, marginTop: 2, fontWeight: 700 }}>▶ 当前</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 选中大运详情 */}
          {active && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: `1px solid ${WX_COLORS[active.wx[0]] || '#a78bfa'}33` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 26, fontWeight: 900, color: WX_COLORS[active.wx[0]] || '#a78bfa' }}>{active.gan}{active.zhi} 大运</span>
                    <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 10 }}>{active.age}～{active.age + 9}岁</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: WX_COLORS[active.wx[0]] }}>{active.score}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>运势评分</div>
                  </div>
                </div>
                <div style={{
                  display: 'inline-block', fontSize: 13, padding: '4px 12px', borderRadius: 20,
                  background: `${WX_COLORS[active.wx[0]] || '#a78bfa'}15`,
                  color: WX_COLORS[active.wx[0]] || '#a78bfa',
                  border: `1px solid ${WX_COLORS[active.wx[0]] || '#a78bfa'}30`,
                  marginBottom: 16, fontWeight: 700,
                }}>✦ {active.theme}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '💼 事业', value: active.career, color: '#60a5fa' },
                    { label: '💕 感情', value: active.love, color: '#f472b6' },
                    { label: '💰 财运', value: active.wealth, color: '#fbbf24' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, color: item.color, marginBottom: 6, fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 流年 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#6366f1', marginBottom: 16 }}>近年流年运势</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.liuNianList.map(ly => {
                const isNow = ly.year === currentYear
                return (
                  <div
                    key={ly.year}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: isNow ? 'rgba(99,102,241,0.08)' : 'var(--bg3)',
                      borderRadius: 10, padding: '10px 14px',
                      border: isNow ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ minWidth: 50 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isNow ? '#6366f1' : 'var(--text)' }}>{ly.year}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{ly.gan}{ly.zhi}</div>
                    </div>
                    <ScoreBar score={ly.score} color={isNow ? '#6366f1' : '#60a5fa'} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: isNow ? '#6366f1' : 'var(--text3)', minWidth: 28 }}>{ly.score}</div>
                    <div style={{ flex: 2 }}>
                      <div style={{ fontSize: 12, color: isNow ? '#a5b4fc' : 'var(--text3)', fontWeight: 600 }}>{ly.theme}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{ly.events.join(' · ')}</div>
                    </div>
                    {isNow && <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 6 }}>今年</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
