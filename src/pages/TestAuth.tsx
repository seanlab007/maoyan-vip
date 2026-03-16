import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import '@/styles/auth.css'

export default function TestAuthPage() {
  const { user, profile, wallet, initialize, signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const testSupabaseConnection = async () => {
    setLoading(true)
    setStatus('正在测试 Supabase 连接...')
    
    try {
      // 测试 Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      setStatus(`Supabase URL: ${supabaseUrl}`)
      console.log('Supabase URL:', supabaseUrl)
      console.log('Supabase Key:', supabaseKey ? '已设置' : '未设置')
      
      // 尝试获取 session
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        throw error
      }
      
      setStatus(`✅ Supabase 连接成功！\nSession: ${data.session ? '已登录' : '未登录'}`)
      console.log('Session:', data.session)
    } catch (err) {
      setStatus(`❌ Supabase 连接失败：${err instanceof Error ? err.message : '未知错误'}`)
      console.error('Supabase 连接错误:', err)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setStatus('正在尝试登录...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'test123456',
      })
      
      if (error) {
        throw error
      }
      
      setStatus(`✅ 登录成功！\n用户 ID: ${data.user?.id}\n邮箱: ${data.user?.email}`)
      console.log('登录成功:', data)
      
      // 初始化 auth store
      await initialize()
      setStatus(`✅ 登录成功！Auth Store 已初始化\n用户 ID: ${data.user?.id}`)
    } catch (err) {
      setStatus(`❌ 登录失败：${err instanceof Error ? err.message : '未知错误'}`)
      console.error('登录错误:', err)
    } finally {
      setLoading(false)
    }
  }

  const testRegister = async () => {
    setLoading(true)
    setStatus('正在尝试注册...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `test${Date.now()}@test.com`,
        password: 'test123456',
        options: {
          data: {
            nickname: '测试用户',
          },
        },
      })
      
      if (error) {
        throw error
      }
      
      setStatus(`✅ 注册成功！\n用户 ID: ${data.user?.id}\n邮箱: ${data.user?.email}`)
      console.log('注册成功:', data)
    } catch (err) {
      setStatus(`❌ 注册失败：${err instanceof Error ? err.message : '未知错误'}`)
      console.error('注册错误:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkUserData = async () => {
    setLoading(true)
    setStatus('正在检查用户数据...')
    
    try {
      if (!user) {
        setStatus('❌ 用户未登录')
        return
      }
      
      // 检查 profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        throw new Error(`Profile 查询失败: ${profileError.message}`)
      }
      
      // 检查 wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (walletError) {
        throw new Error(`Wallet 查询失败: ${walletError.message}`)
      }
      
      setStatus(`✅ 用户数据检查成功！\n\nProfile:\n- ID: ${profileData?.id}\n- 昵称: ${profileData?.nickname}\n\nWallet:\n- ID: ${walletData?.id}\n- 余额: ${walletData?.balance}`)
      console.log('Profile:', profileData)
      console.log('Wallet:', walletData)
    } catch (err) {
      setStatus(`❌ 检查失败：${err instanceof Error ? err.message : '未知错误'}`)
      console.error('检查错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">🧪 Auth 测试工具</h1>
        <p className="auth-subtitle">用于调试认证和数据库问题</p>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--gold)', marginBottom: '12px' }}>当前状态</h3>
          <div style={{ 
            background: 'var(--bg)', 
            padding: '16px', 
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {status || '等待操作...'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={testSupabaseConnection} 
            disabled={loading}
            className="btn-primary"
          >
            🔗 测试 Supabase 连接
          </button>
          <button 
            onClick={testRegister} 
            disabled={loading}
            className="btn-primary"
          >
            📝 注册测试账号
          </button>
          <button 
            onClick={testLogin} 
            disabled={loading}
            className="btn-primary"
          >
            🔐 登录测试账号
          </button>
          <button 
            onClick={checkUserData} 
            disabled={loading}
            className="btn-primary"
          >
            👤 检查用户数据
          </button>
          <button 
            onClick={() => { signOut(); setStatus('✅ 已退出登录'); }} 
            disabled={loading}
            className="btn-primary"
            style={{ background: 'var(--red)' }}
          >
            🚪 退出登录
          </button>
        </div>

        <div style={{ 
          background: 'var(--bg)', 
          padding: '16px', 
          borderRadius: '12px',
          marginBottom: '24px' 
        }}>
          <h3 style={{ color: 'var(--gold)', marginBottom: '12px' }}>Auth Store 状态</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <div>user: {user ? '✅ 已设置' : '❌ 未设置'}</div>
            <div>profile: {profile ? '✅ 已设置' : '❌ 未设置'}</div>
            <div>wallet: {wallet ? '✅ 已设置' : '❌ 未设置'}</div>
            {user && (
              <div style={{ marginTop: '8px', color: 'var(--text2)' }}>
                User ID: {user.id}
              </div>
            )}
            {profile && (
              <div style={{ marginTop: '8px', color: 'var(--text2)' }}>
                昵称: {profile.nickname}
              </div>
            )}
            {wallet && (
              <div style={{ marginTop: '8px', color: 'var(--text2)' }}>
                余额: {wallet.balance} 积分
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          background: 'var(--bg)', 
          padding: '16px', 
          borderRadius: '12px' 
        }}>
          <h3 style={{ color: 'var(--gold)', marginBottom: '12px' }}>调试信息</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text2)' }}>
            <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</div>
            <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置'}</div>
            <div style={{ marginTop: '8px' }}>
              打开浏览器控制台 (F12) 查看详细日志
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
