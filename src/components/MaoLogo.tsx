import React from 'react'

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/mao_logo_icon_2adbb6bd.png'
const LOGO_2X_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/mao_logo_icon_2x_1488bafa.png'

interface MaoLogoProps {
  size?: number
  /** 不再使用，保留兼容性 */
  color?: string
  eyeInnerColor?: string
}

export const MaoLogo: React.FC<MaoLogoProps> = ({ size = 40 }) => {
  // 原图比例约 222:159 ≈ 1.4:1
  const height = Math.round(size * 159 / 222)
  return (
    <img
      src={LOGO_URL}
      srcSet={`${LOGO_URL} 1x, ${LOGO_2X_URL} 2x`}
      width={size}
      height={height}
      alt="猫眼 Logo"
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}

export default MaoLogo
