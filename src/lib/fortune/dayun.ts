/**
 * 大运流年算法
 * 基于八字推算起运年龄、大运天干地支和流年运势
 */

import { calculateBazi, TIAN_GAN, DI_ZHI, WU_XING_GAN, WU_XING_ZHI, type Gender } from './bazi'

export interface DaYunItem {
  idx: number        // 第几步大运
  age: number        // 起运年龄
  year: number       // 起运年份
  gan: string
  zhi: string
  wx: [string, string]
  theme: string      // 大运主题
  career: string
  love: string
  wealth: string
  score: number
}

export interface LiuNianItem {
  year: number
  age: number
  gan: string
  zhi: string
  theme: string
  score: number
  events: string[]
}

export interface DaYunResult {
  qiYunAge: number      // 起运年龄
  qiYunYear: number     // 起运年份
  daYunList: DaYunItem[]
  currentDaYun: DaYunItem | null
  liuNianList: LiuNianItem[]
  summary: string
}

// 判断阴阳年干
function isYangGan(gan: string): boolean {
  return ['甲', '丙', '戊', '庚', '壬'].includes(gan)
}

// 起运时间（数节气，简化为每3天约1岁）
function calcQiYunAge(
  year: number, month: number, day: number,
  yearGan: string, gender: Gender
): number {
  const yangGan = isYangGan(yearGan)
  // 阳男阴女顺排，阴男阳女逆排
  const forward = (gender === 'male' && yangGan) || (gender === 'female' && !yangGan)
  // 简化：根据出生月份和日期估算起运
  const daysToJieQi = (day % 10) + 1
  const age = Math.round(daysToJieQi / 3)
  return Math.max(1, Math.min(10, age))
}

// 大运主题生成
function getDaYunTheme(gan: string, zhi: string, idx: number): { theme: string; career: string; love: string; wealth: string; score: number } {
  const themes: { theme: string; career: string; love: string; wealth: string; score: number }[] = [
    { theme: '开创打基', career: '起步阶段，积累经验', love: '邂逅重要感情', wealth: '储蓄为主，谨慎投资', score: 62 },
    { theme: '积累上升', career: '能力提升，开始受到认可', love: '感情趋于稳定', wealth: '开始积累财富', score: 70 },
    { theme: '事业高峰', career: '职业黄金期，容易升职', love: '感情深化或迎来婚姻', wealth: '财运旺，有意外之财', score: 85 },
    { theme: '稳定成熟', career: '领导地位稳固，守成为主', love: '家庭和谐，子女争气', wealth: '财富稳健增值', score: 78 },
    { theme: '挑战转变', career: '面临转型，需要突破', love: '感情可能有考验', wealth: '注意资金流动', score: 65 },
    { theme: '智慧收获', career: '凭智慧和经验获得尊重', love: '夕阳红，伴侣情深', wealth: '坐享成果', score: 72 },
    { theme: '颐养天年', career: '半退休状态，发挥余热', love: '含饴弄孙', wealth: '守成为主', score: 68 },
    { theme: '圆满归宿', career: '完成使命，留下遗产', love: '老伴相依为命', wealth: '传承财富', score: 65 },
  ]
  // 根据干支五行调整
  const wxGan = WU_XING_GAN[TIAN_GAN.indexOf(gan as any)]
  const wxZhi = WU_XING_ZHI[DI_ZHI.indexOf(zhi as any)]
  const base = themes[idx % themes.length]
  // 火运加分，水运稳，金运财旺
  const wxBonus: Record<string, number> = { '火': 5, '水': 0, '金': 8, '木': 3, '土': 2 }
  return {
    ...base,
    score: Math.min(98, base.score + (wxBonus[wxGan] || 0) + (wxBonus[wxZhi] || 0) / 2),
  }
}

// 流年运势
function getLiuNianFortune(year: number, birthYear: number, daYun: DaYunItem): LiuNianItem {
  const age = year - birthYear
  const now = new Date().getFullYear()
  const diff = Math.floor((new Date(year, 0, 1).getTime() - new Date(2000, 0, 7).getTime()) / 86400000)
  const ganIdx = ((diff % 10) + 10) % 10
  const zhiIdx = ((diff % 12) + 12) % 12
  const gan = TIAN_GAN[ganIdx]
  const zhi = DI_ZHI[zhiIdx]

  const seed = year * 137 + birthYear * 13
  const rng = ((seed * 9301 + 49297) % 233280) / 233280
  const score = Math.round(daYun.score * 0.6 + rng * 40 * 0.4 + 25)

  const eventPools = [
    ['贵人出现，把握机会', '工作上有晋升机会', '财运不错，可适当投资', '感情上有新进展'],
    ['健康需要关注，注意休息', '工作上有挑战，保持冷静', '财务有波动，控制支出', '感情上需要多沟通'],
    ['适合学习进修', '出行机会增加', '人际关系顺畅', '家庭和睦，添喜事'],
    ['创业投资好时机', '职业转型期', '感情上要做决定', '财富积累关键期'],
  ]
  const eventSet = eventPools[year % eventPools.length]
  const events = [eventSet[0], eventSet[age % eventSet.length]]

  const themes = [
    '开拓进取之年', '稳健积累之年', '转变突破之年', '收获丰盈之年',
    '修炼蓄力之年', '挑战磨砺之年', '贵人相助之年', '圆满成就之年',
  ]

  return {
    year, age, gan, zhi,
    theme: themes[year % themes.length],
    score: Math.min(98, Math.max(40, score)),
    events: events.slice(0, 2),
  }
}

export function calculateDaYun(
  year: number, month: number, day: number, hour: number, gender: Gender
): DaYunResult {
  const bazi = calculateBazi(year, month, day, hour, gender)
  const qiYunAge = calcQiYunAge(year, month, day, bazi.year.gan, gender)
  const qiYunYear = year + qiYunAge
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - year

  // 生成8步大运（每步10年）
  const daYunList: DaYunItem[] = []
  const yangGan = isYangGan(bazi.year.gan)
  const forward = (gender === 'male' && yangGan) || (gender === 'female' && !yangGan)

  // 从月柱开始顺排或逆排
  const mGanIdx = TIAN_GAN.indexOf(bazi.month.gan as any)
  const mZhiIdx = DI_ZHI.indexOf(bazi.month.zhi as any)

  for (let i = 0; i < 8; i++) {
    const offset = forward ? i + 1 : -(i + 1)
    const ganIdx = ((mGanIdx + offset) % 10 + 10) % 10
    const zhiIdx = ((mZhiIdx + offset) % 12 + 12) % 12
    const gan = TIAN_GAN[ganIdx]
    const zhi = DI_ZHI[zhiIdx]
    const age = qiYunAge + i * 10
    const dy = getDaYunTheme(gan, zhi, i)
    daYunList.push({
      idx: i + 1,
      age,
      year: year + age,
      gan,
      zhi,
      wx: [WU_XING_GAN[ganIdx], WU_XING_ZHI[zhiIdx]],
      ...dy,
    })
  }

  // 当前大运
  const currentDaYun = daYunList.find(dy => {
    const endAge = dy.age + 10
    return currentAge >= dy.age && currentAge < endAge
  }) || daYunList[0]

  // 流年（未来5年 + 已过去3年）
  const liuNianList: LiuNianItem[] = []
  for (let y = currentYear - 3; y <= currentYear + 5; y++) {
    liuNianList.push(getLiuNianFortune(y, year, currentDaYun))
  }

  const summary = `你的起运年龄为 ${qiYunAge} 岁（${qiYunYear}年），目前正行${currentDaYun?.gan}${currentDaYun?.zhi}大运，主题为「${currentDaYun?.theme}」。${gender === 'male' ? '男命' : '女命'}${yangGan ? '阳' : '阴'}年出生，${forward ? '顺行大运' : '逆行大运'}。`

  return { qiYunAge, qiYunYear, daYunList, currentDaYun, liuNianList, summary }
}
