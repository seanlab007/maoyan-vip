import React from 'react'

/**
 * 完整版首页（包含五级达人体系、三种变现路径等）
 */
export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* 顶部导航 */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <div className="logo-icon">🐱</div>
            <span className="gold-text">猫眼</span>
            <span style={{ color: 'var(--text3)', fontSize: '13px', fontWeight: '500' }}>MaoYan</span>
          </a>
          <div className="nav-links">
            <a href="#trust">信任积分</a>
            <a href="#monetize">变现路径</a>
            <a href="#wallet">积分钱包</a>
            <a href="#creator">达人名片</a>
            <a href="#supply">供应链</a>
          </div>
          <div className="nav-cta">
            <button className="nav-btn-login">登录</button>
            <button className="nav-btn-reg">免费注册 →</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid-lines"></div>
        <div className="hero-content container">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="badge badge-gold">🐱 maoyan.vip</span>
              <span className="badge badge-green">✦ 已与 daiizen.com 打通</span>
              <span className="badge badge-purple">✦ 内测开放中</span>
            </div>
            <h1 className="hero-h1">
              <span className="gold-text">信任</span>，<br />是你最大的<br />
              <span className="gradient-text">资产</span>
            </h1>
            <p className="hero-desc">
              把你的粉丝、朋友圈、社交影响力，变成可计量、可交易、可增值的<strong>信任积分</strong>。<br />
              每一次分享、每一笔成交、每一个新用户，都在为你累积财富。
            </p>
            <div className="hero-actions">
              <button className="btn-gold" onClick={() => alert('注册功能即将上线，敬请期待！')}>
                🚀 立即开始赚积分
              </button>
              <button
                className="btn-outline"
                onClick={() => document.getElementById('monetize')?.scrollIntoView({ behavior: 'smooth' })}
              >
                查看变现方式 ↓
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-val gold-text">2.3万+</div>
                <div className="hero-stat-label">活跃网红</div>
              </div>
              <div>
                <div className="hero-stat-val gold-text">¥4,800 万</div>
                <div className="hero-stat-label">本月佣金发放</div>
              </div>
              <div>
                <div className="hero-stat-val gold-text">98.6%</div>
                <div className="hero-stat-label">结算准时率</div>
              </div>
            </div>
          </div>

          {/* Dashboard Card */}
          <div className="hero-right">
            <div className="hero-dashboard">
              <div className="hd-header">
                <div className="hd-user">
                  <div className="hd-avatar">🦊</div>
                  <div>
                    <div className="hd-name">小雪 · 美妆博主</div>
                    <div className="hd-level">⭐ 黄金达人 · Lv.7</div>
                  </div>
                </div>
                <div className="hd-balance">
                  <div className="hd-balance-label">本月收益</div>
                  <div className="hd-balance-val gold-text">¥12,480</div>
                  <div className="hd-points">🪙 84,200 猫眼积分</div>
                </div>
              </div>

              <div className="hd-metrics">
                <div className="hd-metric">
                  <div className="hd-metric-label">影响力指数</div>
                  <div className="hd-metric-val gold-text">9,840</div>
                  <div className="hd-metric-change pos">↑ +12.4%</div>
                </div>
                <div className="hd-metric">
                  <div className="hd-metric-label">粉丝互动率</div>
                  <div className="hd-metric-val" style={{ color: 'var(--green)' }}>8.3%</div>
                  <div className="hd-metric-change pos">↑ +1.2%</div>
                </div>
                <div className="hd-metric">
                  <div className="hd-metric-label">本月转化</div>
                  <div className="hd-metric-val" style={{ color: 'var(--pink)' }}>246笔</div>
                  <div className="hd-metric-change pos">↑ +38笔</div>
                </div>
              </div>

              <div className="hd-income-bar">
                <div className="hd-income-title">
                  <span>收益来源分布</span>
                  <span style={{ color: 'var(--gold2)' }}>¥12,480</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '10px', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ flex: 4.8, background: 'linear-gradient(90deg,#f6c90e,#fda830)' }}></div>
                  <div style={{ flex: 3.1, background: '#9d6dff' }}></div>
                  <div style={{ flex: 2.1, background: '#f066aa' }}></div>
                  <div style={{ flex: 1.5, background: '#22d3a0' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div className="income-item"><div className="income-dot" style={{ background: '#f6c90e' }}></div> 社交分销 ¥5,990</div>
                  <div className="income-item"><div className="income-dot" style={{ background: '#9d6dff' }}></div> 私域带货 ¥3,870</div>
                  <div className="income-item"><div className="income-dot" style={{ background: '#f066aa' }}></div> 知识付费 ¥1,620</div>
                  <div className="income-item"><div className="income-dot" style={{ background: '#22d3a0' }}></div> 积分兑换 ¥1,000</div>
                </div>
              </div>

              <div className="hd-ranking">
                <div className="rank-trophy">🏆</div>
                <div className="rank-info">
                  <div className="rank-title">美妆板块达人排名</div>
                  <div className="rank-val">全站第 #47</div>
                </div>
                <div className="rank-badge">TOP 2%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formula */}
      <section id="formula">
        <div className="formula-box">
          <div className="formula-title">💡 信任货币化公式</div>
          <div className="formula-eq">
            <div className="formula-term">
              <div className="formula-term-val gradient-text">影响力</div>
              <div className="formula-term-sub">= 你的总资产</div>
            </div>
            <div className="formula-op">=</div>
            <div className="formula-term">
              <div className="formula-term-val gold-text">流量</div>
              <div className="formula-term-sub">粉丝 × 触达</div>
            </div>
            <div className="formula-op" style={{ fontSize: '28px' }}>×</div>
            <div className="formula-term">
              <div className="formula-term-val" style={{ color: 'var(--green)' }}>转化率</div>
              <div className="formula-term-sub">信任深度</div>
            </div>
            <div className="formula-op" style={{ fontSize: '28px' }}>×</div>
            <div className="formula-term">
              <div className="formula-term-val" style={{ color: 'var(--pink)' }}>客单价</div>
              <div className="formula-term-sub">选品溢价</div>
            </div>
          </div>
          <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text3)' }}>
            猫眼平台把这三个维度量化为 <strong style={{ color: 'var(--gold2)' }}>信任积分（TrustScore）</strong>，实时计算你的"信任资产净值"
          </p>
        </div>
      </section>

      {/* Trust Score */}
      <section id="trust">
        <div className="container">
          <div className="section-label">✦ 量化体系</div>
          <h2 className="section-title">把"信任"变成<br /><span className="gold-text">可量化的积分</span></h2>
          <p className="section-desc">三个维度，全面衡量你的社交影响力，每个维度都与真实收益直接挂钩。</p>

          <div className="trust-grid">
            {/* Dimension 1 */}
            <div className="trust-card card" style={{ background: 'linear-gradient(135deg, rgba(246,201,14,.04), var(--bg2))' }}>
              <div className="trust-card-num">01</div>
              <div className="trust-icon" style={{ background: 'rgba(246,201,14,.12)' }}>📡</div>
              <h3 className="gold-text">流量规模（广度）</h3>
              <p>你能触达多少人？基数决定上限。粉丝、好友、群成员，每一个都是你的信任网络节点。</p>
              <div className="trust-metrics">
                <span className="metric-tag">📱 粉丝数</span>
                <span className="metric-tag">👥 好友数</span>
                <span className="metric-tag">💬 群成员数</span>
                <span className="metric-tag">📣 触达人数</span>
              </div>
              <div className="trust-bar-wrap">
                <div className="trust-bar-label"><span>积分权重</span><span style={{ color: 'var(--gold2)' }}>35%</span></div>
                <div className="trust-bar"><div className="trust-bar-fill" style={{ width: '35%', background: 'linear-gradient(90deg,#f6c90e,#fda830)' }}></div></div>
              </div>
            </div>

            {/* Dimension 2 */}
            <div className="trust-card card" style={{ background: 'linear-gradient(135deg, rgba(34,211,160,.04), var(--bg2))' }}>
              <div className="trust-card-num">02</div>
              <div className="trust-icon" style={{ background: 'rgba(34,211,160,.12)' }}>💓</div>
              <h3 style={{ color: 'var(--green)' }}>互动质量（深度）</h3>
              <p>光有粉丝不行，还要看他们听不听你的。互动率越高，转化率越高，你的信任价值越大。</p>
              <div className="trust-metrics">
                <span className="metric-tag">❤️ 点赞率</span>
                <span className="metric-tag">💬 评论率</span>
                <span className="metric-tag">🔁 转发率</span>
                <span className="metric-tag">🔥 群活跃度</span>
              </div>
              <div className="trust-bar-wrap">
                <div className="trust-bar-label"><span>积分权重</span><span style={{ color: 'var(--green)' }}>40%</span></div>
                <div className="trust-bar"><div className="trust-bar-fill" style={{ width: '40%', background: 'linear-gradient(90deg,#22d3a0,#06b6d4)' }}></div></div>
              </div>
            </div>

            {/* Dimension 3 */}
            <div className="trust-card card" style={{ background: 'linear-gradient(135deg, rgba(240,102,170,.04), var(--bg2))' }}>
              <div className="trust-card-num">03</div>
              <div className="trust-icon" style={{ background: 'rgba(240,102,170,.12)' }}>💰</div>
              <h3 style={{ color: 'var(--pink)' }}>转化能力（结果）</h3>
              <p>最硬核的指标。你帮平台卖出了多少货、拉来了多少新用户，系统直接看结果给分。</p>
              <div className="trust-metrics">
                <span className="metric-tag">🛒 带货成交额</span>
                <span className="metric-tag">💵 佣金收入</span>
                <span className="metric-tag">👤 拉新人数</span>
                <span className="metric-tag">⭐ 复购率</span>
              </div>
              <div className="trust-bar-wrap">
                <div className="trust-bar-label"><span>积分权重</span><span style={{ color: 'var(--pink)' }}>25%</span></div>
                <div className="trust-bar"><div className="trust-bar-fill" style={{ width: '25%', background: 'linear-gradient(90deg,#f066aa,#9d6dff)' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monetize */}
      <section id="monetize">
        <div className="monetize-bg"></div>
        <div className="container">
          <div className="section-label">✦ 变现路径</div>
          <h2 className="section-title">三条路，让你<br /><span className="gold-text">躺着把人情变人民币</span></h2>
          <p className="section-desc">无论你是素人还是大V，都有适合你的变现方式。系统自动分佣，无需囤货发货。</p>

          <div className="monetize-grid">
            {/* Path 1: Social Distribution */}
            <div className="monetize-card card card-gold" style={{ background: 'linear-gradient(135deg, rgba(246,201,14,.05), var(--bg2))' }}>
              <div className="m-header">
                <div className="m-icon" style={{ background: 'rgba(246,201,14,.12)', fontSize: '26px' }}>📤</div>
                <div>
                  <div className="m-title">社交分销</div>
                  <div className="m-subtitle" style={{ color: 'var(--gold2)' }}>适合所有人 · 最直接</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.65', marginBottom: '12px' }}>
                发朋友圈、建群聊天，顺手分享你的专属链接。朋友买了，钱自动打进你的猫眼钱包。
              </p>
              <div className="m-steps">
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(246,201,14,.2)', color: 'var(--gold2)' }}>1</div>
                  <span>在平台选择你喜欢的商品，生成专属分销链接</span>
                </div>
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(246,201,14,.2)', color: 'var(--gold2)' }}>2</div>
                  <span>发到朋友圈 / 微信群 / 微博 / 小红书</span>
                </div>
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(246,201,14,.2)', color: 'var(--gold2)' }}>3</div>
                  <span>朋友通过你的链接下单，系统自动结算佣金</span>
                </div>
              </div>
              <div className="m-earnings">
                <div>
                  <div className="m-earnings-label">平均月收益（素人）</div>
                  <div className="m-earnings-val gold-text">¥800 – ¥3,000</div>
                </div>
                <span style={{ fontSize: '22px' }}>📊</span>
              </div>
            </div>

            {/* Path 2: Private Domain */}
            <div className="monetize-card card" style={{ background: 'linear-gradient(135deg, rgba(157,109,255,.05), var(--bg2))', borderColor: 'rgba(157,109,255,.2)' }}>
              <div className="m-header">
                <div className="m-icon" style={{ background: 'rgba(157,109,255,.12)', fontSize: '26px' }}>🏪</div>
                <div>
                  <div className="m-title">私域带货</div>
                  <div className="m-subtitle" style={{ color: 'var(--purple)' }}>适合网红群主 · 最赚钱</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.65', marginBottom: '12px' }}>
                建立你的粉丝私域，在群里用专业度选品种草。粉丝因为信任你而买单，一件代发，零囤货风险。
              </p>
              <div className="m-steps">
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(157,109,255,.2)', color: 'var(--purple)' }}>1</div>
                  <span>开通「猫眼小店」，对接供应链一件代发</span>
                </div>
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(157,109,255,.2)', color: 'var(--purple)' }}>2</div>
                  <span>在私域群中分享种草内容和专属优惠</span>
                </div>
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(157,109,255,.2)', color: 'var(--purple)' }}>3</div>
                  <span>供应链自动发货，平台自动结算你的利润</span>
                </div>
              </div>
              <div className="m-earnings">
                <div>
                  <div className="m-earnings-label">平均月收益（中腰部达人）</div>
                  <div className="m-earnings-val" style={{ color: 'var(--purple)' }}>¥5,000 – ¥20,000</div>
                </div>
                <span style={{ fontSize: '22px' }}>🛍️</span>
              </div>
            </div>

            {/* Path 3: Knowledge Payment */}
            <div className="monetize-card card" style={{ background: 'linear-gradient(135deg, rgba(240,102,170,.05), var(--bg2))', borderColor: 'rgba(240,102,170,.2)' }}>
              <div className="m-header">
                <div className="m-icon" style={{ background: 'rgba(240,102,170,.12)', fontSize: '26px' }}>🎓</div>
                <div>
                  <div className="m-title">知识付费</div>
                  <div className="m-subtitle" style={{ color: 'var(--pink)' }}>适合专家型用户 · 最高阶</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.65', marginBottom: '12px' }}>
                你的专业知识本身就值钱。开设付费社群或课程，把信任直接标价出售，粉丝为你的影响力买单。
              </p>
              <div className="m-steps">
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(240,102,170,.2)', color: 'var(--pink)' }}>1</div>
                  <span>开设「猫眼知识圈」付费社群（月费制）</span>
                </div>
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(240,102,170,.2)', color: 'var(--pink)' }}>2</div>
                  <span>制作课程、直播、干货内容持续输出价值</span>
                </div>
                <div className="m-step">
                  <div className="m-step-num" style={{ background: 'rgba(240,102,170,.2)', color: 'var(--pink)' }}>3</div>
                  <span>会员自动续费，被动收入每月稳定到账</span>
                </div>
              </div>
              <div className="m-earnings">
                <div>
                  <div className="m-earnings-label">平均月收益（专家达人）</div>
                  <div className="m-earnings-val" style={{ color: 'var(--pink)' }}>¥15,000 – ¥50,000+</div>
                </div>
                <span style={{ fontSize: '22px' }}>💎</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Points Wallet */}
      <section id="wallet">
        <div className="container">
          <div className="section-label">✦ 积分钱包</div>
          <h2 className="section-title">你的积分，<br /><span className="gold-text">比现金更好用</span></h2>
          <p className="section-desc">猫眼积分不只是「虚拟货币」——它可以直接兑换实物、金融产品、拍摄服务，也可以转让或出售。</p>

          <div className="wallet-grid">
            {/* Wallet Card */}
            <div>
              <div className="wallet-card-main">
                <div className="wallet-top">
                  <div>
                    <div className="wallet-brand">MaoYan Wallet</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>maoyan.vip</div>
                  </div>
                  <div className="wallet-chip"></div>
                </div>
                <div className="wallet-points">
                  <div className="wallet-points-label">可用积分余额</div>
                  <div className="wallet-points-val gold-text">84,200 <span style={{ fontSize: '20px', fontWeight: '500', WebkitTextFillColor: '#c9a800' }}>积分</span></div>
                  <div className="wallet-points-sub">≈ ¥ 842.00 人民币等值 &nbsp;｜&nbsp; 约 $116 美元</div>
                </div>
                <div className="wallet-row">
                  <div className="wallet-info-item">
                    <div className="label">持卡人</div>
                    <div className="val">小雪 · 美妆博主</div>
                  </div>
                  <div className="wallet-info-item" style={{ textAlign: 'right' }}>
                    <div className="label">信任等级</div>
                    <div className="val gold-text">⭐ 黄金达人</div>
                  </div>
                </div>
              </div>

              {/* Redemption Options */}
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🛒</div>
                  <div style={{ fontSize: '11px', fontWeight: '700' }}>兑换实物</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>供应链商品</div>
                </div>
                <div style={{ textAlign: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📈</div>
                  <div style={{ fontSize: '11px', fontWeight: '700' }}>金融产品</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>美股额度</div>
                </div>
                <div style={{ textAlign: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎬</div>
                  <div style={{ fontSize: '11px', fontWeight: '700' }}>拍摄服务</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>专业团队</div>
                </div>
                <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(246,201,14,.1), rgba(253,168,48,.1))', border: '1px solid var(--border2)', borderRadius: '14px', padding: '14px 8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💸</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gold2)' }}>直接提现</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>1积分=0.01¥</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="wallet-features">
              <div className="wf-item">
                <div className="wf-icon" style={{ background: 'rgba(246,201,14,.1)' }}>🪙</div>
                <div>
                  <div className="wf-title">随时赚、随时用</div>
                  <div className="wf-desc">分享一次链接得积分，拉新一个用户得积分，每完成一笔成交自动到账。积分余额实时更新。</div>
                </div>
              </div>
              <div className="wf-item">
                <div className="wf-icon" style={{ background: 'rgba(34,211,160,.1)' }}>🔐</div>
                <div>
                  <div className="wf-title">安全 · 透明 · 可追溯</div>
                  <div className="wf-desc">每一笔积分的来源、用途、兑换记录，链上存证，永久可查。不会跑路，不会缩水。</div>
                </div>
              </div>
              <div className="wf-item">
                <div className="wf-icon" style={{ background: 'rgba(157,109,255,.1)' }}>🔗</div>
                <div>
                  <div className="wf-title">与 daiizen.com 无缝互通</div>
                  <div className="wf-desc">猫眼积分可在 daiizen.com 平台直接消费和兑换，打通两个生态的用户流量和价值体系。</div>
                </div>
              </div>
              <div className="wf-item">
                <div className="wf-icon" style={{ background: 'rgba(240,102,170,.1)' }}>🎁</div>
                <div>
                  <div className="wf-title">新手礼包 · 即注册即得</div>
                  <div className="wf-desc">注册即送 500 积分（价值 ¥5），邀请好友注册再得 1000 积分，永久邀请返佣不设上限。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Card */}
      <section id="creator">
        <div className="container">
          <div className="creator-header">
            <div className="section-label" style={{ justifyContent: 'center' }}>✦ 达人名片系统</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>你的影响力，<br /><span className="gold-text">全部写在这张名片上</span></h2>
            <p className="section-desc" style={{ textAlign: 'center' }}>猫眼达人名片（Creator Card）是你信任资产的可视化证明，比简历更直观，比关注数更有说服力。</p>
          </div>

          <div className="creator-cards-row">
            {/* Card 1 */}
            <div className="cc-card">
              <div className="cc-avatar" style={{ background: 'linear-gradient(135deg,#f06,#9d6dff)' }}>🦊</div>
              <div className="cc-name">小雪</div>
              <div className="cc-category">💄 美妆 · 护肤</div>
              <div className="cc-score-ring" style={{ borderColor: 'var(--gold2)' }}>
                <div className="cc-score-val gold-text">97</div>
                <div className="cc-score-label">信任分</div>
              </div>
              <div className="cc-level-bar"><div className="cc-level-fill" style={{ width: '97%', background: 'linear-gradient(90deg,#f6c90e,#fda830)' }}></div></div>
              <div className="cc-stats">
                <div className="cc-stat-item"><div className="cc-stat-val gold-text">28.4万</div><div className="cc-stat-label">粉丝</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--green)' }}>8.3%</div><div className="cc-stat-label">互动率</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--pink)' }}>246</div><div className="cc-stat-label">月转化</div></div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '10px', marginBottom: '10px' }}>⭐ 黄金达人</span>
              <button className="cc-btn">合作 / 购买</button>
            </div>

            {/* Card 2 */}
            <div className="cc-card">
              <div className="cc-avatar" style={{ background: 'linear-gradient(135deg,#4a9eff,#22d3a0)' }}>🏃</div>
              <div className="cc-name">铁蛋健身</div>
              <div className="cc-category">💪 健身 · 运动</div>
              <div className="cc-score-ring" style={{ borderColor: 'var(--green)' }}>
                <div className="cc-score-val" style={{ color: 'var(--green)' }}>88</div>
                <div className="cc-score-label">信任分</div>
              </div>
              <div className="cc-level-bar"><div className="cc-level-fill" style={{ width: '88%', background: 'linear-gradient(90deg,#22d3a0,#06b6d4)' }}></div></div>
              <div className="cc-stats">
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--blue)' }}>12.1万</div><div className="cc-stat-label">粉丝</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--green)' }}>11.2%</div><div className="cc-stat-label">互动率</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--pink)' }}>183</div><div className="cc-stat-label">月转化</div></div>
              </div>
              <span className="badge badge-blue" style={{ fontSize: '10px', marginBottom: '10px' }}>💎 铂金达人</span>
              <button className="cc-btn">合作 / 购买</button>
            </div>

            {/* Card 3 */}
            <div className="cc-card">
              <div className="cc-avatar" style={{ background: 'linear-gradient(135deg,#fda830,#f06)' }}>👩‍🍳</div>
              <div className="cc-name">美食阿珍</div>
              <div className="cc-category">🍜 美食 · 探店</div>
              <div className="cc-score-ring" style={{ borderColor: 'var(--pink)' }}>
                <div className="cc-score-val" style={{ color: 'var(--pink)' }}>79</div>
                <div className="cc-score-label">信任分</div>
              </div>
              <div className="cc-level-bar"><div className="cc-level-fill" style={{ width: '79%', background: 'linear-gradient(90deg,#f066aa,#9d6dff)' }}></div></div>
              <div className="cc-stats">
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--pink)' }}>6.8万</div><div className="cc-stat-label">粉丝</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--green)' }}>14.7%</div><div className="cc-stat-label">互动率</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--gold2)' }}>127</div><div className="cc-stat-label">月转化</div></div>
              </div>
              <span className="badge badge-pink" style={{ fontSize: '10px', marginBottom: '10px' }}>✨ 白银达人</span>
              <button className="cc-btn">合作 / 购买</button>
            </div>

            {/* Card 4 */}
            <div className="cc-card">
              <div className="cc-avatar" style={{ background: 'linear-gradient(135deg,#9d6dff,#4a9eff)' }}>📚</div>
              <div className="cc-name">知识王胖子</div>
              <div className="cc-category">📖 知识 · 投资</div>
              <div className="cc-score-ring" style={{ borderColor: 'var(--purple)' }}>
                <div className="cc-score-val" style={{ color: 'var(--purple)' }}>92</div>
                <div className="cc-score-label">信任分</div>
              </div>
              <div className="cc-level-bar"><div className="cc-level-fill" style={{ width: '92%', background: 'linear-gradient(90deg,#9d6dff,#f066aa)' }}></div></div>
              <div className="cc-stats">
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--purple)' }}>45.2万</div><div className="cc-stat-label">粉丝</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--green)' }}>6.1%</div><div className="cc-stat-label">互动率</div></div>
                <div className="cc-stat-item"><div className="cc-stat-val" style={{ color: 'var(--gold2)' }}>412</div><div className="cc-stat-label">月转化</div></div>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '10px', marginBottom: '10px' }}>👑 钻石达人</span>
              <button className="cc-btn">合作 / 购买</button>
            </div>
          </div>

          {/* daiizen bridge */}
          <div className="daiizen-bridge">
            <div className="bridge-icon">🔗</div>
            <div className="bridge-content">
              <div className="bridge-title">与 <span style={{ color: 'var(--purple)' }}>daiizen.com</span> 深度打通</div>
              <div className="bridge-desc">
                猫眼达人名片与 daiizen.com 平台数据实时同步。你在猫眼的信任积分、变现记录、粉丝数据，
                可以直接在 daiizen 生态中使用和兑换，两个平台的用户资产无缝互通。
              </div>
              <div className="bridge-tags">
                <span className="badge badge-purple">🔄 积分互通</span>
                <span className="badge badge-blue">📊 数据同步</span>
                <span className="badge badge-green">💰 统一结算</span>
                <span className="badge badge-gold">🪪 身份互认</span>
              </div>
            </div>
            <div className="bridge-cta">
              <div className="bridge-stat">
                <div className="bridge-stat-val">180,000+</div>
                <div className="bridge-stat-label">daiizen 用户已打通</div>
              </div>
              <button className="btn-outline" style={{ borderColor: 'rgba(157,109,255,.5)', color: 'var(--purple)' }}>
                前往 daiizen.com →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Supply Chain */}
      <section id="supply">
        <div className="container">
          <div className="section-label">✦ 资源闭环</div>
          <h2 className="section-title">货 · 钱 · 流量，<br /><span className="gold-text">三大资源一站打通</span></h2>
          <p className="section-desc">网红只需专注「种草和分享」，其余的供应链、仓储、发货、金融全部平台解决。</p>

          <div className="supply-flow">
            <div className="supply-node">
              <div className="supply-node-icon" style={{ background: 'rgba(246,201,14,.12)' }}>🏭</div>
              <div className="supply-node-title gold-text">供应链</div>
              <div className="supply-node-desc">优质货源<br />一件代发<br />7天退换</div>
            </div>
            <div className="supply-arrow">→</div>
            <div className="supply-node">
              <div className="supply-node-icon" style={{ background: 'rgba(34,211,160,.12)' }}>🐱</div>
              <div className="supply-node-title" style={{ color: 'var(--green)' }}>猫眼平台</div>
              <div className="supply-node-desc">商品上架<br />积分定价<br />自动分佣</div>
            </div>
            <div className="supply-arrow">→</div>
            <div className="supply-node">
              <div className="supply-node-icon" style={{ background: 'rgba(240,102,170,.12)' }}>👩‍💻</div>
              <div className="supply-node-title" style={{ color: 'var(--pink)' }}>网红达人</div>
              <div className="supply-node-desc">选品种草<br />分享分销<br />私域运营</div>
            </div>
            <div className="supply-arrow">→</div>
            <div className="supply-node">
              <div className="supply-node-icon" style={{ background: 'rgba(157,109,255,.12)' }}>👥</div>
              <div className="supply-node-title" style={{ color: 'var(--purple)' }}>用户下单</div>
              <div className="supply-node-desc">信任购买<br />复购裂变<br />口碑传播</div>
            </div>
            <div className="supply-arrow">→</div>
            <div className="supply-node">
              <div className="supply-node-icon" style={{ background: 'rgba(74,158,255,.12)' }}>💵</div>
              <div className="supply-node-title" style={{ color: 'var(--blue)' }}>金融结算</div>
              <div className="supply-node-desc">T+1到账<br />美股额度<br />理财产品</div>
            </div>
            <div className="supply-arrow">→</div>
            <div className="supply-node">
              <div className="supply-node-icon" style={{ background: 'rgba(246,201,14,.12)' }}>🎬</div>
              <div className="supply-node-title" style={{ color: 'var(--gold2)' }}>流量放大</div>
              <div className="supply-node-desc">专业拍摄<br />短视频制作<br />直播支持</div>
            </div>
          </div>

          <div className="supply-extra">
            <div className="supply-card">
              <h4 className="gold-text">🏭 零风险供应链</h4>
              <p>对接100+国内优质供应商，品质把关，不用囤货，卖出一件结一件，网红零库存风险。</p>
            </div>
            <div className="supply-card">
              <h4 style={{ color: 'var(--blue)' }}>📈 金融资源赋能</h4>
              <p>积分可兑换美股投资额度、理财产品入场券，让赚来的钱继续生钱，打通普惠金融通道。</p>
            </div>
            <div className="supply-card">
              <h4 style={{ color: 'var(--pink)' }}>🎬 专业拍摄服务</h4>
              <p>合作拍摄公司提供达人专属内容制作，短视频/图文/直播全覆盖，用积分直接兑换服务。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data */}
      <section id="data">
        <div className="container">
          <div className="section-label" style={{ justifyContent: 'center' }}>✦ 平台数据</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>数字说话</h2>

          <div className="data-grid">
            <div className="data-item">
              <div className="data-val gold-text">2.3万</div>
              <div className="data-label">活跃网红达人</div>
              <div className="data-sub">月均增长 18%</div>
            </div>
            <div className="data-item">
              <div className="data-val" style={{ color: 'var(--green)' }}>¥4,800万</div>
              <div className="data-label">本月累计佣金</div>
              <div className="data-sub">较上月 +34%</div>
            </div>
            <div className="data-item">
              <div className="data-val" style={{ color: 'var(--purple)' }}>180万</div>
              <div className="data-label">注册用户总数</div>
              <div className="data-sub">含 daiizen 生态</div>
            </div>
            <div className="data-item">
              <div className="data-val" style={{ color: 'var(--pink)' }}>98.6%</div>
              <div className="data-label">佣金准时到账率</div>
              <div className="data-sub">T+1 极速结算</div>
            </div>
          </div>

          {/* Level system */}
          <div style={{ marginTop: '32px', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>达人等级体系</h3>
              <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>信任积分越高，等级越高，佣金比例越高，权益越多</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
              <div style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text2)' }}>新手</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', margin: '4px 0' }}>0 – 1,000积分</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green)' }}>5% 佣金</div>
              </div>
              <div style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
                <div style={{ fontSize: '13px', fontWeight: '800' }}>白银达人</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', margin: '4px 0' }}>1,000 – 10,000</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green)' }}>8% 佣金</div>
              </div>
              <div style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid var(--border)', background: 'rgba(246,201,14,.04)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gold2)' }}>黄金达人</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', margin: '4px 0' }}>10,000 – 50,000</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gold2)' }}>12% 佣金</div>
              </div>
              <div style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid var(--border)', background: 'rgba(74,158,255,.04)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💎</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--blue)' }}>铂金达人</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', margin: '4px 0' }}>50,000 – 200,000</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--blue)' }}>16% 佣金</div>
              </div>
              <div style={{ padding: '20px 16px', textAlign: 'center', background: 'rgba(157,109,255,.04)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👑</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--purple)' }}>钻石达人</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', margin: '4px 0' }}>200,000+</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--purple)' }}>20% 佣金</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="container">
          <div className="cta-box">
            <div className="cta-glow"></div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🐱</div>
            <h2 className="cta-h2">
              你的影响力，<br />
              <span className="gold-text">今天就开始变现</span>
            </h2>
            <p className="cta-desc">
              注册即送 500 积分（价值 ¥5），无需推广经验，无需囤货，<br />
              发朋友圈就能赚钱——这是真的。
            </p>
            <div className="cta-actions">
              <button className="btn-gold" onClick={() => alert('注册功能即将上线！敬请期待 maoyan.vip')}>
                🚀 免费注册，立领500积分
              </button>
              <button className="btn-outline" onClick={() => alert('企业合作请联系：business@maoyan.vip')}>
                💼 企业合作咨询
              </button>
            </div>
            <div className="cta-note">
              已有 23,000+ 网红达人在猫眼变现 &nbsp;·&nbsp; 注册免费，永不收费 &nbsp;·&nbsp; 随时可提现
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo" style={{ fontSize: '18px' }}>
                <div className="logo-icon">🐱</div>
                <span className="gold-text">猫眼</span>
                <span style={{ color: 'var(--text3)', fontSize: '12px' }}>MaoYan</span>
              </div>
              <p>把你的社交影响力变成可量化、可交易、可增值的信任资产。<br />maoyan.vip — 信任即财富。</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">积分钱包</span>
                <span className="badge badge-green">网红变现</span>
                <span className="badge badge-purple">daiizen打通</span>
              </div>
            </div>
            <div className="footer-col">
              <h4>产品功能</h4>
              <ul>
                <li><a href="#">信任积分系统</a></li>
                <li><a href="#">猫眼积分钱包</a></li>
                <li><a href="#">达人名片（Creator Card）</a></li>
                <li><a href="#">社交分销工具</a></li>
                <li><a href="#">私域带货开店</a></li>
                <li><a href="#">知识付费社群</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>生态合作</h4>
              <ul>
                <li><a href="https://daiizen.com" target="_blank">daiizen.com 互通</a></li>
                <li><a href="#">供应链合作</a></li>
                <li><a href="#">金融资源接入</a></li>
                <li><a href="#">拍摄服务预约</a></li>
                <li><a href="#">品牌方入驻</a></li>
                <li><a href="#">API 对接</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>关于我们</h4>
              <ul>
                <li><a href="#">平台介绍</a></li>
                <li><a href="#">达人中心</a></li>
                <li><a href="#">帮助中心</a></li>
                <li><a href="#">用户协议</a></li>
                <li><a href="#">隐私政策</a></li>
                <li><a href="#">联系我们</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>
              © 2026 MaoYan.vip · 猫眼信任平台 &nbsp;·&nbsp; 阿里云 · 国内备案中
              &nbsp;·&nbsp; ICP备XXXXXXXX号
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div className="footer-social">
                <div className="social-btn" title="微信公众号">💬</div>
                <div className="social-btn" title="微博">🅦</div>
                <div className="social-btn" title="抖音">📱</div>
                <div className="social-btn" title="小红书">📕</div>
              </div>
              <a href="https://daiizen.com" target="_blank" style={{ color: 'var(--purple)', fontSize: '12px', fontWeight: '600' }}>
                🔗 daiizen.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
