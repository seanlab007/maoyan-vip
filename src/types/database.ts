// Supabase 数据库类型定义
// 完整类型由 supabase gen types typescript 自动生成
// 这里手动定义便于开发

export type UserLevel = 'newbie' | 'silver' | 'gold' | 'platinum' | 'diamond'
export type TransactionType = 'earn' | 'spend' | 'transfer' | 'referral_reward' | 'daily_checkin' | 'admin_adjust'
export type TransactionSource = 'register' | 'daily_checkin' | 'share' | 'referral' | 'sell_commission' | 'redeem' | 'daiizen_sync' | 'admin'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PayType = 'points' | 'cash' | 'mixed'

export interface Profile {
  id: string
  username: string | null
  nickname: string
  avatar_url: string | null
  phone: string | null
  bio: string | null
  level: UserLevel
  trust_score: number
  follower_count: number
  engagement_rate: number
  gmv_total: number
  commission_total: number
  daiizen_user_id: string | null
  daiizen_linked_at: string | null
  referral_code: string
  referred_by: string | null
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  frozen_balance: number
  total_earned: number
  total_spent: number
  last_checkin_at: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  source: TransactionSource
  amount: number
  balance_after: number
  description: string | null
  ref_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: string
  price: number | null
  points_price: number | null
  stock: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  product_id: string
  quantity: number
  pay_type: PayType
  points_used: number
  cash_paid: number
  status: OrderStatus
  address: Record<string, unknown>
  remark: string | null
  created_at: string
  updated_at: string
  product?: Product
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  reward_points: number
  rewarded_at: string | null
  created_at: string
  referred?: Profile
}

export interface Checkin {
  id: string
  user_id: string
  streak: number
  points: number
  checked_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      wallets: { Row: Wallet; Insert: Partial<Wallet>; Update: Partial<Wallet> }
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> }
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      referrals: { Row: Referral; Insert: Partial<Referral>; Update: Partial<Referral> }
      checkins: { Row: Checkin; Insert: Partial<Checkin>; Update: Partial<Checkin> }
    }
  }
}

// 等级配置
export const LEVEL_CONFIG: Record<UserLevel, {
  label: string
  color: string
  minGmv: number
  commission: number
  icon: string
}> = {
  newbie:   { label: '新手',  color: '#9ba3b8', minGmv: 0,      commission: 0.05, icon: '🌱' },
  silver:   { label: '白银',  color: '#c0c0c0', minGmv: 5000,   commission: 0.08, icon: '🥈' },
  gold:     { label: '黄金',  color: '#f6c90e', minGmv: 30000,  commission: 0.12, icon: '🥇' },
  platinum: { label: '铂金',  color: '#4a9eff', minGmv: 100000, commission: 0.16, icon: '💎' },
  diamond:  { label: '钻石',  color: '#9d6dff', minGmv: 500000, commission: 0.20, icon: '👑' },
}
