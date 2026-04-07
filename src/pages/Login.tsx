import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { trackLogin } from '@/lib/analytics'
import toast from 'react-hot-toast'
import '@/styles/auth.css'
import { MaoLogo } from '@/components/MaoLogo'


type LoginMode = 'phone' | 'email'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/dashboard'
  const { user } = useAuthStore()
  const [mode, setMode] = useState<LoginMode>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  // 监听 user 状态变化，登录成功后跳转
  useEffect(() => {
    if (loginSuccess && user) {
      navigate(from, { replace: true })
    }
  }, [loginSuccess, user, navigate, from])
  const [smsSent, setSmsSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { toast.error('请输入注册邮箱'); return }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + '/reset-password',
      })
      if (error) throw error
      setForgotSent(true)
      toast.success('重置链接已发送，请查收邮件 📧', { duration: 6000 })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发送失败'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0 } return c - 1 })
    }, 1000)
  }

  // 测试手机号（短信审核期间可用）
  const TEST_PHONE = '13800138000'
  const TEST_OTP = '123456'

  const handleSendSms = async () => {
    if (!phone || phone.length < 11) { toast.error('请输入正确的手机号'); return }
    if (countdown > 0) return

    // 测试号码直接模拟发送
    const cleanPhone = phone.replace(/\s/g, '')
    if (cleanPhone === TEST_PHONE || cleanPhone === '+86' + TEST_PHONE) {
      setSmsSent(true)
      startCountdown()
      toast.success('验证码已发送（测试码：' + TEST_OTP + '）', { duration: 5000 })
      return
    }

    setIsLoading(true)
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+86${phone}`
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone })
      if (error) {
        // 短信审核中，友好提示
        toast('📱 短信服务开通中，请稍后重试或使用邮箱登录', { icon: '⏳', duration: 5000 })
        return
      }
      setSmsSent(true)
      startCountdown()
      toast.success('验证码已发送，请查收短信')
    } catch {
      toast.error('发送失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 4) { toast.error('请输入验证码'); return }
    setIsLoading(true)

    // 测试号码 Mock 登录
    const cleanPhone = phone.replace(/\s/g, '')
    if ((cleanPhone === TEST_PHONE || cleanPhone === '+86' + TEST_PHONE) && otp === TEST_OTP) {
      try {
        // 使用测试邮箱登录
        const testEmail = '13800138000@test.maoyan.vip'
        const testPassword = '123456'

        // 尝试登录
        let { data, error } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })

        // 如果登录失败，尝试注册测试账号
        if (error) {
          console.log('测试账号不存在，正在创建...')
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
              data: {
                nickname: '测试用户',
                phone: TEST_PHONE,
                referral_code: null
              },
              emailRedirectTo: window.location.origin + '/login'
            }
          })

          if (signUpError) {
            throw signUpError
          }

          // 等待用户创建
          await new Promise(resolve => setTimeout(resolve, 1500))

          // 再次尝试登录
          const loginResult = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          })
          data = loginResult.data
          error = loginResult.error
        }

        if (error) throw error

        if (data?.user) {
          useAuthStore.getState().setUser(data.user)
          if (data.session) useAuthStore.getState().setSession(data.session)
          await useAuthStore.getState().loadUserData(data.user.id)
          trackLogin('phone')
          toast.success('登录成功！欢迎回来 🎉')
          navigate(from, { replace: true })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '登录失败'
        console.error('测试登录错误:', err)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      const fullPhone = phone.startsWith('+') ? phone : `+86${phone}`
      const { data, error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: 'sms' })
      if (error) throw error
      if (data?.user) {
        useAuthStore.getState().setUser(data.user)
        if (data.session) useAuthStore.getState().setSession(data.session)
        useAuthStore.getState().loadUserData(data.user.id)
      }
      trackLogin('phone')
      toast.success('登录成功！欢迎回来 🎉')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      toast.error('验证码错误或已过期，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('请填写邮箱和密码'); return }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // 先跳转，再后台加载用户数据（避免loadUserData卡住导致navigate不执行）
      trackLogin('email')
      toast.success('欢迎回来！')
      navigate(from, { replace: true })

      // 后台异步同步 user 到 authStore
      if (data?.user) {
        useAuthStore.getState().setUser(data.user)
        if (data.session) useAuthStore.getState().setSession(data.session)
        await useAuthStore.getState().loadUserData(data.user.id)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      if (msg.includes('Invalid login credentials')) {
        toast.error('邮箱或密码错误')
      } else if (msg.includes('Email not confirmed')) {
        toast.error('请先验证邮箱')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
          <MaoLogo size={44} eyeInnerColor="#1a1a1a" />
          <span className="logo-text" style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>猫眼 MaoYan</span>
        </div>

        {/* 忘记密码模式 */}
        {showForgot ? (
          <>
            <h1 className="auth-title">重置密码</h1>
            <p className="auth-subtitle">输入注册邮箱，我们发送重置链接给你</p>
            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
                <p style={{ color: '#f0f2f8', marginBottom: 8 }}>重置邮件已发送</p>
                <p style={{ color: '#9ba3b8', fontSize: 13 }}>请查收 <strong style={{ color: '#f6c90e' }}>{forgotEmail}</strong> 的邮件</p>
                <button type="button" onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
                  className="btn-primary" style={{ marginTop: 20 }}>返回登录</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="field">
                  <label>注册邮箱</label>
                  <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} type="email" placeholder="your@email.com" autoFocus />
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? '发送中...' : '发送重置链接'}
                </button>
                <p className="auth-switch" style={{ marginTop: 12 }}>
                  <button type="button" onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', color: '#f6c90e', cursor: 'pointer', fontSize: 14 }}>← 返回登录</button>
                </p>
              </form>
            )}
          </>
        ) : (
          <>
            <h1 className="auth-title">欢迎回来</h1>
            <p className="auth-subtitle">登录您的达人账号</p>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button type="button" onClick={() => toast('微信登录即将开放，请先使用手机号登录', { icon: '⏳' })}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#07C160', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>📱</span> 微信登录
          </button>
          <button type="button" onClick={() => toast('支付宝登录即将开放，请先使用手机号登录', { icon: '⏳' })}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1677FF', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>💳</span> 支付宝登录
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 12, color: '#5a6278' }}>或</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {(['phone', 'email'] as LoginMode[]).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: mode === m ? 'linear-gradient(135deg, #f6c90e, #f6a800)' : 'transparent',
                color: mode === m ? '#000' : '#9ba3b8', transition: 'all 0.2s' }}>
              {m === 'phone' ? '📱 手机号' : '📧 邮箱'}
            </button>
          ))}
        </div>

        {mode === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="auth-form">
            <div className="field">
              <label>手机号</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#9ba3b8', whiteSpace: 'nowrap' }}>
                  🇨🇳 +86
                </div>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} type="tel" placeholder="请输入手机号" maxLength={11} style={{ flex: 1 }} />
              </div>
            </div>
            <div className="field">
              <label>验证码</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} type="text" placeholder="6位验证码" maxLength={6} style={{ flex: 1 }} />
                <button type="button" onClick={handleSendSms} disabled={isLoading || countdown > 0}
                  style={{ background: countdown > 0 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f6c90e, #f6a800)',
                    color: countdown > 0 ? '#5a6278' : '#000', border: 'none', borderRadius: 12,
                    padding: '12px 14px', fontSize: 13, fontWeight: 600, cursor: countdown > 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {countdown > 0 ? `${countdown}s` : smsSent ? '重新发送' : '发送验证码'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
        )}

        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="field">
              <label>邮箱</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" />
            </div>
            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>密码</span>
                <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email) }}
                  style={{ background: 'none', border: 'none', color: '#f6c90e', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                  忘记密码？
                </button>
              </label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="输入密码" />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          还没有账号？<Link to="/register" className="link">免费注册</Link>，送100积分
        </p>
          </>
        )}
      </div>
    </div>
  )
}
