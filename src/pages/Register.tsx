import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { trackRegister } from '@/lib/analytics'
import toast from 'react-hot-toast'
import '@/styles/auth.css'

const schema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(8, '密码至少8位'),
  confirm: z.string(),
  nickname: z.string().min(2, '昵称至少2个字').max(20, '昵称最多20个字'),
  referral_code: z.string().optional(),
  agree: z.boolean().refine(v => v, '请阅读并同意用户协议'),
}).refine(d => d.password === d.confirm, {
  message: '两次密码不一致',
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      referral_code: searchParams.get('ref') || '',
      agree: false,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nickname: data.nickname,
            referral_code: data.referral_code || null,
          },
        },
      })
      
      if (error) throw error

      // 等待一小段时间确保 Auth 用户创建完成
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 手动创建 profile 和 wallet 记录（如果触发器失败）
      if (authData.user) {
        try {
          // 检查 profile 是否已存在
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single()

          if (!existingProfile) {
            // 创建 profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                nickname: data.nickname,
                avatar_url: null,
                referral_code: data.referral_code || null,
              })

            if (profileError) {
              console.error('创建 profile 失败:', profileError)
            }
          }

          // 检查 wallet 是否已存在
          const { data: existingWallet } = await supabase
            .from('wallets')
            .select('id')
            .eq('user_id', authData.user.id)
            .single()

          if (!existingWallet) {
            // 创建 wallet 并赠送 100 积分
            const { error: walletError } = await supabase
              .from('wallets')
              .insert({
                user_id: authData.user.id,
                balance: 100,
                total_earned: 100,
              })

            if (walletError) {
              console.error('创建 wallet 失败:', walletError)
            } else {
              // 写入注册积分流水
              await supabase
                .from('transactions')
                .insert({
                  user_id: authData.user.id,
                  type: 'earn',
                  source: 'register',
                  amount: 100,
                  balance_after: 100,
                  description: '🎉 注册奖励',
                })
            }
          }
        } catch (err) {
          console.error('创建用户数据失败:', err)
        }
      }

      trackRegister('email')
      
      // 根据是否有 session 决定跳转
      if (authData.session) {
        // 无需邮箱验证，直接登录成功
        toast.success('注册成功！欢迎加入猫眼，已赠送100积分 🎉')
        navigate('/dashboard', { replace: true })
      } else {
        // 需要邮箱验证
        toast.success('注册成功！请查收邮件并点击验证链接后登录 📧', { duration: 8000 })
        navigate('/login?registered=true')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '注册失败'
      if (msg.includes('already registered')) {
        toast.error('该邮箱已注册，请直接登录')
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
        <div className="auth-logo">
          <span className="logo-icon">🐱</span>
          <span className="logo-text">猫眼 MaoYan</span>
        </div>
        <h1 className="auth-title">创建账号</h1>
        <p className="auth-subtitle">注册即送 <span className="gold">100 积分</span></p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="field">
            <label>昵称</label>
            <input {...register('nickname')} placeholder="你的达人名字" />
            {errors.nickname && <span className="err">{errors.nickname.message}</span>}
          </div>

          <div className="field">
            <label>邮箱</label>
            <input {...register('email')} type="email" placeholder="your@email.com" />
            {errors.email && <span className="err">{errors.email.message}</span>}
          </div>

          <div className="field">
            <label>密码</label>
            <input {...register('password')} type="password" placeholder="至少8位" />
            {errors.password && <span className="err">{errors.password.message}</span>}
          </div>

          <div className="field">
            <label>确认密码</label>
            <input {...register('confirm')} type="password" placeholder="再次输入密码" />
            {errors.confirm && <span className="err">{errors.confirm.message}</span>}
          </div>

          <div className="field">
            <label>推荐码（选填）</label>
            <input {...register('referral_code')} placeholder="好友推荐码，双方各得积分" />
          </div>

          <div className="field checkbox-field">
            <label>
              <input {...register('agree')} type="checkbox" />
              <span>我已阅读并同意 <Link to="/terms" className="link">用户协议</Link> 和 <Link to="/privacy" className="link">隐私政策</Link></span>
            </label>
            {errors.agree && <span className="err">{errors.agree.message}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? '注册中...' : '立即注册'}
          </button>
        </form>

        <p className="auth-switch">
          已有账号？<Link to="/login" className="link">立即登录</Link>
        </p>
      </div>
    </div>
  )
}
