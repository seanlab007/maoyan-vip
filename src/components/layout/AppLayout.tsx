import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/dashboard', icon: '🪙', label: '积分钱包' },
  { path: '/drama',    icon: '🎬', label: '短剧投资' },
  { path: '/wallet',    icon: '💰', label: '积分明细' },
  { path: '/profile',   icon: '🪪', label: '我的名片' },
  { path: '/leaderboard', icon: '🏆', label: '排行榜' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, wallet, signOut } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('已退出登录')
    navigate('/')
  }

  return (
    <div className="app-layout">
      {/* 顶部导航 */}
      <header className="app-header">
        <Link to="/" className="header-logo">
          <span className="logo-emoji">🐱</span>
          <span className="logo-name">猫眼</span>
        </Link>

        <nav className="header-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <div className="header-points">
            🪙 {wallet?.balance?.toLocaleString() || 0}
          </div>
          <div className="header-user" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="header-avatar">
              {profile?.nickname?.[0] || '🐱'}
            </span>
            <span className="header-name">{profile?.nickname || '达人'}</span>
            <span>▾</span>
          </div>
          {menuOpen && (
            <div className="user-dropdown">
              <Link to="/profile" onClick={() => setMenuOpen(false)}>个人中心</Link>
              <Link to="/wallet" onClick={() => setMenuOpen(false)}>积分钱包</Link>
              <hr />
              <button onClick={handleSignOut}>退出登录</button>
            </div>
          )}
        </div>
      </header>

      {/* 主内容 */}
      <main className="app-main">
        {children}
      </main>

      {/* 底部移动端导航 */}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
