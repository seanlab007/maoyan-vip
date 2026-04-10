/**
 * 每日运势模块
 * 基于出生八字 + 当日干支计算今日运势
 * 面向女性用户优化
 */

import { calculateBazi, TIAN_GAN, DI_ZHI, WU_XING_GAN, WU_XING_ZHI } from './bazi'

export interface DailyFortuneResult {
  date: string
  overall: { score: number; desc: string; emoji: string }
  love: { score: number; desc: string }
  career: { score: number; desc: string }
  wealth: { score: number; desc: string }
  health: { score: number; desc: string }
  lucky: {
    color: string
    number: string
    direction: string
    food: string
    constellation: string
  }
  tip: string
}

// 12星座
const XING_ZUO = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座']

// 获取当天干支
function getTodayGanZhi(): [string, string] {
  const now = new Date()
  const base = new Date(2000, 0, 7)
  const diff = Math.floor((now.getTime() - base.getTime()) / 86400000)
  const ganIdx = ((diff % 10) + 10) % 10
  const zhiIdx = ((diff % 12) + 12) % 12
  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]]
}

// 伪随机（基于日期种子，保证同一天结果一致）
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const LOVE_DESCS = [
  '桃花运很旺，有可能遇到让你心动的TA',
  '感情稳定甜蜜，和另一半的默契度很高',
  '适合表白或约会，今天你的魅力值拉满',
  '感情上可能会有些小纠结，别想太多',
  '单身的话多出去走走，缘分可能就在转角',
  '感情运平平，适合安安静静地独处',
  '今天容易和喜欢的人产生误会，主动沟通',
  '桃花运爆棚，注意分辨真心和假意哦',
]

const CAREER_DESCS = [
  '工作状态极佳，灵感源源不断',
  '适合处理重要工作，决策能力很强',
  '可能会得到领导的认可或好消息',
  '工作压力有点大，注意劳逸结合',
  '适合学习和充电，提升自己的好时机',
  '工作中可能有小波折，保持平常心',
  '社交能力出众，适合拓展人脉',
  '效率一般，建议优先处理最重要的事',
]

const WEALTH_DESCS = [
  '财运亨通，可能有意外的收入进账',
  '适合理财规划，今天做的决定大概率正确',
  '偏财运不错，可以小试手气',
  '消费欲比较强，注意控制购物冲动',
  '正财稳定，踏实工作就能有收获',
  '不宜大额支出，省着点花',
  '有人可能会找你借钱，量力而行',
  '投资方面要保持谨慎，不宜冲动',
]

const HEALTH_DESCS = [
  '精力充沛，适合运动锻炼',
  '注意饮食规律，别暴饮暴食',
  '睡眠质量可能不太好，早点休息',
  '身体状态不错，心情也跟着好',
  '注意保护眼睛，少看手机多远眺',
  '适合做瑜伽或冥想，放松身心',
  '可能会有小不适，注意添减衣物',
  '情绪波动可能较大，找朋友聊聊天',
]

const DAILY_TIPS = [
  '今天适合穿一件亮色的衣服出门，好运加分',
  '给自己泡一杯花茶，心情会变好哦',
  '出门前照照镜子给自己一个微笑，自信就是最好的风水',
  '今天适合整理一下房间，断舍离能带来好运',
  '给在意的人发一条关心消息，善意的能量会回流给你',
  '今天试着走一条不同的路去上班，新鲜感能激发好运',
  '睡前写三件感恩的事，会睡得更踏实',
  '今天适合给自己买一份小礼物犒劳自己',
]

const LUCKY_FOODS = ['草莓', '蓝莓', '抹茶蛋糕', '牛油果沙拉', '黑巧克力', '蜜桃', '坚果', '热可可', '桂花糕', '樱花茶', '樱桃', '芒果']

const LUCKY_COLORS_MAP: Record<string, string> = {
  '木': '嫩绿色', '火': '珊瑚粉', '土': '奶茶色', '金': '珍珠白', '水': '雾霾蓝',
}

export function getDailyFortune(
  year: number, month: number, day: number, hour: number
): DailyFortuneResult {
  const bz = calculateBazi(year, month, day, hour)
  const [todayGan, todayZhi] = getTodayGanZhi()
  const now = new Date()

  // 基于日期生成种子
  const seed = year * 10000 + month * 100 + day + now.getFullYear() * 1000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rand = seededRandom(seed)

  // 计算当日和命盘的五行关系
  const todayWx = WU_XING_GAN[TIAN_GAN.indexOf(todayGan as any)]
  const riWx = bz.riWx
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

  let baseScore = 65
  if (todayWx === riWx) baseScore += 12
  else if (sheng[todayWx] === riWx) baseScore += 8
  else if (sheng[riWx] === todayWx) baseScore += 5
  else if (ke[todayWx] === riWx) baseScore -= 5

  // 各维度分数
  const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)]

  const loveScore = Math.min(100, Math.max(30, baseScore + Math.floor(rand() * 30) - 10))
  const careerScore = Math.min(100, Math.max(30, baseScore + Math.floor(rand() * 25) - 8))
  const wealthScore = Math.min(100, Math.max(30, baseScore + Math.floor(rand() * 28) - 10))
  const healthScore = Math.min(100, Math.max(30, baseScore + Math.floor(rand() * 20) - 5))
  const overallScore = Math.round(loveScore * 0.25 + careerScore * 0.2 + wealthScore * 0.25 + healthScore * 0.3)

  const overallDesc = overallScore >= 85 ? '今天是你的超级幸运日！万事皆宜，放手去做吧'
    : overallScore >= 70 ? '今天运势不错，适合推进重要的事情'
    : overallScore >= 55 ? '今天运势平稳，按部就班就好'
    : overallScore >= 40 ? '今天可能会有些小挑战，保持心态最重要'
    : '今天适合低调一点，休息充电也是不错的选择'

  const overallEmoji = overallScore >= 85 ? '🌟' : overallScore >= 70 ? '😊' : overallScore >= 55 ? '🌿' : overallScore >= 40 ? '🍂' : '🌙'

  // 星座计算（简化）
  const xzIdx = Math.floor(rand() * 12)

  return {
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    overall: { score: overallScore, desc: overallDesc, emoji: overallEmoji },
    love: { score: loveScore, desc: pick(LOVE_DESCS) },
    career: { score: careerScore, desc: pick(CAREER_DESCS) },
    wealth: { score: wealthScore, desc: pick(WEALTH_DESCS) },
    health: { score: healthScore, desc: pick(HEALTH_DESCS) },
    lucky: {
      color: LUCKY_COLORS_MAP[riWx] || '暖杏色',
      number: String(Math.floor(rand() * 9) + 1) + '' + String(Math.floor(rand() * 9)),
      direction: ['东方', '南方', '西方', '北方'][Math.floor(rand() * 4)],
      food: pick(LUCKY_FOODS),
      constellation: XING_ZUO[xzIdx],
    },
    tip: pick(DAILY_TIPS),
  }
}
