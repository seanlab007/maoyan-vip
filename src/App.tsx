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

const HomePage = React.lazy(() => import('@/pages/Home'))
const LoginPage = React.lazy(() => import('@/pages/Login'))
const RegisterPage = React.lazy(() => import('@/pages/Register'))
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPassword'))
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'))
const WalletPage = React.lazy(() => import('@/pages/Wallet'))
const ProfilePage = React.lazy(() => import('@/pages/Profile'))
const LeaderboardPage = React.lazy(() => import('@/pages/Leaderboard'))
const CreatorCardPage = React.lazy(() => import('@/pages/CreatorCard'))
const DramaPage = React.lazy(() => import('@/pages/Drama'))
const DaiizenPointsPage = React.lazy(() => import('@/pages/DaiizenPoints'))
const ProductSelectionPage = React.lazy(() => import('@/pages/ProductSelection'))
const BundleStorePage = React.lazy(() => import('@/pages/BundleStore'))
const LandingPage = React.lazy(() => import('@/pages/LandingPage'))
const TestAuthPage = React.lazy(() => import('@/pages/TestAuth'))
const ConsumptionPointsPage = React.lazy(() => import('@/pages/ConsumptionPoints'))
const GroupBuyPage = React.lazy(() => import('@/pages/GroupBuy'))
const VIPPackagesPage = React.lazy(() => import('@/pages/VIPPackages'))
const HealthPage = React.lazy(() => import('@/pages/Health'))
const OneFacePage = React.lazy(() => import('@/pages/OneFace'))
const ProductReviewPage = React.lazy(() => import('@/pages/ProductReview'))
const MomentsAdPage = React.lazy(() => import('@/pages/MomentsAd'))
const LiveStreamPage = React.lazy(() => import('@/pages/LiveStream'))
const GroupEventsPage = React.lazy(() => import('@/pages/GroupEvents'))
const StockInvestPage = React.lazy(() => import('@/pages/StockInvest'))
const LearnEarnPage = React.lazy(() => import('@/pages/LearnEarn'))
const SellCoursePage = React.lazy(() => import('@/pages/SellCourse'))

function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => { trackPageView(location.pathname) }, [location.pathname])
  return null
}

const Loading = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0c0d10', fontSize:32 }}>🐱</div>
)

function AppRoutes() {
  return (
    <>
      <AnalyticsTracker />
      <React.Suspense fallback={<Loading />}>
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/test-auth" element={<TestAuthPage />} />
          <Route path="/u/:username" element={<CreatorCardPage />} />

          {/* 受保护页面 - 搞钱 Tab */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><AppLayout><WalletPage /></AppLayout></ProtectedRoute>} />
          <Route path="/consumption-points" element={<ProtectedRoute><AppLayout><ConsumptionPointsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/group-buy" element={<AppLayout><GroupBuyPage /></AppLayout>} />
          <Route path="/vip-packages" element={<AppLayout><VIPPackagesPage /></AppLayout>} />

          {/* 受保护页面 - 社交 Tab */}
          <Route path="/drama" element={<ProtectedRoute><AppLayout><DramaPage /></AppLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><AppLayout><LeaderboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/daiizen-points" element={<ProtectedRoute><AppLayout><DaiizenPointsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/product-selection" element={<ProtectedRoute><AppLayout><ProductSelectionPage /></AppLayout></ProtectedRoute>} />
          <Route path="/bundle-store" element={<AppLayout><BundleStorePage /></AppLayout>} />

          {/* 受保护页面 - 变美 Tab */}
          <Route path="/health" element={<ProtectedRoute><AppLayout><HealthPage /></AppLayout></ProtectedRoute>} />
          <Route path="/one-face" element={<ProtectedRoute><AppLayout><OneFacePage /></AppLayout></ProtectedRoute>} />
          <Route path="/product-review" element={<ProtectedRoute><AppLayout><ProductReviewPage /></AppLayout></ProtectedRoute>} />
          <Route path="/moments-ad" element={<ProtectedRoute><AppLayout><MomentsAdPage /></AppLayout></ProtectedRoute>} />
          <Route path="/livestream" element={<ProtectedRoute><AppLayout><LiveStreamPage /></AppLayout></ProtectedRoute>} />
          <Route path="/group-events" element={<ProtectedRoute><AppLayout><GroupEventsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/stock-invest" element={<ProtectedRoute><AppLayout><StockInvestPage /></AppLayout></ProtectedRoute>} />
          <Route path="/learn-earn" element={<ProtectedRoute><AppLayout><LearnEarnPage /></AppLayout></ProtectedRoute>} />
          <Route path="/sell-course" element={<ProtectedRoute><AppLayout><SellCoursePage /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </>
  )
}

export default function App() {
  const { initialize } = useAuthStore()
  useEffect(() => { initGA(); initialize() }, [])
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background:'#1c1f28', color:'#f0f2f8', border:'1px solid rgba(246,201,14,0.25)' },
          success: { iconTheme: { primary:'#f6c90e', secondary:'#0c0d10' } },
        }}
      />
    </BrowserRouter>
  )
}
