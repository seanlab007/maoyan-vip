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

const TOP_CREATORS = [
  { name: "林晓晴", platform: "抖音", followers: "234万", gmv: "¥128万", avatar: `${CDN}/7e2d963854cf7d37c5cba0b17645e19f_03e74458.jpg`, level: "钻石" },
  { name: "苏雅涵", platform: "小红书", followers: "89万", gmv: "¥56万", avatar: `${CDN}/f753cb84667615f0a6c20271f1fd6cd9_684be83f.webp`, level: "铂金" },
  { name: "陈梦瑶", platform: "微博", followers: "156万", gmv: "¥89万", avatar: `${CDN}/4ac48d56026dd3776746305d3bab9a9a_201383c5.jpg`, level: "钻石" },
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
    <div style={{ minHeight: '100vh', background: 'var(--white)', color: 'var(--black)', overflowX: 'hidden', fontFamily: "'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--white)', borderBottom: '1px solid var(--gray-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <MaoLogo size={36} eyeInnerColor="#ffffff" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--navy)', letterSpacing: '2px', textTransform: 'uppercase' }}>MAOYAN</span>
              <span style={{ color: 'var(--gray-light)', fontSize: 10, letterSpacing: '1px' }}>maoyan.vip</span>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--gray-mid)', padding: '8px 16px', textDecoration: 'none', fontWeight: 500, letterSpacing: '1px' }}>登录</Link>
            <Link to="/register" style={{ fontSize: 13, fontWeight: 600, background: 'var(--navy)', color: 'var(--white)', padding: '8px 20px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', border: '1px solid var(--navy)' }}>免费注册</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section style={{ paddingTop: 140, paddingBottom: 100, padding: '140px 40px 100px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left Content */}
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <span style={{ fontSize: 11, padding: '6px 14px', borderRadius: 2, background: 'var(--navy)', color: 'var(--white)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>🐱 新产品</span>
              <span style={{ fontSize: 11, padding: '6px 14px', borderRadius: 2, background: 'var(--off-white)', color: 'var(--navy)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>✦ 已与 daiizen 打通</span>
            </div>

            <h1 style={{ fontSize: 64, fontWeight: 400, lineHeight: 1.1, marginBottom: 32, color: 'var(--black)', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>
              要搞钱<br />
              来猫眼
            </h1>

            <p style={{ color: 'var(--gray-mid)', fontSize: 16, marginBottom: 40, lineHeight: 1.8, maxWidth: 520 }}>
              三大板块，一个 App 搞定：<strong style={{ color: 'var(--navy)' }}>搞钱</strong>（领任务发钱，自用省钱，分享赚钱）、<strong style={{ color: 'var(--navy)' }}>社交</strong>（带你拍短剧，收费组局，网红见面）、<strong style={{ color: 'var(--navy)' }}>变美</strong>（抗炎饮食，长寿规划）。
            </p>

            <div style={{ display: 'flex', gap: 20, marginBottom: 48 }}>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--navy)', color: 'var(--white)', fontWeight: 600, padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', letterSpacing: '1px', border: '1px solid var(--navy)' }}>
                🚀 立即开始赚积分
              </Link>
              <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--navy)', color: 'var(--navy)', padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', fontWeight: 600, letterSpacing: '1px' }}>
                查看功能 ↓
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {[{ val: 23000, suffix: '+', label: '活跃网红' }, { val: 4800, suffix: '万', label: '本月积分流水' }, { val: 98, suffix: '%', label: '结算准时率' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>
                    <CountUp end={s.val} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-light)', letterSpacing: '0.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card */}
          <div style={{ background: 'var(--off-white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <img src={`${TOP_CREATORS[0].avatar}`} alt="林晓晴" style={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover', border: '1px solid var(--gray-border)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--black)' }}>林晓晴</div>
                <div style={{ fontSize: 12, color: 'var(--gray-light)', marginTop: 2 }}>钻石达人 · 抖音 234万粉</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-light)', marginBottom: 4 }}>本月收益</div>
                <div style={{ color: 'var(--navy)', fontWeight: 600, fontSize: 14 }}>+12,840分</div>
              </div>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-light)', marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>猫眼积分余额</div>
              <div style={{ fontSize: 40, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>128,450</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[{ label: '今日获得', val: '+2,340', bg: 'rgba(18,40,73,0.08)' }, { label: '可消费商品', val: '1,284分', bg: 'rgba(18,40,73,0.05)' }, { label: '小猫数量', val: '856只', bg: 'rgba(18,40,73,0.08)' }].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 3, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--gray-light)', marginBottom: 4, letterSpacing: '0.5px' }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)' }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {[{ icon: '📤', text: '朋友圈分享获得积分', val: '+125' }, { icon: '🛒', text: '团购成交佣金', val: '+580' }, { icon: '🎬', text: '短剧投资分红', val: '+320' }].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gray-border)' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--gray-mid)', flex: 1 }}>{item.text}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" style={{ padding: '100px 40px', background: 'var(--off-white)', borderTop: '1px solid var(--gray-border)', borderBottom: '1px solid var(--gray-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 42, fontWeight: 400, marginBottom: 16, color: 'var(--black)', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>三大核心板块</h2>
            <p style={{ color: 'var(--gray-mid)', fontSize: 14, letterSpacing: '0.5px' }}>搞钱 · 社交 · 变美，每一个板块都是一条变现通道</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
            {[{ key: 'creator', icon: '💳', label: '网红卡' }, { key: 'drama', icon: '🎬', label: '短剧投资' }, { key: 'consume', icon: '🧾', label: '消费积分' }, { key: 'groupbuy', icon: '👥', label: '万人团购' }].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '10px 20px', 
                  borderRadius: 2, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  border: '1px solid var(--gray-border)',
                  background: activeTab === tab.key ? 'var(--navy)' : 'var(--white)',
                  color: activeTab === tab.key ? 'var(--white)' : 'var(--black)',
                  letterSpacing: '0.5px'
                }}
              >
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: 48 }}>
            {/* Creator Tab */}
            {activeTab === 'creator' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--navy)', fontWeight: 600, marginBottom: 16, letterSpacing: '2px', textTransform: 'uppercase' }}>网红卡</div>
                  <h3 style={{ fontSize: 32, fontWeight: 400, marginBottom: 20, lineHeight: 1.3, fontFamily: "'Playfair Display', serif", color: 'var(--black)', letterSpacing: '1px' }}>你的社交影响力<br />变成实体名片</h3>
                  <p style={{ color: 'var(--gray-mid)', marginBottom: 28, lineHeight: 1.8 }}>上传你的社交账号数据，生成专属网红名片。每次分享、朋友圈发布、群发推广，都能获得积分奖励。</p>
                  {[{ icon: '📱', text: '支持抖音、小红书、微博、微信等全平台' }, { icon: '🐱', text: '朋友圈软广奖 5–25只小猫，社群交易奖 10–200只小猫' }, { icon: '🔗', text: '专属分享链接，追踪每一笔成交' }, { icon: '🏆', text: '五级达人体系：新手 → 银牌 → 金牌 → 铂金 → 钻石' }].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--gray-mid)', lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  ))}
                  <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--navy)', color: 'var(--white)', fontWeight: 600, padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', marginTop: 28, letterSpacing: '1px', border: '1px solid var(--navy)' }}>
                    立即申请网红卡 →
                  </Link>
                </div>
                <div style={{ background: 'var(--navy)', borderRadius: 4, padding: 32, color: 'var(--white)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: 'radial-gradient(ellipse at top right, white 0%, transparent 70%)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: '2px', opacity: 0.7, textTransform: 'uppercase' }}>猫眼 · MAOYAN.VIP</p>
                      <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>黄金 网红卡</p>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 2, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '4px', marginBottom: 24, opacity: 0.9 }}>•••• •••• •••• 8888</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                      <p style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>持卡人</p>
                      <p style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>林晓晴</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>粉丝量</p>
                      <p style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>234万</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.7 }}>
                    <span>本月积分 12,840</span><span>信任积分 128,450</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drama Tab */}
            {activeTab === 'drama' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 10, color: 'var(--navy)', fontWeight: 600, marginBottom: 16, letterSpacing: '2px', textTransform: 'uppercase' }}>短剧投资 · 出演 · 品牌植入</div>
                  <h3 style={{ fontSize: 32, fontWeight: 400, marginBottom: 12, fontFamily: "'Playfair Display', serif", color: 'var(--black)', letterSpacing: '1px' }}>1元起投，参与爆款短剧</h3>
                  <p style={{ color: 'var(--gray-mid)', fontSize: 14 }}>投资短剧获得分红，或花 1000 元出演一个角色</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
                  {HOT_DRAMAS.map(drama => (
                    <div key={drama.id} style={{ background: 'var(--off-white)', border: '1px solid var(--gray-border)', borderRadius: 4, overflow: 'hidden' }}>
                      {drama.hot && <div style={{ background: 'var(--navy)', color: 'var(--white)', fontSize: 11, fontWeight: 600, padding: '4px 12px' }}>🔥 HOT</div>}
                      <div style={{ height: 140, overflow: 'hidden', background: 'var(--navy)' }}><img src={drama.cover} alt={drama.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                      <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 11, color: 'var(--navy)', marginBottom: 4, fontWeight: 600 }}>{drama.genre}</div>
                        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: 'var(--black)' }}>{drama.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-light)', marginBottom: 12 }}>{drama.views} · ⭐ {drama.rating}</div>
                        <Link to="/drama" style={{ display: 'block', width: '100%', textAlign: 'center', background: 'var(--navy)', color: 'var(--white)', fontSize: 11, fontWeight: 600, padding: '8px 0', borderRadius: 2, textDecoration: 'none' }}>¥1 起投资</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consume Tab */}
            {activeTab === 'consume' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--navy)', fontWeight: 600, marginBottom: 16, letterSpacing: '2px', textTransform: 'uppercase' }}>消费记录 → 积分</div>
                  <h3 style={{ fontSize: 32, fontWeight: 400, marginBottom: 20, lineHeight: 1.3, fontFamily: "'Playfair Display', serif", color: 'var(--black)', letterSpacing: '1px' }}>你的购物记录<br />价值连城</h3>
                  <p style={{ color: 'var(--gray-mid)', marginBottom: 28, lineHeight: 1.8 }}>品牌方需要真实消费者数据。上传你在淘宝、京东等平台的真实购物截图，附上点评，即可获得积分奖励。</p>
                  <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--navy)', color: 'var(--white)', fontWeight: 600, padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', letterSpacing: '1px', border: '1px solid var(--navy)' }}>
                    上传消费记录赚积分 →
                  </Link>
                </div>
                <div style={{ background: 'var(--off-white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: 24 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 20, fontSize: 13, color: 'var(--black)' }}>上传示例</h4>
                  <div style={{ border: '2px dashed var(--gray-border)', borderRadius: 4, padding: 32, textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginBottom: 8 }}>拖拽或点击上传购物截图</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-light)' }}>支持淘宝、京东、拼多多、美团等平台</div>
                  </div>
                </div>
              </div>
            )}

            {/* GroupBuy Tab */}
            {activeTab === 'groupbuy' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 10, color: 'var(--navy)', fontWeight: 600, marginBottom: 16, letterSpacing: '2px', textTransform: 'uppercase' }}>万人团购 · 拼多多模式</div>
                  <h3 style={{ fontSize: 32, fontWeight: 400, marginBottom: 12, fontFamily: "'Playfair Display', serif", color: 'var(--black)', letterSpacing: '1px' }}>人越多，折扣越大</h3>
                  <p style={{ color: 'var(--gray-mid)', fontSize: 14 }}>11 级折扣阶梯，从 5% 到 50%，邀请越多人，大家都受益</p>
                </div>
                <div style={{ background: 'var(--off-white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: 24, marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--gray-light)', marginBottom: 8 }}>当前参团人数（实时）</div>
                      <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--navy)' }}>{demoCount.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--gray-light)', marginBottom: 8 }}>当前折扣</div>
                      <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--navy)' }}>{currentTier.discountPct}% OFF</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--white)', borderRadius: 3, padding: 16, border: '1px solid var(--gray-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 13 }}>
                      <span style={{ color: 'var(--gray-mid)' }}>当前：<span style={{ color: 'var(--navy)', fontWeight: 600 }}>{currentTier.label}</span> · 享 <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{currentTier.discountPct}% 折扣</span></span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--gray-border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, transition: 'width 1s', width: `${tierPct}%`, background: 'var(--navy)' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                  {TIER_LADDER.map((tier, i) => {
                    const active = demoCount >= tier.minPeople
                    return (
                      <div key={i} style={{ borderRadius: 3, padding: 16, textAlign: 'center', border: `1px solid ${active ? 'var(--navy)' : 'var(--gray-border)'}`, background: active ? 'var(--navy)' : 'var(--off-white)' }}>
                        <div style={{ fontSize: 20, fontWeight: 600, color: active ? 'var(--white)' : 'var(--gray-mid)', marginBottom: 4 }}>{tier.discountPct}%</div>
                        <div style={{ fontSize: 11, color: active ? 'var(--white)' : 'var(--gray-light)', fontWeight: 500 }}>{tier.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{ padding: '100px 40px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 768, margin: '0 auto', textAlign: 'center', background: 'var(--navy)', borderRadius: 4, padding: 64, color: 'var(--white)' }}>
          <h2 style={{ fontSize: 40, fontWeight: 400, marginBottom: 20, fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>准备好赚积分了吗？</h2>
          <p style={{ fontSize: 14, marginBottom: 32, lineHeight: 1.8, opacity: 0.9 }}>加入 23,000+ 活跃网红，每月赚取积分。无需投资，无需风险。</p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--white)', color: 'var(--navy)', fontWeight: 600, padding: '12px 32px', borderRadius: 2, fontSize: 13, textDecoration: 'none', letterSpacing: '1px', border: '1px solid var(--white)' }}>
            🚀 免费注册开始赚钱
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '48px 40px', background: 'var(--off-white)', borderTop: '1px solid var(--gray-border)', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <MaoLogo size={32} eyeInnerColor="#ffffff" />
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', letterSpacing: '2px', textTransform: 'uppercase' }}>MAOYAN</span>
          </div>
          <p style={{ color: 'var(--gray-light)', fontSize: 12, marginBottom: 16, letterSpacing: '0.5px' }}>© 2026 Maoyan VIP. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12 }}>
            <a href="#" style={{ color: 'var(--gray-mid)', textDecoration: 'none' }}>服务条款</a>
            <a href="#" style={{ color: 'var(--gray-mid)', textDecoration: 'none' }}>隐私政策</a>
            <a href="#" style={{ color: 'var(--gray-mid)', textDecoration: 'none' }}>联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
