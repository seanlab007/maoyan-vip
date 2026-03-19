import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STATIC_DRAMAS = [
  { id:1, title:'念念有词', genre:'穿书', view_count:3000000000, rating:9.6, investor_count:12500, hot:true, desc:'穿越古代的学霸女主，用现代知识改变命运，甜虐交织', cover:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop', tags:['穿越','甜宠','逆袭'] },
  { id:2, title:'盛夏芬德拉', genre:'甜宠', view_count:1000000000, rating:9.4, investor_count:8900, hot:true, desc:'夏天里的浪漫邂逅，青春与成长的动人故事', cover:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', tags:['青春','甜宠','校园'] },
  { id:3, title:'家里家外', genre:'都市', view_count:800000000, rating:9.2, investor_count:6700, hot:false, desc:'都市家庭的情感纠葛，真实反映现代生活', cover:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop', tags:['家庭','都市','情感'] },
  { id:4, title:'昭然赴礼', genre:'职场', view_count:500000000, rating:9.5, investor_count:5400, hot:true, desc:'体制内大佬与大学老师的极限拉扯，性张力拉满', cover:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', tags:['职场','爱情','权谋'] },
  { id:5, title:'深情诱引', genre:'悬疑', view_count:300000000, rating:9.1, investor_count:4200, hot:false, desc:'层层反转的悬疑剧情，每个角色都有秘密', cover:'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', tags:['悬疑','反转','烧脑'] },
  { id:6, title:'逆袭之路', genre:'爽文', view_count:250000000, rating:9.0, investor_count:3800, hot:false, desc:'从底层逆袭的热血故事，每一集都让人热血沸腾', cover:'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop', tags:['逆袭','爽文','热血'] },
]

const ROLE_TIERS = [
  { role:'路人甲', price:1000, desc:'出现在背景中，有镜头', slots:50, left:23, color:'#9ba3b8' },
  { role:'配角', price:5000, desc:'有台词，出现3集以上', slots:20, left:7, color:'#4a9eff' },
  { role:'重要配角', price:20000, desc:'出现10集以上，有剧情线', slots:5, left:2, color:'#f6c90e' },
  { role:'主演', price:100000, desc:'主角之一，全程出演', slots:2, left:1, color:'#9d6dff' },
]

function formatViews(n: number) {
  if (n >= 100000000) return (n/100000000).toFixed(1)+'亿'
  if (n >= 10000) return (n/10000).toFixed(0)+'万'
  return n.toString()
}

export default function DramaPage() {
  const [dramas, setDramas] = useState<any[]>(STATIC_DRAMAS)
  const [selectedDrama, setSelectedDrama] = useState<any>(null)
  const [investAmount, setInvestAmount] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState<'invest'|'role'>('invest')
  const [loading, setLoading] = useState(false)
  const [subTab, setSubTab] = useState<'drama'|'leaderboard'|'profile'>('drama')

  useEffect(() => { fetchDramas() }, [])

  async function fetchDramas() {
    const { data } = await supabase.from('drama_projects').select('*').order('investor_count', { ascending:false })
    if (data && data.length > 0) setDramas(data)
  }

  function openDrama(drama: any) {
    setSelectedDrama(drama)
    setInvestAmount(1)
    setModalTab('invest')
    setShowModal(true)
  }

  async function handleInvest() {
    if (!selectedDrama) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); setLoading(false); return }
      const { error } = await supabase.from('group_buy_orders').insert({
        user_id: user.id, product_id: `drama_${selectedDrama.id}`,
        product_name: selectedDrama.title, original_price: investAmount,
        final_price: investAmount, dark_reward: investAmount*0.05, status:'paid',
      })
      if (error) throw error
      toast.success(`🎬 投资成功！¥${investAmount} 投入《${selectedDrama.title}》`)
      setShowModal(false)
    } catch (e: any) { toast.error(e.message||'投资失败') }
    setLoading(false)
  }

  return (
    <div style={{ paddingBottom:16 }}>
      {/* 社交子导航 */}
      <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'12px 16px 0', display:'flex' }}>
        {[{id:'drama',label:'🎬 短剧投资'},{id:'leaderboard',label:'🏆 排行榜'},{id:'profile',label:'🪪 我的名片'}].map(tab => (
          <button key={tab.id} onClick={() => {
            if (tab.id==='leaderboard') { window.location.href='/leaderboard'; return }
            if (tab.id==='profile') { window.location.href='/profile'; return }
            setSubTab(tab.id as any)
          }} style={{ flex:1, background:'none', border:'none', borderBottom:subTab===tab.id?'2px solid var(--gold)':'2px solid transparent', padding:'8px 4px 12px', fontSize:13, fontWeight:subTab===tab.id?700:400, color:subTab===tab.id?'var(--gold)':'var(--text2)', cursor:'pointer' }}>{tab.label}</button>
        ))}
      </div>

      {/* 短剧列表 */}
      <div style={{ padding:'16px 16px 0' }}>
        <div style={{ marginBottom:14 }}>
          <h2 style={{ fontSize:17, fontWeight:800, margin:0 }}>🎬 热门短剧</h2>
          <p style={{ fontSize:12, color:'var(--text2)', margin:'2px 0 0' }}>投资短剧，按播放量分成收益</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {dramas.map(drama => (
            <div key={drama.id} onClick={() => openDrama(drama)} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', cursor:'pointer' }}>
              <div style={{ position:'relative', paddingTop:'140%', overflow:'hidden' }}>
                <img src={drama.cover||`https://picsum.photos/seed/${drama.id}/300/420`} alt={drama.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).src=`https://picsum.photos/seed/${drama.id*7}/300/420` }} />
                {drama.hot && <div style={{ position:'absolute', top:8, left:8, background:'linear-gradient(135deg,#E53935,#EF5350)', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>🔥 HOT</div>}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,0.8))', padding:'20px 10px 10px' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{drama.title}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 }}>{formatViews(drama.view_count)} 播放</div>
                </div>
              </div>
              <div style={{ padding:'10px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:11, color:'var(--text2)' }}>{drama.genre}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--gold)' }}>⭐ {drama.rating}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8 }}>{(drama.investor_count||0).toLocaleString()} 人已投资</div>
                <button style={{ width:'100%', background:'linear-gradient(135deg,#f6c90e,#ffd94a)', color:'#000', border:'none', borderRadius:8, padding:'7px 0', fontSize:12, fontWeight:700, cursor:'pointer' }}>立即投资</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 角色出演 */}
      <div style={{ padding:'20px 16px 0' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(157,109,255,0.1),rgba(157,109,255,0.05))', border:'1px solid rgba(157,109,255,0.2)', borderRadius:16, padding:'16px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <span style={{ fontSize:28 }}>🎭</span>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#9d6dff' }}>角色出演机会</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>投资 ¥1000+ 即可申请出演</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {ROLE_TIERS.map(role => (
              <div key={role.role} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${role.color}30`, borderRadius:10, padding:'8px 12px', flex:1, minWidth:100 }}>
                <div style={{ fontSize:12, fontWeight:700, color:role.color }}>{role.role}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>¥{role.price.toLocaleString()}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>剩余 {role.left}/{role.slots}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 投资弹窗 */}
      {showModal && selectedDrama && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:'var(--bg2)', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, margin:'0 auto', padding:'20px', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ fontSize:17, fontWeight:800 }}>《{selectedDrama.title}》</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize:20, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {[{id:'invest',label:'💰 投资分成'},{id:'role',label:'🎭 角色出演'}].map(t => (
                <button key={t.id} onClick={() => setModalTab(t.id as any)} style={{ flex:1, background:modalTab===t.id?'rgba(246,201,14,0.15)':'var(--bg3)', border:`1px solid ${modalTab===t.id?'rgba(246,201,14,0.4)':'var(--border)'}`, borderRadius:10, padding:'8px', fontSize:13, fontWeight:modalTab===t.id?700:400, color:modalTab===t.id?'var(--gold)':'var(--text2)', cursor:'pointer' }}>{t.label}</button>
              ))}
            </div>
            {modalTab==='invest' && (
              <div>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>{selectedDrama.desc}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                  <span style={{ fontSize:13, color:'var(--text2)' }}>投资金额 (¥)</span>
                  <input type="number" value={investAmount} onChange={e => setInvestAmount(Math.max(1,parseInt(e.target.value)||1))} style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:10, padding:'8px 12px', fontSize:16, fontWeight:700, color:'var(--gold)', textAlign:'right' }} />
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  {[1,100,1000,5000].map(amt => (
                    <button key={amt} onClick={() => setInvestAmount(amt)} style={{ flex:1, background:investAmount===amt?'rgba(246,201,14,0.15)':'var(--bg3)', border:`1px solid ${investAmount===amt?'var(--gold)':'var(--border)'}`, borderRadius:8, padding:'6px 0', fontSize:12, color:investAmount===amt?'var(--gold)':'var(--text2)', cursor:'pointer' }}>¥{amt}</button>
                  ))}
                </div>
                <div style={{ background:'var(--bg3)', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}><span style={{ color:'var(--text2)' }}>预期收益率</span><span style={{ color:'var(--green)', fontWeight:700 }}>8~25%</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'var(--text2)' }}>🐱 小猫奖励</span><span style={{ color:'var(--gold)', fontWeight:700 }}>+{Math.floor(investAmount*0.05)}只</span></div>
                </div>
                <button onClick={handleInvest} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#f6c90e,#ffd94a)', color:'#000', border:'none', borderRadius:12, padding:'14px', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
                  {loading?'投资中...':`确认投资 ¥${investAmount}`}
                </button>
              </div>
            )}
            {modalTab==='role' && (
              <div>
                <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>选择出演角色，成为短剧的一部分！</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {ROLE_TIERS.map(role => (
                    <div key={role.role} style={{ background:'var(--bg3)', border:`1px solid ${role.color}30`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:role.color }}>{role.role}</div>
                        <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{role.desc}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>剩余名额: {role.left}/{role.slots}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:16, fontWeight:800, color:role.color }}>¥{role.price.toLocaleString()}</div>
                        <button onClick={() => { toast.success(`已申请《${selectedDrama.title}》${role.role}角色！`); setShowModal(false) }} style={{ marginTop:6, background:role.color, color:'#000', border:'none', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>申请</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
