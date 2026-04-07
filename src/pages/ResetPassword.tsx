import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import '@/styles/auth.css'
import { MaoLogo } from '@/components/MaoLogo'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Supabase 会在 URL hash 里携带 access_token，SDK 自动处理
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 8) { toast.error('密码至少8位'); return }
    if (password !== confirm) { toast.error('两次密码不一致'); return }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('密码已重置！请重新登录 🎉', { duration: 5000 })
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '重置失败'
      toast.error(msg)
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
        <h1 className="auth-title">设置新密码</h1>
        <p className="auth-subtitle">请输入你的新密码</p>

        {!isReady ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ba3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
            <p>验证身份中...</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>如果长时间无反应，请重新点击邮件中的链接</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            <div className="field">
              <label>新密码</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="至少8位"
                autoFocus
              />
            </div>
            <div className="field">
              <label>确认新密码</label>
              <input
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                type="password"
                placeholder="再次输入密码"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存新密码'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
