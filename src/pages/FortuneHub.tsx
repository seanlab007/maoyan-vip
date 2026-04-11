import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  { path: '/fortune/bazi', icon: '🔮', title: '八字排盘', desc: '输入生辰八字，解读你的命运密码', gradient: 'from-purple-500/20 to-pink-500/20' },
  { path: '/fortune/marriage', icon: '💕', title: '姻缘测算', desc: '测测你和TA的缘分指数', gradient: 'from-pink-500/20 to-rose-500/20' },
  { path: '/fortune/wealth', icon: '💰', title: '财运分析', desc: '了解你的财富密码和理财方向', gradient: 'from-amber-500/20 to-orange-500/20' },
  { path: '/fortune/daily', icon: '✨', title: '每日运势', desc: '每日运势早知道，好运不缺席', gradient: 'from-cyan-500/20 to-blue-500/20' },
  { path: '/fortune/name', icon: '🌸', title: '姓名测试', desc: '测测你的名字有多少分', gradient: 'from-green-500/20 to-teal-500/20' },
]

export default function FortuneHub() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 36, padding: '40px 20px' }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔮</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#c084fc,#f472b6,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>命理小馆</h1>
        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6 }}>探索命运的秘密，了解真实的自己<br />用传统易学智慧，助力你的人生决策</p>
      </motion.div>

      {/* 功能卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={f.path} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: `linear-gradient(135deg, var(--bg2), var(--bg3))`,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 24,
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'rgba(246,201,14,0.3)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(246,201,14,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* 底部说明 */}
      <div style={{ textAlign: 'center', marginTop: 36, padding: '20px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          命理测算基于传统易学理论，仅供娱乐参考<br />
          相信自己，你的命运由你创造
        </p>
      </div>
    </div>
  )
}
