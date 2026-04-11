/**
 * 财运分析模块
 * 基于八字分析财运方向、理财建议
 * 面向女性用户优化
 */

import { calculateBazi, BaziResult } from './bazi'

const WU_XING_KE: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

export interface WealthResult {
  score: number           // 财运指数 0-100
  type: string            // 财运类型
  directions: string[]    // 有利方位
  colors: string[]        // 幸运颜色
  industries: string[]    // 适合行业
  periods: { period: string; fortune: string; desc: string }[]
  summary: string
  advice: string
}

const WU_XING_DIRECTION: Record<string, string> = {
  '金': '西方', '木': '东方', '水': '北方', '火': '南方', '土': '中央',
}
const WU_XING_COLOR: Record<string, string> = {
  '金': '白色、银色', '木': '绿色、青色', '水': '黑色、深蓝', '火': '红色、粉色', '土': '黄色、棕色',
}
const WU_XING_INDUSTRY: Record<string, string[]> = {
  '金': ['金融投资', '珠宝首饰', '法律咨询', '医疗美容', '高端服务业'],
  '木': ['教育培训', '文化传媒', '设计创意', '花卉植物', '健康养生'],
  '水': ['物流运输', '旅游酒店', '心理咨询', '社交媒体运营', '内容创作'],
  '火': ['电子商务', '餐饮美食', '直播电商', '摄影影像', '美妆护肤'],
  '土': ['房地产', '建筑工程', '农业食品', '宠物经济', '母婴行业'],
}

export function analyzeWealth(
  year: number, month: number, day: number, hour: number
): WealthResult {
  const bz = calculateBazi(year, month, day, hour)
  const { wuXingCount, riWx, shiShen } = bz

  // 财运类型判断
  const hasZhengCai = shiShen.some(s => s.name === '正财')
  const hasPianCai = shiShen.some(s => s.name === '偏财')
  const caiWxCount = wuXingCount[WU_XING_KE[riWx] || '土'] || 0

  let type: string
  let score: number
  if (hasZhengCai && hasPianCai) {
    type = '正偏财双全'
    score = 82 + Math.floor(Math.random() * 13)
  } else if (hasZhengCai) {
    type = '正财运旺盛'
    score = 70 + Math.floor(Math.random() * 15)
  } else if (hasPianCai) {
    type = '偏财运突出'
    score = 65 + Math.floor(Math.random() * 18)
  } else if (caiWxCount >= 3) {
    type = '暗藏财运'
    score = 60 + Math.floor(Math.random() * 15)
  } else {
    type = '才华生财'
    score = 55 + Math.floor(Math.random() * 15)
  }

  // 五行最旺的作为主要方向
  const sortedWx = Object.entries(wuXingCount).sort((a, b) => b[1] - a[1])
  const topWx = sortedWx[0][0] as string
  const secondWx = sortedWx[1][0] as string

  // 缺的五行对应的方向和颜色也需要补充
  const lackWx = sortedWx.filter(([, v]) => v === 0).map(([k]) => k as string)

  const directions = [WU_XING_DIRECTION[topWx]]
  if (WU_XING_DIRECTION[secondWx] && !directions.includes(WU_XING_DIRECTION[secondWx])) {
    directions.push(WU_XING_DIRECTION[secondWx])
  }
  lackWx.forEach(w => {
    if (WU_XING_DIRECTION[w] && !directions.includes(WU_XING_DIRECTION[w])) {
      directions.push(WU_XING_DIRECTION[w] + '(补运)')
    }
  })

  const colors = [WU_XING_COLOR[topWx]]
  lackWx.forEach(w => {
    if (WU_XING_COLOR[w]) colors.push(WU_XING_COLOR[w] + '(补运)')
  })

  const industries = [
    ...(WU_XING_INDUSTRY[topWx] || []).slice(0, 2),
    ...(WU_XING_INDUSTRY[secondWx] || []).slice(0, 1),
  ]

  // 流年运势
  const currentYear = new Date().getFullYear()
  const periods = []
  for (let i = 0; i < 3; i++) {
    const y = currentYear + i
    const yWx = getYearWuXing(y)
    const match = yWx === riWx ? '大吉' : (Object.values(WU_XING_KE).some(v => v === yWx) ? '吉利' : '平稳')
    const desc = match === '大吉'
      ? '是你的本命五行年，财运亨通，适合大动作'
      : match === '吉利'
      ? '财星年，正财偏财都有进账的机会'
      : '稳扎稳打的一年，适合积累和沉淀'
    periods.push({ period: `${y}年`, fortune: match, desc })
  }

  const summary = generateWealthSummary(type, score, riWx, topWx, industries)
  const advice = generateWealthAdvice(type, score, lackWx, directions, colors)

  return { score, type, directions, colors, industries, periods, summary, advice }
}

function getYearWuXing(year: number): string {
  const ganIdx = (year - 4) % 10
  const gans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
  const wxMap: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' }
  return wxMap[gans[ganIdx]]
}

function generateWealthSummary(type: string, score: number, riWx: string, topWx: string, industries: string[]): string {
  return `你的财运类型为「${type}」，财运指数 ${score} 分。${type === '正偏财双全' ? '你天生就是个小富婆的命，既能踏实赚钱也能抓住意外之财。' : type === '正财运旺盛' ? '你的正财运很旺，靠工资和稳定收入就能过得很好，适合深耕一个领域。' : type === '偏财运突出' ? '你常有意外收获的惊喜，投资眼光不错，但要注意别贪心。' : type === '暗藏财运' ? '你的财运不是摆在明面上的，需要发掘自己的潜力才能显现。' : '你的财富更多来自个人才华和专业能力，投资自己永远是最好的投资。'}五行${topWx}是你的贵人五行，从事${industries.slice(0, 2).join('或')}等行业会特别顺。`
}

function generateWealthAdvice(type: string, score: number, lackWx: string[], directions: string[], colors: string[]): string {
  const tips: string[] = []
  tips.push(`方位建议：多去${directions[0]}方向发展或旅行，能带来财运加持。`)
  tips.push(`颜色加分：日常穿搭或办公环境多使用${colors[0]}，有助于提升气场。`)
  if (lackWx.length > 0) {
    tips.push(`五行补充：你五行缺${lackWx.join('、')}，可以通过饰品、饮食或生活习惯来补充。`)
  }
  if (score >= 75) {
    tips.push('理财建议：财运好的时候也别忘了存钱，建议收入的三分之一做稳健投资。')
  } else {
    tips.push('理财建议：先打牢基本功，提升技能比盲目投资更重要。')
  }
  return tips.join(' ')
}
