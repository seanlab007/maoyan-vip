/**
 * 命理模块统一导出
 */
export { calculateBazi } from './bazi'
export type { BaziResult, Gender } from './bazi'
export { calculateMarriage } from './marriage'
export type { MarriageResult } from './marriage'
export { analyzeWealth } from './wealth'
export type { WealthResult } from './wealth'
export { getDailyFortune } from './daily'
export type { DailyFortuneResult } from './daily'
export { analyzeName } from './name'
export type { NameResult } from './name'
export { calculateZiWei } from './ziwei'
export type { ZiWeiResult } from './ziwei'
export { calculateDaYun } from './dayun'
export type { DaYunResult, DaYunItem, LiuNianItem } from './dayun'
export { drawTarot } from './tarot'
export type { TarotResult, TarotCard, SpreadType } from './tarot'
