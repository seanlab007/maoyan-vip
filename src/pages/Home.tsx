import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function HomePage() {
  const { user } = useAuthStore()

  return (
    <div className="home-page">
      {/* 顶部导航 */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo">
            <span className="logo-emoji">🐱</span>
            <span className="logo-name">猫眼 <span className="logo-en">MaoYan</span></span>
          </div>
          <nav className="home-nav">
            <a href="#features">功能</a>
            <a href="#earn">赚积分</a>
            <a href="#levels">达人等级</a>
            {user
              ? <Link to="/dashboard" className="btn-nav-primary">进入仪表盘 →</Link>
              : <>
                  <Link to="/login" className="btn-nav">登录</Link>
                  <Link to="/register" className="btn-nav-primary">免费注册</Link>
                </>
            }
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">🚀 信任货币化平台</div>
            <h1 className="hero-title">
              信任，是你<br />
              <span className="gold-text">最大的资产</span>
            </h1>
            <p className="hero-desc">
              把你的粉丝、影响力和口碑变成真实收入。<br />
              积分钱包 × 达人变现 × 社交电商，一站搞定。
            </p>
            <div className="hero-formula">
              <span className="formula-item">影响力</span>
              <span className="formula-eq">=</span>
              <span className="formula-item">流量</span>
              <span className="formula-op">×</span>
              <span className="formula-item">转化率</span>
              <span className="formula-op">×</span>
              <span className="formula-item">客单价</span>
            </div>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">立即注册，送100积分 🎁</Link>
              <a href="#features" className="btn-hero-secondary">了解更多 ↓</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>2.3万+</strong><span>入驻达人</span></div>
              <div className="hero-stat"><strong>4800万+</strong><span>累计积分流水</span></div>
              <div className="hero-stat"><strong>98.6%</strong><span>准时结算率</span></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-card">
              <div className="hc-header">
                <span>🐱 猫眼达人仪表盘</span>
                <span className="hc-live">● 实时</span>
              </div>
              <div className="hc-balance">
                <div className="hc-bal-label">本月收益</div>
                <div className="hc-bal-val">12,480 分</div>
                <div className="hc-bal-sub">+2,130分 较上月</div>
              </div>
              <div className="hc-breakdown">
                <div className="hc-item"><span>🛒️ 带货佣金</span><span>8,960分</span></div>
                <div className="hc-item"><span>👥 推荐奖励</span><span>2,400分</span></div>
                <div className="hc-item"><span>🪙 兑换商品</span><span>1,120分</span></div>
              </div>
              <div className="hc-level">
                <span className="hc-level-badge">🥇 黄金达人</span>
                <span className="hc-commission">佣金率 12%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 三维度量化 */}
      <section id="features" className="section features-section">
        <div className="section-inner">
          <h2 className="section-title">量化你的<span className="gold-text">信任价值</span></h2>
          <p className="section-sub">三个维度，建立你的影响力标准</p>
          <div className="features-grid">
            {[
              { icon: '📡', title: '流量规模（广度）', color: '#4a9eff', pct: 35,
                items: ['粉丝数、好友数', '群成员数', '覆盖触达面'] },
              { icon: '💬', title: '互动质量（深度）', color: '#f6c90e', pct: 40,
                items: ['点赞率、评论率', '转发率', '群消息活跃度'] },
              { icon: '💰', title: '转化能力（结果）', color: '#22d3a0', pct: 25,
                items: ['带货成交额', '佣金收入', '拉新人数'] },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="fc-icon" style={{ color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <div className="fc-pct-bar">
                  <div className="fc-pct-fill" style={{ width: `${f.pct}%`, background: f.color }} />
                </div>
                <div className="fc-pct-label">权重 {f.pct}%</div>
                <ul>
                  {f.items.map(i => <li key={i}>✓ {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 赚积分 */}
      <section id="earn" className="section earn-section">
        <div className="section-inner">
          <h2 className="section-title">三种<span className="gold-text">变现路径</span></h2>
          <div className="earn-cards">
            {[
              { icon: '🔗', title: '社交分销', tag: '适合所有人', income: '800–3,000分/月',
                desc: '分享商品链接 → 朋友购买 → 自动到账积分佣金。动动手指，积分兑换好货。' },

              { icon: '🏦', title: '私域带货', tag: '适合网红/群主', income: '5,000–20,000分/月',
                desc: '建立粉丝群，利用专业度选品推荐。粉丝因信任而买单，积分兑换大量好货。' },
              { icon: '📚', title: '知识付费', tag: '适合专家型', income: '15,000–50,000+分/月',
                desc: '分享专业知识（护肤/穿搭/投资），粉丝付费进群或买课。积劆兑换尊贵体验。' },
            ].map(c => (
              <div key={c.title} className="earn-card">
                <div className="ec-icon">{c.icon}</div>
                <div className="ec-tag">{c.tag}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="ec-income">预期收益：<strong>{c.income}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 达人等级 */}
      <section id="levels" className="section levels-section">
        <div className="section-inner">
          <h2 className="section-title">五级<span className="gold-text">达人体系</span></h2>
          <div className="levels-table">
            {[
              { icon: '🌱', level: '新手', color: '#9ba3b8', commission: '5%', gmv: '0起' },
              { icon: '🥈', level: '白銀', color: '#c0c0c0', commission: '8%', gmv: '5,000+分' },
              { icon: '🥇', level: '黄金', color: '#f6c90e', commission: '12%', gmv: '3万+分' },
              { icon: '📎', level: '铂金', color: '#4a9eff', commission: '16%', gmv: '10万+分' },
              { icon: '👑', level: '钒石', color: '#9d6dff', commission: '20%', gmv: '50万+分' },
            ].map(l => (
              <div key={l.level} className="level-row">
                <span className="level-icon">{l.icon}</span>
                <span className="level-name" style={{ color: l.color }}>{l.level}</span>
                <span className="level-commission">佣金 <strong>{l.commission}</strong></span>
                <span className="level-gmv">GMV {l.gmv}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>现在就开始，<span className="gold-text">把信任变成财富</span></h2>
          <p>注册即送 100 积分 · 零门槛入驻 · 当天可开始赚钱</p>
          <Link to="/register" className="btn-cta">免费注册 →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-logo">🐱 猫眼 MaoYan</div>
          <div className="footer-links">
            <a href="/terms">用户协议</a>
            <a href="/privacy">隐私政策</a>
            <a href="mailto:hello@maoyan.vip">联系我们</a>
          </div>
          <div className="footer-copy">© 2026 maoyan.vip · 信任即财富</div>
        </div>
      </footer>
    </div>
  )
}
