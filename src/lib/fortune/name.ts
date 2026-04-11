/**
 * 姓名测试模块
 * 基于五格剖象法分析姓名
 * 面向女性用户优化
 */

const KANGXI_STROKES: Record<string, number> = {
  '一':1,'二':2,'三':3,'四':5,'五':4,'六':4,'七':2,'八':2,'九':2,'十':2,
  '王':4,'李':7,'张':11,'刘':15,'陈':16,'杨':13,'黄':12,'赵':14,'周':8,'吴':7,
  '徐':10,'孙':10,'马':10,'胡':11,'朱':6,'郭':15,'何':7,'林':8,'罗':20,'高':10,
  '梁':11,'郑':19,'谢':17,'韩':17,'唐':10,'冯':5,'于':3,'董':15,'萧':18,'程':12,
  '曹':11,'袁':10,'邓':19,'许':11,'傅':12,'沈':8,'曾':12,'彭':12,'吕':7,'苏':22,
  '蒋':17,'蔡':17,'贾':13,'丁':2,'魏':18,'薛':19,'叶':15,'阎':16,'余':7,'潘':15,
  '杜':7,'戴':17,'夏':10,'钟':17,'汪':7,'田':5,'任':6,'姜':9,'范':15,'方':4,
  '石':5,'姚':9,'谭':19,'廖':14,'邹':17,'熊':14,'金':8,'陆':16,'郝':14,'孔':4,
  '白':5,'崔':11,'康':11,'毛':4,'邱':12,'秦':10,'江':7,'史':5,'顾':21,'侯':9,
  '邵':12,'孟':8,'龙':16,'万':15,'段':9,'雷':13,'钱':16,'汤':12,'尹':4,'黎':15,
  '易':8,'常':11,'武':8,'乔':12,'贺':12,'赖':16,'龚':11,'文':4,'庞':9,'樊':15,
  '兰':23,'倩':10,'婷':12,'雪':11,'慧':15,'雅':12,'静':16,'敏':11,'丽':19,'芳':7,
  '娜':10,'秀':7,'娟':10,'英':11,'华':14,'巧':5,'美':9,'玉':5,'萍':14,
  '红':9,'娥':10,'琳':13,'晶':12,'璐':17,'瑶':15,'颖':16,'洁':16,'欣':8,
  '蕾':19,'薇':19,'菲':14,'珊':10,'蓉':16,'瑗':14,'珺':11,'曦':20,'梦':14,'诗':13,
  '涵':12,'悦':11,'彤':7,'心':4,'思':9,'语':14,'可':5,'安':6,'若':11,'馨':20,
  '怡':9,'依':8,'佳':8,'子':3,'小':3,'紫':11,'晓':16,'月':4,'雨':8,'如':6,
  '亦':6,'书':10,'兮':4,'朵':6,'悠':11,'然':12,'乐':15,'晨':11,'伊':6,
}

// 五格计算
function getStroke(char: string): number {
  if (KANGXI_STROKES[char]) return KANGXI_STROKES[char]
  // 简体字没有康熙笔画的，用字符编码模拟一个合理的笔画数
  return Math.max(1, (char.charCodeAt(0) % 20) + 1)
}

export interface NameResult {
  name: string
  wuGe: {
    tianGe: { num: number; meaning: string }
    renGe: { num: number; meaning: string }
    diGe: { num: number; meaning: string }
    waiGe: { num: number; meaning: string }
    zongGe: { num: number; meaning: string }
  }
  sanCai: string
  sanCaiDesc: string
  score: number
  summary: string
  suggestions: string[]
}

// 数理吉凶
function getNumberMeaning(num: number): { meaning: string; good: boolean } {
  const meanings: Record<number, { meaning: string; good: boolean }> = {
    1: { meaning: '万物开泰，最大吉数', good: true },
    2: { meaning: '动摇不安，根基不固', good: false },
    3: { meaning: '如意吉祥，进取如神', good: true },
    4: { meaning: '万事休止，凶多吉少', good: false },
    5: { meaning: '福禄长寿，阴阳和合', good: true },
    6: { meaning: '安稳余庆，吉人天相', good: true },
    7: { meaning: '精力旺盛，刚毅果决', good: true },
    8: { meaning: '意志坚强，有志竟成', good: true },
    9: { meaning: '穷迫逆境，难以成事', good: false },
    10: { meaning: '万事终局，零暗凄凉', good: false },
    11: { meaning: '旱苗逢雨，枯木逢春', good: true },
    12: { meaning: '薄弱无力，外祥内苦', good: false },
    13: { meaning: '智慧超群，博学多才', good: true },
    14: { meaning: '忍耐孤独，不如意事', good: false },
    15: { meaning: '福寿圆满，富贵荣誉', good: true },
    16: { meaning: '贵人得助，天降好运', good: true },
    17: { meaning: '排除万难，有贵人助', good: true },
    18: { meaning: '有志竟成，内外有运', good: true },
    19: { meaning: '遮云蔽月，辛苦困难', good: false },
    20: { meaning: '非业破运，灾难重重', good: false },
    21: { meaning: '明月光照，独立权威', good: true },
    22: { meaning: '秋草逢霜，困难疾弱', good: false },
    23: { meaning: '旭日东升，壮丽壮观', good: true },
    24: { meaning: '金钱丰盈，白手起家', good: true },
    25: { meaning: '英俊刚毅，资性英敏', good: true },
    26: { meaning: '变怪之数，波澜起伏', good: false },
    27: { meaning: '足智多谋，刚柔相济', good: true },
    28: { meaning: '自豪生离，孤独遭难', good: false },
    29: { meaning: '智谋优秀，财力归集', good: true },
    30: { meaning: '浮沉不定，吉凶难分', good: false },
    31: { meaning: '春日花开，智勇得志', good: true },
    32: { meaning: '侥幸多望，贵人得助', good: true },
    33: { meaning: '家门隆昌，才略智谋', good: true },
    34: { meaning: '破家之身，见识短小', good: false },
    35: { meaning: '温和平静，优雅发展', good: true },
    36: { meaning: '波澜壮阔，风浪不息', good: false },
    37: { meaning: '权威显达，吉人天相', good: true },
    38: { meaning: '磨铁成针，意志薄弱', good: false },
    39: { meaning: '富贵繁荣，功成名就', good: true },
    40: { meaning: '智谋胆力，冒险投机', good: false },
  }
  return meanings[num % 40] || { meaning: '中平之数', good: num % 2 === 1 }
}

function numToWuXing(num: number): string {
  const mod = num % 10
  if (mod === 1 || mod === 2) return '木'
  if (mod === 3 || mod === 4) return '火'
  if (mod === 5 || mod === 6) return '土'
  if (mod === 7 || mod === 8) return '金'
  return '水'
}

export function analyzeName(name: string, surname: string): NameResult {
  const fullName = surname + name
  const surnameStrokes = [...surname].reduce((s, c) => s + getStroke(c), 0)
  const nameChars = [...name]
  const nameStrokes = nameChars.map(c => getStroke(c))
  const nameTotal = nameStrokes.reduce((s, n) => s + n, 0)

  const tianGe = surnameStrokes + 1 // 天格 = 姓笔画 + 1
  const renGe = surnameStrokes + (nameStrokes[0] || 0) // 人格 = 姓 + 名第一字
  const diGe = (nameStrokes[0] || 0) + (nameStrokes[1] || 0) // 地格 = 名第一字 + 名第二字
  const waiGe = nameChars.length >= 2 ? surnameStrokes + (nameStrokes[1] || 0) : tianGe // 外格
  const zongGe = surnameStrokes + nameTotal // 总格

  const numMeaning = (n: number) => getNumberMeaning(n)

  const wuGe = {
    tianGe: { num: tianGe, meaning: numMeaning(tianGe).meaning },
    renGe: { num: renGe, meaning: numMeaning(renGe).meaning },
    diGe: { num: diGe, meaning: numMeaning(diGe).meaning },
    waiGe: { num: waiGe, meaning: numMeaning(waiGe).meaning },
    zongGe: { num: zongGe, meaning: numMeaning(zongGe).meaning },
  }

  // 三才配置
  const sanCai = numToWuXing(tianGe) + numToWuXing(renGe) + numToWuXing(diGe)
  const sanCaiDesc = getSanCaiDesc(sanCai)

  // 评分
  const goodCount = [tianGe, renGe, diGe, waiGe, zongGe].filter(n => numMeaning(n).good).length
  const sanCaiBonus = sanCaiDesc.includes('大吉') ? 15 : sanCaiDesc.includes('吉') ? 8 : 0
  const score = Math.min(100, Math.round(goodCount * 16 + sanCaiBonus + 10))

  // 生成总结
  const summary = generateNameSummary(fullName, wuGe, score)
  const suggestions = generateNameSuggestions(wuGe, sanCai, nameChars)

  return { name: fullName, wuGe, sanCai, sanCaiDesc, score, summary, suggestions }
}

function getSanCaiDesc(sanCai: string): string {
  const configs: Record<string, string> = {
    '木木木': '大吉，成功运极佳',
    '木木火': '大吉，进取得胜',
    '木木土': '吉，稳健发展',
    '火火火': '大吉，光明磊落',
    '火火土': '大吉，厚载万物',
    '土土土': '吉，安稳厚实',
    '土土金': '大吉，福禄双全',
    '金金金': '吉，刚毅果断',
    '金金水': '大吉，智慧通达人缘好',
    '水水水': '吉，聪明伶俐',
    '水水木': '大吉，才华横溢',
    '木火土': '大吉，顺利发达',
    '火土金': '大吉，根基稳固',
    '土金水': '大吉，圆满福寿',
    '金水木': '大吉，充满生机',
    '水木火': '大吉，顺畅成功',
  }
  return configs[sanCai] || '中平，有吉有凶'
}

function generateNameSummary(name: string, wuGe: NameResult['wuGe'], score: number): string {
  if (score >= 85) return `「${name}」是一个非常好的名字！人格${wuGe.renGe.num}是核心，代表你的性格和人际关系；总格${wuGe.zongGe.num}影响一生运势。这个名字在数理上很和谐，能给你带来自信和好运。`
  if (score >= 70) return `「${name}」是个不错的名字。虽然个别数理有小瑕疵，但整体组合还是比较协调的。这个名字能给人的第一印象加分。`
  if (score >= 55) return `「${name}」算是一个中等偏上的名字。有一些数理比较吉利，也有需要改进的地方。可以通过小名或英文名来补足。`
  return `「${name}」在数理上有些不足，但这只是传统姓名学的一个参考维度。真正重要的是你这个人本身。`
}

function generateNameSuggestions(wuGe: NameResult['wuGe'], sanCai: string, nameChars: string[]): string[] {
  const suggestions: string[] = []
  if (!getNumberMeaning(wuGe.renGe.num).good) {
    suggestions.push('人格（代表性格和人际）数理偏弱，建议在社交中多主动一些')
  }
  if (!getNumberMeaning(wuGe.zongGe.num).good) {
    suggestions.push('总格（影响一生运程）不够理想，可以用英文名或小名来补充')
  }
  if (sanCai.includes('火') && sanCai.includes('金')) {
    suggestions.push('三才中有火金相克，注意调节情绪，避免冲动')
  }
  if (nameChars.length === 1) {
    suggestions.push('单名比较简洁大气，但缺少中间的缓冲数理')
  }
  if (suggestions.length === 0) {
    suggestions.push('你的名字数理很好，保持自信就是最好的风水')
  }
  return suggestions
}
