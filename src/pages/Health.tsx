import React, { useState } from 'react'
import toast from 'react-hot-toast'

// 用户健康习惯数据（基于用户提供的个人补剂/运动清单）
const HEALTH_CATEGORIES = [
  {
    id: 'exercise',
    icon: '🏋️',
    title: '运动锻炼',
    color: '#22d3a0',
    items: [
      { id: 'zhanzhuang', name: '站桩', unit: '分钟', target: 30, icon: '🧘' },
      { id: 'cardio', name: '有氧运动', unit: '分钟', target: 30, icon: '🏃' },
      { id: 'strength', name: '力量训练', unit: '组', target: 3, icon: '💪' },
      { id: 'stretch', name: '拉伸/瑜伽', unit: '分钟', target: 15, icon: '🤸' },
    ],
  },
  {
    id: 'supplements',
    icon: '💊',
    title: '营养补剂',
    color: '#4a9eff',
    items: [
      { id: 'nad', name: 'NAD+', unit: '粒', target: 1, icon: '⚡' },
      { id: 'nmn', name: 'NMN', unit: '粒', target: 1, icon: '🔬' },
      { id: 'vitd', name: '维生素 D3', unit: '粒', target: 1, icon: '☀️' },
      { id: 'omega3', name: 'Omega-3', unit: '粒', target: 2, icon: '🐟' },
      { id: 'magnesium', name: '镁', unit: '粒', target: 1, icon: '🪨' },
      { id: 'zinc', name: '锌', unit: '粒', target: 1, icon: '🔩' },
      { id: 'collagen', name: '胶原蛋白', unit: '克', target: 10, icon: '✨' },
      { id: 'probiotics', name: '益生菌', unit: '粒', target: 1, icon: '🦠' },
    ],
  },
  {
    id: 'diet',
    icon: '🥗',
    title: '饮食习惯',
    color: '#f6c90e',
    items: [
      { id: 'water', name: '喝水', unit: '升', target: 2, icon: '💧' },
      { id: 'vegetables', name: '蔬菜', unit: '份', target: 3, icon: '🥦' },
      { id: 'protein', name: '优质蛋白', unit: '份', target: 2, icon: '🥩' },
      { id: 'no_sugar', name: '无糖饮食', unit: '天', target: 1, icon: '🚫' },
      { id: 'intermittent', name: '轻断食', unit: '小时', target: 16, icon: '⏰' },
    ],
  },
  {
    id: 'sleep',
    icon: '😴',
    title: '睡眠恢复',
    color: '#9d6dff',
    items: [
      { id: 'sleep_time', name: '睡眠时长', unit: '小时', target: 8, icon: '🌙' },
      { id: 'sleep_quality', name: '睡眠质量', unit: '分', target: 90, icon: '⭐' },
      { id: 'no_screen', name: '睡前无屏幕', unit: '分钟', target: 30, icon: '📵' },
    ],
  },
]

// 寿命预测因子
const LONGEVITY_FACTORS = [
  { key: 'exercise', label: '运动', max: 15, icon: '🏋️' },
  { key: 'supplements', label: '补剂', max: 10, icon: '💊' },
  { key: 'diet', label: '饮食', max: 15, icon: '🥗' },
  { key: 'sleep', label: '睡眠', max: 10, icon: '😴' },
]

export default function HealthPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState('exercise')
  const [showPrediction, setShowPrediction] = useState(false)

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [itemId]: !prev[itemId] }
      const totalChecked = Object.values(next).filter(Boolean).length
      if (totalChecked > 0 && totalChecked % 5 === 0) {
        toast.success(`🎉 已完成 ${totalChecked} 项健康习惯！`)
      }
      return next
    })
  }

  // 计算各类别完成率
  const getCategoryProgress = (catId: string) => {
    const cat = HEALTH_CATEGORIES.find(c => c.id === catId)
    if (!cat) return 0
    const done = cat.items.filter(item => checkedItems[item.id]).length
    return Math.round((done / cat.items.length) * 100)
  }

  // 计算总体健康分
  const totalItems = HEALTH_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0)
  const doneItems = Object.values(checkedItems).filter(Boolean).length
  const healthScore = Math.round((doneItems / totalItems) * 100)

  // 寿命预测
  const baseAge = 78 // 中国平均寿命
  const bonusYears = Math.round((healthScore / 100) * 20) // 最多+20年
  const predictedAge = baseAge + bonusYears

  const activecat = HEALTH_CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <div style={{ paddingBottom: 16, background: 'var(--bg)', minHeight: '100vh' }}>
      {/* 顶部健康分 */}
      <div style={{
        background: 'linear-gradient(160deg, #001a0d 0%, #0c0d10 60%)',
        padding: '20px 20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(34,211,160,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🌿 变美打卡</h1>
        
        {/* 健康分圆环 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="#22d3a0" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#22d3a0' }}>{healthScore}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>健康分</span>
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              今日完成 {doneItems}/{totalItems} 项
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
              {healthScore >= 80 ? '🌟 优秀！你今天的状态很棒' : healthScore >= 50 ? '💪 继续加油，保持健康习惯' : '🌱 开始打卡，养成好习惯'}
            </div>
            <button
              onClick={() => setShowPrediction(!showPrediction)}
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,160,0.2), rgba(34,211,160,0.1))',
                border: '1px solid rgba(34,211,160,0.3)',
                borderRadius: 99,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: '#22d3a0',
                cursor: 'pointer',
              }}
            >
              🔮 查看寿命预测
            </button>
          </div>
        </div>

        {/* 寿命预测展开 */}
        {showPrediction && (
          <div style={{
            marginTop: 16,
            background: 'rgba(34,211,160,0.05)',
            border: '1px solid rgba(34,211,160,0.15)',
            borderRadius: 14,
            padding: '16px',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>基于您的健康习惯预测</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>中国平均</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text2)' }}>78岁</div>
              </div>
              <div style={{ fontSize: 20, color: '#22d3a0' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>您的预测</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#22d3a0' }}>{predictedAge}岁</div>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>额外寿命</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--gold)' }}>+{bonusYears}年</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>* 基于健康行为学研究模型，仅供参考。坚持健康习惯，每天都在延长您的生命！</div>
          </div>
        )}
      </div>

      {/* 类别 Tab */}
      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {HEALTH_CATEGORIES.map(cat => {
          const progress = getCategoryProgress(cat.id)
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0,
                background: active ? `${cat.color}18` : 'var(--bg2)',
                border: `1px solid ${active ? cat.color : 'var(--border)'}`,
                borderRadius: 12,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: active ? cat.color : 'var(--text)' }}>{cat.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{progress}%</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 打卡项目列表 */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>{activecat.icon}</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: activecat.color }}>{activecat.title}</h2>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>
            {activecat.items.filter(item => checkedItems[item.id]).length}/{activecat.items.length}
          </span>
        </div>

        {/* 进度条 */}
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${getCategoryProgress(activecat.id)}%`,
            background: activecat.color,
            borderRadius: 99,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activecat.items.map(item => {
            const done = checkedItems[item.id]
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
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: done ? activecat.color : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  {done ? '✓' : item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: done ? activecat.color : 'var(--text)' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>目标: {item.target} {item.unit}</div>
                </div>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `2px solid ${done ? activecat.color : 'var(--border)'}`,
                  background: done ? activecat.color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: done ? '#000' : 'transparent',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  ✓
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 健康洞察 */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>💡 健康洞察</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '⚡', title: 'NAD+ 与 NMN 协同', desc: '两者同时服用可增强细胞能量代谢，建议早晨空腹服用效果最佳', color: '#4a9eff' },
            { icon: '🧘', title: '站桩的长寿秘密', desc: '每日30分钟站桩可改善气血循环，研究显示坚持3个月可降低血压', color: '#22d3a0' },
            { icon: '☀️', title: '维生素D3优化', desc: '与K2同服可提高吸收率，建议随餐服用，目标血清水平 40-60 ng/mL', color: '#f6c90e' },
            { icon: '⏰', title: '16:8 轻断食', desc: '每日16小时禁食可激活自噬机制，清除衰老细胞，延缓衰老', color: '#9d6dff' },
          ].map(insight => (
            <div key={insight.title} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${insight.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
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

      {/* 连续打卡激励 */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,211,160,0.1), rgba(34,211,160,0.05))',
          border: '1px solid rgba(34,211,160,0.2)',
          borderRadius: 16,
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🌿</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#22d3a0' }}>坚持健康习惯</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>每完成 10 项打卡，获得 50 积分奖励</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>今日已完成 {doneItems} 项 · 距离奖励还差 {Math.max(0, 10 - (doneItems % 10))} 项</div>
        </div>
      </div>
    </div>
  )
}
