import React, { useState } from 'react'
import { drawTarot, type TarotResult, type SpreadType } from '@/lib/fortune/tarot'
import { motion, AnimatePresence } from 'framer-motion'

const SPREAD_INFO: Record<SpreadType, { label: string; desc: string; icon: string; color: string }> = {
  single: { label: '单牌指引', desc: '快速获得一个明确的指引', icon: '🃏', color: '#f472b6' },
  three: { label: '三牌阵', desc: '过去·现在·未来，洞察事物脉络', icon: '🔮', color: '#a78bfa' },
  celtic: { label: '凯尔特十字', desc: '十张牌全面解析问题的方方面面', icon: '✨', color: '#fbbf24' },
}

function TarotCardDisplay({ card, index, delay = 0 }: { card: TarotResult['cards'][0]; index: number; delay?: number }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ textAlign: 'center' }}
    >
      {/* 牌面 */}
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          cursor: 'pointer',
          width: 100,
          margin: '0 auto 12px',
        }}
      >
        <div style={{
          width: 100, height: 160,
          borderRadius: 12,
          background: flipped
            ? (card.isReversed
              ? 'linear-gradient(160deg,#1e1e2e,#2d1b3d)'
              : 'linear-gradient(160deg,#1a1a2e,#16213e)')
            : 'linear-gradient(135deg,#2d1b69,#4c1d95)',
          border: `2px solid ${card.isReversed ? 'rgba(248,113,113,0.4)' : 'rgba(167,139,250,0.4)'}`,
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: `0 8px 32px ${card.isReversed ? 'rgba(248,113,113,0.15)' : 'rgba(167,139,250,0.15)'}`,
          transform: card.isReversed ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'all 0.3s',
          position: 'relative' as const,
        }}>
          {!flipped ? (
            <div style={{ fontSize: 28, opacity: 0.5 }}>🔯</div>
          ) : (
            <>
              <div style={{ fontSize: 32 }}>{card.emoji}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, padding: '0 8px', textAlign: 'center' as const }}>
                {card.name}
              </div>
              {card.isReversed && (
                <div style={{
                  position: 'absolute' as const, bottom: 6, fontSize: 9,
                  color: '#f87171', fontWeight: 700, letterSpacing: 1,
                }}>逆位</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 位置标签 */}
      <div style={{
        fontSize: 11, color: 'var(--text3)', marginBottom: 4,
        background: 'rgba(255,255,255,0.05)', padding: '2px 8px',
        borderRadius: 20, display: 'inline-block',
      }}>
        {card.position}
      </div>

      {flipped && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: card.isReversed ? '#f87171' : '#c084fc', marginBottom: 4 }}>
            {card.name} {card.isReversed ? '（逆）' : '（正）'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, maxWidth: 140 }}>
            {card.meaning.length > 40 ? card.meaning.slice(0, 40) + '...' : card.meaning}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function FortuneTarot() {
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<SpreadType>('three')
  const [result, setResult] = useState<TarotResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [allFlipped, setAllFlipped] = useState(false)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  const submit = () => {
    if (!question.trim()) return
    setLoading(true)
    setAllFlipped(false)
    setSelectedCard(null)
    setTimeout(() => {
      setResult(drawTarot(question, spread))
      setLoading(false)
    }, 1200)
  }

  const handleFlipAll = () => {
    setAllFlipped(true)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🎴</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>塔罗占卜</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>78张神秘牌组，让宇宙通过塔罗与你对话</p>
          </div>
        </div>
      </motion.div>

      {/* 牌阵选择 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {(Object.entries(SPREAD_INFO) as [SpreadType, typeof SPREAD_INFO[SpreadType]][]).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setSpread(key)}
            style={{
              padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
              background: spread === key ? `${info.color}18` : 'var(--bg2)',
              border: `2px solid ${spread === key ? info.color + '60' : 'rgba(255,255,255,0.06)'}`,
              textAlign: 'center', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{info.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: spread === key ? info.color : 'var(--text)', marginBottom: 4 }}>{info.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{info.desc}</div>
          </button>
        ))}
      </div>

      {/* 问题输入 */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        <label style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8, display: 'block', fontWeight: 600 }}>
          🌙 请在心中默念你的问题，再输入于此
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="例如：我和TA的感情会有结果吗？/ 这份工作适合我吗？/ 近期我应该注意什么？"
          rows={3}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text)', fontSize: 14, outline: 'none',
            resize: 'none', lineHeight: 1.6, boxSizing: 'border-box',
          }}
        />
        <button
          onClick={submit}
          disabled={loading || !question.trim()}
          style={{
            width: '100%', marginTop: 14, padding: '12px', borderRadius: 12,
            background: 'linear-gradient(135deg,#7c3aed,#db2777)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
            cursor: !question.trim() ? 'not-allowed' : 'pointer',
            opacity: !question.trim() ? 0.5 : 1,
          }}
        >
          {loading ? '正在洗牌抽牌...' : `🎴 开启${SPREAD_INFO[spread].label}`}
        </button>
      </div>

      {/* 占卜结果 */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 牌面展示 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>
                {SPREAD_INFO[result.spreadType].icon} 你的牌阵
              </h3>
              <button
                onClick={handleFlipAll}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                ✨ 翻开所有牌
              </button>
            </div>

            <div style={{
              display: 'flex', gap: 16, justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              {result.cards.map((card, i) => (
                <div key={i} onClick={() => setSelectedCard(selectedCard === i ? null : i)}>
                  <TarotCardDisplay
                    card={card}
                    index={i}
                    delay={allFlipped ? i * 0.1 : 0}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
              点击牌面可翻开查看详情
            </div>
          </div>

          {/* 选中牌详情 */}
          <AnimatePresence>
            {selectedCard !== null && result.cards[selectedCard] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(167,139,250,0.2)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 64, height: 100, borderRadius: 8, flexShrink: 0,
                      background: 'linear-gradient(135deg,#2d1b69,#4c1d95)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transform: result.cards[selectedCard].isReversed ? 'rotate(180deg)' : 'none',
                      border: '1px solid rgba(167,139,250,0.3)',
                    }}>
                      <div style={{ fontSize: 22 }}>{result.cards[selectedCard].emoji}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '0 4px', fontWeight: 700 }}>
                        {result.cards[selectedCard].name}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: result.cards[selectedCard].isReversed ? '#f87171' : '#c084fc', marginBottom: 4 }}>
                        {result.cards[selectedCard].name}
                        <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8, opacity: 0.8 }}>
                          {result.cards[selectedCard].isReversed ? '逆位' : '正位'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                        位置：{result.cards[selectedCard].position}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}>
                        {result.cards[selectedCard].meaning}
                      </div>
                      <div style={{
                        fontSize: 13, color: '#fbbf24', lineHeight: 1.6,
                        padding: '10px 14px', background: 'rgba(251,191,36,0.06)',
                        borderRadius: 8, borderLeft: '3px solid #fbbf24',
                      }}>
                        💫 {result.cards[selectedCard].advice}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 综合解读 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 14 }}>🌙 综合解读</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>{result.synthesis}</p>
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(219,39,119,0.1))',
              borderRadius: 10, border: '1px solid rgba(167,139,250,0.2)',
            }}>
              <div style={{ fontSize: 13, color: '#c084fc', fontWeight: 700, marginBottom: 6 }}>✨ 宇宙的建议</div>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{result.advice}</p>
            </div>
          </div>

          {/* 今日幸运 */}
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 24, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>✨ 幸运颜色</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{result.luckyColor}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>🔢 幸运数字</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{result.luckyNumber}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>🎴 牌阵</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{SPREAD_INFO[result.spreadType].label}</div>
            </div>
          </div>

          {/* 重新占卜 */}
          <button
            onClick={() => { setResult(null); setQuestion('') }}
            style={{
              width: '100%', marginTop: 16, padding: '12px', borderRadius: 12,
              background: 'var(--bg2)', color: 'var(--text3)', fontSize: 14,
              fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            }}
          >
            🔄 重新占卜
          </button>
        </motion.div>
      )}
    </div>
  )
}
