import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getTransactions, dailyCheckin } from '@/api/wallet'
import type { Transaction } from '@/types/database'
import { LEVEL_CONFIG } from '@/types/database'
import { trackEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'

const EARN_TASKS = [
  { id:'checkin', icon:'📅', title:'每日签到', desc:'连续签到最高 50 积分/天', reward:'+10~50', color:'#22d3a0', path:null, unlocked:true },
  { id:'consumption', icon:'📸', title:'上传消费记录', desc:'上传购物截图获得积分', reward:'+50~200', color:'#4a9eff', path:'/consumption-points', unlocked:true },
  { id:'groupbuy', icon:'🛍️', title:'万人团购', desc:'参与团购享折扣 + DARK 奖励', reward:'最高5折', color:'#f6c90e', path:'/group-buy', unlocked:true },
  { id:'drama', icon:'🎬', title:'短剧投资', desc:'投资热门短剧，按播放量分成', reward:'8~25%', color:'#9d6dff', path:'/drama', unlocked:true },
  { id:'referral', icon:'🤝', title:'邀请好友', desc:'每邀请一人获得 200 积分', reward:'+200/人', color:'#f066aa', path:'/profile', unlocked:true },
  { id:'review', icon:'✍️', title:'商品评测', desc:'写详细评测获得额外积分', reward:'+100', color:'#ff9800', path:'/consumption-points', unlocked:true },
  { id:'course', icon:'🚀', title:'达人孵化课程', desc:'完成课程解锁更高佣金比例', reward:'佣金+5%', color:'#f6c90e', path:'/group-buy', unlocked:false, lockLevel:'silver' },
  { id:'influencer', icon:'⭐', title:'网红活动接单', desc:'达到黄金等级后解锁品牌合作', reward:'定制报价', color:'#9d6dff', path:null, unlocked:false, lockLevel:'gold' },
]

export default function DashboardPage() {
  const { user, profile, wallet, loadUserData } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const levelConfig = profile ? LEVEL_CONFIG[profile.level] : LEVEL_CONFIG.newbie

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
    <div style={{ paddingBottom:16, background:'var(--bg)', minHeight:'100vh' }}>
      {/* 顶部资产卡片 */}
      <div style={{ background:'linear-gradient(160deg,#1a1500 0%,#0c0d10 60%)', padding:'20px 20px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'radial-gradient(circle,rgba(246,201,14,0.08) 0%,transparent 70%)', borderRadius:'50%' }} />
        {/* 用户行 */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ width:46, height:46, borderRadius:'50%', border:`2px solid ${levelConfig.color}`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg3)', fontSize:20, flexShrink:0 }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>{profile?.nickname?.[0]||'🐱'}</span>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16, fontWeight:700 }}>{profile?.nickname||'猫眼达人'}</span>
              <span style={{ background:levelConfig.color, color:'#000', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>{levelConfig.icon} {levelConfig.label}</span>
            </div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>邀请码: <code style={{ color:'var(--gold)', fontFamily:'monospace' }}>{profile?.referral_code}</code></div>
          </div>
          <button onClick={handleCheckin} disabled={isCheckingIn||hasCheckedIn} style={{ background:hasCheckedIn?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#f6c90e,#ffd94a)', color:hasCheckedIn?'var(--text3)':'#000', border:'none', borderRadius:99, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:hasCheckedIn?'default':'pointer', flexShrink:0 }}>
            {isCheckingIn?'签到中...':hasCheckedIn?'✓ 已签到':'📅 签到'}
          </button>
        </div>
        {/* 余额 */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:13, color:'var(--text2)' }}>猫眼积分余额</span>
            <button onClick={() => setBalanceVisible(!balanceVisible)} style={{ fontSize:14, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>{balanceVisible?'👁':'🙈'}</button>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontSize:44, fontWeight:900, letterSpacing:-2, background:'linear-gradient(135deg,#f6c90e 0%,#ffd94a 50%,#f6a800 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {balanceVisible?(wallet?.balance||0).toLocaleString():'****'}
            </span>
            <span style={{ fontSize:16, color:'var(--text2)' }}>分</span>
          </div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>累计获得 {(wallet?.total_earned||0).toLocaleString()} 分 · 已消耗 {(wallet?.total_spent||0).toLocaleString()} 分</div>
        </div>
        {/* 快捷操作 */}
        <div style={{ display:'flex', gap:12, marginTop:20 }}>
          {[{label:'积分明细',icon:'📊',path:'/wallet'},{label:'消费积分',icon:'📸',path:'/consumption-points'},{label:'万人团购',icon:'🛍️',path:'/group-buy'},{label:'邀请好友',icon:'🔗',path:'/profile'}].map(item => (
            <Link key={item.path} to={item.path} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, textDecoration:'none' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{item.icon}</div>
              <span style={{ fontSize:11, color:'var(--text2)' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 养老金/医疗险 */}
      <div style={{ padding:'16px 16px 0' }}>
        <div style={{ display:'flex', gap:10 }}>
          {[{label:'养老金',icon:'🏦',color:'#4a9eff',desc:'长期积累，退休保障'},{label:'医疗保险',icon:'🏥',color:'#22d3a0',desc:'健康守护，随时可用'}].map(card => (
            <div key={card.label} style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}><span style={{ fontSize:18 }}>{card.icon}</span><span style={{ fontSize:12, color:'var(--text2)' }}>{card.label}</span></div>
              <div style={{ fontSize:22, fontWeight:800, color:card.color }}>¥0.00</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 搞钱任务 */}
      <div style={{ padding:'20px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div><h2 style={{ fontSize:17, fontWeight:800, margin:0 }}>💰 搞钱任务</h2><p style={{ fontSize:12, color:'var(--text2)', margin:'2px 0 0' }}>完成任务，积累财富</p></div>
          <span style={{ fontSize:12, color:'var(--text3)' }}>{EARN_TASKS.filter(t=>t.unlocked).length}/{EARN_TASKS.length} 已解锁</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {EARN_TASKS.map(task => {
            const inner = (
              <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, color:'inherit', textDecoration:'none' as const }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`${task.color}18`, border:`1px solid ${task.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{task.unlocked?task.icon:'🔒'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>{task.title}</span>
                    {task.id==='checkin'&&hasCheckedIn&&<span style={{ fontSize:10, background:'rgba(34,211,160,0.15)', color:'#22d3a0', padding:'1px 6px', borderRadius:99 }}>已完成</span>}
                    {!task.unlocked&&<span style={{ fontSize:10, background:'rgba(246,201,14,0.1)', color:'var(--gold)', padding:'1px 6px', borderRadius:99 }}>{task.lockLevel==='silver'?'白银解锁':'黄金解锁'}</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{task.desc}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:task.color, flexShrink:0 }}>{task.reward}</div>
              </div>
            )
            if (task.path && task.unlocked) {
              return <Link key={task.id} to={task.path} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, textDecoration:'none', color:'inherit' }}>{inner}</Link>
            }
            return (
              <div key={task.id} onClick={() => !task.unlocked && toast(`🔒 达到${task.lockLevel==='silver'?'白银':'黄金'}等级后解锁`)} style={{ background:task.unlocked?'var(--bg2)':'rgba(255,255,255,0.02)', border:`1px solid ${task.unlocked?'var(--border)':'rgba(255,255,255,0.04)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, cursor:task.unlocked?'pointer':'not-allowed', opacity:task.unlocked?1:0.5 }}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>

      {/* 最近流水 */}
      <div style={{ padding:'20px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <h2 style={{ fontSize:17, fontWeight:800, margin:0 }}>📋 最近流水</h2>
          <Link to="/wallet" style={{ fontSize:12, color:'var(--gold)' }}>查看全部 →</Link>
        </div>
        {transactions.length===0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text3)' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🪙</div>
            <div>暂无流水记录</div>
            <div style={{ fontSize:12, marginTop:4 }}>完成任务开始赚积分吧！</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:tx.amount>0?'rgba(34,211,160,0.1)':'rgba(229,57,53,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {tx.type==='daily_checkin'?'📅':tx.type==='referral_reward'?'🤝':tx.amount>0?'💰':'🛍️'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{tx.description||tx.type}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{formatDate(tx.created_at)}</div>
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:tx.amount>0?'var(--green)':'var(--red)' }}>{formatAmount(tx.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部 Banner */}
      <div style={{ padding:'20px 16px 0' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(246,201,14,0.1),rgba(246,201,14,0.05))', border:'1px solid rgba(246,201,14,0.2)', borderRadius:16, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--gold)' }}>🚀 要搞钱 来猫眼</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>邀请好友，双方各得 200 积分</div>
          </div>
          <Link to="/profile" style={{ background:'linear-gradient(135deg,#f6c90e,#ffd94a)', color:'#000', borderRadius:99, padding:'8px 16px', fontSize:13, fontWeight:700, textDecoration:'none', flexShrink:0 }}>立即邀请</Link>
        </div>
      </div>
    </div>
  )
}
