import React, { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

// ─── 健康打卡分类 ───────────────────────────────────────────────────────────
const HEALTH_CATEGORIES = [
  {
    id: 'exercise',
    icon: '🏋️',
    title: '运动锻炼',
    color: '#22d3a0',
    items: [
      { id: 'zhanzhuang', name: '站桩', unit: '分钟', target: 30, icon: '🧘' },
      { id: 'cardio',     name: '有氧运动', unit: '分钟', target: 30, icon: '🏃' },
      { id: 'strength',   name: '力量训练', unit: '组',   target: 3,  icon: '💪' },
      { id: 'stretch',    name: '拉伸/瑜伽', unit: '分钟', target: 15, icon: '🤸' },
    ],
  },
  {
    id: 'supplements',
    icon: '💊',
    title: '营养补剂',
    color: '#4a9eff',
    items: [
      { id: 'nad',        name: 'NAD+',    unit: '粒', target: 1,  icon: '⚡' },
      { id: 'nmn',        name: 'NMN',     unit: '粒', target: 1,  icon: '🔬' },
      { id: 'vitd',       name: '维生素 D3', unit: '粒', target: 1, icon: '☀️' },
      { id: 'omega3',     name: 'Omega-3', unit: '粒', target: 2,  icon: '🐟' },
      { id: 'magnesium',  name: '镁',      unit: '粒', target: 1,  icon: '🪨' },
      { id: 'zinc',       name: '锌',      unit: '粒', target: 1,  icon: '🔩' },
      { id: 'collagen',   name: '胶原蛋白', unit: '克', target: 10, icon: '✨' },
      { id: 'probiotics', name: '益生菌',  unit: '粒', target: 1,  icon: '🦠' },
    ],
  },
  {
    id: 'diet',
    icon: '🥗',
    title: '饮食习惯',
    color: '#f6c90e',
    items: [
      { id: 'water',       name: '喝水',    unit: '升',  target: 2,  icon: '💧' },
      { id: 'vegetables',  name: '蔬菜',    unit: '份',  target: 3,  icon: '🥦' },
      { id: 'protein',     name: '优质蛋白', unit: '份', target: 2,  icon: '🥩' },
      { id: 'no_sugar',    name: '无糖饮食', unit: '天', target: 1,  icon: '🚫' },
      { id: 'intermittent',name: '轻断食',  unit: '小时', target: 16, icon: '⏰' },
    ],
  },
  {
    id: 'sleep',
    icon: '😴',
    title: '睡眠恢复',
    color: '#9d6dff',
    items: [
      { id: 'sleep_quality', name: '睡眠质量',   unit: '分',   target: 90, icon: '⭐' },
      { id: 'no_screen',     name: '睡前无屏幕', unit: '分钟', target: 30, icon: '📵' },
    ],
  },
]

// 睡眠时长评分规则
const SLEEP_SCORE_RULES = [
  { min: 9.5, max: 99,  score: -5,  label: '睡太多',  color: '#f87171', tip: '超过9.5小时可能影响代谢' },
  { min: 7.5, max: 9.5, score: +10, label: '最佳',    color: '#22d3a0', tip: '7.5-9.5小时是黄金睡眠区间' },
  { min: 6,   max: 7.5, score: +3,  label: '尚可',    color: '#f6c90e', tip: '6-7.5小时略显不足' },
  { min: 5,   max: 6,   score: -5,  label: '不足',    color: '#fb923c', tip: '5-6小时会加速衰老' },
  { min: 0,   max: 5,   score: -15, label: '严重不足', color: '#f87171', tip: '低于5小时严重损害健康' },
]

function getSleepRule(hours: number) {
  return SLEEP_SCORE_RULES.find(r => hours >= r.min && hours < r.max) || SLEEP_SCORE_RULES[SLEEP_SCORE_RULES.length - 1]
}

const TOTAL_ITEMS = HEALTH_CATEGORIES.reduce((s, c) => s + c.items.length, 0)

// ─── localStorage 工具 ──────────────────────────────────────────────────────
const TODAY = () => new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

function loadStorage() {
  try {
    const raw = localStorage.getItem('maoyan_health_v2')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveStorage(data: Record<string, unknown>) {
  localStorage.setItem('maoyan_health_v2', JSON.stringify(data))
}

// 计算连续打卡天数（从今天往前数）
function calcStreak(history: Record<string, boolean>): number {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10)
    if (history[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// 最近 35 天日历数据
function buildCalendar(history: Record<string, boolean>) {
  const days: { date: string; done: boolean; isToday: boolean }[] = []
  const today = TODAY()
  for (let i = 34; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, done: !!history[key], isToday: key === today })
  }
  return days
}

// 喵值奖励规则
function calcDarkReward(streak: number): { amount: number; reason: string } {
  if (streak > 0 && streak % 30 === 0) return { amount: 10, reason: `连续 ${streak} 天！` }
  if (streak > 0 && streak % 7 === 0)  return { amount: 3,  reason: `连续 ${streak} 天！` }
  return { amount: 1, reason: '今日全部完成' }
}

// ─── 组件 ────────────────────────────────────────────────────────────────────
export default function HealthPage() {
  const today = TODAY()

  // 从 localStorage 初始化
  const [storage, setStorage] = useState<Record<string, unknown>>(() => loadStorage())

  // 今日打卡状态
  const todayChecked: Record<string, boolean> = (storage[`day_${today}`] as Record<string, boolean>) || {}
  // 历史完成天（每天是否全部完成）
  const completedDays: Record<string, boolean> = (storage['completed_days'] as Record<string, boolean>) || {}
  // 喵值余额
  const darkBalance: number = (storage['dark_balance'] as number) || 0

  const [activeCategory, setActiveCategory] = useState('exercise')
  const [showPrediction, setShowPrediction] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  // 睡眠时长（小时，支持小数）
  const sleepHoursKey = `sleep_hours_${today}`
  const [sleepHours, setSleepHoursState] = useState<number | ''>(
    () => (storage[sleepHoursKey] as number) ?? ''
  )

  // 持久化写入
  const persist = useCallback((next: Record<string, unknown>) => {
    setStorage(next)
    saveStorage(next)
  }, [])

  // 打卡 / 取消打卡
  const toggleItem = (itemId: string) => {
    const dayKey = `day_${today}`
    const prevDay: Record<string, boolean> = (storage[dayKey] as Record<string, boolean>) || {}
    const nextDay = { ...prevDay, [itemId]: !prevDay[itemId] }
    const doneCount = Object.values(nextDay).filter(Boolean).length

    const next = { ...storage, [dayKey]: nextDay }

    // 判断今天是否全部完成
    const wasComplete = !!completedDays[today]
    const nowComplete = doneCount === TOTAL_ITEMS

    if (nowComplete && !wasComplete) {
      // 首次完成今天全部项目 → 发放喵值
      const newCompleted = { ...completedDays, [today]: true }
      const newStreak = calcStreak({ ...completedDays, [today]: true })
      const reward = calcDarkReward(newStreak)
      const newDark = darkBalance + reward.amount

      next['completed_days'] = newCompleted
      next['dark_balance'] = newDark

      persist(next)
      toast.success(`🐱 恭喜！获得 ${reward.amount} 喵值（+${reward.amount}只小猫）（${reward.reason}）`, { duration: 4000 })
    } else {
      persist(next)
      if (doneCount > 0 && doneCount % 5 === 0) {
        toast(`✅ 已完成 ${doneCount} 项，继续加油！`, { icon: '💪' })
      }
    }
  }

  // 设置睡眠时长
  const setSleepHours = (val: number | '') => {
    setSleepHoursState(val)
    const next = { ...storage, [sleepHoursKey]: val }
    persist(next)
    if (typeof val === 'number' && val > 0) {
      const rule = getSleepRule(val)
      toast(rule.score > 0
        ? `🌙 睡眠 ${val}h — ${rule.label}！健康分 ${rule.score > 0 ? '+' : ''}${rule.score}`
        : `⚠️ 睡眠 ${val}h — ${rule.label}，健康分 ${rule.score}`,
        { icon: rule.score > 0 ? '✅' : '🚨', duration: 3000 }
      )
    }
  }

  const doneItems = Object.values(todayChecked).filter(Boolean).length
  // 睡眠时长不同对健康分的影响
  const sleepBonus = typeof sleepHours === 'number' && sleepHours > 0 ? getSleepRule(sleepHours).score : 0
  const baseScore = Math.round((doneItems / TOTAL_ITEMS) * 100)
  const healthScore = Math.max(0, Math.min(100, baseScore + sleepBonus))
  const streak = calcStreak(completedDays)
  const calendarDays = buildCalendar(completedDays)
  const activecat = HEALTH_CATEGORIES.find(c => c.id === activeCategory)!

  const getCategoryProgress = (catId: string) => {
    const cat = HEALTH_CATEGORIES.find(c => c.id === catId)
    if (!cat) return 0
    const done = cat.items.filter(item => todayChecked[item.id]).length
    return Math.round((done / cat.items.length) * 100)
  }

  // 寿命预测（睡眠分对寿命有额外影响）
  const baseAge = 78
  const bonusYears = Math.round((healthScore / 100) * 20)
  const sleepLifeBonus = typeof sleepHours === 'number' && sleepHours > 0 ? Math.round(getSleepRule(sleepHours).score / 5) : 0
  const predictedAge = baseAge + bonusYears + sleepLifeBonus

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* ── 顶部：DARK 余额 + 连续天数 ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0a001a 0%, #0c0d10 60%)',
        padding: '20px 20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'radial-gradient(circle, rgba(157,109,255,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🌿 变美打卡</h1>

        {/* DARK 余额卡 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(157,109,255,0.15), rgba(157,109,255,0.06))',
          border: '1px solid rgba(157,109,255,0.35)',
          borderRadius: 16,
          padding: '14px 18px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(157,109,255,0.7)', marginBottom: 4, letterSpacing: 1 }}>🐱 喵值（小猫）</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#c084fc', lineHeight: 1 }}>{darkBalance.toFixed(0)} 只</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>养猫奖励 · 每天打卡领小猫 · 喵値可兑换猫粮</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>连续打卡</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: streak >= 7 ? '#f6c90e' : '#9d6dff', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>天</div>
          </div>
        </div>

        {/* DARK 奖励说明 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { days: 1,  dark: '+1',  label: '每日完成' },
            { days: 7,  dark: '+3',  label: '连续7天' },
            { days: 30, dark: '+10', label: '连续30天' },
          ].map(r => (
            <div key={r.days} style={{
              flex: 1,
              background: streak >= r.days ? 'rgba(157,109,255,0.12)' : 'var(--bg2)',
              border: `1px solid ${streak >= r.days ? 'rgba(157,109,255,0.4)' : 'var(--border)'}`,
              borderRadius: 10,
              padding: '8px 6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: streak >= r.days ? '#c084fc' : 'var(--text2)' }}>{r.dark}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>🐱喵值</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* 健康分圆环 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle cx="40" cy="40" r="33" fill="none" stroke="#22d3a0" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 33}`}
                strokeDashoffset={`${2 * Math.PI * 33 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#22d3a0' }}>{healthScore}</span>
              <span style={{ fontSize: 9, color: 'var(--text3)' }}>健康分</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>今日完成 {doneItems}/{TOTAL_ITEMS} 项</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              {doneItems === TOTAL_ITEMS ? '🐱 今日全部完成，喵值已到账！' : healthScore >= 50 ? '💪 继续加油，快完成了！' : '🌱 开始打卡，领取小猫奖励'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowPrediction(!showPrediction)} style={{ background: 'rgba(34,211,160,0.12)', border: '1px solid rgba(34,211,160,0.3)', borderRadius: 99, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#22d3a0', cursor: 'pointer' }}>
                🔮 寿命预测
              </button>
              <button onClick={() => setShowCalendar(!showCalendar)} style={{ background: 'rgba(157,109,255,0.12)', border: '1px solid rgba(157,109,255,0.3)', borderRadius: 99, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#c084fc', cursor: 'pointer' }}>
                📅 打卡日历
              </button>
            </div>
          </div>
        </div>

        {/* 寿命预测展开 */}
        {showPrediction && (
          <div style={{ marginTop: 14, background: 'rgba(34,211,160,0.05)', border: '1px solid rgba(34,211,160,0.15)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>基于您的健康习惯预测</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>中国平均</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text2)' }}>78岁</div>
              </div>
              <div style={{ fontSize: 18, color: '#22d3a0' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>您的预测</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: '#22d3a0' }}>{predictedAge}岁</div>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>额外寿命</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>+{bonusYears}年</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>* 基于健康行为学研究模型，仅供参考。</div>
          </div>
        )}

        {/* 打卡日历 */}
        {showCalendar && (
          <div style={{ marginTop: 14, background: 'rgba(157,109,255,0.05)', border: '1px solid rgba(157,109,255,0.15)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c084fc', marginBottom: 12 }}>📅 最近 35 天打卡记录</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
              {calendarDays.map(d => (
                <div key={d.date} title={d.date} style={{
                  aspectRatio: '1',
                  borderRadius: 6,
                  background: d.done ? 'rgba(157,109,255,0.7)' : d.isToday ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: d.isToday ? '1px solid rgba(157,109,255,0.6)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  color: d.done ? '#fff' : 'var(--text3)',
                }}>
                  {d.done ? '✓' : d.isToday ? '今' : new Date(d.date).getDate()}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 10, color: 'var(--text3)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(157,109,255,0.7)', marginRight: 4, verticalAlign: 'middle' }} />已完成</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(157,109,255,0.6)', marginRight: 4, verticalAlign: 'middle' }} />今天</span>
              <span>连续 {streak} 天 🔥</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 类别 Tab：2×2 网格 ── */}
      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {HEALTH_CATEGORIES.map(cat => {
          const progress = getCategoryProgress(cat.id)
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: active ? `${cat.color}18` : 'var(--bg2)',
                border: `1px solid ${active ? cat.color : 'var(--border)'}`,
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? cat.color : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{progress}%</div>
              </div>
              {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>

      {/* ── 打卡项目列表 ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>{activecat.icon}</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: activecat.color }}>{activecat.title}</h2>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>
            {activecat.items.filter(item => todayChecked[item.id]).length}/{activecat.items.length}
          </span>
        </div>

        {/* 进度条 */}
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${getCategoryProgress(activecat.id)}%`, background: activecat.color, borderRadius: 99, transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activecat.items.map(item => {
            const done = !!todayChecked[item.id]
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                style={{
                  background: done ? `${activecat.color}10` : 'var(--bg2)',
                  border: `1px solid ${done ? activecat.color + '40' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: done ? activecat.color : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {done ? '✓' : item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: done ? activecat.color : 'var(--text)' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>目标: {item.target} {item.unit}</div>
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: `2px solid ${done ? activecat.color : 'var(--border)'}`,
                  background: done ? activecat.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: done ? '#000' : 'transparent',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>✓</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 睡眠时长输入（仅睡眠分类时显示，或始终显示） ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {(() => {
          const rule = typeof sleepHours === 'number' && sleepHours > 0 ? getSleepRule(sleepHours) : null
          return (
            <div style={{
              background: rule ? `${rule.color}10` : 'var(--bg2)',
              border: `1px solid ${rule ? rule.color + '40' : 'var(--border)'}`,
              borderRadius: 14,
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>🌙</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>昨晚睡了多久？</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>输入小时数，影响健康分和寿命预测</div>
                </div>
                {rule && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: rule.color }}>{rule.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: rule.score > 0 ? '#22d3a0' : '#f87171' }}>
                      {rule.score > 0 ? '+' : ''}{rule.score} 分
                    </div>
                  </div>
                )}
              </div>
              {/* 快选按鈕 */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {[3, 5, 6, 7, 8, 9, 10].map(h => {
                  const r = getSleepRule(h)
                  const selected = sleepHours === h
                  return (
                    <button
                      key={h}
                      onClick={() => setSleepHours(h)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: `1px solid ${selected ? r.color : 'var(--border)'}`,
                        background: selected ? `${r.color}20` : 'transparent',
                        color: selected ? r.color : 'var(--text3)',
                        fontSize: 12,
                        fontWeight: selected ? 700 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {h}h
                    </button>
                  )
                })}
              </div>
              {/* 手动输入 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={sleepHours}
                  onChange={e => {
                    const v = e.target.value === '' ? '' : parseFloat(e.target.value)
                    setSleepHours(v as number | '')
                  }}
                  placeholder="自定义小时数"
                  style={{
                    flex: 1,
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14,
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>小时</span>
              </div>
              {rule && (
                <div style={{ marginTop: 8, fontSize: 11, color: rule.color }}>
                  💡 {rule.tip}
                </div>
              )}
              {/* 寿命影响提示 */}
              {rule && (
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
                  寿命预测：{rule.score > 0 ? `+${Math.round(rule.score / 5)}年` : `${Math.round(rule.score / 5)}年`}
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* ── 今日完成提示 ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          background: doneItems === TOTAL_ITEMS
            ? 'linear-gradient(135deg, rgba(157,109,255,0.15), rgba(157,109,255,0.06))'
            : 'linear-gradient(135deg, rgba(34,211,160,0.08), rgba(34,211,160,0.03))',
          border: `1px solid ${doneItems === TOTAL_ITEMS ? 'rgba(157,109,255,0.3)' : 'rgba(34,211,160,0.15)'}`,
          borderRadius: 16,
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{doneItems === TOTAL_ITEMS ? '🌑' : '🌿'}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: doneItems === TOTAL_ITEMS ? '#c084fc' : '#22d3a0' }}>
            {doneItems === TOTAL_ITEMS ? `🐱 喵值已到账！连续 ${streak} 天` : '🌱 完成全部打卡，领取小猫奖励'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
            {doneItems === TOTAL_ITEMS
              ? `已养 ${darkBalance} 只小猫 · 连续7天+3只 · 连续30天+10只`
              : `今日已完成 ${doneItems}/${TOTAL_ITEMS} 项 · 还差 ${TOTAL_ITEMS - doneItems} 项`}
          </div>
          {doneItems === TOTAL_ITEMS && (
            <div style={{ fontSize: 11, color: 'rgba(157,109,255,0.6)', marginTop: 8 }}>
喵值可兑换猫粮、猫玩具、小猫周边商品
            </div>
          )}
        </div>
      </div>

      {/* ── 健康洞察 ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>💡 健康洞察</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '⚡', title: 'NAD+ 与 NMN 协同', desc: '两者同时服用可增强细胞能量代谢，建议早晨空腹服用效果最佳', color: '#4a9eff' },
            { icon: '🧘', title: '站桩的长寿秘密', desc: '每日30分钟站桩可改善气血循环，研究显示坚持3个月可降低血压', color: '#22d3a0' },
            { icon: '☀️', title: '维生素D3优化', desc: '与K2同服可提高吸收率，建议随餐服用，目标血清水平 40-60 ng/mL', color: '#f6c90e' },
            { icon: '⏰', title: '16:8 轻断食', desc: '每日16小时禁食可激活自噬机制，清除衰老细胞，延缓衰老', color: '#9d6dff' },
          ].map(insight => (
            <div key={insight.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${insight.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {insight.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: insight.color, marginBottom: 4 }}>{insight.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{insight.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
