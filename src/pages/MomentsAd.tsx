import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const TIPS = [
  '截图需包含完整朋友圈内容，可见点赞/评论数',
  '发布时间需在截图中可见',
  '内容需包含猫眼相关信息（@猫眼/猫眼logo/maoyan.vip）',
  '截图需满24小时后提交，审核后获得积分',
]

export default function MomentsAdPage() {
  const navigate = useNavigate()
  const { profile, wallet, setWallet } = useAuthStore()
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('微信朋友圈')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [tab, setTab] = useState<'submit' | 'history'>('submit')

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) { toast.error('最多上传5张截图'); return }
    const newPreviews: string[] = []
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => {
        newPreviews.push(ev.target?.result as string)
        if (newPreviews.length === files.length) {
          setPreviews(p => [...p, ...newPreviews])
        }
      }
      reader.readAsDataURL(f)
    })
    setImages(i => [...i, ...files])
  }

  const removeImage = (idx: number) => {
    setImages(i => i.filter((_, j) => j !== idx))
    setPreviews(p => p.filter((_, j) => j !== idx))
  }

  const handleSubmit = async () => {
    if (!profile?.id) { toast.error('请先登录'); return }
    if (images.length === 0) { toast.error('请上传至少一张朋友圈截图'); return }
    if (!content.trim()) { toast.error('请填写朋友圈内容描述'); return }

    setSubmitting(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of images) {
        const ext = file.name.split('.').pop()
        const path = `moments/${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('uploads').upload(path, file)
        if (!error) {
          const { data } = supabase.storage.from('uploads').getPublicUrl(path)
          uploadedUrls.push(data.publicUrl)
        }
      }

      const reward = 80
      await supabase.from('moments_ads').insert({
        user_id: profile.id,
        platform,
        content,
        screenshot_urls: uploadedUrls,
        status: 'pending',
        reward_points: reward,
      }).select()

      await supabase.from('point_transactions').insert({
        user_id: profile.id,
        type: 'moments_ad',
        amount: reward,
        description: `朋友圈广告：${platform}`,
        status: 'pending',
      })

      const newBalance = (wallet?.balance || 0) + reward
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
      setWallet({ ...(wallet as any), balance: newBalance })

      toast.success(`🎉 提交成功！审核通过后获得 +${reward} 积分`)
      setContent(''); setImages([]); setPreviews([])
      setTab('history')
    } catch (err) {
      console.error(err)
      toast.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📱 朋友圈广告</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>发朋友圈推广猫眼，满24小时截图提交 · 审核通过得 <strong style={{ color: 'var(--gold)' }}>+80 积分/条</strong></p>
      </div>

      {/* 提示 */}
      <div style={{ background: 'rgba(246,201,14,0.08)', border: '1px solid rgba(246,201,14,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>📋 提交要求</div>
        {TIPS.map((t, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>• {t}</div>)}
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['submit', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 20px', borderRadius: 99, border: `1px solid ${tab === t ? 'var(--gold)' : 'var(--border)'}`, background: tab === t ? 'rgba(246,201,14,0.15)' : 'transparent', color: tab === t ? 'var(--gold)' : 'var(--text2)', fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>
            {t === 'submit' ? '提交记录' : '历史记录'}
          </button>
        ))}
      </div>

      {tab === 'submit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 平台 */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>发布平台</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['微信朋友圈', '微博', '小红书', '抖音', 'QQ空间'].map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, border: `1px solid ${platform === p ? 'var(--gold)' : 'var(--border)'}`, background: platform === p ? 'rgba(246,201,14,0.15)' : 'transparent', color: platform === p ? 'var(--gold)' : 'var(--text2)', cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 内容描述 */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>朋友圈内容描述 *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
              placeholder="简述你发的朋友圈内容，例如：分享了猫眼平台的邀请链接，附上了个人使用体验..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {/* 上传截图 */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>上传截图 * <span style={{ color: 'var(--text3)' }}>（最多5张，需显示发布时间）</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {images.length < 5 && (
                <label style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)', fontSize: 13 }}>
                  <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                  <span style={{ fontSize: 28 }}>+</span>
                  <span>添加截图</span>
                </label>
              )}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            style={{ padding: '14px', borderRadius: 12, background: submitting ? 'rgba(246,201,14,0.4)' : 'var(--gold)', color: '#000', fontWeight: 800, fontSize: 16, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '提交中...' : '✅ 提交审核，获得 +80 积分'}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div>暂无历史记录</div>
          <button onClick={() => setTab('submit')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 99, background: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700 }}>去提交</button>
        </div>
      )}
    </div>
  )
}
