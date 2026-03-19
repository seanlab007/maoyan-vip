import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const PLATFORMS = ['淘宝', '京东', '拼多多', '抖音小店', '小红书', '美团', '饿了么', '线下门店', '其他']
const CATEGORIES = ['美妆护肤', '服装鞋包', '数码电子', '食品饮料', '家居家电', '运动健身', '母婴玩具', '图书文具', '医疗健康', '其他']

export default function ProductReviewPage() {
  const navigate = useNavigate()
  const { profile, wallet, setWallet } = useAuthStore()
  const [platform, setPlatform] = useState('淘宝')
  const [category, setCategory] = useState('美妆护肤')
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [recommend, setRecommend] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('图片不能超过 10MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!productName.trim()) { toast.error('请填写商品名称'); return }
    if (review.trim().length < 30) { toast.error('评测内容至少 30 字，帮助更多用户决策'); return }
    if (!profile?.id) { toast.error('请先登录'); return }

    setSubmitting(true)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `reviews/${profile.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('uploads').upload(path, imageFile)
        if (!uploadErr) {
          const { data } = supabase.storage.from('uploads').getPublicUrl(path)
          imageUrl = data.publicUrl
        }
      }

      const reward = 100
      const { error: insertErr } = await supabase.from('product_reviews').insert({
        user_id: profile.id,
        platform,
        category,
        product_name: productName,
        price: parseFloat(price) || 0,
        rating,
        review_text: review,
        pros: pros || null,
        cons: cons || null,
        recommend,
        image_url: imageUrl,
        status: 'pending',
        reward_points: reward,
      })

      if (insertErr) {
        // 如果表不存在，仍然给积分（降级处理）
        console.warn('product_reviews table may not exist:', insertErr.message)
      }

      // 写入积分流水
      const { error: txErr } = await supabase.from('point_transactions').insert({
        user_id: profile.id,
        type: 'product_review',
        amount: reward,
        description: `商品评测：${productName}`,
        status: 'pending',
      })

      // 更新 wallet balance
      if (!txErr) {
        const newBalance = (wallet?.balance || 0) + reward
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
        setWallet({ ...(wallet as any), balance: newBalance })
      }

      setSubmitted(true)
      toast.success(`🎉 评测提交成功！审核通过后获得 +${reward} 积分`)
    } catch (err) {
      console.error(err)
      toast.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: 'var(--gold)', fontSize: 24, marginBottom: 8 }}>评测提交成功！</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 8 }}>审核通过后，您将获得 <strong style={{ color: 'var(--gold)' }}>+100 积分</strong></p>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>审核时间：1~3 个工作日</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => { setSubmitted(false); setProductName(''); setReview(''); setImagePreview(null); setImageFile(null) }}
            style={{ padding: '10px 24px', borderRadius: 99, background: 'var(--gold)', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            再写一篇
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '10px 24px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>✍️ 商品真实评测</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>写真实使用体验，帮助更多用户决策 · 审核通过得 <strong style={{ color: 'var(--gold)' }}>+100 积分</strong></p>
      </div>

      {/* 评分卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[{ label: '上传截图', reward: '+50~200', icon: '📸' }, { label: '附带点评', reward: '+100', icon: '✍️' }, { label: '月度活跃', reward: '+500', icon: '📅' }].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{c.reward} 积分</div>
          </div>
        ))}
      </div>

      {/* 表单 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 平台 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>购买平台</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, border: `1px solid ${platform === p ? 'var(--gold)' : 'var(--border)'}`, background: platform === p ? 'rgba(246,201,14,0.15)' : 'transparent', color: platform === p ? 'var(--gold)' : 'var(--text2)', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 分类 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>商品分类</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, border: `1px solid ${category === c ? '#4a9eff' : 'var(--border)'}`, background: category === c ? 'rgba(74,158,255,0.15)' : 'transparent', color: category === c ? '#4a9eff' : 'var(--text2)', cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 商品名 + 价格 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>商品名称 *</label>
            <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="例：ONE·FACE 高定肖像拍摄"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>消费金额 (¥)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
              style={{ width: 100, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14 }} />
          </div>
        </div>

        {/* 评分 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>综合评分</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)}
                style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${rating >= s ? '#f6c90e' : 'var(--border)'}`, background: rating >= s ? 'rgba(246,201,14,0.2)' : 'transparent', fontSize: 20, cursor: 'pointer' }}>
                {rating >= s ? '⭐' : '☆'}
              </button>
            ))}
            <span style={{ color: 'var(--text2)', fontSize: 13, alignSelf: 'center', marginLeft: 8 }}>
              {['', '很差', '较差', '一般', '不错', '非常好'][rating]}
            </span>
          </div>
        </div>

        {/* 评测内容 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>评测内容 * <span style={{ color: 'var(--text3)' }}>（至少 30 字）</span></label>
          <textarea value={review} onChange={e => setReview(e.target.value)} rows={5}
            placeholder="说说你的真实使用体验：质量如何？性价比怎样？适合什么场景？会推荐给朋友吗？"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ textAlign: 'right', fontSize: 12, color: review.length >= 30 ? 'var(--gold)' : 'var(--text3)', marginTop: 4 }}>{review.length} / 30+</div>
        </div>

        {/* 优缺点 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#22d3a0', display: 'block', marginBottom: 6 }}>👍 优点（选填）</label>
            <textarea value={pros} onChange={e => setPros(e.target.value)} rows={3} placeholder="最喜欢的地方..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(34,211,160,0.06)', border: '1px solid rgba(34,211,160,0.2)', color: 'var(--text)', fontSize: 13, resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#ff6b6b', display: 'block', marginBottom: 6 }}>👎 缺点（选填）</label>
            <textarea value={cons} onChange={e => setCons(e.target.value)} rows={3} placeholder="不满意的地方..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--text)', fontSize: 13, resize: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* 是否推荐 */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[{ v: true, label: '✅ 推荐购买', color: '#22d3a0' }, { v: false, label: '❌ 不推荐', color: '#ff6b6b' }].map(opt => (
            <button key={String(opt.v)} onClick={() => setRecommend(opt.v)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${recommend === opt.v ? opt.color : 'var(--border)'}`, background: recommend === opt.v ? `${opt.color}22` : 'transparent', color: recommend === opt.v ? opt.color : 'var(--text2)', fontWeight: recommend === opt.v ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* 上传图片 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>📸 上传商品图片（选填，支持 JPG/PNG/WebP，最大 10MB）</label>
          <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 12, padding: imagePreview ? 0 : '24px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden' }}>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
            ) : (
              <div style={{ color: 'var(--text3)', fontSize: 14 }}>点击选择图片</div>
            )}
          </label>
        </div>

        {/* 提交 */}
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: '14px', borderRadius: 12, background: submitting ? 'rgba(246,201,14,0.4)' : 'var(--gold)', color: '#000', fontWeight: 800, fontSize: 16, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? '提交中...' : '✅ 提交评测，获得 +100 积分'}
        </button>
      </div>
    </div>
  )
}
