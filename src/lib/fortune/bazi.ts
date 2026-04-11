/**
 * 八字排盘核心算法
 * 基于公历出生日期计算天干地支、五行、十神等
 * 支持男女性别选择，输出通俗化解读
 */

// === 基础数据表 ===

export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export const WU_XING_GAN = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'] as const
export const WU_XING_ZHI = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'] as const
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const

// 纳音五行
const NA_YIN: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂石金', '乙未': '砂石金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗环金', '辛亥': '钗环金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '砂中土', '丁巳': '砂中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

// 五行生克关系
const WU_XING_SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
const WU_XING_KE: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

// 地支藏干
const DI_ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲'],
}

export type Gender = 'male' | 'female'

// 十神关系（以日干为基准）
function getShiShen(riGan: string, gan: string): string {
  const riIdx = TIAN_GAN.indexOf(riGan as any)
  const ganIdx = TIAN_GAN.indexOf(gan as any)
  const riWx = WU_XING_GAN[riIdx]
  const ganWx = WU_XING_GAN[ganIdx]
  const sameYinYang = (riIdx % 2) === (ganIdx % 2)

  if (riWx === ganWx) return sameYinYang ? '比肩' : '劫财'
  if (WU_XING_SHENG[riWx] === ganWx) return sameYinYang ? '食神' : '伤官'
  if (WU_XING_SHENG[ganWx] === riWx) return sameYinYang ? '偏印' : '正印'
  if (WU_XING_KE[riWx] === ganWx) return sameYinYang ? '偏财' : '正财'
  if (WU_XING_KE[ganWx] === riWx) return sameYinYang ? '七杀' : '正官'
  return ''
}

// === 核心计算函数 ===

export interface BaziResult {
  year: { gan: string; zhi: string; wx: [string, string]; naYin: string }
  month: { gan: string; zhi: string; wx: [string, string]; naYin: string }
  day: { gan: string; zhi: string; wx: [string, string]; naYin: string }
  hour: { gan: string; zhi: string; wx: [string, string]; naYin: string }
  riGan: string // 日干（日元）
  riWx: string  // 日主五行
  shengXiao: string
  wuXingCount: Record<string, number>
  shiShen: { pos: string; name: string; gan: string }[]
  summary: string
}

/**
 * 年柱天干地支
 * 注意：立春前出生算上一年
 */
function getYearGanZhi(year: number, month: number, day: number): [string, string] {
  let y = year
  if (month < 2 || (month === 2 && day < 4)) y -= 1
  const ganIdx = (y - 4) % 10
  const zhiIdx = (y - 4) % 12
  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]]
}

/**
 * 月柱天干地支
 */
function getMonthGanZhi(yearGan: string, month: number, day: number): [string, string] {
  const jieQiMonth = [
    [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
    [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6]
  ]
  let mIdx = 0
  for (let i = jieQiMonth.length - 1; i >= 0; i--) {
    if (month > jieQiMonth[i][0] || (month === jieQiMonth[i][0] && day >= jieQiMonth[i][1])) {
      mIdx = i
      break
    }
  }
  const zhiIdx = (mIdx + 2) % 12
  const startGanMap: Record<string, number> = { '甲': 2, '己': 2, '乙': 4, '庚': 4, '丙': 6, '辛': 6, '丁': 8, '壬': 8, '戊': 0, '癸': 0 }
  const ganIdx = (startGanMap[yearGan] + mIdx) % 10
  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]]
}

/**
 * 日柱天干地支
 */
function getDayGanZhi(year: number, month: number, day: number): [string, string] {
  const base = new Date(2000, 0, 7)
  const target = new Date(year, month - 1, day)
  const diff = Math.floor((target.getTime() - base.getTime()) / 86400000)
  const ganIdx = ((diff % 10) + 10) % 10
  const zhiIdx = ((diff % 12) + 12) % 12
  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]]
}

/**
 * 时柱天干地支
 */
function getHourGanZhi(dayGan: string, hour: number): [string, string] {
  const zhiIdx = Math.floor(((hour + 1) % 24) / 2)
  const startGanMap: Record<string, number> = { '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8 }
  const ganIdx = (startGanMap[dayGan] + zhiIdx) % 10
  return [TIAN_GAN[ganIdx], DI_ZHI[zhiIdx]]
}

/**
 * 主函数：计算八字
 * gender 参数可选，默认不区分性别
 */
export function calculateBazi(
  year: number, month: number, day: number, hour: number, gender?: Gender
): BaziResult {
  const [yGan, yZhi] = getYearGanZhi(year, month, day)
  const [mGan, mZhi] = getMonthGanZhi(yGan, month, day)
  const [dGan, dZhi] = getDayGanZhi(year, month, day)
  const [hGan, hZhi] = getHourGanZhi(dGan, hour)

  const yWx: [string, string] = [WU_XING_GAN[TIAN_GAN.indexOf(yGan as any)], WU_XING_ZHI[DI_ZHI.indexOf(yZhi as any)]]
  const mWx: [string, string] = [WU_XING_GAN[TIAN_GAN.indexOf(mGan as any)], WU_XING_ZHI[DI_ZHI.indexOf(mZhi as any)]]
  const dWx: [string, string] = [WU_XING_GAN[TIAN_GAN.indexOf(dGan as any)], WU_XING_ZHI[DI_ZHI.indexOf(dZhi as any)]]
  const hWx: [string, string] = [WU_XING_GAN[TIAN_GAN.indexOf(hGan as any)], WU_XING_ZHI[DI_ZHI.indexOf(hZhi as any)]]

  // 五行计数
  const wxCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  ;[yWx, mWx, dWx, hWx].forEach(([g, z]) => { wxCount[g]++; wxCount[z]++ })

  // 生肖
  const zhiIdx = (year - 4) % 12
  const sx = SHENG_XIAO[(zhiIdx + 12) % 12]

  // 十神
  const shiShen = [
    { pos: '年干', name: getShiShen(dGan, yGan), gan: yGan },
    { pos: '月干', name: getShiShen(dGan, mGan), gan: mGan },
    { pos: '日干', name: '日主', gan: dGan },
    { pos: '时干', name: getShiShen(dGan, hGan), gan: hGan },
  ]

  // 纳音
  const naYin = (g: string, z: string) => NA_YIN[g + z] || ''

  // 根据性别生成解读
  const summary = generateSummary(dGan, yWx, mWx, dWx, hWx, wxCount, sx, gender)

  return {
    year: { gan: yGan, zhi: yZhi, wx: yWx, naYin: naYin(yGan, yZhi) },
    month: { gan: mGan, zhi: mZhi, wx: mWx, naYin: naYin(mGan, mZhi) },
    day: { gan: dGan, zhi: dZhi, wx: dWx, naYin: naYin(dGan, dZhi) },
    hour: { gan: hGan, zhi: hZhi, wx: hWx, naYin: naYin(hGan, hZhi) },
    riGan: dGan,
    riWx: WU_XING_GAN[TIAN_GAN.indexOf(dGan as any)],
    shengXiao: sx,
    wuXingCount: wxCount,
    shiShen,
    summary,
  }
}

// 通俗解读生成（根据性别区分）
function generateSummary(
  riGan: string,
  yWx: [string, string], mWx: [string, string], dWx: [string, string], hWx: [string, string],
  wxCount: Record<string, number>,
  sx: string,
  gender?: Gender
): string {
  const riWx = WU_XING_GAN[TIAN_GAN.indexOf(riGan as any)]
  const parts: string[] = []
  const isMale = gender === 'male'
  const isFemale = gender === 'female'

  // 性格
  const personalityMale: Record<string, string> = {
    '木': '你天生正直仁厚，像一棵参天大树。骨子里有股韧劲儿，认定的事情不会轻易放弃。为人豁达大方，在朋友圈中很有号召力。',
    '火': '你是个热情豪爽的人，做事雷厉风行，行动力超强。直觉敏锐，说干就干，天生的领导者气质，在人群中总是最有感染力的那一个。',
    '土': '你踏实靠谱，是朋友们最信赖的"主心骨"。做事有规划、有条理，沉稳中带着坚定。你的靠谱让人有安全感。',
    '金': '你果断刚毅，有很强的个人魅力和执行力。做事讲究品质和效率，内心有原则但不失变通。',
    '水': '你聪明机敏，心思缜密如水。善于洞察人心，应变能力极强。有时候想法太多容易内耗，但你的悟性是一般人比不了的。',
  }
  const personalityFemale: Record<string, string> = {
    '木': '你天生优雅温柔，像一棵蓬勃生长的花树。骨子里有股倔劲儿，认定的事情不会轻易放弃。社交场合中自然散发的亲和力让你很受欢迎。',
    '火': '你是个热情开朗的人，笑起来能照亮整个房间。直觉敏锐，行动力超强，说干就干。在人群中总是最耀眼的那一个。',
    '土': '你踏实靠谱，是朋友们最信赖的"定心丸"。做事有规划、有条理，温柔中带着坚定。你的靠谱让人有安全感。',
    '金': '你独立果断，有很强的个人魅力。审美品味出众，做事讲究质感。内心柔软但表面看起来飒飒的。',
    '水': '你聪明灵动，心思细腻如水。善于察言观色，情商很高。有时候想法太多容易内耗，但你的悟性是一般人比不了的。',
  }
  const personalityNeutral: Record<string, string> = {
    '木': '你天生正直仁厚，像一棵蓬勃生长的大树。骨子里有股韧劲儿，认定的事情不会轻易放弃。社交场合中自然散发的亲和力让你很受欢迎。',
    '火': '你是个热情开朗的人，做事雷厉风行，行动力超强。直觉敏锐，说干就干。在人群中总是最有感染力的那一个。',
    '土': '你踏实靠谱，是朋友们最信赖的人。做事有规划、有条理，沉稳中带着坚定。你的靠谱让人有安全感。',
    '金': '你独立果断，有很强的个人魅力和执行力。做事讲究品质和效率，审美品味出众。',
    '水': '你聪明机敏，心思缜密如水。善于洞察人心，应变能力极强。有时候想法太多容易内耗，但你的悟性是一般人比不了的。',
  }
  const personality = isMale ? personalityMale : isFemale ? personalityFemale : personalityNeutral
  parts.push(personality[riWx] || '')

  // 姻缘
  const hasZhengGuan = [yWx, mWx, dWx, hWx].some(([g]) => getShiShen(riGan, TIAN_GAN[TIAN_GAN.indexOf(g as any)]) === '正官')
  const hasQiSha = [yWx, mWx, dWx, hWx].some(([g]) => getShiShen(riGan, TIAN_GAN[TIAN_GAN.indexOf(g as any)]) === '七杀')
  const hasZhengCaiStar = [yWx, mWx, dWx, hWx].some(([g]) => getShiShen(riGan, TIAN_GAN[TIAN_GAN.indexOf(g as any)]) === '正财')

  if (isMale) {
    // 男命：正财为妻星，偏财为异性缘
    if (hasZhengCaiStar) {
      parts.push('婚姻方面，正财星现说明你命中注定会遇到一个温柔贤惠的另一半，适合细水长流的爱情。')
    } else if (hasQiSha) {
      parts.push('感情方面，你容易遇到让你心动但也纠结的类型。建议多给自己一些时间，不要被激情冲昏头脑。')
    } else {
      parts.push('感情方面你比较独立自主，不着急将就。属于晚婚命格的人，遇到对的人一切都值得等待。')
    }
  } else if (isFemale) {
    // 女命：正官为夫星
    if (hasZhengGuan) {
      parts.push('婚姻方面，正官星现说明你命中注定会遇到一个温暖体贴的另一半，适合细水长流的爱情。')
    } else if (hasQiSha) {
      parts.push('感情方面，你容易遇到让你心动但也纠结的类型。建议多给自己一些时间，不要被激情冲昏头脑。')
    } else {
      parts.push('感情方面你比较独立自主，不着急将就。属于晚婚命格的人，遇到对的人一切都值得等待。')
    }
  } else {
    // 未选性别：通用解读
    if (hasZhengGuan || hasZhengCaiStar) {
      parts.push('婚姻方面，命盘中有利于感情的星耀出现，说明你命中注定会遇到合适的另一半，适合细水长流的爱情。')
    } else if (hasQiSha) {
      parts.push('感情方面，你容易遇到让你心动但也纠结的类型。建议多给自己一些时间，不要被激情冲昏头脑。')
    } else {
      parts.push('感情方面你比较独立自主，不着急将就。属于晚婚命格的人，遇到对的人一切都值得等待。')
    }
  }

  // 财运
  const hasZhengCai = [yWx, mWx, dWx, hWx].some(([g]) => getShiShen(riGan, TIAN_GAN[TIAN_GAN.indexOf(g as any)]) === '正财')
  const hasPianCai = [yWx, mWx, dWx, hWx].some(([g]) => getShiShen(riGan, TIAN_GAN[TIAN_GAN.indexOf(g as any)]) === '偏财')
  if (hasZhengCai || hasPianCai) {
    parts.push('财运方面，你具备良好的理财意识，正财偏财都有可能。适合稳健投资+适度副业的发展模式。')
  } else {
    parts.push('财运方面，你的财运更多来自自身才华和专业能力的提升。投资自己永远是最划算的。')
  }

  // 健康
  const lackWx = Object.entries(wxCount).filter(([, v]) => v === 0).map(([k]) => k)
  if (lackWx.length > 0) {
    const healthTips: Record<string, string> = {
      '木': '肝胆方面需要多关注，建议保持情绪舒畅，少熬夜',
      '火': '心脏和小肠系统需要呵护，注意休息别太拼命',
      '土': '脾胃方面要特别注意，少吃生冷，规律饮食',
      '金': '肺部和呼吸系统需要保养，多去空气好的地方',
      '水': '肾脏和泌尿系统要留意，多喝水别憋尿',
    }
    parts.push('健康提醒：五行缺' + lackWx.join('、') + '，' + lackWx.map(w => healthTips[w]).join('；') + '。')
  }

  return parts.join('\n\n')
}
