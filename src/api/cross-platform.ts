/**
 * maoyan-vip 跨平台积分 API 
 * 文件：src/api/cross-platform.ts
 * 
 * 使用 Supabase service_role 调用 RPC 函数提交跨平台订单
 * 注意：这个文件中的 service key 只能在后端/Vercel Edge Function 中使用
 * 前端只用 reportOrderFromFrontend（用 anon key）
 */

import { supabase } from '@/lib/supabase'

export interface CrossPlatformOrderPayload {
  platform: 'daiizen' | 'mcmamoo' | 'whalepictures' | 'umonfrost' | 'lacelle1802' | 'maoyan'
  orderId: string
  amountUsd: number
  currency?: string
  autoCredit?: boolean
}

export interface MaoWalletSummary {
  userId: string
  email: string
  displayName: string
  maoBalance: number
  maoFrozen: number
  totalEarned: number
  totalSpent: number
  lastCheckinAt: string | null
  checkinStreak: number
}

/**
 * 提交跨平台订单（前端调用，已登录用户自动关联）
 * 使用 Supabase RPC 通过 SECURITY DEFINER 函数写入
 */
export async function reportCrossPlatformOrder(
  payload: CrossPlatformOrderPayload
): Promise<{ orderId: string; maoReward: number } | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const maoReward = payload.amountUsd * 0.10 * 100 // 10% * 100 MAO/USD

  const { data, error } = await supabase.rpc('submit_platform_order', {
    p_user_id: user.id,
    p_platform: payload.platform,
    p_order_id: payload.orderId,
    p_amount_usd: payload.amountUsd,
    p_currency: payload.currency || 'USD',
    p_auto_credit: payload.autoCredit !== false,
  })

  if (error) {
    console.error('[CrossPlatform] 提交订单失败:', error)
    throw error
  }

  return { orderId: data as string, maoReward }
}

/**
 * 获取 MAO 积分钱包概览（从 unified view）
 */
export async function getMaoWalletSummary(): Promise<MaoWalletSummary | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('mao_wallet_summary')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  return {
    userId: data.user_id,
    email: data.email,
    displayName: data.display_name,
    maoBalance: parseFloat(data.mao_balance) || 0,
    maoFrozen: parseFloat(data.mao_frozen) || 0,
    totalEarned: parseFloat(data.total_earned) || 0,
    totalSpent: parseFloat(data.total_spent) || 0,
    lastCheckinAt: data.last_checkin_at,
    checkinStreak: data.checkin_streak || 0,
  }
}

/**
 * 获取 MAO 积分流水
 */
export async function getMaoTransactions(limit = 20, offset = 0) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('mao_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return []
  return data || []
}

/**
 * 获取跨平台订单记录
 */
export async function getCrossPlatformOrders(limit = 20) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('cross_platform_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

/**
 * 确保当前登录用户的钱包已初始化
 */
export async function ensureWallet() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.rpc('ensure_wallet', { p_user_id: user.id })
}
