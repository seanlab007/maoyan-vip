import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { trackLogin } from '@/lib/analytics'
import toast from 'react-hot-toast'
import '@/styles/auth.css'

const schema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      trackLogin('email')
      toast.success('欢迎回来！')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      if (msg.includes('Invalid login credentials')) {
        toast.error('邮箱或密码错误')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value
    if (!email) { toast.error('请先填写邮箱'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { toast.error(error.message); return }
    toast.success('重置密码邮件已发送，请查收')
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

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="field">
            <label>邮箱</label>
            <input {...register('email')} type="email" placeholder="your@email.com" />
            {errors.email && <span className="err">{errors.email.message}</span>}
          </div>

          <div className="field">
            <div className="label-row">
              <label>密码</label>
              <button type="button" className="link-btn" onClick={handleResetPassword}>忘记密码？</button>
            </div>
            <input {...register('password')} type="password" placeholder="输入密码" />
            {errors.password && <span className="err">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="auth-switch">
          还没有账号？<Link to="/register" className="link">免费注册</Link>，送100积分
        </p>
      </div>
    </div>
  )
}
