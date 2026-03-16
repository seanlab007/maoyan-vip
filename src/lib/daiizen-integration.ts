/**
 * maoyan.vip - daiizen 积分系统集成 API
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PointTransaction {
  id: number;
  user_id: number;
  type: 'earned' | 'spent' | 'expired' | 'sync_from_maoyan';
  amount: number;
  reason?: string;
  order_id?: number;
  created_at: string;
}

interface PointRule {
  id: number;
  rule_type: string;
  amount: number;
  description?: string;
  condition_data?: any;
  is_active: boolean;
}

export async function getMyDaiizenUser(maoyanUserId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        daiizen_user_id,
        daiizen_user:daiizen_user_id (
          id,
          open_id,
          name,
          email,
          total_points,
          available_points,
          maoyan_user_id
        )
      `)
      .eq('id', maoyanUserId)
      .single();

    if (error) throw error;

    if (!data?.daiizen_user_id) {
      return null;
    }

    return data.daiizen_user;
  } catch (error) {
    console.error('获取 daiizen 用户失败:', error);
    return null;
  }
}

export async function linkDaiizenAccount(maoyanUserId: string, daiizenOpenId: string): Promise<boolean> {
  try {
    const { data: daiizenUser, error: findError } = await supabase
      .from('daiizen_users')
      .select('id, maoyan_user_id')
      .eq('open_id', daiizenOpenId)
      .single();

    if (findError || !daiizenUser) {
      throw new Error('daiizen 账号不存在');
    }

    if (daiizenUser.maoyan_user_id) {
      throw new Error('该 daiizen 账号已被关联');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ daiizen_user_id: daiizenUser.id })
      .eq('id', maoyanUserId);

    if (updateError) throw updateError;

    const { error: daiizenError } = await supabase
      .from('daiizen_users')
      .update({ maoyan_user_id: maoyanUserId })
      .eq('id', daiizenUser.id);

    if (daiizenError) throw daiizenError;

    return true;
  } catch (error: any) {
    console.error('关联账号失败:', error);
    throw error;
  }
}

export async function unlinkDaiizenAccount(maoyanUserId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('daiizen_user_id')
      .eq('id', maoyanUserId)
      .single();

    if (!profile?.daiizen_user_id) {
      throw new Error('未关联 daiizen 账号');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ daiizen_user_id: null })
      .eq('id', maoyanUserId);

    if (updateError) throw updateError;

    const { error: daiizenError } = await supabase
      .from('daiizen_users')
      .update({ maoyan_user_id: null })
      .eq('id', profile.daiizen_user_id);

    if (daiizenError) throw daiizenError;

    return true;
  } catch (error: any) {
    console.error('解除关联失败:', error);
    throw error;
  }
}

export async function getDaiizenPoints(daiizenUserId: number): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('daiizen_users')
      .select('available_points')
      .eq('id', daiizenUserId)
      .single();

    if (error) throw error;

    return data?.available_points || 0;
  } catch (error) {
    console.error('查询积分失败:', error);
    return 0;
  }
}

export async function syncDaiizenPoints(maoyanUserId: string): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('daiizen_user_id, available_daiizen_points')
      .eq('id', maoyanUserId)
      .single();

    if (!profile?.daiizen_user_id) {
      throw new Error('未关联 daiizen 账号');
    }

    if (!profile.available_daiizen_points || profile.available_daiizen_points <= 0) {
      throw new Error('daiizen 积分余额为 0');
    }

    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: maoyanUserId,
        type: 'sync_from_daiizen',
        amount: profile.available_daiizen_points,
        description: '从 daiizen 同步购物积分',
      });

    if (txError) throw txError;

    return profile.available_daiizen_points;
  } catch (error: any) {
    console.error('同步积分失败:', error);
    throw error;
  }
}

export async function getDaiizenPointTransactions(daiizenUserId: number): Promise<PointTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('daiizen_point_transactions')
      .select('*')
      .eq('user_id', daiizenUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('查询交易记录失败:', error);
    return [];
  }
}

export async function getDaiizenPointRules(): Promise<PointRule[]> {
  try {
    const { data, error } = await supabase
      .from('daiizen_point_rules')
      .select('*')
      .eq('is_active', true)
      .order('rule_type');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('查询积分规则失败:', error);
    return [];
  }
}

export function formatPoints(points: number): string {
  return points.toLocaleString();
}

export function getPointTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'earned': '获得',
    'spent': '消费',
    'expired': '过期',
    'sync_from_maoyan': '从 maoyan 同步',
  };
  return labels[type] || type;
}

export function getPointTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'earned': '🎁',
    'spent': '🪙',
    'expired': '⏰',
    'sync_from_maoyan': '🔄',
  };
  return icons[type] || '📝';
}

export default {
  getMyDaiizenUser,
  linkDaiizenAccount,
  unlinkDaiizenAccount,
  getDaiizenPoints,
  syncDaiizenPoints,
  getDaiizenPointTransactions,
  getDaiizenPointRules,
  formatPoints,
  getPointTypeLabel,
  getPointTypeIcon,
};
