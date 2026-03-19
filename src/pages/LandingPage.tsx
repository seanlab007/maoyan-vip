import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MaoLogo } from '@/components/MaoLogo'

const TIER_LADDER = [
  { minPeople: 1,     discountPct: 5,  label: "1人团",   badge: "单人享折扣" },
  { minPeople: 5,     discountPct: 10, label: "5人团",   badge: "🔥 热门" },
  { minPeople: 20,    discountPct: 15, label: "20人团",  badge: "💎 优惠" },
  { minPeople: 100,   discountPct: 25, label: "百人团",  badge: "⭐ 超值" },
  { minPeople: 1000,  discountPct: 35, label: "千人团",  badge: "🏆 超级团" },
  { minPeople: 10000, discountPct: 50, label: "万人团",  badge: "👑 最高折扣" },
]

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG'
const HOT_DRAMAS = [
  { id: 1, title: "夜色温柔", genre: "都市爱情", views: "1.2亿", rating: 9.2, investors: 8432, cover: `${CDN}/drama2_23160c93.webp`, hot: true },
  { id: 2, title: "心动不回头", genre: "青春甜宠", views: "8800万", rating: 9.0, investors: 6218, cover: `${CDN}/drama1_5edaa483.webp`, hot: true },
  { id: 3, title: "冰霜未结", genre: "霸总虐恋", views: "6500万", rating: 8.8, investors: 4890, cover: `${CDN}/drama3_830d80e1.jpg`, hot: false },
  { id: 4, title: "婚夜燃尽", genre: "商战爱情", views: "5200万", rating: 8.7, investors: 3654, cover: `${CDN}/drama5_9cba5735.jpg`, hot: false },
]

const ONE_FACE_CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG'
const TOP_CREATORS = [
  { name: "林晓晴", platform: "抖音", followers: "234万", gmv: "¥128万", avatar: `${ONE_FACE_CDN}/7e2d963854cf7d37c5cba0b17645e19f_03e74458.jpg`, level: "钻石" },
  { name: "苏雅涵", platform: "小红书", followers: "89万", gmv: "¥56万", avatar: `${ONE_FACE_CDN}/f753cb84667615f0a6c20271f1fd6cd9_684be83f.webp`, level: "铂金" },
  { name: "陈梦瑶", platform: "微博", followers: "156万", gmv: "¥89万", avatar: `${ONE_FACE_CDN}/4ac48d56026dd3776746305d3bab9a9a_201383c5.jpg`, level: "钻石" },
]

function CountUp({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const step = end / 60
        const timer = setInterval(() => {
          start += step
          if (start >= end) { setCount(end); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'creator' | 'drama' | 'consume' | 'groupbuy'>('creator')
  const [demoCount, setDemoCount] = useState(2847)

  useEffect(() => {
    const timer = setInterval(() => setDemoCount(c => c + Math.floor(Math.random() * 3)), 2000)
    return () => clearInterval(timer)
  }, [])

  const matchedTiers = TIER_LADDER.filter(t => demoCount >= t.minPeople)
  const currentTier = matchedTiers.length > 0 ? matchedTiers[matchedTiers.length - 1] : TIER_LADDER[0]
  const nextTier = TIER_LADDER.find(t => demoCount < t.minPeople) ?? null
  const tierPct = nextTier ? Math.min(100, (demoCount / nextTier.minPeople) * 100) : 100

  return (
    <div style={{ minHeight: '100vh', background: '#0c0d10', color: '#f0f2f8', overflowX: 'hidden', fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(12,13,16,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <MaoLogo size={34} eyeInnerColor="#0c0d10" />
            <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg, #f6c90e, #ffd94a, #f6a800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>猫眼</span>
            <span style={{ color: '#5a6278', fontSize: 13 }}>maoyan.vip</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" style={{ fontSize: 14, color: '#9ba3b8', padding: '6px 12px', textDecoration: 'none' }}>登录</Link>
            <Link to="/register" style={{ fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', padding: '6px 16px', borderRadius: 99, textDecoration: 'none' }}>免费注册</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 128, paddingBottom: 80, padding: '128px 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'rgba(246,201,14,0.1)', border: '1px solid rgba(246,201,14,0.25)', color: '#f6c90e' }}>🐱 maoyan.vip</span>
              <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.25)', color: '#22d3a0' }}>✦ 已与 daiizen.com 打通</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 24 }}>
              <span style={{ background: 'linear-gradient(135deg, #f6c90e, #ffd94a, #f6a800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>要搞钱</span>，<br />
              来猫眼<br />
              <span style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, background: 'linear-gradient(135deg, #22d3a0, #4a9eff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💰 搞钱 · 🤝 社交 · 🌿 变美</span>
            </h1>
            <p style={{ color: '#9ba3b8', fontSize: 18, marginBottom: 32, lineHeight: 1.7 }}>
              三大板块，一个 App 搞定：<strong style={{ color: '#f6c90e' }}>搞钱</strong>（领任务发钱，自用省钱，分享赚钱）、<strong style={{ color: '#4a9eff' }}>社交</strong>（带你拍短剧，收费组局，网红见面）、<strong style={{ color: '#22d3a0' }}>变美</strong>（抗炎饮食，长寿规划）。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', fontWeight: 700, padding: '12px 24px', borderRadius: 99, fontSize: 14, textDecoration: 'none' }}>
                🚀 立即开始赚积分
              </Link>
              <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(246,201,14,0.3)', color: '#f6c90e', padding: '12px 24px', borderRadius: 99, fontSize: 14, textDecoration: 'none' }}>
                查看功能 ↓
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[{ val: 23000, suffix: '+', label: '活跃网红', prefix: '' }, { val: 4800, suffix: '万', label: '本月积分流水', prefix: '' }, { val: 98, suffix: '%', label: '结算准时率', prefix: '' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <CountUp end={s.val} suffix={s.suffix} prefix={s.prefix} />
                  </div>
                  <div style={{ fontSize: 12, color: '#5a6278', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Card */}
          <div style={{ background: '#14161c', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <img src={`${ONE_FACE_CDN}/7e2d963854cf7d37c5cba0b17645e19f_03e74458.jpg`} alt="林晓晴" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '2px solid #f6c90e' }} />
              <div>
                <div style={{ fontWeight: 600 }}>林晓晴</div>
                <div style={{ fontSize: 12, color: '#9ba3b8' }}>钻石达人 · 抖音 234万粉</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#9ba3b8' }}>本月收益</div>                <div style={{ color: '#22d3a0', fontWeight: 700 }}>+12,840分</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1c1f28, #0c0d10)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(246,201,14,0.15)' }}>
              <div style={{ fontSize: 12, color: '#5a6278', marginBottom: 4 }}>猫眼积分余额</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 12, background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>128,450</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[{ label: '今日获得', val: '+2,340', color: '#f6c90e', bg: 'rgba(246,201,14,0.08)' }, { label: '可消费商品', val: '1,284分', color: '#22d3a0', bg: 'rgba(34,211,160,0.08)' }, { label: '🐱小猫数量', val: '856只', color: '#9d6dff', bg: 'rgba(157,109,255,0.08)' }].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#9ba3b8', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
            {[{ icon: '📤', text: '朋友圈分享获得积分', val: '+125', color: '#22d3a0' }, { icon: '🛒', text: '团购成交佣金', val: '+580', color: '#f6c90e' }, { icon: '🎬', text: '短剧投资分红', val: '+320', color: '#9d6dff' }].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: '#9ba3b8', flex: 1 }}>{item.text}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Features */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>三大核心板块</h2>
            <p style={{ color: '#9ba3b8' }}>搞钱 · 社交 · 变美，每一个板块都是一条变现通道</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            {[{ key: 'creator', icon: '💳', label: '网红卡' }, { key: 'drama', icon: '🎬', label: '短剧投资' }, { key: 'consume', icon: '🧾', label: '消费积分' }, { key: 'groupbuy', icon: '👥', label: '万人团购' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none', ...(activeTab === tab.key ? { background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', boxShadow: '0 0 20px rgba(246,201,14,0.3)' } : { background: '#14161c', color: '#9ba3b8', border: '1px solid rgba(255,255,255,0.08)' }) }}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ background: '#14161c', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)', padding: 32 }}>

            {/* Creator Card */}
            {activeTab === 'creator' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#f6c90e', fontWeight: 600, marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase' }}>网红卡</div>
                  <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16, lineHeight: 1.3 }}>你的社交影响力<br /><span style={{ background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>变成实体名片</span></h3>
                  <p style={{ color: '#9ba3b8', marginBottom: 24, lineHeight: 1.7 }}>上传你的社交账号数据，生成专属网红名片。每次分享、朋友圈发布、群发推广，都能获得积分奖励，积分可兑换商品或领取小猫（积分不可提现）。</p>
                  {[{ icon: '📱', text: '支持抖音、小红书、微博、微信等全平台' }, { icon: '🐱', text: '朋友圈软广奖 5–25只小猫，社群交易奖 10–200只小猫' }, { icon: '🔗', text: '专属分享链接，追踪每一笔成交' }, { icon: '🏆', text: '五级达人体系：新手 → 银牌 → 金牌 → 铂金 → 钻石' }].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, color: '#9ba3b8' }}>{item.text}</span>
                    </div>
                  ))}
                  <Link to="/creator-card" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', fontWeight: 700, padding: '12px 24px', borderRadius: 99, fontSize: 14, textDecoration: 'none', marginTop: 24 }}>
                    立即申请网红卡 →
                  </Link>
                </div>
                <div>
                  <div style={{ background: 'linear-gradient(135deg, #92400e, #d97706, #b45309)', borderRadius: 16, padding: 24, marginBottom: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(ellipse at top right, white 0%, transparent 70%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                      <div><p style={{ fontSize: 11, letterSpacing: 1, opacity: 0.7 }}>猫眼 · MAOYAN.VIP</p><p style={{ fontSize: 14, fontWeight: 600 }}>黄金 网红卡</p></div>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 4, marginBottom: 16, opacity: 0.9 }}>•••• •••• •••• 8888</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div><p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>持卡人</p><p style={{ fontSize: 14, fontWeight: 500 }}>林晓晴</p></div>
                      <div style={{ textAlign: 'right' }}><p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>粉丝量</p><p style={{ fontSize: 14, fontWeight: 500 }}>234万</p></div>
                    </div>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.7 }}>
                      <span>本月积分 12,840</span><span>信任积分 128,450</span>
                    </div>
                  </div>
                  {TOP_CREATORS.map((c, i) => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1c1f28', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
                      <span style={{ color: '#f6c90e', fontWeight: 700, fontSize: 14, width: 20 }}>#{i + 1}</span>
                      <img src={c.avatar} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(246,201,14,0.4)' }} />
                      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: 12, color: '#5a6278' }}>{c.platform} · {c.followers}</div></div>
                      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, color: '#22d3a0' }}>{c.gmv}</div><div style={{ fontSize: 12, color: '#9ba3b8' }}>{c.level}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drama Tab */}
            {activeTab === 'drama' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ fontSize: 11, color: '#f066aa', fontWeight: 600, marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase' }}>短剧投资 · 出演 · 品牌植入</div>
                  <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>1元起投，<span style={{ background: 'linear-gradient(135deg, #f6c90e, #f066aa, #9d6dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>参与爆款短剧</span></h3>
                  <p style={{ color: '#9ba3b8' }}>投资短剧获得分红，或花 1000 元出演一个角色，品牌全程植入 50 万起</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {HOT_DRAMAS.map(drama => (
                    <div key={drama.id} style={{ background: '#1c1f28', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      {drama.hot && <div style={{ background: 'linear-gradient(135deg, #E53935, #f066aa)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px' }}>🔥 HOT</div>}
                      <div style={{ height: 160, overflow: 'hidden', background: '#0c0d10', borderRadius: '12px 12px 0 0' }}><img src={drama.cover} alt={drama.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} /></div>
                      <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, color: '#9d6dff', marginBottom: 4 }}>{drama.genre}</div>
                        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{drama.title}</div>
                        <div style={{ fontSize: 12, color: '#5a6278', marginBottom: 12 }}>{drama.views} · ⭐ {drama.rating}</div>
                        <Link to="/drama" style={{ display: 'block', width: '100%', textAlign: 'center', background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', fontSize: 12, fontWeight: 700, padding: '8px 0', borderRadius: 99, textDecoration: 'none' }}>¥1 起投资</Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#1c1f28', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>出演 & 品牌植入方案</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                    {[{ role: '群演', price: '¥1,000', desc: '出镜 3–5 秒，背景角色', icon: '🎭' }, { role: '配角', price: '¥5,000', desc: '有台词，出镜 1–3 分钟', icon: '🎬' }, { role: '主演', price: '¥50,000', desc: '核心角色，全程出镜', icon: '⭐' }, { role: '品牌植入', price: '¥500,000', desc: '全程品牌露出 + 剧情绑定', icon: '🏢' }].map(item => (
                      <div key={item.role} style={{ background: '#14161c', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.role}</div>
                        <div style={{ color: '#f6c90e', fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{item.price}</div>
                        <div style={{ fontSize: 12, color: '#5a6278' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Consume Tab */}
            {activeTab === 'consume' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#22d3a0', fontWeight: 600, marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase' }}>消费记录 → 积分</div>
                  <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16, lineHeight: 1.3 }}>你的购物记录<br /><span style={{ background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>价值连城</span></h3>
                  <p style={{ color: '#9ba3b8', marginBottom: 24, lineHeight: 1.7 }}>品牌方需要真实消费者数据。上传你在淘宝、京东等平台的真实购物截图，附上点评，即可获得积分奖励。</p>
                  {[{ tier: '基础上传', desc: '仅截图，无点评', reward: '+50 积分', color: '#9ba3b8' }, { tier: '标准点评', desc: '截图 + 50字以上点评', reward: '+150 积分', color: '#f6c90e' }, { tier: '深度调研', desc: '截图 + 200字以上详细分析', reward: '+500 积分', color: '#22d3a0' }, { tier: '品类专家', desc: '同品类 5 条以上对比分析', reward: '+2000 积分', color: '#9d6dff' }].map(item => (
                    <div key={item.tier} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1c1f28', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: item.color }} />
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{item.tier}</div><div style={{ fontSize: 12, color: '#5a6278' }}>{item.desc}</div></div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: item.color }}>{item.reward}</div>
                    </div>
                  ))}
                  <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #22d3a0, #00b894)', color: '#000', fontWeight: 700, padding: '12px 24px', borderRadius: 99, fontSize: 14, textDecoration: 'none', marginTop: 24 }}>上传消费记录赚积分 →</Link>
                </div>
                <div style={{ background: '#1c1f28', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 16 }}>上传示例</h4>
                  <div style={{ border: '2px dashed rgba(246,201,14,0.3)', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                    <div style={{ fontSize: 14, color: '#9ba3b8', marginBottom: 8 }}>拖拽或点击上传购物截图</div>
                    <div style={{ fontSize: 12, color: '#5a6278' }}>支持淘宝、京东、拼多多、美团等平台截图</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#9ba3b8', display: 'block', marginBottom: 8 }}>购买平台</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['淘宝', '京东', '拼多多', '美团', '饿了么', '其他'].map(p => (
                        <button key={p} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, background: '#14161c', border: '1px solid rgba(255,255,255,0.08)', color: '#9ba3b8', cursor: 'pointer' }}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#9ba3b8', display: 'block', marginBottom: 8 }}>你的点评（越详细积分越多）</label>
                    <textarea style={{ width: '100%', background: '#14161c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, fontSize: 14, color: '#f0f2f8', resize: 'none', height: 96, fontFamily: 'inherit' }} placeholder="说说你为什么买这个产品？用了之后感觉怎么样？" />
                  </div>
                  <button style={{ width: '100%', background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', fontWeight: 700, padding: '12px 0', borderRadius: 12, fontSize: 14, cursor: 'pointer', border: 'none' }}>提交获取积分</button>
                </div>
              </div>
            )}

            {/* GroupBuy Tab */}
            {activeTab === 'groupbuy' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ fontSize: 11, color: '#9d6dff', fontWeight: 600, marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase' }}>万人团购 · 拼多多模式</div>
                  <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>人越多，<span style={{ background: 'linear-gradient(135deg, #f6c90e, #f066aa, #9d6dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>折扣越大</span></h3>
                  <p style={{ color: '#9ba3b8' }}>11 级折扣阶梯，从 5% 到 50%，邀请越多人，大家都受益</p>
                </div>
                <div style={{ background: '#1c1f28', borderRadius: 16, padding: 24, border: '1px solid rgba(246,201,14,0.15)', marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#9ba3b8' }}>当前参团人数（实时）</div>
                      <div style={{ fontSize: 40, fontWeight: 900, background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{demoCount.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#9ba3b8' }}>当前折扣</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: '#22d3a0' }}>{currentTier.discountPct}% OFF</div>
                    </div>
                  </div>
                  <div style={{ background: '#14161c', borderRadius: 12, padding: 16, border: '1px solid rgba(246,201,14,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: '#9ba3b8' }}>当前：<span style={{ color: '#f6c90e', fontWeight: 700 }}>{currentTier.label}</span> · 享 <span style={{ color: '#22d3a0', fontWeight: 700 }}>{currentTier.discountPct}% 折扣</span></span>
                      {nextTier && <span style={{ fontSize: 12, color: '#5a6278' }}>再邀 {nextTier.minPeople - demoCount} 人解锁 {nextTier.discountPct}% 折扣</span>}
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#1c1f28', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, transition: 'width 1s', width: `${tierPct}%`, background: 'linear-gradient(90deg, #f6c90e, #ffd94a)' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 32 }}>
                  {TIER_LADDER.map((tier, i) => {
                    const active = demoCount >= tier.minPeople
                    return (
                      <div key={i} style={{ borderRadius: 12, padding: 12, textAlign: 'center', border: `1px solid ${active ? 'rgba(246,201,14,0.4)' : 'rgba(255,255,255,0.06)'}`, background: active ? 'rgba(246,201,14,0.1)' : '#1c1f28' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, ...(active ? { background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#5a6278' }) }}>{tier.discountPct}%</div>
                        <div style={{ fontSize: 12, marginTop: 4, color: active ? '#f6c90e' : '#5a6278' }}>{tier.label}</div>
                        {tier.badge && <div style={{ fontSize: 11, marginTop: 4, color: '#9d6dff' }}>{tier.badge}</div>}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                  {[{ icon: '💬', label: '分享到微信', color: '#22d3a0' }, { icon: '🐦', label: '分享到微博', color: '#f6c90e' }, { icon: '✈️', label: '分享到 Telegram', color: '#4a9eff' }].map(btn => (
                    <button key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99, border: `1px solid ${btn.color}40`, color: btn.color, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'transparent' }}>
                      <span>{btn.icon}</span><span>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hot Drama Section */}
      <section id="drama-section" style={{ padding: '80px 24px', background: '#0a0b0e' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>🎬 最近最火短剧</h2>
          <p style={{ color: '#9ba3b8', marginBottom: 40 }}>1元起投，参与短剧分红；1000元起，出演即将上映的角色</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {HOT_DRAMAS.map(drama => (
              <div key={drama.id} style={{ background: '#14161c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', transition: 'all 0.2s' }}>
                {drama.hot && <div style={{ background: 'linear-gradient(135deg, #E53935, #f066aa)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px' }}>🔥 HOT</div>}
                <div style={{ height: 144, overflow: 'hidden', background: '#0c0d10' }}><img src={drama.cover} alt={drama.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} /></div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: '#9d6dff', marginBottom: 4 }}>{drama.genre}</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{drama.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5a6278', marginBottom: 16 }}>
                    <span>👁 {drama.views}</span><span>⭐ {drama.rating}</span><span>👥 {drama.investors.toLocaleString()}人</span>
                  </div>
                  <Link to="/drama" style={{ display: 'block', width: '100%', textAlign: 'center', background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', fontWeight: 700, padding: '10px 0', borderRadius: 99, fontSize: 14, textDecoration: 'none' }}>¥1 起投资</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/drama" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(246,201,14,0.3)', color: '#f6c90e', padding: '12px 24px', borderRadius: 99, fontSize: 14, textDecoration: 'none' }}>查看全部短剧 →</Link>
          </div>
        </div>
      </section>

      {/* Creator Leaderboard */}
      <section id="creator" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>🏆 达人排行榜</h2>
            <p style={{ color: '#9ba3b8' }}>本月最赚钱的网红达人</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {TOP_CREATORS.map((c, i) => (
              <div key={c.name} style={{ background: '#14161c', borderRadius: 16, padding: 24, border: `1px solid ${i === 0 ? 'rgba(246,201,14,0.4)' : 'rgba(255,255,255,0.06)'}`, ...(i === 0 ? { boxShadow: '0 0 30px rgba(246,201,14,0.1)' } : {}) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, ...(i === 0 ? { background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : { color: '#5a6278' }) }}>#{i + 1}</div>
                  <img src={c.avatar} alt={c.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(246,201,14,0.4)' }} />
                  <div><div style={{ fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 12, color: '#9ba3b8' }}>{c.platform} · {c.level}</div></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#1c1f28', borderRadius: 12, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 12, color: '#5a6278', marginBottom: 4 }}>粉丝量</div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.followers}</div></div>
                  <div style={{ background: '#1c1f28', borderRadius: 12, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 12, color: '#5a6278', marginBottom: 4 }}>本月GMV</div><div style={{ fontWeight: 700, fontSize: 14, color: '#22d3a0' }}>{c.gmv}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 768, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #14161c, #1c1f28)', borderRadius: 24, padding: 64, border: '1px solid rgba(246,201,14,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(246,201,14,0.05) 0%, transparent 70%)' }} />
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16, position: 'relative', zIndex: 1 }}>
              现在加入，<span style={{ background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>立得 500 积分</span>
            </h2>
            <p style={{ color: '#9ba3b8', marginBottom: 32, position: 'relative', zIndex: 1 }}>注册即送 500 积分，邀请好友再得 200 积分/人，无上限</p>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f6c90e, #f6a800)', color: '#000', fontWeight: 900, padding: '16px 32px', borderRadius: 99, fontSize: 18, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
              🚀 免费注册，立领积分
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f6c90e, #f6a800)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 12 }}>猫</div>
            <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, #f6c90e, #ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>猫眼</span>
            <span style={{ color: '#5a6278', fontSize: 13 }}>maoyan.vip</span>
          </div>
          <div style={{ fontSize: 12, color: '#5a6278', textAlign: 'center' }}>
            数据与 <a href="https://daiizen.com" style={{ color: '#f6c90e' }}>daiizen.com</a> 互通 · Powered by <span style={{ color: '#9d6dff' }}>猫眼品牌管理</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#5a6278' }}>
            <a href="#" style={{ color: '#5a6278', textDecoration: 'none' }}>隐私政策</a>
            <a href="#" style={{ color: '#5a6278', textDecoration: 'none' }}>服务条款</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
