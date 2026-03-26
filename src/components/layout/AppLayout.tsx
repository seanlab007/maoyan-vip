import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { MaoLogo } from '@/components/MaoLogo'

const SIDEBAR_W = 260

const NAV_ITEMS = [
  { id: 'earn', path: '/dashboard', icon: '💰', label: '搞钱', subPaths: ['/dashboard', '/wallet', '/consumption-points', '/group-buy', '/one-face', '/vip-packages'] },
  { id: 'social', path: '/drama', icon: '🤝', label: '社交', subPaths: ['/drama', '/leaderboard', '/profile'] },
  { id: 'beauty', path: '/health', icon: '🌿', label: '变美', subPaths: ['/health'] },
  { id: 'daiizen', path: '/daiizen-points', icon: '🛍️', label: 'daiizen', subPaths: ['/daiizen-points', '/product-selection'] },
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

  const isTabActive = (item: typeof NAV_ITEMS[0]) =>
    item.subPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))

  return (
    <>
      {/* ===== 全局布局 CSS ===== */}
      <style>{`
        /* 桌面端：侧边栏 fixed，内容区 margin-left */
        @media (min-width: 1024px) {
          .apl-sidebar {
            display: flex !important;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            width: ${SIDEBAR_W}px;
            height: 100vh;
            overflow-y: auto;
            background: rgba(12,13,16,0.99);
            border-right: 1px solid rgba(255,255,255,0.08);
            z-index: 100;
          }
          .apl-content {
            margin-left: ${SIDEBAR_W}px;
            min-height: 100vh;
          }
          .apl-main {
            padding: 28px 32px 60px 32px;
          }
          .apl-mobile-header { display: none !important; }
          .apl-mobile-tabs   { display: none !important; }
        }

        /* 手机端：无侧边栏，顶部 header + 底部 tab */
        @media (max-width: 1023px) {
          .apl-sidebar { display: none !important; }
          .apl-content { margin-left: 0; }
          .apl-main    { padding: 12px 16px 90px 16px; }
          .apl-mobile-header {
            display: flex !important;
            position: sticky;
            top: 0;
            z-index: 200;
            background: rgba(12,13,16,0.97);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding: 10px 16px;
            align-items: center;
            justify-content: space-between;
          }
          .apl-mobile-tabs {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(12,13,16,0.97);
            backdrop-filter: blur(16px);
            border-top: 1px solid rgba(255,255,255,0.08);
            z-index: 200;
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      {/* ===== 桌面端固定侧边栏 ===== */}
      <aside className="apl-sidebar" style={{ display: 'none' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <MaoLogo size={40} eyeInnerColor="#0d0d0d" />
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>猫眼</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: -2 }}>要搞钱 来猫眼</div>
            </div>
          </Link>
        </div>

        {/* 用户信息 */}
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, overflow: 'hidden', flexShrink: 0 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{profile?.nickname?.[0] || '🐱'}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nickname || '猫眼达人'}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>邀请码: <span style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{profile?.referral_code}</span></div>
            </div>
          </div>
          {/* 积分余额 */}
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(246,201,14,0.06)', border: '1px solid rgba(246,201,14,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>🪙 积分余额</div>
            <div style={{ fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{(wallet?.balance || 0).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>累计 {(wallet?.total_earned || 0).toLocaleString()} 分</div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = isTabActive(item)
            return (
              <Link key={item.id} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, textDecoration: 'none', background: active ? 'rgba(246,201,14,0.1)' : 'transparent', border: active ? '1px solid rgba(246,201,14,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: active ? 700 : 400, color: active ? 'var(--gold)' : 'var(--text2)' }}>{item.label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />}
              </Link>
            )
          })}
          {/* daiizen 子菜单 */}
          {(location.pathname.startsWith('/daiizen') || location.pathname.startsWith('/product-selection')) && (
            <div style={{ marginTop: 2, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { to: '/daiizen-points', label: '🪙 积分 & 抽奖' },
                { to: '/product-selection', label: '🛒 选品中心' },
              ].map(sub => (
                <Link key={sub.to} to={sub.to} style={{
                  display: 'block', padding: '8px 14px', borderRadius: 8, fontSize: 13,
                  color: location.pathname === sub.to ? 'var(--gold)' : 'var(--text3)',
                  textDecoration: 'none', fontWeight: location.pathname === sub.to ? 700 : 400,
                  background: location.pathname === sub.to ? 'rgba(246,201,14,0.07)' : 'transparent',
                }}>{sub.label}</Link>
              ))}
            </div>
          )}
        </nav>

        {/* 底部退出 */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 13, color: 'var(--text3)' }}>
            <span>🚪</span><span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* ===== 右侧内容区（桌面端有 margin-left，手机端无） ===== */}
      <div className="apl-content" style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* 手机端顶部 header */}
        <header className="apl-mobile-header" style={{ display: 'none', position: 'relative' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <MaoLogo size={32} eyeInnerColor="#0d0d0d" />
            <span style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>猫眼</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(246,201,14,0.1)', border: '1px solid rgba(246,201,14,0.2)', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🪙</span><span>{(wallet?.balance || 0).toLocaleString()}</span>
            </div>
            <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, overflow: 'hidden' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{profile?.nickname?.[0] || '🐱'}</span>}
            </div>
          </div>
          {showUserMenu && (
            <>
              <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
              <div style={{ position: 'absolute', top: '100%', right: 16, zIndex: 200, background: 'var(--bg3)', border: '1px solid rgba(246,201,14,0.25)', borderRadius: 12, padding: 8, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{profile?.nickname || '猫眼达人'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>邀请码: {profile?.referral_code}</div>
                </div>
                {[{ to: '/profile', label: '👤 个人名片' }, { to: '/wallet', label: '💳 积分明细' }, { to: '/vip-packages', label: '🐱 自用省钱包' }, { to: '/group-buy', label: '🏷️ 大牌折扣' }].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text)', textDecoration: 'none' }}>{item.label}</Link>
                ))}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                <button onClick={handleSignOut} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14, color: 'var(--red)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>🚪 退出登录</button>
              </div>
            </>
          )}
        </header>

        {/* 主内容区 */}
        <main className="apl-main">
          {children}
        </main>

        {/* 手机端底部 Tab */}
        <nav className="apl-mobile-tabs" style={{ display: 'none' }}>
          {NAV_ITEMS.map(tab => {
            const active = isTabActive(tab)
            return (
              <Link key={tab.id} to={tab.path} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0 8px', gap: 3, textDecoration: 'none', position: 'relative' }}>
                {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 2, background: 'var(--gold)', borderRadius: '0 0 2px 2px' }} />}
                <span style={{ fontSize: 22, filter: active ? 'none' : 'grayscale(0.5) opacity(0.6)', transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}>{tab.icon}</span>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--gold)' : 'var(--text3)', transition: 'all 0.2s' }}>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
