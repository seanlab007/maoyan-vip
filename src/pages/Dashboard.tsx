import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getTransactions, dailyCheckin } from '@/api/wallet'
import type { Transaction } from '@/types/database'
import { LEVEL_CONFIG } from '@/types/database'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'

// ===== 搞钱任务（全部解锁）=====
const TASK_GROUPS = [
  {
    id: 'basic',
    title: '🌱 基础任务',
    subtitle: '每天都能做，稳定积累',
    tasks: [
      { id:'checkin', icon:'📅', title:'每日签到', desc:'连续签到最高 50 积分/天，坚持打卡有惊喜', reward:'+10~50', color:'#22d3a0', path:null, unlocked:true },
      { id:'consumption', icon:'📸', title:'上传消费记录', desc:'上传微信/支付宝/淘宝/京东购物截图获得积分', reward:'+50~200', color:'#4a9eff', path:'/consumption-points', unlocked:true },
      { id:'review', icon:'✍️', title:'商品真实评测', desc:'写自用商品详细评测，帮助其他用户决策', reward:'+100', color:'#ff9800', path:'/consumption-points', unlocked:true },
    ]
  },
  {
    id: 'social',
    title: '📣 分享赚钱',
    subtitle: '自用省钱，分享赚钱',
    tasks: [
      { id:'referral', icon:'🤝', title:'邀请好友', desc:'每邀请一人注册，双方各得 200 积分', reward:'+200/人', color:'#f066aa', path:'/profile', unlocked:true },
      { id:'moments', icon:'📱', title:'朋友圈广告', desc:'发朋友圈推广猫眼，满 24 小时截图核销积分', reward:'+80/条', color:'#07c160', path:null, unlocked:true },
      { id:'creatorcard', icon:'🪪', title:'网红名片推广', desc:'生成专属网红卡，通过微信好友/社群传播', reward:'+积分返点', color:'#f6c90e', path:'/profile', unlocked:true },
    ]
  },
  {
    id: 'content',
    title: '🎬 内容创作',
    subtitle: '越做越赚，影响力变现',
    tasks: [
      { id:'xiaohongshu', icon:'📕', title:'发小红书/抖音', desc:'发布猫眼相关内容，提交链接审核后获积分', reward:'+200~500', color:'#ff2442', path:null, unlocked:true },
      { id:'tshirt', icon:'👕', title:'穿 Logo T恤打卡', desc:'穿猫眼 Logo 服装发社交媒体，品牌曝光赚积分', reward:'+150', color:'#9d6dff', path:null, unlocked:true },
      { id:'livestream', icon:'🔴', title:'开直播', desc:'用积分兑换投流，直播带货或推广猫眼平台', reward:'佣金分成', color:'#ff4757', path:null, unlocked:true },
    ]
  },
  {
    id: 'organize',
    title: '🎯 组局赚钱',
    subtitle: '高端玩法，品牌合作',
    tasks: [
      { id:'survey', icon:'🔍', title:'消费调研局', desc:'组织真实消费者，让品牌方了解消费习惯，可同吃同住调研', reward:'+5000~20000积分/场', color:'#4a9eff', path:null, unlocked:true },
      { id:'influencer_event', icon:'⭐', title:'网红流量局', desc:'联合多位网红组局，品牌方付费参与，真实用户互动', reward:'定制报价', color:'#9d6dff', path:null, unlocked:true },
      { id:'vip_day', icon:'🎪', title:'网红生活体验', desc:'付费开放「网红生活的一天」，设置阶梯票价', reward:'自定义收费', color:'#f6c90e', path:null, unlocked:true },
    ]
  },

  {
    id: 'invest',
    title: '💹 投资理财',
    subtitle: '钱生钱，长期复利',
    tasks: [
      { id:'vippackages', icon:'🐱', title:'自用省钱 分享赚錢', desc:'宝妈/精致女性/新中产/女大学生/男大学生五大终身会员权益包，储値金模式，7天无理由退款', reward:'立赠积分', color:'#f6c90e', path:'/vip-packages', unlocked:true },
      { id:'groupbuy', icon:'🏷️', title:'大牌折扣中心', desc:'ONE FACE/概念180/碑芙宝贝/MitoQ四大品牌，万人团购享最低折扣，认购包锁定长期价格', reward:'最高5折', color:'#ff9800', path:'/group-buy', unlocked:true },
      { id:'drama', icon:'🎬', title:'短剧投资', desc:'投资热门短剧，按实际播放量分成，最高 25% 收益', reward:'8~25%', color:'#9d6dff', path:'/drama', unlocked:true },
      { id:'stock', icon:'📈', title:'积分投资美股', desc:'用积分兑换投资额度，投资美股/大宗商品，收益以积分形式发放', reward:'市场积分收益', color:'#22d3a0', path:null, unlocked:true },
    ]
  },
  {
    id: 'knowledge',
    title: '📚 学习赚钱',
    subtitle: '越学越赚，知识变现',
    tasks: [
      { id:'course_take', icon:'🎓', title:'听课赚积分', desc:'完成品牌方推出的课程并通过考试，获得积分奖励', reward:'+200~500', color:'#ff9800', path:null, unlocked:true },
      { id:'course_sell', icon:'💡', title:'卖自己的课程', desc:'上传课程大纲（品牌方提供），通过审核后开始销售', reward:'课程分成', color:'#f066aa', path:null, unlocked:true },
    ]
  },
]

const ALL_TASKS = TASK_GROUPS.flatMap(g => g.tasks)

// ===== 附赠式抽奖奖品（提前公布尾号）=====
const LUCKY_PRIZES = [
  { id:1, icon:'📱', name:'iPhone 16 Pro Max', brand:'Apple', tail:'8888', date:'2026-04-01', value:'¥9,999' },
  { id:2, icon:'💄', name:'海蓝之谜精华套装', brand:'La Mer', tail:'6666', date:'2026-04-01', value:'¥3,800' },
  { id:3, icon:'👜', name:'LV 经典手袋', brand:'Louis Vuitton', tail:'5200', date:'2026-05-01', value:'¥12,000' },
  { id:4, icon:'⌚', name:'Apple Watch Ultra 2', brand:'Apple', tail:'9527', date:'2026-05-01', value:'¥6,299' },
  { id:5, icon:'🎧', name:'AirPods Pro 2', brand:'Apple', tail:'1314', date:'2026-06-01', value:'¥1,999' },
]

// ===== 奖金池大奖 =====
const JACKPOT_PRIZES = [
  { icon:'🚗', name:'特斯拉 Model 3', value:'¥239,900', desc:'2026年度大奖' },
  { icon:'🏠', name:'海景公寓一套', value:'¥1,200,000', desc:'三亚·亚龙湾' },
  { icon:'💎', name:'蒂芙尼钻石项链', value:'¥88,000', desc:'季度大奖' },
  { icon:'✈️', name:'欧洲豪华游', value:'¥50,000', desc:'双人行程' },
]

export default function DashboardPage() {
  const { user, profile, wallet, loadUserData } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [activeTab, setActiveTab] = useState<'lucky'|'jackpot'>('lucky')
  const [pensionTab, setPensionTab] = useState<'invest'|'claim'|'dividend'>('dividend')
  const levelConfig = profile ? LEVEL_CONFIG[profile.level] : LEVEL_CONFIG.newbie

  // 养老金积分计算
  const pensionPoints = Math.floor((wallet?.total_earned || 0) * 0.1)
  const pensionMonthly = Math.max(5, Math.floor(pensionPoints / 120)) // 每月可领
  const pensionTo85 = pensionMonthly * 12 * 20 // 至85岁累计可领
  const pensionDividend = Math.floor(pensionPoints * 0.065) // 累计分红
  // 近12个月分红模拟数据
  const pensionHistory = [
    { month: '2025.03', val: pensionMonthly * 0.7 },
    { month: '2025.04', val: pensionMonthly * 0.75 },
    { month: '2025.05', val: pensionMonthly * 0.8 },
    { month: '2025.06', val: pensionMonthly * 0.78 },
    { month: '2025.07', val: pensionMonthly * 0.9 },
    { month: '2025.08', val: pensionMonthly * 0.95 },
    { month: '2025.09', val: pensionMonthly * 1.0 },
    { month: '2025.10', val: pensionMonthly * 1.0 },
    { month: '2025.11', val: pensionMonthly * 1.05 },
    { month: '2025.12', val: pensionMonthly * 1.05 },
    { month: '2026.01', val: pensionMonthly * 1.1 },
    { month: '2026.02', val: pensionMonthly * 0.94 },
  ]
  const pensionMaxVal = Math.max(...pensionHistory.map(h => h.val), 1)
  // 模拟奖金池进度
  const jackpotCurrent = 2847650
  const jackpotTarget = 5000000
  const jackpotProgress = (jackpotCurrent / jackpotTarget) * 100

  useEffect(() => {
    if (!user) return
    loadUserData(user.id)
    loadTransactions()
    checkTodayCheckin()
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    try {
      const { data } = await getTransactions(user.id, 1, 8)
      setTransactions(data)
    } catch (e) { console.error(e) }
  }

  const checkTodayCheckin = async () => {
    const today = new Date().toISOString().split('T')[0]
    const lastCheckin = wallet?.last_checkin_at?.split('T')[0]
    setHasCheckedIn(lastCheckin === today)
  }

  const handleCheckin = async () => {
    if (!user || isCheckingIn || hasCheckedIn) return
    setIsCheckingIn(true)
    try {
      const result = await dailyCheckin(user.id)
      if (result.success) {
        toast.success(result.message)
        setHasCheckedIn(true)
        loadUserData(user.id)
        loadTransactions()
        trackEvent('daily_checkin', { streak: result.streak })
      } else {
        toast(result.message)
        setHasCheckedIn(true)
      }
    } catch { toast.error('签到失败，请重试') }
    finally { setIsCheckingIn(false) }
  }

  const formatAmount = (n: number) => n >= 0 ? `+${n}` : `${n}`
  const formatDate = (s: string) => {
    const d = new Date(s)
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  return (
    <>
      <style>{`
        .dash-top-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
        .dash-task-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media (max-width:900px) {
          .dash-top-grid { grid-template-columns:1fr; gap:12px; margin-bottom:16px; }
          .dash-task-grid { grid-template-columns:1fr; gap:12px; }
        }
      `}</style>
      <div style={{ padding:'0 4px' }}>

        {/* ===== 1. 积分总余额卡片 ===== */}
        <div style={{ background:'linear-gradient(160deg,#1a1500 0%,#0c0d10 80%)', borderRadius:20, padding:'24px 28px', position:'relative', overflow:'hidden', border:'1px solid rgba(246,201,14,0.15)', marginBottom:16 }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'radial-gradient(circle,rgba(246,201,14,0.08) 0%,transparent 70%)', borderRadius:'50%' }} />
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:'50%', border:`2px solid ${levelConfig.color}`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg3)', fontSize:18, flexShrink:0 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>{profile?.nickname?.[0]||'🐱'}</span>}
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:15, fontWeight:700 }}>{profile?.nickname||'猫眼达人'}</span>
                <span style={{ background:levelConfig.color, color:'#000', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>{levelConfig.icon} {levelConfig.label}</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>邀请码: <code style={{ color:'var(--gold)', fontFamily:'monospace' }}>{profile?.referral_code}</code></div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:13, color:'var(--text2)' }}>猫眼积分总余额</span>
            <button onClick={() => setBalanceVisible(!balanceVisible)} style={{ fontSize:14, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>{balanceVisible?'👁':'🙈'}</button>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:52, fontWeight:900, letterSpacing:-2, background:'linear-gradient(135deg,#f6c90e 0%,#ffd94a 50%,#f6a800 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {balanceVisible?(wallet?.balance||0).toLocaleString():'****'}
            </span>
            <span style={{ fontSize:18, color:'var(--text2)' }}>分</span>
          </div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>累计获得 {(wallet?.total_earned||0).toLocaleString()} 分 · 已消耗 {(wallet?.total_spent||0).toLocaleString()} 分</div>

          <div style={{ display:'flex', gap:10 }}>
            {[{label:'积分明细',icon:'📊',path:'/wallet'},{label:'省钱包',icon:'🐱',path:'/vip-packages'},{label:'大牌折扣',icon:'🏷️',path:'/group-buy'},{label:'邀请好友',icon:'🔗',path:'/profile'}].map(item => (
              <Link key={item.path} to={item.path} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, textDecoration:'none' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{item.icon}</div>
                <span style={{ fontSize:10, color:'var(--text2)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== 2. 养老金积分 ===== */}
        <div style={{ background:'var(--bg2)', border:'1px solid rgba(74,158,255,0.25)', borderRadius:16, marginBottom:16, overflow:'hidden' }}>
          {/* 顶部标题 */}
          <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>🏦</span>
              <span style={{ fontSize:15, fontWeight:700 }}>养老金积分</span>
              <span style={{ fontSize:11, color:'var(--text3)', background:'rgba(74,158,255,0.1)', padding:'2px 8px', borderRadius:99 }}>持续消费自动累积</span>
            </div>
            <span style={{ fontSize:11, color:'#4a9eff', cursor:'pointer' }}>分享</span>
          </div>

          {/* 三大数据 */}
          <div style={{ padding:'16px 20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0, borderBottom:'1px solid var(--border)' }}>
            <div style={{ borderRight:'1px solid var(--border)', paddingRight:12 }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>积分总额</div>
              <div style={{ fontSize:22, fontWeight:900, color:'var(--text)' }}>{pensionPoints.toLocaleString()}</div>
            </div>
            <div style={{ borderRight:'1px solid var(--border)', padding:'0 12px' }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>至85岁累计可领 <span style={{ fontSize:10 }}>ℹ️</span></div>
              <div style={{ fontSize:22, fontWeight:900, color:'#4a9eff' }}>{pensionTo85.toLocaleString()}</div>
            </div>
            <div style={{ paddingLeft:12 }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>累计分红 <span style={{ fontSize:10 }}>ℹ️</span></div>
              <div style={{ fontSize:22, fontWeight:900, color:'#22d3a0' }}>+{pensionDividend.toLocaleString()}</div>
            </div>
          </div>

          {/* 追加建议栏 */}
          <div style={{ margin:'12px 20px', padding:'12px 14px', background:'rgba(74,158,255,0.06)', border:'1px solid rgba(74,158,255,0.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:8, flex:1 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>
                每月追加 <span style={{ color:'#4a9eff', fontWeight:700 }}>100 积分</span>，至85岁多领取 <span style={{ color:'#4a9eff', fontWeight:700 }}>{(100 * 12 * 20).toLocaleString()} 积分</span>，已有1,280,541人追加投入
              </div>
            </div>
            <button style={{ flexShrink:0, background:'linear-gradient(135deg,#4a9eff,#2563eb)', color:'#fff', border:'none', borderRadius:20, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' as const }}>去追加</button>
          </div>

          {/* Tab切换 */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', margin:'0 20px' }}>
            {([['invest','投入'],['claim','领取'],['dividend','分红']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setPensionTab(key)} style={{ flex:1, padding:'10px 0', fontSize:13, fontWeight:pensionTab===key?700:400, color:pensionTab===key?'#4a9eff':'var(--text3)', background:'transparent', border:'none', borderBottom:pensionTab===key?'2px solid #4a9eff':'2px solid transparent', cursor:'pointer', transition:'all 0.15s' }}>{label}</button>
            ))}
            <button style={{ padding:'10px 12px', fontSize:12, color:'var(--text3)', background:'transparent', border:'none', cursor:'pointer' }}>身故说明 ›</button>
          </div>

          {/* 分红内容 */}
          <div style={{ padding:'16px 20px 20px' }}>
            {pensionTab === 'dividend' && (
              <>
                {/* 切换累计/月分红 */}
                <div style={{ display:'flex', background:'var(--bg3)', borderRadius:8, padding:3, marginBottom:14 }}>
                  <button style={{ flex:1, padding:'6px 0', borderRadius:6, fontSize:12, fontWeight:600, background:'transparent', border:'none', color:'var(--text3)', cursor:'pointer' }}>累计分红</button>
                  <button style={{ flex:1, padding:'6px 0', borderRadius:6, fontSize:12, fontWeight:700, background:'var(--bg2)', border:'1px solid var(--border)', color:'#4a9eff', cursor:'pointer' }}>月分红</button>
                </div>
                {/* 当月分红标题 */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontSize:13, color:'var(--text3)' }}>2026.02</span>
                  <span style={{ fontSize:13, color:'#22d3a0', fontWeight:700 }}>当月分红 +{Math.floor(pensionMonthly * 0.94).toLocaleString()}分</span>
                </div>
                {/* 柱状图 */}
                <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:80, marginBottom:8 }}>
                  {pensionHistory.map((h, i) => (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                      <div style={{ width:'100%', background: i === pensionHistory.length-1 ? 'rgba(74,158,255,0.5)' : '#4a9eff', borderRadius:'3px 3px 0 0', height:`${Math.max(4, (h.val / pensionMaxVal) * 70)}px`, transition:'height 0.3s' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text3)' }}>
                  <span>2025.03</span>
                  <span>2026.02</span>
                </div>
                {/* 明细 */}
                <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
                  {[
                    { label:'已转入积分', val:`${pensionDividend.toLocaleString()}分` },
                    { label:'剩余可用分红', val:`${Math.floor(pensionDividend * 0.001)}分` },
                  ].map(item => (
                    <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ color:'var(--text3)' }}>{item.label}</span>
                      <span style={{ color:'var(--text)' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {pensionTab === 'invest' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>每消费 100 积分自动存入 10 积分养老金</div>
                {[
                  { label:'投入总积分', val:pensionPoints.toLocaleString() },
                  { label:'本月新增', val:`+${Math.floor(pensionPoints * 0.08)}` },
                  { label:'起始日期', val:'2024.01.01' },
                  { label:'年化积分增长', val:'8.5%' },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--text3)' }}>{item.label}</span>
                    <span style={{ color:'var(--text)', fontWeight:600 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            )}
            {pensionTab === 'claim' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>每月可领取积分</div>
                <div style={{ fontSize:32, fontWeight:900, color:'#4a9eff', marginBottom:4 }}>{pensionMonthly.toLocaleString()}<span style={{ fontSize:14, fontWeight:400, color:'var(--text3)' }}> 分/月</span></div>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>持续消费可提升每月领取额度</div>
                {[
                  { label:'领取方式', val:'每月 1 日自动到账（积分）' },
                  { label:'至85岁累计可领', val:`${pensionTo85.toLocaleString()} 分` },
                  { label:'已累计领取', val:`${pensionDividend.toLocaleString()} 分` },
                  { label:'剩余可领', val:`${(pensionTo85 - pensionDividend).toLocaleString()} 分` },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--text3)' }}>{item.label}</span>
                    <span style={{ color:'var(--text)', fontWeight:600 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== 3. 抽奖板块 ===== */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', marginBottom:24 }}>
          {/* Tab 切换 */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            {[
              { key:'lucky' as const, label:'🎁 附赠式抽奖', desc:'尾号公示' },
              { key:'jackpot' as const, label:'🏆 奖金池大奖', desc:'公证开奖' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex:1, padding:'10px 12px', borderRadius:10, border:activeTab===tab.key?'1px solid rgba(246,201,14,0.4)':'1px solid var(--border)', background:activeTab===tab.key?'rgba(246,201,14,0.08)':'transparent', cursor:'pointer', textAlign:'left' as const }}>
                <div style={{ fontSize:13, fontWeight:700, color:activeTab===tab.key?'var(--gold)':'var(--text2)' }}>{tab.label}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{tab.desc}</div>
              </button>
            ))}
          </div>

          {activeTab === 'lucky' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ fontSize:13, color:'var(--text2)' }}>消费即获得抽奖资格，提前公布中奖尾号</div>
                <span style={{ fontSize:11, background:'rgba(34,211,160,0.1)', color:'#22d3a0', padding:'2px 8px', borderRadius:99 }}>进行中</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {LUCKY_PRIZES.map(prize => (
                  <div key={prize.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'rgba(246,201,14,0.1)', border:'1px solid rgba(246,201,14,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{prize.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{prize.name}</div>
                      <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{prize.brand} · 价值 {prize.value}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:12, color:'var(--gold)', fontWeight:700 }}>尾号 {prize.tail}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{prize.date} 开奖</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(246,201,14,0.05)', border:'1px solid rgba(246,201,14,0.1)', borderRadius:10, fontSize:11, color:'var(--text3)' }}>
                🎯 规则：每消费满 100 积分获得 1 张抽奖券，券号末 4 位与公示尾号一致即中奖。
              </div>
            </>
          )}

          {activeTab === 'jackpot' && (
            <>
              {/* 奖金池进度 */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13, color:'var(--text2)' }}>当前奖金池</span>
                  <span style={{ fontSize:11, background:'rgba(157,109,255,0.1)', color:'#9d6dff', padding:'2px 8px', borderRadius:99 }}>公证处监督</span>
                </div>
                <div style={{ fontSize:32, fontWeight:900, background:'linear-gradient(135deg,#9d6dff,#f066aa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>
                  {jackpotCurrent.toLocaleString()} <span style={{ fontSize:16 }}>积分</span>
                </div>
                <div style={{ background:'var(--bg3)', borderRadius:99, height:8, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ height:'100%', width:`${jackpotProgress}%`, background:'linear-gradient(90deg,#9d6dff,#f066aa)', borderRadius:99, transition:'width 1s ease' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)' }}>
                  <span>进度 {jackpotProgress.toFixed(1)}%</span>
                  <span>目标 {jackpotTarget.toLocaleString()} 积分</span>
                </div>
              </div>

              {/* 大奖列表 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                {JACKPOT_PRIZES.map((prize, i) => (
                  <div key={i} style={{ padding:'12px 14px', background:'rgba(157,109,255,0.05)', border:'1px solid rgba(157,109,255,0.15)', borderRadius:12 }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>{prize.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700 }}>{prize.name}</div>
                    <div style={{ fontSize:13, color:'#9d6dff', fontWeight:800, marginTop:2 }}>{prize.value}</div>
                    <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{prize.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding:'10px 14px', background:'rgba(157,109,255,0.05)', border:'1px solid rgba(157,109,255,0.1)', borderRadius:10, fontSize:11, color:'var(--text3)' }}>
                🏛️ 规则：每消费 1 积分，自动存入 0.1 积分至奖金池。达到目标积分后，邀请公证处现场开奖，直播全程。
              </div>
            </>
          )}
        </div>

        {/* ===== 4. 签到 + 最近流水 ===== */}
        <div className="dash-top-grid" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <button onClick={handleCheckin} disabled={isCheckingIn||hasCheckedIn} style={{ background:hasCheckedIn?'rgba(255,255,255,0.04)':'linear-gradient(135deg,#f6c90e,#ffd94a)', color:hasCheckedIn?'var(--text3)':'#000', border:hasCheckedIn?'1px solid var(--border)':'none', borderRadius:14, padding:'16px', fontSize:14, fontWeight:700, cursor:hasCheckedIn?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {isCheckingIn?'签到中...':hasCheckedIn?'✓ 今日已签到':'📅 立即签到 · 领取积分'}
            </button>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'16px', flex:1, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:14, fontWeight:700 }}>📋 最近流水</span>
                <Link to="/wallet" style={{ fontSize:12, color:'var(--gold)' }}>查看全部 →</Link>
              </div>
              {transactions.length===0 ? (
                <div style={{ textAlign:'center', padding:'16px 0', color:'var(--text3)', fontSize:13 }}>暂无流水，完成任务开始赚积分！</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {transactions.slice(0,5).map(tx => (
                    <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:tx.amount>0?'rgba(34,211,160,0.1)':'rgba(229,57,53,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                        {tx.type==='daily_checkin'?'📅':tx.type==='referral_reward'?'🤝':tx.amount>0?'💰':'🛍️'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.description||tx.type}</div>
                        <div style={{ fontSize:10, color:'var(--text3)' }}>{formatDate(tx.created_at)}</div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:tx.amount>0?'var(--green)':'var(--red)', flexShrink:0 }}>{formatAmount(tx.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ONE FACE 肖像大师卡片 */}
          <Link to="/one-face" style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{ background:'linear-gradient(135deg,rgba(246,201,14,0.06) 0%,rgba(240,102,170,0.06) 100%)', border:'1px solid rgba(246,201,14,0.15)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            {/* 照片轮播预览 */}
            <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden' }}>
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/7e2d963854cf7d37c5cba0b17645e19f_03e74458.jpg" alt="ONE FACE" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }} />
              <div style={{ position:'absolute', top:10, left:12, fontSize:10, letterSpacing:3, color:'rgba(255,255,255,0.8)', fontFamily:'serif' }}>ONE·FACE | 高定肖像</div>
              <div style={{ position:'absolute', bottom:10, left:12, right:12, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>一张脸，一个决定性叙事</div>
                <span style={{ background:'rgba(246,201,14,0.9)', color:'#000', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>查看详情 →</span>
              </div>
            </div>
            {/* 功能速览 */}
            <div style={{ padding:'14px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { icon:'📸', label:'拍照=积分充值', color:'#f6c90e' },
                { icon:'👑', label:'VIP徽章+橱窗', color:'#9d6dff' },
                { icon:'🚀', label:'平台流量扶持', color:'#4a9eff' },
                { icon:'🤝', label:'邀约赚积分', color:'#22d3a0' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8 }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:item.color }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          </Link>
        </div>

        {/* ===== 5. 搞钱任务列表 ===== */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div><h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>💰 搞钱任务</h2><p style={{ fontSize:12, color:'var(--text2)', margin:'2px 0 0' }}>全部解锁，完成任务积累财富</p></div>
            <span style={{ fontSize:12, background:'rgba(34,211,160,0.1)', color:'#22d3a0', padding:'3px 10px', borderRadius:99 }}>✓ 全部解锁</span>
          </div>
          <div className="dash-task-grid">
            {TASK_GROUPS.map(group => (
              <div key={group.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 18px' }}>
                <div style={{ marginBottom:12 }}>
                  <span style={{ fontSize:14, fontWeight:700 }}>{group.title}</span>
                  <span style={{ fontSize:11, color:'var(--text3)', marginLeft:8 }}>{group.subtitle}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {group.tasks.map(task => {
                    const isCheckinDone = task.id==='checkin' && hasCheckedIn
                    const inner = (
                      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, color:'inherit', textDecoration:'none' as const }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`${task.color}18`, border:`1px solid ${task.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{task.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' as const }}>
                            <span style={{ fontSize:12, fontWeight:700 }}>{task.title}</span>
                            {isCheckinDone&&<span style={{ fontSize:9, background:'rgba(34,211,160,0.15)', color:'#22d3a0', padding:'1px 5px', borderRadius:99 }}>✓ 已完成</span>}
                          </div>
                          <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{task.reward}</div>
                        </div>
                      </div>
                    )
                    if (task.path) {
                      return <Link key={task.id} to={task.path} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', textDecoration:'none', color:'inherit' }}>{inner}</Link>
                    }
                    if (task.id==='checkin') {
                      return <div key={task.id} onClick={handleCheckin} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:`1px solid ${isCheckinDone?'var(--border)':'rgba(34,211,160,0.3)'}`, cursor:isCheckinDone?'default':'pointer' }}>{inner}</div>
                    }
                    if (task.id==='moments') {
                      return <div key={task.id} onClick={() => toast('📱 发朋友圈后满 24 小时，截图发客服微信核销，即得 +80 积分', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='xiaohongshu') {
                      return <div key={task.id} onClick={() => toast('📕 发布内容后，将链接发客服审核，通过后即得 +200~500 积分', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='tshirt') {
                      return <div key={task.id} onClick={() => toast('👕 穿猫眼 Logo 服装发社交媒体，截图发客服核销 +150 积分', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='livestream') {
                      return <div key={task.id} onClick={() => toast('🔴 开直播联系客服申请投流支持，按带货金额分成佣金', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='survey') {
                      return <div key={task.id} onClick={() => toast('🔍 组局调研联系客服报名，单场 +5000~20000 积分', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='influencer_event') {
                      return <div key={task.id} onClick={() => toast('⭐ 网红流量局联系客服报名，品牌方付费定制报价', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='vip_day') {
                      return <div key={task.id} onClick={() => toast('🎤 网红生活体验联系客服开通，自定义阶梯票价', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='stock') {
                      return <div key={task.id} onClick={() => toast('📈 积分投资美股功能即将上线，敬请期待', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='course_take') {
                      return <div key={task.id} onClick={() => toast('🎓 课程内容即将上线，敬请期待', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    if (task.id==='course_sell') {
                      return <div key={task.id} onClick={() => toast('💡 卖课功能即将上线，敬请期待', { duration: 3000 })} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    }
                    return (
                      <div key={task.id} onClick={() => toast(`💡 ${task.title}：联系客服了解详情`)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', cursor:'pointer' }}>{inner}</div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 6. 底部邀请 Banner ===== */}
        <div style={{ background:'linear-gradient(135deg,rgba(246,201,14,0.1),rgba(246,201,14,0.05))', border:'1px solid rgba(246,201,14,0.2)', borderRadius:16, padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--gold)' }}>🚀 要搞钱 来猫眼</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>邀请好友，双方各得 200 积分 · 推荐越多赚越多</div>
          </div>
          <Link to="/profile" style={{ background:'linear-gradient(135deg,#f6c90e,#ffd94a)', color:'#000', borderRadius:99, padding:'10px 24px', fontSize:14, fontWeight:700, textDecoration:'none', flexShrink:0 }}>立即邀请</Link>
        </div>
      </div>
    </>
  )
}
