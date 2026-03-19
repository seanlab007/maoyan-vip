import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// AI 自动打分逻辑（前端模拟，实际应调用后端 AI 接口）
function aiScoreImage(file: File, reviewText: string): Promise<{ score: number; reason: string; aiPoints: number }> {
  return new Promise(resolve => {
    // 模拟 AI 打分：基于文件大小、类型、点评长度
    setTimeout(() => {
      let score = 60 // 基础分
      let reasons: string[] = []
      // 图片大小检测（越大越可能是真实截图）
      if (file.size > 200 * 1024) { score += 10; reasons.push('截图内容丰富') }
      if (file.size > 500 * 1024) { score += 5; reasons.push('高清截图') }
      // 点评长度
      if (reviewText.length >= 100) { score += 20; reasons.push('点评详细') }
      else if (reviewText.length >= 50) { score += 10; reasons.push('点评内容充实') }
      else { reasons.push('建议补充更多点评') }
      // 图片格式
      if (file.type === 'image/jpeg' || file.type === 'image/png') { score += 5; reasons.push('格式规范') }
      score = Math.min(100, score)
      const aiPoints = Math.round(score * 2) // AI分数转化为奖励积分
      resolve({ score, reason: reasons.join('，'), aiPoints })
    }, 1500) // 模拟 AI 处理时间
  })
}

const PLATFORMS = ['淘宝', '京东', '拼多多', '抖音小店', '小红书', '美团', '饿了么', '其他']

const POINT_RULES = [
  { label: '上传截图', points: '50–200', desc: '每张真实购物截图', icon: '📸' },
  { label: '附带点评', points: '+100', desc: '详细说明喜欢/不喜欢的原因', icon: '✍️' },
  { label: '月度活跃', points: '+500', desc: '每月上传5条以上记录', icon: '📅' },
  { label: '品牌调研', points: '+1000', desc: '完成品牌方专项调研问卷', icon: '🎯' },
]

const POINT_TIERS = [
  { min: 0, max: 999, level: '普通会员', color: '#9ba3b8', multiplier: '1x' },
  { min: 1000, max: 4999, level: '银牌会员', color: '#c0c0c0', multiplier: '1.2x' },
  { min: 5000, max: 19999, level: '金牌会员', color: '#f6c90e', multiplier: '1.5x' },
  { min: 20000, max: 99999, level: '铂金会员', color: '#9d6dff', multiplier: '2x' },
  { min: 100000, max: Infinity, level: '钻石会员', color: '#f066aa', multiplier: '3x' },
]

export default function ConsumptionPointsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ platform: '淘宝', product_name: '', amount: '', review: '', screenshot_url: '' })
  const [loading, setLoading] = useState(false)
  const [myPoints, setMyPoints] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [aiResult, setAiResult] = useState<{ score: number; reason: string; aiPoints: number } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('consumption_records').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    if (data) {
      setRecords(data)
      setMyPoints(data.reduce((sum: number, r: any) => sum + (r.points_earned || 0), 0))
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. 本地预览
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setSelectedFile(file)
    setAiResult(null)

    // 2. 启动 AI 打分
    setAiLoading(true)
    toast('🤖 AI 正在分析截图...', { duration: 2000 })
    const result = await aiScoreImage(file, form.review)
    setAiResult(result)
    setAiLoading(false)

    // 3. 尝试上传到 Supabase Storage
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `consumption/${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('uploads').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      setForm(f => ({ ...f, screenshot_url: publicUrl }))
      toast.success(`截图上传成功！AI 评分: ${result.score}分`)
    } catch {
      // Storage 不可用时，用本地 base64 作为备用
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setForm(f => ({ ...f, screenshot_url: dataUrl }))
        toast.success(`截图已记录！AI 评分: ${result.score}分`)
      }
      reader.readAsDataURL(file)
    }
    setUploading(false)
  }

  async function handleSubmit() {
    if (!form.product_name || !form.review) { toast.error('请填写商品名称和点评'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('请先登录'); return }
      // 积分计算：基础 + 点评奖励 + 截图奖励 + AI分奖励
      const basePoints = 50
      const reviewBonus = form.review.length > 50 ? 100 : 0
      const screenshotBonus = form.screenshot_url ? 50 : 0
      const aiBonus = aiResult ? aiResult.aiPoints : 0
      const totalPoints = basePoints + reviewBonus + screenshotBonus + aiBonus
      const { error } = await supabase.from('consumption_records').insert({
        user_id: user.id,
        platform: form.platform,
        product_name: form.product_name,
        amount: parseFloat(form.amount) || 0,
        review: form.review,
        screenshot_url: form.screenshot_url,
        points_earned: totalPoints,
        status: 'pending', // 待人工审核
        // 存储 AI 评分信息（如果字段存在）
        // ai_score: aiResult?.score,
        // ai_reason: aiResult?.reason,
      })
      if (error) throw error
      toast.success(`🎉 提交成功！AI预评 ${totalPoints} 积分，人工审核后最终到账`)
      setShowForm(false)
      setForm({ platform: '淘宝', product_name: '', amount: '', review: '', screenshot_url: '' })
      setPreviewUrl(null)
      setSelectedFile(null)
      setAiResult(null)
      fetchData()
    } catch (e: any) { toast.error(e.message || '提交失败') }
    setLoading(false)
  }

  const currentTier = POINT_TIERS.find(t => myPoints >= t.min && myPoints <= t.max) || POINT_TIERS[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* 页头 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🧾</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>消费记录换积分</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>上传真实购物截图 + 点评 → 获得积分 → 兑换商品或服务（积分不可提现）</p>
          </div>
        </div>

        {/* 我的积分卡 */}
        <div style={{ background: 'linear-gradient(135deg,rgba(246,201,14,0.15),rgba(246,201,14,0.05))', border: '1px solid rgba(246,201,14,0.3)', borderRadius: 20, padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>我的消费积分</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#f6c90e' }}>{myPoints.toLocaleString()}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              <span style={{ color: currentTier.color, fontWeight: 700 }}>{currentTier.level}</span>
              <span style={{ color: 'var(--text3)', marginLeft: 8 }}>积分倍率 {currentTier.multiplier}</span>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 14, cursor: 'pointer', border: 'none', fontSize: 15 }}>
            + 上传消费记录
          </button>
        </div>

        {/* 积分规则 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          {POINT_RULES.map((rule, i) => (
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{rule.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{rule.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f6c90e', marginBottom: 4 }}>{rule.points} 积分</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{rule.desc}</div>
            </div>
          ))}
        </div>

        {/* 积分等级 */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>积分等级体系</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {POINT_TIERS.map((tier, i) => (
              <div key={i} style={{ flex: '1 1 140px', background: myPoints >= tier.min ? 'rgba(246,201,14,0.08)' : 'var(--bg3)', border: `1px solid ${myPoints >= tier.min ? tier.color + '60' : 'var(--border)'}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ color: tier.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{tier.level}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{tier.min.toLocaleString()}+ 积分</div>
                <div style={{ fontSize: 13, color: '#22d3a0', fontWeight: 600 }}>倍率 {tier.multiplier}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 我的记录 */}
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>我的消费记录</h3>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <div>还没有消费记录，上传第一条获得积分吧！</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {records.map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ background: 'var(--bg3)', padding: '2px 10px', borderRadius: 20, fontSize: 12, color: 'var(--text2)' }}>{r.platform}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.product_name}</span>
                    {r.amount > 0 && <span style={{ fontSize: 12, color: 'var(--text3)' }}>消费金额: ¥{r.amount}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{r.review}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#f6c90e', fontWeight: 700, fontSize: 16 }}>+{r.points_earned}</div>
                  <div style={{ fontSize: 11, color: r.status === 'approved' ? '#22d3a0' : 'var(--text3)' }}>
                    {r.status === 'approved' ? '✅ 已到账' : r.status === 'pending' ? '⏳ 审核中' : '❌ 未通过'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 上传表单弹窗 */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: 32, maxWidth: 500, width: '100%', margin: 'auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>上传消费记录</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>真实记录 + 详细点评 = 更多积分</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>购物平台</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setForm(f => ({ ...f, platform: p }))}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${form.platform === p ? '#f6c90e' : 'var(--border)'}`, background: form.platform === p ? 'rgba(246,201,14,0.15)' : 'var(--bg3)', color: form.platform === p ? '#f6c90e' : 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>商品名称 *</label>
              <input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} placeholder="例：耐克运动鞋 Air Max 270"
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>消费金额（元）</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                消费点评 * <span style={{ color: '#22d3a0' }}>（50字以上获得额外100积分）</span>
              </label>
              <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                placeholder="说说你为什么喜欢/不喜欢这个商品？质量如何？性价比怎样？会推荐给朋友吗？"
                rows={4} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, resize: 'vertical' }} />
              <div style={{ fontSize: 12, color: form.review.length > 50 ? '#22d3a0' : 'var(--text3)', marginTop: 4 }}>
                {form.review.length} 字 {form.review.length > 50 ? '✅ 额外 +100 积分' : `（还差 ${50 - form.review.length} 字）`}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                上传购物截图 <span style={{ color: '#22d3a0' }}>(＋50 积分 + AI评分奖励)</span>
              </label>
              {/* 截图预览 */}
              {previewUrl ? (
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <img src={previewUrl} alt="截图预览" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border)' }} />
                  <button
                    onClick={() => { setPreviewUrl(null); setSelectedFile(null); setAiResult(null); setForm(f => ({ ...f, screenshot_url: '' })) }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', fontSize: 14 }}
                  >×</button>
                </div>
              ) : (
                <label style={{ display: 'block', border: '2px dashed var(--border2)', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)' }}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                  <div style={{ color: 'var(--text3)', fontSize: 13 }}>{uploading ? '上传中...' : '点击选择购物截图（支持 JPG/PNG/WebP）'}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 4 }}>AI 将自动分析截图真实性</div>
                </label>
              )}
              {/* AI 评分结果 */}
              {aiLoading && (
                <div style={{ background: 'rgba(157,109,255,0.08)', border: '1px solid rgba(157,109,255,0.2)', borderRadius: 10, padding: '10px 14px', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <span style={{ fontSize: 13, color: '#c084fc' }}>AI 正在分析截图真实性...</span>
                </div>
              )}
              {aiResult && !aiLoading && (
                <div style={{ background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)', borderRadius: 10, padding: '12px 14px', marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🤖</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#22d3a0' }}>AI 评分: {aiResult.score}分</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f6c90e' }}>+{aiResult.aiPoints} 积分</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{aiResult.reason}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>ℹ️ AI 预评仅供参考，最终积分由人工审核确定</div>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>预计获得积分：</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>人工审核后最终确定</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>基础积分</span><span>50</span>
                </div>
                {form.review.length > 50 && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>详细点评奖励</span><span style={{ color: '#22d3a0' }}>+100</span>
                </div>}
                {form.screenshot_url && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>截图奖励</span><span style={{ color: '#22d3a0' }}>+50</span>
                </div>}
                {aiResult && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#c084fc' }}>🤖 AI评分奖励（{aiResult.score}分）</span>
                  <span style={{ color: '#c084fc' }}>+{aiResult.aiPoints}</span>
                </div>}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>合计（AI预评）</span>
                  <span style={{ color: '#f6c90e' }}>{50 + (form.review.length > 50 ? 100 : 0) + (form.screenshot_url ? 50 : 0) + (aiResult?.aiPoints || 0)} 积分</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px 0', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600 }}>取消</button>
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px 0', background: 'linear-gradient(135deg,#f6c90e,#ffd94a)', color: '#0c0d10', fontWeight: 700, borderRadius: 10, cursor: 'pointer', border: 'none', fontSize: 15 }}>
                {loading ? '提交中...' : '提交获得积分'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
