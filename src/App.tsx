import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { initGA, trackPageView } from '@/lib/analytics'
import { useLocation } from 'react-router-dom'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import '@/styles/drama.css'
import '@/styles/daiizen-points.css'
import '@/styles/landing.css'

// 懒加载页面
const HomePage = React.lazy(() => import('@/pages/Home'))
const LoginPage = React.lazy(() => import('@/pages/Login'))
const RegisterPage = React.lazy(() => import('@/pages/Register'))
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'))
const WalletPage = React.lazy(() => import('@/pages/Wallet'))
const ProfilePage = React.lazy(() => import('@/pages/Profile'))
const LeaderboardPage = React.lazy(() => import('@/pages/Leaderboard'))
const CreatorCardPage = React.lazy(() => import('@/pages/CreatorCard'))
const DramaPage = React.lazy(() => import('@/pages/Drama'))
const DaiizenPointsPage = React.lazy(() => import('@/pages/DaiizenPoints'))
const LandingPage = React.lazy(() => import('@/pages/LandingPage'))
const TestAuthPage = React.lazy(() => import('@/pages/TestAuth'))
const ConsumptionPointsPage = React.lazy(() => import('@/pages/ConsumptionPoints'))
const GroupBuyPage = React.lazy(() => import('@/pages/GroupBuy'))

// GA4 页面追踪
function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

function AppRoutes() {
  return (
    <>
      <AnalyticsTracker />
      <React.Suspense fallback={<div className="loading-screen"><div className="loading-logo">🐱</div></div>}>
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/test-auth" element={<TestAuthPage />} />
          <Route path="/u/:username" element={<CreatorCardPage />} />

          {/* 受保护页面（需登录） */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <AppLayout>
                <WalletPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <AppLayout>
                <LeaderboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/drama" element={
            <ProtectedRoute>
              <AppLayout>
                <DramaPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/daiizen-points" element={
            <ProtectedRoute>
              <AppLayout>
                <DaiizenPointsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/consumption-points" element={
            <ProtectedRoute>
              <AppLayout>
                <ConsumptionPointsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/group-buy" element={
            <AppLayout>
              <GroupBuyPage />
            </AppLayout>
          } />

          {/* 兜底 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </>
  )
}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initGA()
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1c1f28',
            color: '#f0f2f8',
            border: '1px solid rgba(246,201,14,0.25)',
          },
          success: { iconTheme: { primary: '#f6c90e', secondary: '#0c0d10' } },
        }}
      />
    </BrowserRouter>
  )
}

