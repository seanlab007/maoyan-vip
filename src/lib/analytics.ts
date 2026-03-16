// Google Analytics 4 埋点工具
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// 初始化 GA4（在 index.html 中通过 script 标签加载，这里只做封装）
export function initGA() {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') {
    console.log('📊 GA4 未配置，跳过初始化')
    return
  }
  // GA4 脚本已在 index.html 中注入
  console.log('📊 GA4 已初始化:', GA_ID)
}

// 页面浏览事件
export function trackPageView(path: string, title?: string) {
  if (!window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  })
}

// 用户注册
export function trackRegister(method: 'email' | 'phone') {
  window.gtag?.('event', 'sign_up', { method })
}

// 用户登录
export function trackLogin(method: 'email' | 'phone') {
  window.gtag?.('event', 'login', { method })
}

// 积分变动
export function trackPointsChange(action: 'earn' | 'spend', amount: number, source: string) {
  window.gtag?.('event', 'points_change', {
    action,
    points_amount: amount,
    source,
  })
}

// 分享行为
export function trackShare(content_type: string, method: string) {
  window.gtag?.('event', 'share', { content_type, method })
}

// 下单
export function trackPurchase(orderId: string, value: number, currency = 'CNY') {
  window.gtag?.('event', 'purchase', {
    transaction_id: orderId,
    value,
    currency,
  })
}

// daiizen 积分同步
export function trackDaiizenSync(direction: 'import' | 'export', amount: number) {
  window.gtag?.('event', 'daiizen_sync', { direction, points_amount: amount })
}

// 通用自定义事件
export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.('event', name, params)
}
