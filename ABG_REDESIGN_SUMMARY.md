# ABG Visual Identity Redesign - Maoyan VIP

## 概述 / Overview

本次改版将 `maoyan.vip` 的视觉风格从"黑金"主题完全转换为 **ABG（Authentic Brands Group）的无彩色极简主义**风格。这是一次全面的品牌视觉升级，旨在打造更加专业、高端、国际化的用户体验。

---

## 核心设计原则 / Core Design Principles

### 1. 无彩色极简主义 (Achromatic Minimalism)
- **背景色**：纯白 (`#FFFFFF`) 和米白 (`#F5F5F2`)
- **文字色**：纯黑 (`#000000`) 和海军蓝 (`#122849`)
- **辅助色**：中性灰 (`#555555`, `#999999`, `#E8E8E4`)
- **设计理念**：高对比度、大留白、极简线条

### 2. 字体规范 (Typography)
| 用途 | 字体 | 大小 | 字重 | 字间距 |
|------|------|------|------|--------|
| 主标题 (H1) | Playfair Display | 60px | 400 | 1px |
| 副标题 (H2) | Playfair Display | 42px | 400 | 1px |
| 导航 (Nav) | Inter | 14px | 600 | 3-5px |
| 正文 (Body) | Inter | 14-16px | 400 | 0.3px |
| 标签 (Label) | Inter | 10-12px | 500 | 2px |

### 3. 间距系统 (Spacing System)
- **极小** (XS): 4px
- **小** (SM): 8px
- **中** (MD): 16px
- **大** (LG): 24px
- **超大** (XL): 32px
- **2XL**: 48px

### 4. 圆角规范 (Border Radius)
- **按钮/输入框**: 2px (极小圆角)
- **卡片**: 4px (轻微圆角)
- **容器**: 8px (标准圆角)

---

## 改版详情 / Redesign Details

### 全局样式 (`src/index.css`)
✅ **更新内容**：
- 重新定义所有 CSS 变量，映射到 ABG 色系
- 背景色从深色 (`#0c0d10`) 改为白色 (`#FFFFFF`)
- 文字色从浅色改为深色 (`#000000`)
- 按钮、卡片、输入框样式全面更新
- 添加了微妙的阴影 (`box-shadow: 0 1px 3px rgba(0,0,0,0.04)`)

### 布局组件 (`src/components/layout/AppLayout.tsx`)
✅ **更新内容**：
- **侧边栏**：白色背景 + 海军蓝激活态
- **导航**：大写字母 + 3-5px 字间距
- **用户卡片**：米白色背景 + 海军蓝余额显示
- **移动端**：顶部白色 Header + 底部白色 Tab 栏
- **交互**：悬停效果改为背景色变化，而非渐变

### 登陆页面 (`src/pages/LandingPage.tsx`)
✅ **更新内容**：
- **导航栏**：白色背景 + 海军蓝按钮
- **Hero 区域**：大留白 + Playfair Display 标题
- **特性卡片**：白色背景 + 细边框 + 极轻投影
- **CTA 按钮**：海军蓝实心 + 白色文字
- **排版**：严格遵循 ABG 字间距规范

---

## 色彩对照表 / Color Palette

| 色彩名称 | 十六进制 | RGB | 用途 |
|---------|---------|-----|------|
| Navy | `#122849` | 18, 40, 73 | 主色、激活态、强调 |
| Black | `#000000` | 0, 0, 0 | 文字、标题 |
| White | `#FFFFFF` | 255, 255, 255 | 背景、卡片 |
| Off-White | `#F5F5F2` | 245, 245, 242 | 次级背景 |
| Gray Mid | `#555555` | 85, 85, 85 | 正文文字 |
| Gray Light | `#999999` | 153, 153, 153 | 辅助文字 |
| Gray Border | `#E8E8E4` | 232, 232, 228 | 边框、分割线 |

---

## 组件变更 / Component Changes

### 按钮 (Buttons)
**之前**：金色渐变 + 圆角
**现在**：
- **主按钮**：海军蓝实心 + 白色文字 + 2px 圆角
- **描边按钮**：黑色边框 + 透明背景 + 2px 圆角
- **幽灵按钮**：浅灰边框 + 透明背景

### 卡片 (Cards)
**之前**：深色背景 + 金色边框
**现在**：
- 白色背景 + `1px solid #E8E8E4` 边框
- 悬停时：边框变深 + 轻微投影 (`0 4px 12px rgba(0,0,0,0.08)`)

### 输入框 (Inputs)
**之前**：深色背景 + 金色焦点
**现在**：
- 白色背景 + 灰色边框
- 焦点时：海军蓝边框 + 浅蓝色阴影 (`0 0 0 3px rgba(18,40,73,0.08)`)

### 导航菜单 (Navigation)
**之前**：小写 + 无字间距
**现在**：
- 大写字母 + 3-5px 字间距
- 激活态：海军蓝背景 + 白色文字
- 非激活态：灰色文字 + 透明背景

---

## 响应式设计 / Responsive Design

### 桌面端 (Desktop ≥ 1024px)
- 固定侧边栏 (280px)
- 内容区域 margin-left: 280px
- 完整导航菜单

### 平板端 (768px - 1023px)
- 隐藏侧边栏
- 顶部 Header
- 底部 Tab 导航

### 手机端 (< 768px)
- 全屏内容
- 粘性 Header
- 底部 Tab 导航 + 安全区域适配

---

## 浏览器兼容性 / Browser Compatibility

✅ 支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 性能优化 / Performance

- 移除了复杂的渐变效果，减少 GPU 计算
- 使用原生 CSS 变量，便于主题切换
- 优化了阴影和过渡效果，提高帧率
- 字体加载使用 Google Fonts CDN

---

## 后续建议 / Recommendations

1. **其他页面**：逐步更新 Dashboard、Profile、Drama 等页面，保持风格一致
2. **深色模式**：可考虑添加 `prefers-color-scheme: dark` 支持
3. **动画**：保持简洁，避免过度动画
4. **可访问性**：确保所有文字对比度 ≥ 4.5:1 (WCAG AA)
5. **测试**：在真实设备上验证各种屏幕尺寸

---

## 提交信息 / Commit History

```
427ec5b - fix: Correct ABG visual style - Light minimalism with white backgrounds
93008e0 - feat: Apply ABG visual identity redesign - Achromatic minimalism style
```

---

**改版完成日期**: 2026年4月13日  
**改版者**: ABG Design Team  
**参考资料**: `brand_visual_guide_bilingual.html`
