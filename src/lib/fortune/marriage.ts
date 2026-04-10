/**
 * 姻缘测算模块
 * 基于双方八字计算配对指数、缘分分析
 * 面向女性用户优化
 */

import { calculateBazi, BaziResult, TIAN_GAN, WU_XING_GAN, DI_ZHI, WU_XING_ZHI } from './bazi'

export interface MarriageResult {
  score: number            // 0-100 综合配对分
  dimensions: {
    name: string
    score: number
    desc: string
  }[]
  summary: string
  advice: string
}

/**
 * 计算两个八字的配对指数
 */
export function calculateMarriage(
  y1: number, m1: number, d1: number, h1: number,
  y2: number, m2: number, d2: number, h2: number
): MarriageResult {
  const bz1 = calculateBazi(y1, m1, d1, h1)
  const bz2 = calculateBazi(y2, m2, d2, h2)

  const dims: MarriageResult['dimensions'] = []

  // 1. 五行互补 (权重25)
  const wxScore = calcWuXingMatch(bz1.wuXingCount, bz2.wuXingCount)
  dims.push({
    name: '五行互补',
    score: wxScore,
    desc: wxScore >= 80 ? '你们的五行非常互补，在一起就像拼图完美契合' :
          wxScore >= 60 ? '五行比较和谐，大部分元素能互相补足' :
          '五行有一定差异，但差异也是吸引力的来源'
  })

  // 2. 生肖配对 (权重20)
  const sxScore = calcShengXiaoMatch(bz1.shengXiao, bz2.shengXiao)
  dims.push({
    name: '生肖相性',
    score: sxScore,
    desc: sxScore >= 80 ? '生肖六合或三合，天生一对的节奏' :
          sxScore >= 60 ? '生肖比较和谐，相处起来不会太累' :
          '生肖有冲有合，需要多一些包容和理解'
  })

  // 3. 性格契合 (权重20)
  const persScore = calcPersonalityMatch(bz1.riWx, bz2.riWx)
  dims.push({
    name: '性格默契',
    score: persScore,
    desc: persScore >= 80 ? '你们性格互补，一个外放一个内敛，恰到好处' :
          persScore >= 60 ? '性格有一定差异但能互相欣赏' :
          '性格差异较大，需要更多沟通和磨合'
  })

  // 4. 感情运势 (权重20)
  const loveScore = calcLoveFortune(bz1, bz2)
  dims.push({
    name: '感情运势',
    score: loveScore,
    desc: loveScore >= 80 ? '感情运势很强，在一起会越来越甜蜜' :
          loveScore >= 60 ? '感情运中等偏上，用心经营会有好结果' :
          '感情路上可能有些波折，但风雨后见彩虹'
  })

  // 5. 生活协调 (权重15)
  const lifeScore = calcLifeHarmony(bz1, bz2)
  dims.push({
    name: '生活协调',
    score: lifeScore,
    desc: lifeScore >= 80 ? '生活习惯和价值观高度一致，过日子特别和谐' :
          lifeScore >= 60 ? '大部分生活习惯能协调，小分歧不影响感情' :
          '生活习惯差异较大，需要互相迁就和适应'
  })

  // 加权总分
  const totalScore = Math.round(
    wxScore * 0.25 + sxScore * 0.2 + persScore * 0.2 + loveScore * 0.2 + lifeScore * 0.15
  )

  // 生成总结和建议
  const summary = generateMarriageSummary(totalScore, bz1, bz2)
  const advice = generateMarriageAdvice(totalScore, dims)

  return { score: totalScore, dimensions: dims, summary, advice }
}

// 五行互补度
function calcWuXingMatch(wx1: Record<string, number>, wx2: Record<string, number>): number {
  const all = ['金', '木', '水', '火', '土'] as const
  let complementScore = 0
  all.forEach(wx => {
    const diff = Math.abs((wx1[wx] || 0) - (wx2[wx] || 0))
    if (diff === 0 && (wx1[wx] || 0) > 0) complementScore += 20 // 都有且平衡
    else if (diff <= 1) complementScore += 15 // 小差异
    else if (wx1[wx] === 0 && (wx2[wx] || 0) >= 2) complementScore += 12 // 一方缺另一方补
    else if (wx1[wx] === 0 && wx2[wx] === 0) complementScore += 5 // 都缺
    else complementScore += 8
  })
  return Math.min(100, Math.max(40, complementScore))
}

// 生肖配对
function calcShengXiaoMatch(sx1: string, sx2: string): number {
  const liuHe: Record<string, string> = { '鼠': '牛', '牛': '鼠', '虎': '猪', '猪': '虎', '兔': '狗', '狗': '兔', '龙': '鸡', '鸡': '龙', '蛇': '猴', '猴': '蛇', '马': '羊', '羊': '马' }
  const sanHe = [['鼠', '龙', '猴'], ['牛', '蛇', '鸡'], ['虎', '马', '狗'], ['兔', '羊', '猪']]
  const chong: Record<string, string> = { '鼠': '马', '马': '鼠', '牛': '羊', '羊': '牛', '虎': '猴', '猴': '虎', '兔': '鸡', '鸡': '兔', '龙': '狗', '狗': '龙', '蛇': '猪', '猪': '蛇' }

  if (liuHe[sx1] === sx2) return 95
  for (const group of sanHe) {
    if (group.includes(sx1) && group.includes(sx2)) return 85
  }
  if (chong[sx1] === sx2) return 45
  return 65
}

// 性格契合度
function calcPersonalityMatch(wx1: string, wx2: string): number {
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

  if (wx1 === wx2) return 70 // 同五行，有默契但缺新鲜感
  if (sheng[wx1] === wx2 || sheng[wx2] === wx1) return 88 // 相生
  if (ke[wx1] === wx2 || ke[wx2] === wx1) return 55 // 相克
  return 72
}

// 感情运势
function calcLoveFortune(bz1: BaziResult, bz2: BaziResult): number {
  // 简化：根据双方命盘中的财官星和食伤星判断
  const loveStars1 = bz1.shiShen.filter(s => s.name === '正官' || s.name === '七杀' || s.name === '食神' || s.name === '伤官').length
  const loveStars2 = bz2.shiShen.filter(s => s.name === '正财' || s.name === '偏财').length
  return Math.min(95, Math.max(50, 55 + loveStars1 * 8 + loveStars2 * 10))
}

// 生活协调度
function calcLifeHarmony(bz1: BaziResult, bz2: BaziResult): number {
  const allWx = [...bz1.wuXingCount, ...bz2.wuXingCount] as unknown as [string, number][]
  const total = allWx.reduce((s, [, v]) => s + v, 0)
  const hasBalance = Object.values(bz1.wuXingCount).some(v => v >= 2) && Object.values(bz2.wuXingCount).some(v => v >= 2)
  return hasBalance ? 75 + Math.floor(Math.random() * 15) : 55 + Math.floor(Math.random() * 20)
}

function generateMarriageSummary(score: number, bz1: BaziResult, bz2: BaziResult): string {
  if (score >= 85) return `${bz1.shengXiao}女 + ${bz2.shengXiao}男，天作之合！你们的缘分指数非常高，从八字来看是难得的好组合。在一起的时候彼此都感到舒服和安心，这种默契是很多人羡慕不来的。`
  if (score >= 70) return `${bz1.shengXiao}女 + ${bz2.shengXiao}男，缘分不错哦！你们之间有很强的吸引力，虽然偶尔会有小分歧，但正好是增进感情的催化剂。用心经营，这段关系会越来越稳固。`
  if (score >= 55) return `${bz1.shengXiao}女 + ${bz2.shengXiao}男，有缘分但需要经营。你们之间的吸引力是真实的，只是在性格和生活习惯上有一些差异需要磨合。多沟通、多包容，感情会越来越好的。`
  return `${bz1.shengXiao}女 + ${bz2.shengXiao}男，缘分需要时间培养。八字上看你们有一些差异，但这不代表没有可能。如果真心喜欢，多了解对方、给彼此空间，说不定会有意想不到的惊喜。`
}

function generateMarriageAdvice(score: number, dims: MarriageResult['dimensions']): string {
  const weakDims = dims.filter(d => d.score < 65).map(d => d.name)
  if (score >= 85) return '你们是天造地设的一对，好好珍惜这份缘分吧！'
  if (weakDims.length === 0) return '各方面都很匹配，继续保持，感情会开花结果的！'
  return `建议多关注「${weakDims.join('」和「')}」方面，在这些维度上多花心思，会让你们的关系更加稳固。`
}
