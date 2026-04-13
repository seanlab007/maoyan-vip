import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { MaoLogo } from '@/components/MaoLogo'

const SIDEBAR_W = 280

const NAV_ITEMS = [
  { id: 'earn', path: '/dashboard', icon: '💰', label: '搞钱', subPaths: ['/dashboard', '/wallet', '/consumption-points', '/group-buy', '/one-face', '/vip-packages', '/fortune'] },
  { id: 'social', path: '/drama', icon: '🤝', label: '社交', subPaths: ['/drama', '/leaderboard', '/profile'] },
  { id: 'beauty', path: '/health', icon: '🌿', label: '变美', subPaths: ['/health', '/one-face', '/product-review', '/moments-ad', '/livestream', '/group-events', '/stock-invest', '/learn-earn', '/sell-course'] },
  { id: 'daiizen', path: '/daiizen-points', icon: '🛍️', label: 'daiizen', subPaths: ['/daiizen-points', '/product-selection', '/bundle-store'] },
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
      {/* ===== ABG LAYOUT STYLES ===== */}
      <style>{`
        /* Desktop: Fixed sidebar + content area */
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
            background: var(--white);
            border-right: 1px solid var(--gray-border);
            z-index: 100;
          }
          .apl-content {
            margin-left: ${SIDEBAR_W}px;
            min-height: 100vh;
            background: var(--off-white);
          }
          .apl-main {
            padding: 40px 48px 60px 48px;
          }
          .apl-mobile-header { display: none !important; }
          .apl-mobile-tabs   { display: none !important; }
        }

        /* Mobile: No sidebar, top header + bottom tabs */
        @media (max-width: 1023px) {
          .apl-sidebar { display: none !important; }
          .apl-content { margin-left: 0; background: var(--off-white); }
          .apl-main    { padding: 16px 20px 100px 20px; }
          .apl-mobile-header {
            display: flex !important;
            position: sticky;
            top: 0;
            z-index: 200;
            background: var(--white);
            border-bottom: 1px solid var(--gray-border);
            padding: 12px 20px;
            align-items: center;
            justify-content: space-between;
          }
          .apl-mobile-tabs {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: var(--white);
            border-top: 1px solid var(--gray-border);
            z-index: 200;
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="apl-sidebar" style={{ display: 'none' }}>
        {/* Logo Section */}
        <div style={{ padding: '32px 28px 28px', borderBottom: '1px solid var(--gray-border)' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <MaoLogo size={40} eyeInnerColor="#ffffff" />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', letterSpacing: '1px' }}>MAOYAN</div>
              <div style={{ fontSize: 10, color: 'var(--gray-light)', marginTop: 2, letterSpacing: '2px', textTransform: 'uppercase' }}>要搞钱</div>
            </div>
          </Link>
        </div>

        {/* User Info Card */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--gray-border)' }}>
          <div style={{ background: 'var(--off-white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 2, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-border)' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{profile?.nickname?.[0] || '🐱'}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nickname || 'User'}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-light)', marginTop: 2, fontFamily: 'monospace' }}>ID: {profile?.referral_code}</div>
            </div>
          </div>

          {/* Balance Card */}
          <div style={{ marginTop: 16, padding: '16px', background: 'var(--navy)', borderRadius: 4, color: 'var(--white)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 8, letterSpacing: '2px', textTransform: 'uppercase' }}>积分余额</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>{(wallet?.balance || 0).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>累计 {(wallet?.total_earned || 0).toLocaleString()} 分</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = isTabActive(item)
            return (
              <Link 
                key={item.id} 
                to={item.path} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px 16px', 
                  borderRadius: 4, 
                  textDecoration: 'none', 
                  background: active ? 'var(--navy)' : 'transparent',
                  border: active ? '1px solid var(--navy)' : '1px solid transparent',
                  color: active ? 'var(--white)' : 'var(--gray-mid)',
                  transition: 'all 0.2s ease',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: active ? '1px' : '0px'
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--white)' }} />}
              </Link>
            )
          })}

          {/* Daiizen Submenu */}
          {(location.pathname.startsWith('/daiizen') || location.pathname.startsWith('/product-selection') || location.pathname.startsWith('/bundle-store')) && (
            <div style={{ marginTop: 8, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { to: '/daiizen-points', label: '🪙 积分 & 抽奖' },
                { to: '/product-selection', label: '🛒 选品中心' },
                { to: '/bundle-store', label: '🏪 套餐商城' },
              ].map(sub => (
                <Link 
                  key={sub.to} 
                  to={sub.to} 
                  style={{
                    display: 'block', 
                    padding: '8px 12px', 
                    borderRadius: 3, 
                    fontSize: 12,
                    color: location.pathname === sub.to ? 'var(--navy)' : 'var(--gray-light)',
                    textDecoration: 'none', 
                    fontWeight: location.pathname === sub.to ? 600 : 400,
                    background: location.pathname === sub.to ? 'var(--off-white)' : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}

          {/* Fortune Submenu */}
          {isTabActive({ id: 'earn', path: '/dashboard', icon: '💰', label: '搞钱', subPaths: ['/dashboard', '/wallet', '/consumption-points', '/group-buy', '/one-face', '/vip-packages', '/fortune'] }) && (
            <div style={{ marginTop: 8, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { to: '/fortune', label: '🔮 命理小馆' },
              ].map(sub => (
                <Link 
                  key={sub.to} 
                  to={sub.to} 
                  style={{
                    display: 'block', 
                    padding: '8px 12px', 
                    borderRadius: 3, 
                    fontSize: 12,
                    color: location.pathname.startsWith('/fortune') ? 'var(--navy)' : 'var(--gray-light)',
                    textDecoration: 'none', 
                    fontWeight: location.pathname.startsWith('/fortune') ? 600 : 400,
                    background: location.pathname.startsWith('/fortune') ? 'var(--off-white)' : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}

          {/* Beauty Submenu */}
          {isTabActive({ id: 'beauty', path: '/health', icon: '🌿', label: '变美', subPaths: ['/health', '/one-face', '/product-review', '/moments-ad', '/livestream', '/group-events', '/stock-invest', '/learn-earn', '/sell-course'] }) && (
            <div style={{ marginTop: 8, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { to: '/health', label: '🌿 健康' },
                { to: '/one-face', label: '👆 一面' },
              ].map(sub => (
                <Link 
                  key={sub.to} 
                  to={sub.to} 
                  style={{
                    display: 'block', 
                    padding: '8px 12px', 
                    borderRadius: 3, 
                    fontSize: 12,
                    color: location.pathname === sub.to ? 'var(--navy)' : 'var(--gray-light)',
                    textDecoration: 'none', 
                    fontWeight: location.pathname === sub.to ? 600 : 400,
                    background: location.pathname === sub.to ? 'var(--off-white)' : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Sign Out Button */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--gray-border)' }}>
          <button 
            onClick={handleSignOut} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              width: '100%', 
              padding: '10px 16px', 
              borderRadius: 4, 
              background: 'transparent', 
              border: '1px solid var(--gray-border)', 
              cursor: 'pointer', 
              fontSize: 13, 
              color: 'var(--gray-mid)',
              transition: 'all 0.2s',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--off-white)'
              e.currentTarget.style.borderColor = 'var(--gray-mid)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--gray-border)'
            }}
          >
            <span>🚪</span><span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* ===== CONTENT AREA ===== */}
      <div className="apl-content" style={{ background: 'var(--off-white)', minHeight: '100vh' }}>

        {/* Mobile Header */}
        <header className="apl-mobile-header" style={{ display: 'none', position: 'relative' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <MaoLogo size={32} eyeInnerColor="#ffffff" />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)', letterSpacing: '1px' }}>MAOYAN</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'var(--navy)', border: '1px solid var(--navy)', borderRadius: 2, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🪙</span><span>{(wallet?.balance || 0).toLocaleString()}</span>
            </div>
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)} 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 2, 
                background: 'var(--navy)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                fontSize: 16, 
                overflow: 'hidden',
                border: '1px solid var(--gray-border)'
              }}
            >
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{profile?.nickname?.[0] || '🐱'}</span>}
            </div>
          </div>
          {showUserMenu && (
            <>
              <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
              <div style={{ position: 'absolute', top: '100%', right: 16, zIndex: 200, background: 'var(--white)', border: '1px solid var(--gray-border)', borderRadius: 4, padding: 8, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-border)', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--black)' }}>{profile?.nickname || 'User'}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-light)', marginTop: 2 }}>ID: {profile?.referral_code}</div>
                </div>
                {[{ to: '/profile', label: '👤 个人名片' }, { to: '/wallet', label: '💳 积分明细' }, { to: '/vip-packages', label: '🐱 自用省钱包' }, { to: '/group-buy', label: '🏷️ 大牌折扣' }].map(item => (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    onClick={() => setShowUserMenu(false)} 
                    style={{ 
                      display: 'block', 
                      padding: '8px 12px', 
                      borderRadius: 3, 
                      fontSize: 13, 
                      color: 'var(--black)', 
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--off-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {item.label}
                  </Link>
                ))}
                <hr style={{ border: 'none', borderTop: '1px solid var(--gray-border)', margin: '4px 0' }} />
                <button 
                  onClick={handleSignOut} 
                  style={{ 
                    display: 'block', 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: 3, 
                    fontSize: 13, 
                    color: 'var(--red)', 
                    textAlign: 'left', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  🚪 退出登录
                </button>
              </div>
            </>
          )}
        </header>

        {/* Main Content */}
        <main className="apl-main">
          {children}
        </main>

        {/* Mobile Secondary Tab (Fortune) */}
        {isTabActive({ id: 'earn', path: '/dashboard', icon: '💰', label: '搞钱', subPaths: ['/dashboard', '/wallet', '/consumption-points', '/group-buy', '/one-face', '/vip-packages', '/fortune'] }) && location.pathname.startsWith('/fortune') && (
          <nav className="apl-mobile-tabs" style={{ display: 'none', borderTop: '1px solid var(--gray-border)', paddingTop: 4, background: 'var(--white)' }}>
            {[
              { to: '/dashboard', icon: '💰', label: '搞钱首页' },
              { to: '/fortune', icon: '🔮', label: '命理小馆' },
            ].map(sub => {
              const active = sub.to === '/fortune' ? location.pathname.startsWith('/fortune') : location.pathname === sub.to
              return (
                <Link 
                  key={sub.to} 
                  to={sub.to} 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '8px 0 6px', 
                    gap: 2, 
                    textDecoration: 'none',
                    borderTop: active ? '2px solid var(--navy)' : '2px solid transparent'
                  }}
                >
                  <span style={{ fontSize: 18, opacity: active ? 1 : 0.5 }}>{sub.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? 'var(--navy)' : 'var(--gray-light)' }}>{sub.label}</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Mobile Bottom Tab */}
        <nav className="apl-mobile-tabs" style={{ display: 'none' }}>
          {NAV_ITEMS.map(tab => {
            const active = isTabActive(tab)
            return (
              <Link 
                key={tab.id} 
                to={tab.path} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '10px 0 8px', 
                  gap: 3, 
                  textDecoration: 'none', 
                  position: 'relative',
                  borderTop: active ? '2px solid var(--navy)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: 22, opacity: active ? 1 : 0.5, transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? 'var(--navy)' : 'var(--gray-light)', transition: 'all 0.2s' }}>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
