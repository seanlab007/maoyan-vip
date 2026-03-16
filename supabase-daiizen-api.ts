/**
 * Supabase daiizen 积分系统 API
 * 功能：
 * 1. daiizen 用户管理（查询、创建、更新）
 * 2. 积分交易（发放、消耗、查询）
 * 3. 账号关联（maoyan.vip ↔ daiizen）
 * 4. 积分规则管理
 * 5. 邀请好友
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 环境变量
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Supabase 客户端（使用 service_role 权限，可以绕过 RLS）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================================================
// 类型定义
// ============================================================================

interface DaiizenUser {
  id?: number;
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role?: 'user' | 'admin';
  maoyanUserId?: string;
  totalPoints?: number;
  availablePoints?: number;
}

interface PointTransaction {
  userId: number;
  type: 'earned' | 'spent' | 'expired' | 'sync_from_maoyan';
  amount: number;
  reason?: string;
  orderId?: number;
  maoyanTxId?: string;
}

interface DaiizenOrder {
  userId: number;
  orderNumber: string;
  status: 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  totalUsdd: number;
  shippingAddress?: any;
  paymentMethod?: string;
  paymentTxHash?: string;
}

// ============================================================================
// daiizen 用户管理
// ============================================================================

/**
 * 创建 daiizen 用户
 */
export async function createDaiizenUser(user: Omit<DaiizenUser, 'id' | 'totalPoints' | 'availablePoints'>) {
  const { data, error } = await supabase
    .from('daiizen_users')
    .insert({
      open_id: user.openId,
      name: user.name,
      email: user.email,
      login_method: user.loginMethod,
      role: user.role || 'user',
      maoyan_user_id: user.maoyanUserId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 查询 daiizen 用户（通过 openId）
 */
export async function getDaiizenUserByOpenId(openId: string) {
  const { data, error } = await supabase
    .from('daiizen_users')
    .select(`
      *,
      maoyan_user:maoyan_user_id(
        id,
        display_name
      )
    `)
    .eq('open_id', openId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 查询 daiizen 用户（通过 ID）
 */
export async function getDaiizenUserById(id: number) {
  const { data, error } = await supabase
    .from('daiizen_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 更新 daiizen 用户
 */
export async function updateDaiizenUser(id: number, updates: Partial<DaiizenUser>) {
  const { data, error } = await supabase
    .from('daiizen_users')
    .update({
      name: updates.name,
      email: updates.email,
      login_method: updates.loginMethod,
      maoyan_user_id: updates.maoyanUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 关联 maoyan.vip 账号
 */
export async function linkMaoyanAccount(daiizenUserId: number, maoyanUserId: string) {
  // 检查 maoyanUserId 是否已被其他 daiizen 用户关联
  const { data: existing } = await supabase
    .from('daiizen_users')
    .select('id')
    .eq('maoyan_user_id', maoyanUserId)
    .not('id', 'eq', daiizenUserId)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('该 maoyan 账号已被关联');
  }

  // 更新 daiizen 用户的 maoyan_user_id
  const { data, error } = await supabase
    .from('daiizen_users')
    .update({ maoyan_user_id: maoyanUserId })
    .eq('id', daiizenUserId)
    .select()
    .single();

  if (error) throw error;

  // 同时更新 maoyan.vip 用户的 daiizen_user_id
  await supabase
    .from('profiles')
    .update({ daiizen_user_id: daiizenUserId })
    .eq('id', maoyanUserId);

  return data;
}

/**
 * 解除 maoyan 账号关联
 */
export async function unlinkMaoyanAccount(daiizenUserId: number) {
  const { data, error: userError } = await supabase
    .from('daiizen_users')
    .select('maoyan_user_id')
    .eq('id', daiizenUserId)
    .single();

  if (userError) throw userError;

  const maoyanUserId = data?.maoyan_user_id;

  // 解除 daiizen 端关联
  const { data: updated, error } = await supabase
    .from('daiizen_users')
    .update({ maoyan_user_id: null })
    .eq('id', daiizenUserId)
    .select()
    .single();

  if (error) throw error;

  // 解除 maoyan 端关联
  if (maoyanUserId) {
    await supabase
      .from('profiles')
      .update({ daiizen_user_id: null })
      .eq('id', maoyanUserId);
  }

  return updated;
}

// ============================================================================
// 积分交易管理
// ============================================================================

/**
 * 发放积分
 */
export async function grantPoints(userId: number, amount: number, reason: string, orderId?: number) {
  if (amount <= 0) throw new Error('积分数量必须大于 0');

  const { data, error } = await supabase
    .from('daiizen_point_transactions')
    .insert({
      user_id: userId,
      type: 'earned',
      amount: amount,
      reason: reason,
      order_id: orderId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 消耗积分
 */
export async function spendPoints(userId: number, amount: number, reason: string, maoyanTxId?: string) {
  if (amount <= 0) throw new Error('积分数量必须大于 0');

  // 检查余额
  const user = await getDaiizenUserById(userId);
  if (!user || (user.available_points || 0) < amount) {
    throw new Error('积分不足');
  }

  const { data, error } = await supabase
    .from('daiizen_point_transactions')
    .insert({
      user_id: userId,
      type: 'spent',
      amount: -amount,
      reason: reason,
      maoyan_tx_id: maoyanTxId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 查询用户积分余额
 */
export async function getUserPoints(userId: number) {
  const { data, error } = await supabase
    .from('daiizen_users')
    .select('id, open_id, name, total_points, available_points')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 查询积分交易记录（分页）
 */
export async function getPointTransactions(userId: number, page: number = 1, limit: number = 20, type?: string) {
  let query = supabase
    .from('daiizen_point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

// ============================================================================
// daiizen 订单管理（可选）
// ============================================================================

/**
 * 创建 daiizen 订单
 */
export async function createDaiizenOrder(order: DaiizenOrder) {
  const orderNumber = `DZ${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const { data, error } = await supabase
    .from('daiizen_orders')
    .insert({
      user_id: order.userId,
      order_number: orderNumber,
      status: order.status,
      total_usdd: order.totalUsdd,
      shipping_address: order.shippingAddress,
      payment_method: order.paymentMethod,
      payment_tx_hash: order.paymentTxHash,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(orderId: number, status: string) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'paid') {
    updates.payment_confirmed_at = new Date().toISOString();
  } else if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('daiizen_orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 订单完成时发放积分（通过 Supabase 函数实现）
 * 说明：创建一个 Supabase Edge Function 或使用 Database Webhooks
 */

// ============================================================================
// 积分规则管理
// ============================================================================

/**
 * 查询所有启用的积分规则
 */
export async function getActivePointRules() {
  const { data, error } = await supabase
    .from('daiizen_point_rules')
    .select('*')
    .eq('is_active', true)
    .order('rule_type');

  if (error) throw error;
  return data;
}

/**
 * 更新积分规则
 */
export async function updatePointRule(ruleId: number, updates: any) {
  const { data, error } = await supabase
    .from('daiizen_point_rules')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ruleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// 邀请好友
// ============================================================================

/**
 * 创建邀请关系
 */
export async function createReferral(referrerId: number, referredId: number) {
  // 查询邀请奖励规则
  const rules = await getActivePointRules();
  const referralRule = rules.find(r => r.rule_type === 'referral');
  const rewardPoints = referralRule?.amount || 50;

  // 创建邀请记录
  const { data, error } = await supabase
    .from('daiizen_user_referrals')
    .insert({
      referrer_id: referrerId,
      referred_id: referredId,
      reward_points: rewardPoints,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // 发放邀请人奖励
  await grantPoints(referrerId, rewardPoints, '邀请好友奖励');

  // 发放被邀请人奖励（40%）
  await grantPoints(referredId, Math.floor(rewardPoints * 0.4), '被邀请奖励');

  return data;
}

// ============================================================================
// 跨平台数据查询
// ============================================================================

/**
 * 查询用户跨平台积分汇总
 */
export async function getUserCrossPlatformSummary(maoyanUserId: string) {
  const { data, error } = await supabase
    .from('user_points_summary')
    .select('*')
    .eq('maoyan_user_id', maoyanUserId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// 导出
// ============================================================================

export default {
  // 用户管理
  createDaiizenUser,
  getDaiizenUserByOpenId,
  getDaiizenUserById,
  updateDaiizenUser,
  linkMaoyanAccount,
  unlinkMaoyanAccount,

  // 积分交易
  grantPoints,
  spendPoints,
  getUserPoints,
  getPointTransactions,

  // 订单管理
  createDaiizenOrder,
  updateOrderStatus,

  // 积分规则
  getActivePointRules,
  updatePointRule,

  // 邀请好友
  createReferral,

  // 跨平台查询
  getUserCrossPlatformSummary,
};
