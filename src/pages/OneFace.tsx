import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

// ===== CDN 照片资源 =====
const GALLERY_PHOTOS = [
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/7e2d963854cf7d37c5cba0b17645e19f_03e74458.jpg',
    theme: '光影大片',
    style: '金色逆光',
    points: 2000,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/f753cb84667615f0a6c20271f1fd6cd9_684be83f.webp',
    theme: '向日葵系列',
    style: '清新时尚',
    points: 1500,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/4ac48d56026dd3776746305d3bab9a9a_201383c5.jpg',
    theme: '国风旗袍',
    style: '东方美学',
    points: 2500,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/1c305bf5aeebdf550f566eb663cc5587_4ba76b31.webp',
    theme: '新春红系列',
    style: '喜庆大气',
    points: 2000,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/60bc7f5cca8ca72d418f2077780c2b4a_ba467bf8.jpg',
    theme: '优雅熟龄',
    style: '知性成熟',
    points: 1800,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/c7718de424af52e21888ed0ca2c2e5fc_3f442840.jpg',
    theme: '古风侠女',
    style: '武侠仙气',
    points: 3000,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/568e9f29bd321b0e6ff5a3575510af66_0e9547c0.jpg',
    theme: '亲子温情',
    style: '家庭纪念',
    points: 1500,
  },
  {
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/77e50b5580635f7cc9851d4724151c3f_8ebd40a3.jpg',
    theme: '闺蜜写真',
    style: '时尚轻奢',
    points: 1800,
  },
]

// ===== ONE FACE 等级体系 =====
const ONEFACE_LEVELS = [
  { level: 1, name: '初见', icon: '🌱', photos: 0, badge: '普通会员', color: '#888', perks: ['基础拍摄服务', '积分充值'] },
  { level: 2, name: '绽放', icon: '🌸', photos: 1, badge: 'VIP 徽章', color: '#22d3a0', perks: ['VIP 专属徽章', '优先预约', '个人橱窗展示'] },
  { level: 3, name: '盛放', icon: '🌺', photos: 3, badge: '网红认证', color: '#4a9eff', perks: ['网红认证标识', '平台流量扶持', '专属推荐位'] },
  { level: 4, name: '传奇', icon: '👑', photos: 6, badge: '肖像大师', color: '#f6c90e', perks: ['肖像大师勋章', '首页展示', '品牌合作资格', '邀约奖励翻倍'] },
]

// ===== 模拟网红橱窗数据 =====
const SHOWCASE_INFLUENCERS = [
  { name: '小鱼儿', nickname: '@xiaoyu', photos: 8, badge: '肖像大师', badgeColor: '#f6c90e', avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/7e2d963854cf7d37c5cba0b17645e19f_03e74458.jpg', fans: '12.3万', points: 45000 },
  { name: '晴天', nickname: '@qingtian', photos: 6, badge: '肖像大师', badgeColor: '#f6c90e', avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/4ac48d56026dd3776746305d3bab9a9a_201383c5.jpg', fans: '8.7万', points: 32000 },
  { name: '玫瑰', nickname: '@meigui', photos: 4, badge: '网红认证', badgeColor: '#4a9eff', avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/1c305bf5aeebdf550f566eb663cc5587_4ba76b31.webp', fans: '5.2万', points: 18000 },
  { name: '优雅姐', nickname: '@youyajie', photos: 3, badge: '网红认证', badgeColor: '#4a9eff', avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663405311158/X9MpYGJw9J7Db3VAodtwJG/60bc7f5cca8ca72d418f2077780c2b4a_ba467bf8.jpg', fans: '3.8万', points: 12000 },
]

// ===== 套餐配置 =====
const PACKAGES = [
  { id: 'basic', name: '基础套餐', price: 299, points: 500, photos: 10, desc: '1套主题 · 精修10张 · 电子版', color: '#22d3a0', popular: false },
  { id: 'standard', name: '标准套餐', price: 599, points: 1200, photos: 20, desc: '2套主题 · 精修20张 · 电子版+印刷版', color: '#4a9eff', popular: true },
  { id: 'premium', name: '高端套餐', price: 999, points: 2500, photos: 30, desc: '3套主题 · 精修30张 · 全套服务+橱窗展示', color: '#f6c90e', popular: false },
  { id: 'vip', name: '肖像大师', price: 1999, points: 6000, photos: 50, desc: '5套主题 · 精修50张 · 品牌合作+流量扶持', color: '#f066aa', popular: false },
]

export default function OneFacePage() {
  const { profile, wallet, loadUserData, user } = useAuthStore()
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 模拟用户 ONE FACE 照片数量（实际应从数据库读取）
  const userPhotoCount = 0
  const currentLevel = ONEFACE_LEVELS.reduce((acc, l) => userPhotoCount >= l.photos ? l : acc, ONEFACE_LEVELS[0])
  const nextLevel = ONEFACE_LEVELS.find(l => l.photos > userPhotoCount)

  useEffect(() => {
    if (user) loadUserData(user.id)
  }, [user])

  useEffect(() => {
    if (!autoPlay) return
    timerRef.current = setInterval(() => {
      setCurrentPhoto(p => (p + 1) % GALLERY_PHOTOS.length)
    }, 3000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay])

  const goTo = (i: number) => {
    setCurrentPhoto(i)
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 8000)
  }

  return (
    <div style={{ padding: '0 4px' }}>

      {/* ===== Hero 区域：大图轮播 + 品牌标语 ===== */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 20, aspectRatio: '16/9', maxHeight: 420, background: '#000' }}>
        {GALLERY_PHOTOS.map((photo, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === currentPhoto ? 1 : 0, transition: 'opacity 0.8s ease', pointerEvents: i === currentPhoto ? 'auto' : 'none' }}>
            <img src={photo.url} alt={photo.theme} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
          </div>
        ))}

        {/* 品牌标语 */}
        <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.7)', fontFamily: 'serif', marginBottom: 4 }}>ONE·FACE | 高定肖像</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>One Face, One Definitive Narrative</div>
        </div>

        {/* 当前照片信息 */}
        <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, zIndex: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{GALLERY_PHOTOS[currentPhoto].theme}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{GALLERY_PHOTOS[currentPhoto].style}</div>
          </div>
          <div style={{ background: 'rgba(246,201,14,0.9)', color: '#000', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
            +{GALLERY_PHOTOS[currentPhoto].points} 积分
          </div>
        </div>

        {/* 指示点 */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
          {GALLERY_PHOTOS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === currentPhoto ? 20 : 6, height: 6, borderRadius: 99, background: i === currentPhoto ? '#f6c90e' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* 左右切换 */}
        <button onClick={() => goTo((currentPhoto - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 16, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <button onClick={() => goTo((currentPhoto + 1) % GALLERY_PHOTOS.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 16, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* ===== 一张脸，一个决定性叙事 ===== */}
      <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, marginBottom: 6 }}>一张脸，一个决定性叙事</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>专业高定肖像拍摄 · 拍照即积分充值 · 照片越多等级越高</div>
      </div>

      {/* ===== 功能1：拍照 = 积分充值 ===== */}
      <div style={{ background: 'linear-gradient(135deg,rgba(246,201,14,0.08),rgba(246,201,14,0.03))', border: '1px solid rgba(246,201,14,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📸</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>拍照 = 积分充值</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>每次拍摄，积分直接到账，相当于消费返现</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.id} onClick={() => toast(`📸 ${pkg.name}：¥${pkg.price}，获得 ${pkg.points} 积分，联系客服预约`)} style={{ position: 'relative', padding: '14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${pkg.popular ? pkg.color : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}>
              {pkg.popular && <div style={{ position: 'absolute', top: 0, right: 0, background: pkg.color, color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: '0 12px 0 8px' }}>最热</div>}
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: pkg.color, marginBottom: 4 }}>¥{pkg.price}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{pkg.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${pkg.color}15`, borderRadius: 6, padding: '4px 8px', width: 'fit-content' }}>
                <span style={{ fontSize: 12 }}>🪙</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: pkg.color }}>+{pkg.points.toLocaleString()} 积分</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 功能2：VIP徽章 + 等级体系 ===== */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#9d6dff,#f066aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👑</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>ONE FACE 等级体系</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>照片越多，等级越高，特权越多</div>
          </div>
        </div>

        {/* 当前等级 */}
        <div style={{ background: `${currentLevel.color}12`, border: `1px solid ${currentLevel.color}30`, borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 32 }}>{currentLevel.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Lv.{currentLevel.level} {currentLevel.name}</span>
              <span style={{ background: currentLevel.color, color: '#000', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 99 }}>{currentLevel.badge}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              {nextLevel ? `再拍 ${nextLevel.photos - userPhotoCount} 张解锁「${nextLevel.name}」` : '已达最高等级！'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: currentLevel.color }}>{userPhotoCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>张照片</div>
          </div>
        </div>

        {/* 等级列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ONEFACE_LEVELS.map((lv, i) => {
            const unlocked = userPhotoCount >= lv.photos
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: unlocked ? `${lv.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${unlocked ? lv.color + '25' : 'var(--border)'}`, opacity: unlocked ? 1 : 0.6 }}>
                <span style={{ fontSize: 22 }}>{lv.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Lv.{lv.level} {lv.name}</span>
                    <span style={{ background: lv.color, color: '#000', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{lv.badge}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lv.perks.join(' · ')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: lv.color, fontWeight: 700 }}>{lv.photos}张</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>起</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== 功能3：平台流量扶持 ===== */}
      <div style={{ background: 'linear-gradient(135deg,rgba(74,158,255,0.08),rgba(12,13,16,0.95))', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#4a9eff,#22d3a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚀</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>拍照获得平台流量扶持</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>有 ONE FACE 照片，平台为你加权推流</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: '📌', title: '推荐位展示', desc: '首页精选推荐', color: '#4a9eff' },
            { icon: '🔥', title: '热门加权', desc: '内容优先曝光', color: '#ff9800' },
            { icon: '🎯', title: '精准推送', desc: '匹配目标用户', color: '#22d3a0' },
            { icon: '📊', title: '数据分析', desc: '专属流量报告', color: '#9d6dff' },
            { icon: '💼', title: '品牌对接', desc: '商业合作机会', color: '#f6c90e' },
            { icon: '🌟', title: '明星同款', desc: '同款主题推广', color: '#f066aa' },
          ].map(item => (
            <div key={item.title} style={{ padding: '12px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 功能4：网红橱窗展示 ===== */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#f066aa,#9d6dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🪪</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>网红个人橱窗</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>有 ONE FACE 照片即可开通专属橱窗</div>
            </div>
          </div>
          <Link to="/profile" style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none' }}>我的橱窗 →</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {SHOWCASE_INFLUENCERS.map((inf, i) => (
            <div key={i} onClick={() => toast(`👤 查看 ${inf.name} 的个人橱窗`)} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${inf.badgeColor}`, flexShrink: 0 }}>
                  <img src={inf.avatar} alt={inf.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{inf.nickname}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <span style={{ background: inf.badgeColor, color: '#000', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{inf.badge}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#4a9eff' }}>{inf.photos}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>张照片</div>
                </div>
                <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f6c90e' }}>{inf.fans}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>粉丝</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 功能5：邀约拍照积分奖励 ===== */}
      <div style={{ background: 'linear-gradient(135deg,rgba(34,211,160,0.08),rgba(12,13,16,0.95))', border: '1px solid rgba(34,211,160,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#22d3a0,#4a9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤝</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>邀约拍照，双向积分</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>邀请好友来拍，你和好友都能赚积分</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '📨', step: '1', title: '生成专属邀约链接', desc: '一键生成你的 ONE FACE 邀约码', reward: '' },
            { icon: '📱', step: '2', title: '分享给好友', desc: '发送到微信、朋友圈、抖音', reward: '' },
            { icon: '📸', step: '3', title: '好友完成拍摄', desc: '好友使用你的邀约码预约并完成拍摄', reward: '+500 积分' },
            { icon: '💰', step: '4', title: '双方获得奖励', desc: '你和好友各得积分，好友额外享折扣', reward: '+200 积分' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,211,160,0.15)', border: '1px solid rgba(34,211,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{item.desc}</div>
              </div>
              {item.reward && <div style={{ background: 'rgba(34,211,160,0.1)', color: '#22d3a0', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>{item.reward}</div>}
            </div>
          ))}
        </div>
        <button onClick={() => toast('🤝 邀约链接已复制！发给好友，好友拍摄后你们各得积分')} style={{ width: '100%', background: 'linear-gradient(135deg,#22d3a0,#4a9eff)', color: '#000', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          生成我的邀约链接 →
        </button>
      </div>

      {/* ===== 照片缩略图网格 ===== */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>📷 作品展示</div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>点击查看大图</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {GALLERY_PHOTOS.map((photo, i) => (
            <div key={i} onClick={() => goTo(i)} style={{ aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: i === currentPhoto ? '2px solid var(--gold)' : '2px solid transparent', transition: 'border-color 0.2s' }}>
              <img src={photo.url} alt={photo.theme} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ===== 底部 CTA ===== */}
      <div style={{ background: 'linear-gradient(135deg,rgba(246,201,14,0.1),rgba(240,102,170,0.08))', border: '1px solid rgba(246,201,14,0.2)', borderRadius: 16, padding: '24px 28px', textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>一张脸，一个决定性叙事</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.8 }}>
          拍照即积分充值 · 照片越多等级越高<br />VIP 徽章 · 网红橱窗 · 平台流量扶持
        </div>
        <button onClick={() => toast('📸 ONE FACE 预约：请联系客服或到店咨询，即可享受专业高定肖像拍摄')} style={{ background: 'linear-gradient(135deg,#f6c90e,#f066aa)', color: '#000', border: 'none', borderRadius: 99, padding: '14px 40px', fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>
          立即预约拍摄
        </button>
      </div>
    </div>
  )
}
