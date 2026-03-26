import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/orders/cross-platform
 * 
 * 接收来自各平台的订单报告（通过 MaoYan SDK 的 reportOrder()），
 * 使用 service_role 调用 Supabase RPC submit_platform_order，
 * 将消费金额的 10% 转换为 MAO 积分发放到用户钱包。
 * 
 * 支持平台：daiizen / mcmamoo / whalepictures / umonfrost / lacelle1802 / maoyan
 * 数据库：fczherphuixpdjuevzsh.supabase.co
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ALLOWED_PLATFORMS = ['daiizen', 'mcmamoo', 'whalepictures', 'umonfrost', 'lacelle1802', 'maoyan']

// CORS：允许所有平台调用
const CORS_ORIGINS = [
  'https://maoyan.vip',
  'https://daiizen.com',
  'https://mcmamoo.com',
  'https://www.mcmamoo.com',
  'https://whalepictures.vip',
  'https://www.whalepictures.vip',
  'https://umonfrost.com',
  'https://www.umonfrost.com',
  'https://lacelle1802.com',
  'https://www.lacelle1802.com',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 处理
  const origin = req.headers.origin || ''
  if (CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // 验证 Authorization Bearer token（Supabase JWT）
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '需要登录' })
  }
  const token = authHeader.slice(7)

  // 验证用户 token
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || '')
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Token 无效或已过期' })
  }

  // 解析请求体
  const { platform, orderId, amountUsd, currency = 'USD' } = req.body || {}

  if (!ALLOWED_PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: `不支持的平台：${platform}` })
  }
  if (!orderId || typeof amountUsd !== 'number' || amountUsd <= 0) {
    return res.status(400).json({ error: '参数错误：orderId 和 amountUsd 必填' })
  }

  // 使用 service_role 调用 RPC
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data, error } = await serviceClient.rpc('submit_platform_order', {
    p_user_id: user.id,
    p_platform: platform,
    p_order_id: String(orderId),
    p_amount_usd: amountUsd,
    p_currency: currency,
    p_auto_credit: true,
  })

  if (error) {
    console.error('[cross-platform API]', error)
    return res.status(500).json({ error: '积分发放失败', detail: error.message })
  }

  const maoReward = Math.floor(amountUsd * 0.10 * 100)
  return res.status(200).json({
    success: true,
    orderId: data,
    maoReward,
    message: `成功发放 ${maoReward} MAO 积分`,
  })
}
