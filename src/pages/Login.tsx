import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { trackLogin } from '@/lib/analytics'
import toast from 'react-hot-toast'
import '@/styles/auth.css'

type LoginMode = 'phone' | 'email'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/dashboard'
  const [mode, setMode] = useState<LoginMode>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0 } return c - 1 })
    }, 1000)
  }

  const handleSendSms = async () => {
    if (!phone || phone.length < 11) { toast.error('请输入正确的手机号'); return }
    setIsLoading(true)
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+86${phone}`
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone })
      if (error) throw error
      setSmsSent(true)
      startCountdown()
      toast.success('验证码已发送，请查收短信')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发送失败'
      toast.error(msg.includes('not enabled') ? '手机登录暂未开放，请使用邮筱登录' : msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 4) { toast.error('请输入验证码'); return }
    setIsLoading(true)
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+86${phone}`
      const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: 'sms' })
      if (error) throw error
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
    if (!email || !password) { toast.error('请填写邮筱和密码'); return }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      trackLogin('email')
      toast.success('欢迎回来！')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      toast.error(msg.includes('Invalid login credentials') ? '邮筱或密码错误' : msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🐱</span>
          <span className="logo-text">猫眼 MaoYan</span>
        </div>
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
              {m === 'phone' ? '📱 手机号' : '📧 邮筱'}
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
              <label>邮筱</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" />
            </div>
            <div className="field">
              <label>密码</label>
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
      </div>
    </div>
  )
}
