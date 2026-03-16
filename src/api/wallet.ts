/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import type { Transaction, Wallet } from '@/types/database'
import { trackPointsChange } from '@/lib/analytics'

// 获取钱包信息
export async function getWallet(userId: string): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data as Wallet
}

// 获取积分流水（分页）
export async function getTransactions(
  userId: string,
  page = 1,
  pageSize = 20
): Promise<{ data: Transaction[]; count: number }> {
  const from = (page - 1) * pageSize
  const { data, count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  if (error) throw error
  return { data: (data as Transaction[]) || [], count: count || 0 }
}

// 每日签到
export async function dailyCheckin(userId: string): Promise<{
  success: boolean
  points: number
  streak: number
  message: string
}> {
  const today = new Date().toISOString().split('T')[0]

  // 检查今天是否已签到
  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('checked_at', today)
    .single()

  if (existing) {
    return { success: false, points: 0, streak: 0, message: '今天已经签到过了' }
  }

  // 查询连续签到天数
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const { data: yesterdayCheckin } = await supabase
    .from('checkins')
    .select('streak')
    .eq('user_id', userId)
    .eq('checked_at', yesterday)
    .single()

  const streak = (yesterdayCheckin?.streak || 0) + 1
  const points = Math.min(10 + (streak - 1) * 2, 50) // 最多50积分/天

  // 写入签到记录
  const { error: checkinError } = await supabase
    .from('checkins')
    .insert({ user_id: userId, streak, points, checked_at: today })
  if (checkinError) throw checkinError

  // 查询当前余额
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single() as { data: any }

  const newBalance = (wallet?.balance || 0) + points

  // 直接用手动更新
  await supabase
    .from('wallets')
    .update({ balance: newBalance, last_checkin_at: new Date().toISOString() } as any)
    .eq('user_id', userId)

  // 写入流水
  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'daily_checkin',
    source: 'daily_checkin',
    amount: points,
    balance_after: newBalance,
    description: `📅 第${streak}天签到奖励${streak >= 7 ? '（连续签到加成）' : ''}`,
  })

  trackPointsChange('earn', points, 'daily_checkin')

  return { success: true, points, streak, message: `签到成功！获得 ${points} 积分` }
}

// 积分兑换商品
export async function redeemProduct(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; orderId?: string; message: string }> {
  // 查询商品
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single() as { data: any }

  if (!product) return { success: false, message: '商品不存在' }
  if (product.stock < quantity) return { success: false, message: '库存不足' }
  if (!product.points_price) return { success: false, message: '该商品不支持积分兑换' }

  const totalPoints = product.points_price * quantity

  // 检查余额
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance, total_spent')
    .eq('user_id', userId)
    .single() as { data: any }

  if (!wallet || wallet.balance < totalPoints) {
    return { success: false, message: `积分不足，需要 ${totalPoints} 积分` }
  }

  const newBalance = wallet.balance - totalPoints

  // 创建订单
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      product_id: productId,
      quantity,
      pay_type: 'points',
      points_used: totalPoints,
      cash_paid: 0,
      status: 'paid',
    })
    .select()
    .single() as { data: any; error: any }

  if (orderError) return { success: false, message: '下单失败，请重试' }

  // 扣减积分
  await supabase
    .from('wallets')
    .update({ balance: newBalance, total_spent: (wallet.total_spent || 0) + totalPoints } as any)
    .eq('user_id', userId)

  // 扣减库存
  await supabase
    .from('products')
    .update({ stock: product.stock - quantity } as any)
    .eq('id', productId)

  // 写入流水
  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'spend',
    source: 'redeem',
    amount: -totalPoints,
    balance_after: newBalance,
    description: `🛍️ 兑换 ${product.name} x${quantity}`,
    ref_id: order.id,
  } as any)

  trackPointsChange('spend', totalPoints, 'redeem')

  return { success: true, orderId: order.id, message: '兑换成功！' }
}
