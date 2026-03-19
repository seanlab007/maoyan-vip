import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const PLATFORMS = ['抖音', '快手', '微信视频号', '淘宝直播', 'B站', '小红书', '其他']

export default function LiveStreamPage() {
  const { profile, wallet, setWallet } = useAuthStore()
  const [platform, setPlatform] = useState('抖音')
  const [liveUrl, setLiveUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [viewers, setViewers] = useState('')
  const [gmv, setGmv] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const calcReward = () => {
    const g = parseFloat(gmv) || 0
    const d = parseFloat(duration) || 0
    let base = 50
    if (d >= 2) base += 30
    if (d >= 4) base += 50
    if (g >= 1000) base += 100
    if (g >= 5000) base += 200
    if (g >= 10000) base += 500
    return base
  }

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 6) { toast.error('最多6张截图'); return }
    const newPreviews: string[] = []
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => {
        newPreviews.push(ev.target?.result as string)
        if (newPreviews.length === files.length) setPreviews(p => [...p, ...newPreviews])
      }
      reader.readAsDataURL(f)
    })
    setImages(i => [...i, ...files])
  }

  const handleSubmit = async () => {
    if (!profile?.id) { toast.error('请先登录'); return }
    if (images.length === 0) { toast.error('请上传直播截图或回放截图'); return }
    if (!duration) { toast.error('请填写直播时长'); return }

    setSubmitting(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of images) {
        const ext = file.name.split('.').pop()
        const path = `livestream/${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('uploads').upload(path, file)
        if (!error) {
          const { data } = supabase.storage.from('uploads').getPublicUrl(path)
          uploadedUrls.push(data.publicUrl)
        }
      }

      const reward = calcReward()
      await supabase.from('livestream_records').insert({
        user_id: profile.id,
        platform,
        live_url: liveUrl || null,
        duration_hours: parseFloat(duration) || 0,
        viewers: parseInt(viewers) || 0,
        gmv: parseFloat(gmv) || 0,
        description,
        screenshot_urls: uploadedUrls,
        status: 'pending',
        reward_points: reward,
      })

      await supabase.from('point_transactions').insert({
        user_id: profile.id,
        type: 'livestream',
        amount: reward,
        description: `直播记录：${platform} ${duration}小时`,
        status: 'pending',
      })

      const newBalance = (wallet?.balance || 0) + reward
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
      setWallet({ ...(wallet as any), balance: newBalance })

      setSubmitted(true)
      toast.success(`🎉 提交成功！审核通过后获得 +${reward} 积分`)
    } catch (err) {
      console.error(err)
      toast.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ color: 'var(--gold)', fontSize: 24, marginBottom: 8 }}>直播记录提交成功！</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 4 }}>预计获得 <strong style={{ color: 'var(--gold)' }}>+{calcReward()} 积分</strong></p>
      <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>审核时间：1~3 个工作日</p>
      <button onClick={() => { setSubmitted(false); setImages([]); setPreviews([]); setDuration(''); setGmv(''); setViewers('') }}
        style={{ padding: '10px 28px', borderRadius: 99, background: 'var(--gold)', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        再提交一次
      </button>
    </div>
  )

  const reward = calcReward()

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🔴 开直播</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>上传直播记录和卖货截图，审核通过按时长+GMV获得积分奖励</p>
      </div>

      {/* 积分规则 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: '基础奖励', val: '+50', desc: '每次直播' },
          { label: '时长≥2h', val: '+30', desc: '额外奖励' },
          { label: '时长≥4h', val: '+80', desc: '额外奖励' },
          { label: 'GMV≥1000', val: '+100', desc: '卖货奖励' },
          { label: 'GMV≥5000', val: '+300', desc: '卖货奖励' },
          { label: 'GMV≥1万', val: '+800', desc: '卖货奖励' },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>{c.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* 预估积分 */}
      <div style={{ background: 'linear-gradient(135deg,rgba(246,201,14,0.1),rgba(246,201,14,0.05))', border: '1px solid rgba(246,201,14,0.3)', borderRadius: 12, padding: '16px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>预估可获积分</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--gold)' }}>+{reward}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 平台 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>直播平台</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, border: `1px solid ${platform === p ? 'var(--gold)' : 'var(--border)'}`, background: platform === p ? 'rgba(246,201,14,0.15)' : 'transparent', color: platform === p ? 'var(--gold)' : 'var(--text2)', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 直播链接 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>直播间链接（选填）</label>
          <input value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        {/* 时长 + 观看人数 + GMV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: '直播时长（小时）*', val: duration, set: setDuration, ph: '例：2.5' },
            { label: '最高在线人数', val: viewers, set: setViewers, ph: '例：500' },
            { label: '卖货GMV（¥）', val: gmv, set: setGmv, ph: '例：3000' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>

        {/* 描述 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>直播内容描述（选填）</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder="简述直播内容，推广了哪些产品，是否提到猫眼平台..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        {/* 上传截图 */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>上传直播截图/回放截图 * <span style={{ color: 'var(--text3)' }}>（最多6张）</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => { setImages(imgs => imgs.filter((_, j) => j !== i)); setPreviews(ps => ps.filter((_, j) => j !== i)) }}
                  style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))}
            {images.length < 6 && (
              <label style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)', fontSize: 13 }}>
                <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                <span style={{ fontSize: 28 }}>+</span><span>添加截图</span>
              </label>
            )}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: '14px', borderRadius: 12, background: submitting ? 'rgba(246,201,14,0.4)' : 'var(--gold)', color: '#000', fontWeight: 800, fontSize: 16, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? '提交中...' : `✅ 提交记录，预计获得 +${reward} 积分`}
        </button>
      </div>
    </div>
  )
}
