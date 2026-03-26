/**
 * daiizenApi.ts — maoyan.vip 调用 daiizen 后端的统一客户端
 *
 * 包含：
 *  - 公开商品 API（无需 secret）
 *  - 积分/抽奖 API（需要 x-maoyan-secret header）
 *  - 身份互通 API
 */

const DAIIZEN_BASE = import.meta.env.VITE_DAIIZEN_API_URL || 'https://api.daiizen.com'
const MAOYAN_SECRET = import.meta.env.VITE_MAOYAN_LINK_SECRET || 'dev-link-secret-change-me'

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function get<T>(path: string, params?: Record<string, string | number>, withSecret = false): Promise<T> {
  const url = new URL(`${DAIIZEN_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  const headers: Record<string, string> = {}
  if (withSecret) headers['x-maoyan-secret'] = MAOYAN_SECRET
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function post<T>(path: string, body: unknown, withSecret = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (withSecret) headers['x-maoyan-secret'] = MAOYAN_SECRET
  const res = await fetch(`${DAIIZEN_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DaiizenProduct {
  id: number
  slug: string
  name: string
  nameEn: string
  description: string | null
  priceUsdd: string      // decimal as string from API
  stock: number
  images: string[]
  aiGeneratedImageUrl: string | null
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  weight: string | null
  categoryId: number | null
  category: DaiizenCategory | null
  createdAt: string
  updatedAt: string
}

export interface DaiizenCategory {
  id: number
  slug: string
  name: string
  nameEn: string
  iconUrl: string | null
  sortOrder: number
}

export interface ProductsResponse {
  data: DaiizenProduct[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface LotteryPrize {
  rank: number
  name: string
  probability: number
  value: string
  isPhysical: boolean
  stock: number
}

export interface Lottery {
  id: number
  type: 'points_draw' | 'prize_pool'
  title: string
  description: string | null
  status: 'active' | 'paused' | 'ended'
  costPoints: number
  poolAmount: string | null
  poolCurrency: string
  prizes: LotteryPrize[] | null
  maxDrawsPerUser: number | null
  totalDraws: number
  startAt: string
  endAt: string | null
}

export interface UserPoints {
  id: number
  userId: number
  maoyanOpenId: string | null
  balance: number
  totalEarned: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface DrawRecord {
  id: number
  lotteryId: number
  userId: number
  maoyanOpenId: string | null
  sourcePlatform: string
  result: 'win' | 'lose' | 'pending'
  prizeRank: number | null
  prizeName: string | null
  prizeValue: string | null
  pointsSpent: number
  isClaimed: number
  claimedAt: string | null
  createdAt: string
}

export interface DrawResponse {
  success: boolean
  draw: DrawRecord
  prize: { rank: number; name: string; value: string }
  isWin: boolean
  pointsSpent: number
  pointsReturned: number
  newBalance: number
}

export interface UserLink {
  id: number
  daiizenUserId: number
  maoyanOpenId: string
  maoyanEmail: string | null
  linkedAt: string
}

// ── 公开商品 API（无需 secret）────────────────────────────────────────────────

export const productApi = {
  /** 获取分类列表 */
  getCategories: (lang = 'zh'): Promise<{ data: DaiizenCategory[] }> =>
    get('/api/public/categories', { lang }),

  /** 获取商品列表（分页 + 过滤） */
  getProducts: (params: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sort?: 'newest' | 'price_asc' | 'price_desc'
    featured?: boolean
    lang?: string
  } = {}): Promise<ProductsResponse> => {
    const p: Record<string, string | number> = {}
    if (params.page) p.page = params.page
    if (params.limit) p.limit = params.limit
    if (params.category) p.category = params.category
    if (params.search) p.search = params.search
    if (params.sort) p.sort = params.sort
    if (params.featured) p.featured = '1'
    p.lang = params.lang || 'zh'
    return get('/api/public/products', p)
  },

  /** 获取单个商品 */
  getProduct: (slug: string, lang = 'zh'): Promise<{ data: DaiizenProduct }> =>
    get(`/api/public/products/${slug}`, { lang }),
}

// ── 积分 API ──────────────────────────────────────────────────────────────────

export const pointsApi = {
  /** 通过 maoyan openId 查积分 */
  getByMaoyan: (maoyanOpenId: string): Promise<{ data: UserPoints | null; linked: boolean }> =>
    post('/api/points-lottery/points/by-maoyan', { maoyanOpenId }),
}

// ── 抽奖 API ──────────────────────────────────────────────────────────────────

export const lotteryApi = {
  /** 获取所有活跃抽奖活动 */
  getAll: (): Promise<{ data: Lottery[] }> =>
    get('/api/points-lottery/lotteries'),

  /** 执行抽奖（maoyan 用户） */
  draw: (params: {
    lotteryId: number
    maoyanOpenId: string
  }): Promise<DrawResponse> =>
    post('/api/points-lottery/draw', {
      ...params,
      sourcePlatform: 'maoyan',
    }),

  /** 获取 maoyan 用户的抽奖历史 */
  getHistoryByMaoyan: (maoyanOpenId: string, limit = 20): Promise<{ data: DrawRecord[] }> =>
    post('/api/points-lottery/draws/by-maoyan', { maoyanOpenId, limit }),

  /** 领奖 */
  claim: (drawId: number): Promise<{ success: boolean; prizeName: string; prizeValue: string }> =>
    post(`/api/points-lottery/claim/${drawId}`, {}),
}

// ── 身份互通 API ──────────────────────────────────────────────────────────────

export const linkApi = {
  /** 绑定 maoyan openId 到 daiizen userId */
  link: (daiizenUserId: number, maoyanOpenId: string, maoyanEmail?: string): Promise<{ success: boolean }> =>
    post('/api/points-lottery/link', { daiizenUserId, maoyanOpenId, maoyanEmail }),

  /** 通过 maoyan openId 查 daiizen 账号 */
  getByMaoyan: (maoyanOpenId: string): Promise<{ data: UserLink }> =>
    get('/api/points-lottery/link/by-maoyan', { maoyanOpenId }, true),
}
