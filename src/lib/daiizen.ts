import axios from 'axios'

// daiizen.com API 集成
// 文档待补充后完善，当前提供完整的接口预留框架

const daiizenClient = axios.create({
  baseURL: import.meta.env.VITE_DAIIZEN_API_URL || 'https://api.daiizen.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_DAIIZEN_API_KEY || '',
  },
})

daiizenClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[daiizen API Error]', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export interface DaiizenUser {
  id: string
  username: string
  email: string
  points: number
  level: string
}

export interface DaiizenSyncResult {
  success: boolean
  transaction_id: string
  points_transferred: number
  new_balance: number
}

// ── 用户身份互认 ──────────────────────────────────────────

/**
 * 通过邮箱查询 daiizen 用户（身份互认）
 */
export async function getDaiizenUserByEmail(email: string): Promise<DaiizenUser | null> {
  try {
    const { data } = await daiizenClient.get(`/v1/users/by-email`, { params: { email } })
    return data.user || null
  } catch {
    return null
  }
}

/**
 * 绑定 daiizen 账号（OAuth 授权码换取用户信息）
 */
export async function linkDaiizenAccount(authCode: string): Promise<DaiizenUser | null> {
  try {
    const { data } = await daiizenClient.post('/v1/auth/link', { code: authCode })
    return data.user || null
  } catch {
    return null
  }
}

// ── 积分互通 ──────────────────────────────────────────────

/**
 * 从 daiizen 导入积分到 maoyan
 * @param daiizenUserId daiizen 用户ID
 * @param points 要导入的积分数量
 */
export async function importPointsFromDaiizen(
  daiizenUserId: string,
  points: number
): Promise<DaiizenSyncResult> {
  const { data } = await daiizenClient.post('/v1/points/transfer', {
    from_platform: 'daiizen',
    to_platform: 'maoyan',
    user_id: daiizenUserId,
    amount: points,
  })
  return data
}

/**
 * 将 maoyan 积分导出到 daiizen
 */
export async function exportPointsToDaiizen(
  daiizenUserId: string,
  points: number
): Promise<DaiizenSyncResult> {
  const { data } = await daiizenClient.post('/v1/points/transfer', {
    from_platform: 'maoyan',
    to_platform: 'daiizen',
    user_id: daiizenUserId,
    amount: points,
  })
  return data
}

/**
 * 查询 daiizen 积分余额
 */
export async function getDaiizenBalance(daiizenUserId: string): Promise<number> {
  try {
    const { data } = await daiizenClient.get(`/v1/users/${daiizenUserId}/balance`)
    return data.points || 0
  } catch {
    return 0
  }
}

/**
 * 获取 daiizen 积分汇率（1 daiizen积分 = ? maoyan积分）
 */
export async function getExchangeRate(): Promise<{ daiizen_to_maoyan: number; maoyan_to_daiizen: number }> {
  try {
    const { data } = await daiizenClient.get('/v1/points/exchange-rate')
    return data
  } catch {
    // 默认 1:1
    return { daiizen_to_maoyan: 1, maoyan_to_daiizen: 1 }
  }
}

export default daiizenClient
