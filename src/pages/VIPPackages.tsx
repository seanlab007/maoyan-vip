import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

interface Package {
  id: string
  name: string
  tagline: string
  price: number
  originalPrice?: number
  color: string
  gradient: string
  badge: string
  badgeColor: string
  icon: string
  points: number
  products: { icon: string; title: string; desc: string }[]
  services: { icon: string; title: string; desc: string }[]
  pointsUse: string[]
  highlight: string
  tag?: string
}

const packages: Package[] = [
  {
    id: 'mama',
    name: '宝妈·省心守护',
    tagline: '黑金包',
    price: 4999,
    color: '#f6c90e',
    gradient: 'linear-gradient(135deg,#1a1200,#2d1f00)',
    badge: '黑金',
    badgeColor: '#f6c90e',
    icon: '👶',
    points: 10000,
    tag: '最受欢迎',
    highlight: '24个月每月1元换购纸尿裤/奶粉',
    products: [
      { icon: '🍼', title: '1元月卡', desc: '未来24个月，每月1元换购一箱指定品牌纸尿裤（市价约¥150）或3段奶粉（保质期≥6个月）' },
      { icon: '🧻', title: '日常6折专享', desc: '全年享棉柔巾、湿巾、宝宝洗护等品类6折专享价' },
    ],
    services: [
      { icon: '🎁', title: '立即获赠10,000积分', desc: '可兑换亲子艺术照、宝宝短剧角色体验、高端临期辅食等' },
      { icon: '👩‍👩‍👧', title: '妈妈团专属社群', desc: '网红母婴博主定期答疑，ONE FACE照片2张' },
      { icon: '📸', title: '宝宝成长档案', desc: '云端永久存储+年度电子纪念册，免费' },
    ],
    pointsUse: ['兑换亲子艺术照拍摄', '宝宝短剧角色体验', '兑换高端临期辅食'],
  },
  {
    id: 'lady',
    name: '精致女性·美力投资',
    tagline: '白金包',
    price: 3999,
    color: '#e0aaff',
    gradient: 'linear-gradient(135deg,#0d0020,#1a0035)',
    badge: '白金',
    badgeColor: '#e0aaff',
    icon: '💄',
    points: 8000,
    highlight: 'SK-II/雅诗兰黛/兰蔻临期美妆5折，全年限购24件',
    products: [
      { icon: '✨', title: '大牌5折特价', desc: 'SK-II、雅诗兰黛、兰蔻等临期美妆（保质期≥1年），全年限购24件' },
      { icon: '💎', title: '颜值好物7折', desc: '网红推荐美容仪、饰品等，享7折会员价' },
    ],
    services: [
      { icon: '🎁', title: '立即获赠8,000积分', desc: '可兑换网红一对一咨询、短剧投资份额、高端护肤品' },
      { icon: '📷', title: '每年2次形象照', desc: '免费专业形象照拍摄，获"认证女神"主页标识' },
      { icon: '🎬', title: '短剧联合投资人', desc: '用积分兑换热门短剧份额，享收益分红' },
      { icon: '🌟', title: '网红私密粉丝圈', desc: '解锁网红私密粉丝圈，参与线上主题派对' },
    ],
    pointsUse: ['网红一对一咨询', '短剧投资份额', '兑换高端临期护肤品'],
  },
  {
    id: 'man',
    name: '新中产男性·智趣生活',
    tagline: '铂金包',
    price: 2999,
    color: '#4af0ff',
    gradient: 'linear-gradient(135deg,#001520,#002535)',
    badge: '铂金',
    badgeColor: '#4af0ff',
    icon: '🥃',
    points: 6000,
    highlight: '每月1元男士生活盲盒（价值≥¥150）',
    products: [
      { icon: '🎁', title: '月度盲盒1元购', desc: '每月1元获"男士生活盲盒"（临期高端零食、护肤品、科技配件等，价值≥¥150）' },
      { icon: '🍺', title: '品味精选6折', desc: '精选临期精酿啤酒、威士忌、咖啡豆等，享6折会员价' },
    ],
    services: [
      { icon: '🎁', title: '立即获赠6,000积分', desc: '可兑换短剧投资份额、线下活动名额、高端临期数码产品' },
      { icon: '📈', title: '短剧投资社群', desc: '获取项目信息，与主创交流，优先参与投资' },
      { icon: '🏅', title: '"生活家"认证', desc: '平台认证徽章，优先参与品酒会、剧本杀等线下活动' },
    ],
    pointsUse: ['兑换短剧投资份额', '兑换线下活动名额', '兑换高端临期数码产品'],
  },
  {
    id: 'girl',
    name: '女大学生·颜值充电',
    tagline: '校园包',
    price: 999,
    color: '#ff8fab',
    gradient: 'linear-gradient(135deg,#200010,#35001a)',
    badge: '校园',
    badgeColor: '#ff8fab',
    icon: '🎀',
    points: 1500,
    tag: '学生专属',
    highlight: '每月4次1分钱兑换大牌美妆小样',
    products: [
      { icon: '💅', title: '大牌小样1分钱', desc: '每月1分钱兑换大牌美妆/护肤品小样，每月限4次' },
      { icon: '💄', title: '国货彩妆5折', desc: '完美日记、Colorkey等国货临期彩妆专享5折' },
    ],
    services: [
      { icon: '🎁', title: '立即获赠1,500积分', desc: '可兑换美妆教程课、短剧群演体验、网红同款临期服饰' },
      { icon: '✅', title: '成长任务赚积分', desc: '穿搭打卡等任务赚额外积分，兑换"学姐形象课"' },
      { icon: '🎬', title: '短剧群演机会', desc: '可获得短剧剧组群演、现场观摩机会' },
      { icon: '💼', title: '实习内推资格', desc: '优秀会员可获得平台或合作MCN的实习内推资格' },
    ],
    pointsUse: ['兑换美妆教程课', '短剧群演体验', '兑换网红同款临期服饰'],
  },
  {
    id: 'boy',
    name: '男大学生·破局玩家',
    tagline: '校园包',
    price: 666,
    color: '#69ff7a',
    gradient: 'linear-gradient(135deg,#001500,#002500)',
    badge: '校园',
    badgeColor: '#69ff7a',
    icon: '🎮',
    points: 1000,
    tag: '最低门槛',
    highlight: '积分直接兑换热门游戏皮肤',
    products: [
      { icon: '⚡', title: '能量包1元抢购', desc: '每月1元抢购"临期游戏零食能量包"（泡面、饮料、零食）' },
      { icon: '📱', title: '数码周边6折', desc: '手机壳、数据线、键鼠等临期数码周边，享6折' },
    ],
    services: [
      { icon: '🎁', title: '立即获赠1,000积分', desc: '可兑换游戏皮肤、短剧最低门槛投资份额、限量临期潮玩' },
      { icon: '🎮', title: '游戏皮肤直兑', desc: '积分直接兑换热门游戏皮肤（与渠道合作采购）' },
      { icon: '🏆', title: '校园达人社群', desc: '线上游戏赛、剧本杀，承接剪辑/文案任务赚积分' },
    ],
    pointsUse: ['兑换游戏皮肤', '短剧最低门槛投资份额', '兑换限量临期潮玩'],
  },
]

export default function VIPPackages() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState<Package | null>(null)

  const handleBuy = (pkg: Package) => {
    toast.success(`🎉 已选择【${pkg.name}】，储值金 ¥${pkg.price}，7天无理由退款保障`, { duration: 3000 })
    setShowDetail(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 20px', textAlign: 'center', background: 'linear-gradient(180deg,rgba(246,201,14,0.08) 0%,transparent 100%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(246,201,14,0.1)', border: '1px solid rgba(246,201,14,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: 'var(--gold)', marginBottom: 12 }}>
          🐱 终身会员权益包
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.2 }}>
          自用省钱<br /><span style={{ background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>分享赚钱</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text3)', margin: 0, lineHeight: 1.6 }}>
          储值金模式 · 7天无理由退款 · 积分只可消费不可提现
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          {['储值金可退', '7天冷静期', '积分不过期', '专属社群'].map(tag => (
            <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 12, padding: '3px 10px', fontSize: 11, color: 'var(--text3)' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Package Cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {packages.map(pkg => (
          <div
            key={pkg.id}
            onClick={() => setShowDetail(pkg)}
            style={{
              background: pkg.gradient,
              border: `1px solid ${pkg.color}40`,
              borderRadius: 18,
              padding: '20px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.15s',
            }}
          >
            {/* Tag */}
            {pkg.tag && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: pkg.color, color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
                {pkg.tag}
              </div>
            )}
            {/* Badge glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: pkg.color, opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${pkg.color}20`, border: `1px solid ${pkg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {pkg.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{pkg.name}</span>
                  <span style={{ background: pkg.color, color: '#000', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 8 }}>{pkg.badge}</span>
                </div>
                <div style={{ fontSize: 12, color: pkg.color, marginBottom: 8, opacity: 0.9 }}>✦ {pkg.highlight}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: pkg.color }}>¥{pkg.price.toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>储值金</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  立赠 {pkg.points.toLocaleString()} 积分 · 7天无理由退款
                </div>
              </div>
            </div>

            {/* Quick benefits preview */}
            <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {pkg.products.slice(0, 2).map((p, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${pkg.color}30`, borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  {p.icon} {p.title}
                </span>
              ))}
              {pkg.services.slice(0, 1).map((s, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${pkg.color}30`, borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  {s.icon} {s.title}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>点击查看完整权益 →</span>
              <button
                onClick={e => { e.stopPropagation(); handleBuy(pkg) }}
                style={{ background: pkg.color, color: '#000', border: 'none', borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                立即购买
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rules Footer */}
      <div style={{ margin: '20px 16px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10 }}>📋 通用规则说明</div>
        {[
          '本权益包为"终身会员资格"，支付金额为储值金，支持随时按余额退款',
          '所赠积分仅限本平台消费，不可提现、不可转让、不可退款',
          '购买后享有7天无理由退款权利（冷静期）',
          '所有"1元购"商品均为指定临期品或库存品，具体商品以每月实际推送为准',
        ].map((rule, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <span style={{ color: 'var(--gold)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>·</span>
            <span style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{rule}</span>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          onClick={() => setShowDetail(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: 'var(--card)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${showDetail.color}20`, border: `1px solid ${showDetail.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {showDetail.icon}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{showDetail.name}</div>
                <div style={{ fontSize: 13, color: showDetail.color }}>¥{showDetail.price.toLocaleString()} 储值金 · 立赠 {showDetail.points.toLocaleString()} 积分</div>
              </div>
            </div>

            {/* Products */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: showDetail.color, color: '#000', borderRadius: 6, padding: '1px 8px', fontSize: 11 }}>商品权益</span>
              </div>
              {showDetail.products.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Services */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10 }}>
                <span style={{ background: showDetail.color, color: '#000', borderRadius: 6, padding: '1px 8px', fontSize: 11 }}>服务与社交权益</span>
              </div>
              {showDetail.services.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Points use */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>
                <span style={{ background: showDetail.color, color: '#000', borderRadius: 6, padding: '1px 8px', fontSize: 11 }}>积分消费建议</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {showDetail.pointsUse.map((u, i) => (
                  <span key={i} style={{ background: `${showDetail.color}15`, border: `1px solid ${showDetail.color}40`, borderRadius: 10, padding: '5px 12px', fontSize: 12, color: showDetail.color }}>
                    🐱 {u}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleBuy(showDetail)}
              style={{ width: '100%', background: showDetail.color, color: '#000', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer' }}
            >
              立即购买 · 储值金 ¥{showDetail.price.toLocaleString()}
            </button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
              7天无理由退款 · 积分不可提现
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
