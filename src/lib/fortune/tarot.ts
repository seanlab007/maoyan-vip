/**
 * 塔罗牌占卜模块
 * 支持三牌阵、凯尔特十字阵
 * 78张完整牌组，含正逆位解读
 */

// 大阿卡纳（22张）
export const MAJOR_ARCANA = [
  { id: 0, name: '愚者', en: 'The Fool', emoji: '🃏', upright: '新开始、冒险精神、自由天真、无畏出发', reversed: '鲁莽冲动、缺乏计划、逃避责任' },
  { id: 1, name: '魔术师', en: 'The Magician', emoji: '🎩', upright: '意志力、技能、魅力、行动力十足', reversed: '虚伪、欺骗、技能未发挥' },
  { id: 2, name: '女祭司', en: 'The High Priestess', emoji: '🌙', upright: '直觉、神秘、内在智慧、潜意识', reversed: '压抑直觉、秘密被揭露、混乱' },
  { id: 3, name: '女皇', en: 'The Empress', emoji: '👑', upright: '丰盛、母性、自然、创造力旺盛', reversed: '依赖、创造力受阻、过度保护' },
  { id: 4, name: '皇帝', en: 'The Emperor', emoji: '⚔️', upright: '权威、稳定、结构、父性力量', reversed: '专制、缺乏灵活性、权力滥用' },
  { id: 5, name: '教皇', en: 'The Hierophant', emoji: '⛪', upright: '传统、信仰、精神指引、规范', reversed: '叛逆、打破规则、个人信念' },
  { id: 6, name: '恋人', en: 'The Lovers', emoji: '💑', upright: '爱情、价值观、重要选择、和谐', reversed: '价值观冲突、分离、错误的选择' },
  { id: 7, name: '战车', en: 'The Chariot', emoji: '🏆', upright: '意志胜利、控制、勇气、方向明确', reversed: '失控、方向迷失、过于强势' },
  { id: 8, name: '力量', en: 'Strength', emoji: '🦁', upright: '内在力量、耐心、包容、驯服野性', reversed: '软弱、不安全感、力量未发挥' },
  { id: 9, name: '隐士', en: 'The Hermit', emoji: '🔦', upright: '独处、内省、指引、智慧之光', reversed: '孤立、拒绝帮助、过度自闭' },
  { id: 10, name: '命运之轮', en: 'Wheel of Fortune', emoji: '🎡', upright: '好运、转机、命运、循环变化', reversed: '坏运气、抗拒变化、命运作弄' },
  { id: 11, name: '正义', en: 'Justice', emoji: '⚖️', upright: '公正、真相、因果报应、平衡', reversed: '不公平、逃避责任、偏见' },
  { id: 12, name: '倒吊人', en: 'The Hanged Man', emoji: '🙃', upright: '暂停、换视角、放手、等待时机', reversed: '拖延、固执、浪费时间' },
  { id: 13, name: '死神', en: 'Death', emoji: '🌑', upright: '转变、结束与开始、蜕变、放下过去', reversed: '抗拒改变、停滞不前、难以放手' },
  { id: 14, name: '节制', en: 'Temperance', emoji: '🌊', upright: '平衡、耐心、适度、融合', reversed: '过度、不平衡、缺乏节制' },
  { id: 15, name: '恶魔', en: 'The Devil', emoji: '🔗', upright: '束缚、物质欲望、上瘾、阴暗面', reversed: '解脱、意识觉醒、打破束缚' },
  { id: 16, name: '塔', en: 'The Tower', emoji: '⚡', upright: '突如其来的变化、颠覆、解放、重建', reversed: '逃避必要的变化、小灾难' },
  { id: 17, name: '星星', en: 'The Star', emoji: '⭐', upright: '希望、灵感、平静、内心光明', reversed: '绝望、失去信心、不切实际' },
  { id: 18, name: '月亮', en: 'The Moon', emoji: '🌕', upright: '幻觉、恐惧、潜意识、不确定性', reversed: '迷雾散去、真相浮现、克服恐惧' },
  { id: 19, name: '太阳', en: 'The Sun', emoji: '☀️', upright: '成功、喜悦、活力、一切顺遂', reversed: '过于乐观、短暂的成功、光芒暂失' },
  { id: 20, name: '审判', en: 'Judgement', emoji: '📯', upright: '觉醒、重生、自我反思、新使命', reversed: '自我怀疑、拒绝觉醒、后悔' },
  { id: 21, name: '世界', en: 'The World', emoji: '🌍', upright: '完成、整合、成就、一个循环的终点', reversed: '未完成、缺乏完结感、快要成功' },
]

// 小阿卡纳（56张，4个花色各14张）
const SUITS = ['权杖', '圣杯', '宝剑', '星币'] as const
const SUIT_EMOJI: Record<string, string> = { '权杖': '🪄', '圣杯': '🏆', '宝剑': '⚔️', '星币': '💰' }
const SUIT_ELEMENT: Record<string, string> = { '权杖': '火', '圣杯': '水', '宝剑': '风', '星币': '土' }
const SUIT_DOMAIN: Record<string, string> = { '权杖': '行动与热情', '圣杯': '情感与关系', '宝剑': '思维与挑战', '星币': '物质与财富' }
const NUMBERS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', '侍从', '骑士', '王后', '国王']

export interface TarotCard {
  id: string
  name: string
  emoji: string
  isReversed: boolean
  position?: string // 在牌阵中的位置含义
  meaning: string
  advice: string
}

// 随机抽牌（支持去重）
function drawCards(count: number, seed?: number): TarotCard[] {
  const allCards = [
    ...MAJOR_ARCANA.map(c => ({ ...c, suit: null })),
    ...SUITS.flatMap(suit => NUMBERS.map((num, i) => ({
      id: `${suit}_${num}`,
      name: `${suit}${num}`,
      en: `${num} of ${suit}`,
      emoji: SUIT_EMOJI[suit],
      upright: `${suit}牌组代表${SUIT_DOMAIN[suit]}，${num}号牌代表${i < 10 ? '数字牌能量' : '宫廷牌人物'}。充满${SUIT_ELEMENT[suit]}元素的能量。`,
      reversed: `${suit}${num}逆位：能量受阻，需要内省。`,
      suit,
    })))
  ]

  // 基于时间的伪随机洗牌
  const now = seed || Date.now()
  const shuffled = [...allCards]
  let s = now
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count).map((card, idx) => {
    s = (s * 9301 + 49297) % 233280
    const isReversed = (s / 233280) > 0.5
    const meaning = isReversed ? card.reversed : card.upright
    return {
      id: String(card.id),
      name: card.name,
      emoji: card.emoji || SUIT_EMOJI[(card as any).suit] || '🃏',
      isReversed,
      meaning,
      advice: generateCardAdvice(card.name, isReversed, idx),
    }
  })
}

function generateCardAdvice(cardName: string, reversed: boolean, position: number): string {
  const posAdvices = [
    ['此刻的你，', '当前处境：'],
    ['行动建议：', '接下来可以：'],
    ['最终结果：', '未来走向：'],
  ]
  const prefix = posAdvices[Math.min(position, 2)][reversed ? 1 : 0]
  const advices: Record<string, string[]> = {
    '愚者': ['大胆迈出第一步，相信自己的直觉', '别因冲动而忽视重要细节'],
    '恋人': ['遵从内心的感受做选择', '审视你的价值观是否一致'],
    '命运之轮': ['把握眼前的机遇，时机难得', '学会接受无法改变的事情'],
    '太阳': ['充满信心，你会成功的！', '别过于依赖表面的光鲜'],
    '月亮': ['听从直觉，但也保持清醒', '面对内心的恐惧，它并不真实'],
    '死神': ['放下过去，新的开始已在等你', '不要抗拒必要的改变'],
    '世界': ['你已经走到了一个阶段的终点，值得庆贺！', '先完成眼前的事情，再开始新的章节'],
  }
  const specific = advices[cardName]
  if (specific) return prefix + specific[reversed ? 1 : 0]
  return prefix + (reversed ? '保持谨慎，事情可能有隐藏的复杂性' : '积极行动，当前能量对你有利')
}

// 牌阵类型
export type SpreadType = 'three' | 'celtic' | 'single'

const SPREAD_POSITIONS: Record<SpreadType, string[]> = {
  single: ['整体指引'],
  three: ['过去/根源', '现在/核心', '未来/结果'],
  celtic: [
    '核心现状', '交叉挑战', '远因基础', '近期过去',
    '潜在可能', '近期未来', '自我认知', '外部影响',
    '希望与恐惧', '最终结果'
  ]
}

export interface TarotResult {
  spreadType: SpreadType
  cards: (TarotCard & { position: string })[]
  synthesis: string
  advice: string
  luckyColor: string
  luckyNumber: number
}

const LUCKY_COLORS = ['深紫色', '金色', '玫瑰粉', '宝石蓝', '翡翠绿', '银白色', '珊瑚橙', '磁石黑']

export function drawTarot(question: string, spread: SpreadType = 'three'): TarotResult {
  const seed = Date.now() + question.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const positions = SPREAD_POSITIONS[spread]
  const cards = drawCards(positions.length, seed)

  const cardsWithPosition = cards.map((card, i) => ({
    ...card,
    position: positions[i],
  }))

  // 综合解读
  const majorCount = cardsWithPosition.filter(c => MAJOR_ARCANA.some(m => m.name === c.name)).length
  const reversedCount = cardsWithPosition.filter(c => c.isReversed).length

  const synthesisParts = []
  if (majorCount >= positions.length * 0.5) {
    synthesisParts.push('此次占卜中大阿卡纳牌占多数，说明你正面临重大的人生课题和转折，宇宙在关注你的这段旅程。')
  } else {
    synthesisParts.push('此次占卜小阿卡纳为主，聚焦于日常生活的具体事项。')
  }
  if (reversedCount > positions.length / 2) {
    synthesisParts.push('逆位牌较多，内在有些阻塞需要清理，建议深入自省。')
  } else {
    synthesisParts.push('正位牌为主，整体能量流动顺畅，可以积极行动。')
  }
  if (question.includes('感情') || question.includes('爱情') || question.includes('爱') || question.includes('他') || question.includes('她')) {
    synthesisParts.push('关于感情，牌阵指引你回到内心，真正的答案在你的直觉里。')
  } else if (question.includes('工作') || question.includes('事业') || question.includes('钱') || question.includes('财')) {
    synthesisParts.push('在事业财富上，牌阵建议你看清自身价值，适时调整方向。')
  }

  const advice = cardsWithPosition[cardsWithPosition.length - 1]?.advice || '相信自己，答案已在心中'
  const rng = ((seed * 9301 + 49297) % 233280) / 233280
  const luckyColor = LUCKY_COLORS[Math.floor(rng * LUCKY_COLORS.length)]
  const luckyNumber = Math.floor(rng * 9) + 1

  return {
    spreadType: spread,
    cards: cardsWithPosition,
    synthesis: synthesisParts.join(' '),
    advice,
    luckyColor,
    luckyNumber,
  }
}
