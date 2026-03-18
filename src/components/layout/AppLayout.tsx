import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const BOTTOM_TABS = [
  { id: 'earn', path: '/dashboard', icon: '💰', label: '搞钱', subPaths: ['/dashboard', '/wallet', '/consumption-points', '/group-buy'] },
  { id: 'social', path: '/drama', icon: '🤝', label: '社交', subPaths: ['/drama', '/leaderboard', '/profile'] },
  { id: 'beauty', path: '/health', icon: '🌿', label: '变美', subPaths: ['/health'] },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, wallet, signOut } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('已退出登录')
    navigate('/')
  }

  const isTabActive = (tab: typeof BOTTOM_TABS[0]) =>
    tab.subPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--bg)', maxWidth:480, margin:'0 auto', position:'relative' }}>
      {/* 顶部状态栏 */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(12,13,16,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>🐱</span>
          <span style={{ fontSize:16, fontWeight:800, background:'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>猫眼</span>
          <span style={{ fontSize:10, color:'var(--text3)', marginLeft:2 }}>要搞钱 来猫眼</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'rgba(246,201,14,0.1)', border:'1px solid rgba(246,201,14,0.2)', borderRadius:99, padding:'4px 12px', fontSize:13, fontWeight:700, color:'var(--gold)', display:'flex', alignItems:'center', gap:4 }}>
            <span>🪙</span><span>{(wallet?.balance||0).toLocaleString()}</span>
          </div>
          <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ width:34, height:34, borderRadius:'50%', background:'var(--bg3)', border:'2px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, overflow:'hidden', position:'relative' }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>{profile?.nickname?.[0]||'🐱'}</span>}
          </div>
        </div>
        {showUserMenu && (
          <>
            <div onClick={() => setShowUserMenu(false)} style={{ position:'fixed', inset:0, zIndex:199 }} />
            <div style={{ position:'absolute', top:'100%', right:16, zIndex:200, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:12, padding:8, minWidth:160, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{profile?.nickname||'猫眼达人'}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>邀请码: {profile?.referral_code}</div>
              </div>
              {[{to:'/profile',label:'👤 个人名片'},{to:'/wallet',label:'💳 积分明细'},{to:'/consumption-points',label:'📸 消费积分'},{to:'/group-buy',label:'🛍️ 万人团购'}].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)} style={{ display:'block', padding:'8px 12px', borderRadius:8, fontSize:14, color:'var(--text)' }}>{item.label}</Link>
              ))}
              <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'4px 0' }} />
              <button onClick={handleSignOut} style={{ display:'block', width:'100%', padding:'8px 12px', borderRadius:8, fontSize:14, color:'var(--red)', textAlign:'left' }}>🚪 退出登录</button>
            </div>
          </>
        )}
      </header>

      {/* 主内容区 */}
      <main style={{ flex:1, overflowY:'auto', paddingBottom:80 }}>{children}</main>

      {/* 底部 Tab 导航 */}
      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'rgba(12,13,16,0.97)', backdropFilter:'blur(16px)', borderTop:'1px solid var(--border)', display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom)' }}>
        {BOTTOM_TABS.map(tab => {
          const active = isTabActive(tab)
          return (
            <Link key={tab.id} to={tab.path} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'10px 0 8px', gap:3, textDecoration:'none', position:'relative' }}>
              {active && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:32, height:2, background:'var(--gold)', borderRadius:'0 0 2px 2px' }} />}
              <span style={{ fontSize:22, filter:active?'none':'grayscale(0.5) opacity(0.6)', transform:active?'scale(1.1)':'scale(1)', transition:'all 0.2s' }}>{tab.icon}</span>
              <span style={{ fontSize:11, fontWeight:active?700:400, color:active?'var(--gold)':'var(--text3)', transition:'all 0.2s' }}>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
