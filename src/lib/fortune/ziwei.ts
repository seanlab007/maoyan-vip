/**
 * 紫微斗数核心算法
 * 基于农历生辰推算命宫、主星、身宫
 * 参考 iztro 算法逻辑，纯前端实现
 */

import { DI_ZHI } from './bazi'

// 紫微斗数十四主星
export const ZIWEI_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
] as const

// 六吉星
export const AUSPICIOUS_STARS = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'] as const

// 六煞星
export const INAUSPICIOUS_STARS = ['火星', '铃星', '擎羊', '陀罗', '地空', '地劫'] as const

// 12宫名称（顺时针）
export const PALACES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'
] as const

// 五行属性
const STAR_WUXING: Record<string, string> = {
  '紫微': '土', '天机': '木', '太阳': '火', '武曲': '金', '天同': '水', '廉贞': '火',
  '天府': '土', '太阴': '水', '贪狼': '木', '巨门': '水', '天相': '水', '天梁': '土',
  '七杀': '金', '破军': '水'
}

// 主星解读
const STAR_DESC: Record<string, { trait: string; career: string; love: string }> = {
  '紫微': { trait: '领导力强，尊贵自重，有王者之风，自带光环', career: '管理、政务、高端商业均适合', love: '感情中处于主导地位，对伴侣要求较高' },
  '天机': { trait: '聪明灵活，谋略出众，思维活跃，变化多端', career: '策划、咨询、科研、IT领域发光发热', love: '感情细腻，但变化多，需要给予安全感' },
  '太阳': { trait: '热情开朗，乐于助人，有博爱精神，广受欢迎', career: '公关、教育、媒体、政界均有建树', love: '感情大方，但有时过于付出忽略自己' },
  '武曲': { trait: '意志坚强，行动力强，重实际，有将帅之才', career: '金融、军警、外科、机械等硬核领域', love: '感情朴实直接，不善表达但忠诚可靠' },
  '天同': { trait: '温和善良，享受生活，心地纯善，有福气', career: '服务业、餐饮、文艺、儿童教育', love: '感情温柔包容，是细水长流的好伴侣' },
  '廉贞': { trait: '热情刚直，有冒险精神，喜欢挑战和自我突破', career: '艺术、演艺、法律、军事', love: '感情热烈浓厚，有桃花但感情路多波折' },
  '天府': { trait: '稳重踏实，有包容心，喜储蓄，求安定', career: '银行、财务、房产、管理', love: '感情稳重，对家庭责任感强' },
  '太阴': { trait: '温柔细腻，直觉灵敏，有艺术气质，感性', career: '文艺、设计、心理、护理', love: '感情丰富，对伴侣体贴入微' },
  '贪狼': { trait: '多才多艺，桃花旺盛，欲望多样，活力四射', career: '娱乐、销售、公关、餐饮酒吧', love: '桃花星，魅力十足但感情复杂' },
  '巨门': { trait: '口才了得，思辨能力强，有些多疑', career: '律师、教师、主持人、谈判', love: '感情中爱讲道理，需要包容对方' },
  '天相': { trait: '公正勤奋，乐于助人，喜欢规矩秩序', career: '行政、秘书、法律辅助、服务业', love: '感情忠诚，喜欢照顾对方' },
  '天梁': { trait: '正直清高，有贵人运，处事稳重老道', career: '医疗、宗教、社会工作、顾问', love: '感情成熟，常有老少配的缘分' },
  '七杀': { trait: '冲劲十足，争强好胜，有闯劲，不服输', career: '创业、军警、体育、外科', love: '感情上容易急躁，但对伴侣很保护' },
  '破军': { trait: '开创改革，敢于突破旧格局，变动多', career: '改革、革新性行业、创意创业', love: '感情上变动较多，婚姻需谨慎' },
}

export interface ZiWeiResult {
  mingGong: {
    palace: string
    zhi: string
    mainStar: string
    auspicious: string[]
    inauspicious: string[]
    score: number
  }
  shenGong: {
    palace: string
    zhi: string
  }
  palaceStars: { palace: string; zhi: string; stars: string[] }[]
  mainStarDesc: typeof STAR_DESC[string] & { name: string; wuxing: string }
  personality: string
  lifePattern: string
  yearFortune: { year: number; desc: string; score: number }[]
}

// 简易农历转换（基于公历偏移，精度适合娱乐）
function toLunar(year: number, month: number, day: number): { year: number; month: number; day: number } {
  // 简化：使用公历偏移模拟农历
  // 实际农历转换需要完整的天文历表
  const base = new Date(1900, 0, 31)
  const target = new Date(year, month - 1, day)
  const diff = Math.floor((target.getTime() - base.getTime()) / 86400000)
  const lunarYear = Math.floor(diff / 365) + 1900
  const lunarMonth = Math.floor((diff % 365) / 30) + 1
  const lunarDay = (diff % 30) + 1
  return { year: lunarYear, month: Math.min(12, Math.max(1, lunarMonth)), day: Math.min(30, Math.max(1, lunarDay)) }
}

// 寅宫起，地支顺序推算命宫
function calcMingGongZhi(lunarMonth: number, hour: number): string {
  // 子时=0, 以寅时(hour=4)为命宫起点
  const hourIdx = Math.floor(((hour + 1) % 24) / 2) // 地支时辰索引
  // 寅月生人，子时命宫在寅
  // 根据生月生时互相推算
  const base = (lunarMonth - 1 + 2) % 12 // 寅=2
  const idx = ((2 + lunarMonth - 1) * 2 - hourIdx * 2 + 24) % 12
  return DI_ZHI[idx]
}

// 根据五行局和命宫地支，定紫微星位置
function calcZiWeiPalace(lunarYear: number, lunarMonth: number, lunarDay: number): number {
  // 五行局：根据年干和命宫确定
  const wu_xing_ju = [2, 3, 4, 5, 6][(lunarYear % 5)]
  // 紫微所在宫位（简化算法）
  const base = (lunarDay % 12)
  return base
}

// 播种主星到各宫
function distributeMajorStars(ziWeiPos: number): Record<string, string[]> {
  const starsInPalace: Record<string, string[]> = {}
  for (const zhi of DI_ZHI) starsInPalace[zhi] = []

  // 紫微系（紫微、天机、太阳、武曲、天同、廉贞）
  const ziWeiGroup = [
    { star: '紫微', offset: 0 }, { star: '天机', offset: -1 },
    { star: '太阳', offset: -2 }, { star: '武曲', offset: -3 },
    { star: '天同', offset: -4 }, { star: '廉贞', offset: -6 }
  ]
  // 天府系（天府、太阴、贪狼、巨门、天相、天梁、七杀、破军）
  const tianFuGroup = [
    { star: '天府', offset: 0 }, { star: '太阴', offset: 1 },
    { star: '贪狼', offset: 2 }, { star: '巨门', offset: 3 },
    { star: '天相', offset: 4 }, { star: '天梁', offset: 5 },
    { star: '七杀', offset: 6 }, { star: '破军', offset: 10 }
  ]
  // 天府星位 = 紫微对宫偏移
  const tianFuPos = (ziWeiPos + 4) % 12

  ziWeiGroup.forEach(({ star, offset }) => {
    const pos = ((ziWeiPos + offset) % 12 + 12) % 12
    starsInPalace[DI_ZHI[pos]].push(star)
  })
  tianFuGroup.forEach(({ star, offset }) => {
    const pos = (tianFuPos + offset) % 12
    starsInPalace[DI_ZHI[pos]].push(star)
  })

  return starsInPalace
}

// 六吉星分布（简化）
function distributeAuspicious(year: number, hour: number): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const zhi of DI_ZHI) result[zhi] = []
  const base = year % 12
  AUSPICIOUS_STARS.forEach((star, i) => {
    const pos = (base + i * 2 + hour) % 12
    result[DI_ZHI[pos]].push(star)
  })
  return result
}

// 六煞星分布（简化）
function distributeInauspicious(year: number, hour: number): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const zhi of DI_ZHI) result[zhi] = []
  INAUSPICIOUS_STARS.forEach((star, i) => {
    const pos = (year + i * 3 + hour + 1) % 12
    result[DI_ZHI[pos]].push(star)
  })
  return result
}

// 生成大运流年（每10年一大运）
function generateDaYunFortune(mainStar: string, birthYear: number): { year: number; desc: string; score: number }[] {
  const result = []
  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear

  const patterns = [
    { ages: [1, 10], descs: ['幼年时期，依赖家庭，性格初成', '儿时学习，积累基础，家庭影响深远'] },
    { ages: [11, 20], descs: ['青春期，自我意识觉醒，探索兴趣', '高中大学时代，结交重要朋友，见识增长'] },
    { ages: [21, 30], descs: ['事业起步，感情萌芽，打拼初期', '三十而立，事业感情双线发展，压力较大'] },
    { ages: [31, 40], descs: ['事业上升期，感情稳定，家庭责任增加', '黄金十年，收获期，注意健康管理'] },
    { ages: [41, 50], descs: ['事业高峰，考验智慧，需要突破', '中年转型期，调整方向，沉淀升华'] },
    { ages: [51, 60], descs: ['积累回报，享受成果，子女成才', '智慧期，可发挥人生经验，广受尊重'] },
    { ages: [61, 70], descs: ['退休安享，颐养天年，含饴弄孙', '老年运势，注重健康，修身养性'] },
  ]

  const seedRng = (seed: number) => {
    let s = seed
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  }

  for (let i = 0; i < 7; i++) {
    const startAge = patterns[i].ages[0]
    const year = birthYear + startAge
    const rng = seedRng(birthYear + i * 137)
    const score = Math.round(55 + rng() * 40)
    const descIdx = rng() > 0.5 ? 0 : 1
    result.push({ year, desc: patterns[i].descs[descIdx], score })
  }
  return result
}

// 性格分析
function generatePersonality(mainStar: string, mingZhi: string): string {
  const zhiPers: Record<string, string> = {
    '子': '思维敏锐，适应能力强，天生有亲和力',
    '丑': '踏实稳健，意志坚定，对目标专注',
    '寅': '积极进取，有领导气质，喜欢挑战',
    '卯': '心思细腻，创意丰富，善解人意',
    '辰': '包容万物，有魄力，做事有大局观',
    '巳': '聪明机智，洞察力强，有神秘气质',
    '午': '热情奔放，行动力强，有感染力',
    '未': '温和善良，有艺术品味，重感情',
    '申': '机灵活泼，思维多变，适应力强',
    '酉': '精致完美，条理清晰，有鉴赏力',
    '戌': '忠诚可靠，正直有责任心，重义气',
    '亥': '感性浪漫，直觉敏锐，有悲悯心',
  }
  const starTrait = STAR_DESC[mainStar]?.trait || ''
  const zhiTrait = zhiPers[mingZhi] || ''
  return `命宫坐${mingZhi}，${zhiTrait}。命主${mainStar}星主导，${starTrait}。综合来看，你是一个${starTrait.split('，')[0]}且${zhiTrait.split('，')[0]}的人。`
}

// 命运格局
function generateLifePattern(mainStar: string, score: number): string {
  const patterns: Record<string, string[]> = {
    high: [
      `${mainStar}坐命，贵气横溢，一生多受贵人相助，命格高贵，宜在社会上层发展。`,
      `${mainStar}入命，聪明才智超群，凭借自身努力可达人生高峰，财官双美。`,
    ],
    mid: [
      `${mainStar}坐命，平稳中见机遇，需要主动出击，中年后运势明显上升。`,
      `${mainStar}入命，有起有落，但总体向好，坚持努力终得回报。`,
    ],
    low: [
      `${mainStar}坐命，早年多磨砺，但磨砺是财富，大器晚成之相，中晚年方显峥嵘。`,
      `${mainStar}入命，命中多有挑战，但正是这些历练铸就坚韧的性格。`,
    ],
  }
  const level = score >= 75 ? 'high' : score >= 55 ? 'mid' : 'low'
  const idx = score % 2
  return patterns[level][idx]
}

export function calculateZiWei(year: number, month: number, day: number, hour: number): ZiWeiResult {
  const lunar = toLunar(year, month, day)
  const mingZhi = calcMingGongZhi(lunar.month, hour)
  const mingIdx = DI_ZHI.indexOf(mingZhi as any)

  // 身宫：时支与命宫配合（简化）
  const hourZhiIdx = Math.floor(((hour + 1) % 24) / 2)
  const shenIdx = (mingIdx + hourZhiIdx + 6) % 12
  const shenZhi = DI_ZHI[shenIdx]

  const ziWeiPos = (calcZiWeiPalace(lunar.year, lunar.month, lunar.day) + mingIdx) % 12
  const majorStars = distributeMajorStars(ziWeiPos)
  const auspiciousStars = distributeAuspicious(year, hour)
  const inauspiciousStars = distributeInauspicious(year, hour)

  // 命宫主星
  const mingStars = majorStars[mingZhi] || []
  const mainStar = mingStars.length > 0 ? mingStars[0] : '紫微' // fallback

  // 评分
  const auspiciousCount = (auspiciousStars[mingZhi] || []).length
  const inauspiciousCount = (inauspiciousStars[mingZhi] || []).length
  const baseScore = 55 + mingStars.length * 8
  const score = Math.min(98, Math.max(40, baseScore + auspiciousCount * 5 - inauspiciousCount * 4))

  // 各宫星曜汇总
  const palaceStars = DI_ZHI.map((zhi, i) => ({
    palace: PALACES[i % 12],
    zhi,
    stars: [
      ...(majorStars[zhi] || []),
      ...(auspiciousStars[zhi] || []),
      ...(inauspiciousStars[zhi] || []).map(s => `⚡${s}`),
    ]
  }))

  const mainStarDesc = {
    name: mainStar,
    wuxing: STAR_WUXING[mainStar] || '土',
    ...(STAR_DESC[mainStar] || { trait: '综合型命格', career: '多方位发展', love: '感情丰富细腻' })
  }

  return {
    mingGong: {
      palace: '命宫',
      zhi: mingZhi,
      mainStar,
      auspicious: auspiciousStars[mingZhi] || [],
      inauspicious: inauspiciousStars[mingZhi] || [],
      score,
    },
    shenGong: {
      palace: PALACES[shenIdx % 12],
      zhi: shenZhi,
    },
    palaceStars,
    mainStarDesc,
    personality: generatePersonality(mainStar, mingZhi),
    lifePattern: generateLifePattern(mainStar, score),
    yearFortune: generateDaYunFortune(mainStar, year),
  }
}
