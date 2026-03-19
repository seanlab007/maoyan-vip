import React from 'react'

/**
 * 猫眼 M 形猫脸 Logo
 * 精确复刻 Mao.png 形状：
 * - 整体轮廓：M 形（两个尖角耳朵 + 中间凹陷 + 底部宽矩形）
 * - 底部两个圆形眼睛（圆环：外圈黑色/深色，内圈黄色）
 * - 颜色：黄色 #f6c90e（品牌金黄）
 */
interface MaoLogoProps {
  size?: number
  color?: string
  /** 暗色背景下眼睛内圈颜色 */
  eyeInnerColor?: string
}

export const MaoLogo: React.FC<MaoLogoProps> = ({
  size = 40,
  color = '#f6c90e',
  eyeInnerColor = '#0d0d0d',
}) => {
  /**
   * SVG viewBox: 0 0 100 88
   *
   * 形状分析（参考 Mao.png）：
   * 整体是一个 M 形轮廓，用单一路径描述：
   *   - 左耳尖顶: (14, 0)
   *   - 右耳尖顶: (86, 0)
   *   - M 中间凹陷底部: (50, 38)
   *   - 左下角: (0, 88)
   *   - 右下角: (100, 88)
   *
   * M 形路径（顺时针）：
   *   从左下角 (0, 88) 开始
   *   → 左耳左边 (0, 88) → 左耳顶 (14, 0) → M中间凹 (50, 38) → 右耳顶 (86, 0) → 右下角 (100, 88)
   *   → 底部直线回到 (0, 88)
   *
   * 眼睛：两个圆环位于底部横条区域
   *   左眼圆心: (28, 72)，右眼圆心: (72, 72)
   *   外圆半径: 16，内圆半径: 9
   */
  return (
    <svg
      width={size}
      height={Math.round(size * 0.88)}
      viewBox="0 0 100 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* M 形主体轮廓 */}
      <path
        d="M0,88 L14,0 L50,38 L86,0 L100,88 Z"
        fill={color}
      />
      {/* 左眼：外圈（深色/黑色，形成圆环效果） */}
      <circle cx="28" cy="72" r="16" fill={eyeInnerColor} />
      {/* 左眼：内圈（黄色，与主体同色） */}
      <circle cx="28" cy="72" r="9" fill={color} />
      {/* 右眼：外圈 */}
      <circle cx="72" cy="72" r="16" fill={eyeInnerColor} />
      {/* 右眼：内圈 */}
      <circle cx="72" cy="72" r="9" fill={color} />
    </svg>
  )
}

export default MaoLogo
