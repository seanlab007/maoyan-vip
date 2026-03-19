import React from 'react'

/**
 * 猫眼 双层M猫脸 Logo
 *
 * 精确复刻 Mao.png：
 * ┌─────────────────────────────────────────┐
 * │  外层大M（实心黄色填充）                  │
 * │    两个高尖耳 → 中间凹陷 → 底部宽矩形     │
 * │  内层小M（镂空/深色，嵌套在外M内部）      │
 * │    比外M略小，形成双层M立体效果            │
 * │  底部两个圆眼（圆环：外深色+内黄色）       │
 * └─────────────────────────────────────────┘
 *
 * SVG viewBox: 0 0 100 90
 *
 * 外层大M路径（实心黄色）：
 *   左下(2,88) → 左耳顶(18,2) → 中间凹(50,40) → 右耳顶(82,2) → 右下(98,88) → 闭合
 *
 * 内层小M路径（深色，镂空效果）：
 *   比外M内缩约8px，形成厚边框感
 *   左下内(12,88) → 左耳顶内(22,18) → 中间凹内(50,50) → 右耳顶内(78,18) → 右下内(88,88) → 闭合
 *
 * 眼睛位于底部矩形区域，圆心约在 y=72
 */
interface MaoLogoProps {
  size?: number
  color?: string
  eyeInnerColor?: string
}

export const MaoLogo: React.FC<MaoLogoProps> = ({
  size = 40,
  color = '#f6c90e',
  eyeInnerColor = '#0d0d0d',
}) => {
  const h = Math.round(size * 0.9)

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*
        外层大M（实心黄色）
        形状：两个尖耳朵 + 底部宽矩形
        左耳顶(18,2), 中凹(50,40), 右耳顶(82,2)
        底部矩形从 y=62 到 y=90
      */}
      <path
        d="M2,90 L18,2 L50,40 L82,2 L98,90 Z"
        fill={color}
      />

      {/*
        内层小M（深色，镂空）
        比外M内缩，形成双层M效果
        左耳顶内(24,14), 中凹内(50,48), 右耳顶内(76,14)
        底部从 y=62 开始（不延伸到底，给眼睛留空间）
      */}
      <path
        d="M12,90 L24,14 L50,48 L76,14 L88,90 Z"
        fill={eyeInnerColor}
      />

      {/*
        底部眼睛区域：用黄色矩形盖住内层M底部，
        然后在上面画圆环眼睛
        这样底部呈现：黄色底 + 两个圆环眼
      */}
      <rect x="2" y="62" width="96" height="28" fill={color} />

      {/* 左眼：外圈深色 */}
      <circle cx="30" cy="76" r="13" fill={eyeInnerColor} />
      {/* 左眼：内圈黄色（圆环效果） */}
      <circle cx="30" cy="76" r="7" fill={color} />

      {/* 右眼：外圈深色 */}
      <circle cx="70" cy="76" r="13" fill={eyeInnerColor} />
      {/* 右眼：内圈黄色（圆环效果） */}
      <circle cx="70" cy="76" r="7" fill={color} />
    </svg>
  )
}

export default MaoLogo
