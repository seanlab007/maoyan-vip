import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type EventType = 'survey' | 'influencer' | 'lifestyle'

const EVENT_CONFIG = {
  survey: {
    icon: '🔍', title: '消费调研局', color: '#4a9eff',
    desc: '组织真实消费者，让品牌方了解消费习惯，可同吃同住调研',
    hostDesc: '网红/达人发起，品牌方付费参与',
    tiers: [
      { label: '基础场', price: 5000, slots: 10, desc: '线上调研，1~2小时', reward: 5000 },
      { label: '进阶场', price: 15000, slots: 20, desc: '线下调研，半天', reward: 12000 },
      { label: '深度场', price: 30000, slots: 30, desc: '同吃同住，1~3天', reward: 20000 },
    ],
    joinAs: ['品牌方（付费参与）', '消费者（免费参与）'],
  },
  influencer: {
    icon: '⭐', title: '网红流量局', color: '#9d6dff',
    desc: '联合多位网红组局，品牌方付费参与，真实用户互动',
    hostDesc: '网红发起，品牌方报名参与',
    tiers: [
      { label: '小型局', price: 8000, slots: 5, desc: '3~5位网红，线上联动', reward: 8000 },
      { label: '中型局', price: 25000, slots: 10, desc: '5~10位网红，线下见面', reward: 20000 },
      { label: '大型局', price: 80000, slots: 20, desc: '10+位网红，品牌发布会', reward: 50000 },
    ],
    joinAs: ['品牌方（付费报名）', '网红达人（免费参与）'],
  },
  lifestyle: {
    icon: '🎪', title: '网红生活体验', color: '#f6c90e',
    desc: '付费开放「网红生活的一天」，设置阶梯票价，C端用户购票参与',
    hostDesc: '网红发起，C端用户购票参与',
    tiers: [
      { label: '旁观票', price: 199, slots: 50, desc: '线上直播观看全程', reward: 199 },
      { label: '互动票', price: 599, slots: 20, desc: '线下参与半天活动', reward: 599 },
      { label: '深度票', price: 1999, slots: 5, desc: '全天陪同，专属合影', reward: 1999 },
    ],
    joinAs: ['C端用户（购票参与）'],
  },
}

interface EventForm {
  title: string
  date: string
  location: string
  description: string
  maxParticipants: string
  selectedTier: number
  contactWechat: string
}

export default function GroupEventsPage() {
  const { profile, wallet, setWallet } = useAuthStore()
  const [activeType, setActiveType] = useState<EventType>('survey')
  const [view, setView] = useState<'list' | 'create' | 'join'>('list')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<EventForm>({
    title: '', date: '', location: '', description: '',
    maxParticipants: '', selectedTier: 0, contactWechat: ''
  })

  const cfg = EVENT_CONFIG[activeType]

  useEffect(() => { loadEvents() }, [activeType])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('group_events')
        .select('*, profiles(nickname, avatar_url)')
        .eq('event_type', activeType)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
      setEvents(data || [])
    } catch { setEvents([]) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!profile?.id) { toast.error('请先登录'); return }
    if (!form.title.trim()) { toast.error('请填写活动标题'); return }
    if (!form.date) { toast.error('请选择活动日期'); return }
    if (!form.contactWechat.trim()) { toast.error('请填写联系微信'); return }

    setSubmitting(true)
    try {
      const tier = cfg.tiers[form.selectedTier]
      const reward = Math.floor(tier.reward * 0.1) // 发起奖励10%

      await supabase.from('group_events').insert({
        host_id: profile.id,
        event_type: activeType,
        title: form.title,
        date: form.date,
        location: form.location || '线上',
        description: form.description,
        max_participants: parseInt(form.maxParticipants) || tier.slots,
        current_participants: 0,
        tier_label: tier.label,
        price: tier.price,
        contact_wechat: form.contactWechat,
        status: 'active',
        reward_points: reward,
      })

      await supabase.from('point_transactions').insert({
        user_id: profile.id,
        type: 'event_create',
        amount: reward,
        description: `发起${cfg.title}：${form.title}`,
        status: 'pending',
      })

      const newBalance = (wallet?.balance || 0) + reward
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
      setWallet({ ...(wallet as any), balance: newBalance })

      toast.success(`🎉 活动发布成功！获得 +${reward} 积分`)
      setView('list')
      setForm({ title: '', date: '', location: '', description: '', maxParticipants: '', selectedTier: 0, contactWechat: '' })
      loadEvents()
    } catch (err) {
      console.error(err)
      toast.error('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async (event: any) => {
    if (!profile?.id) { toast.error('请先登录'); return }
    toast.success(`📞 报名成功！请添加主办方微信：${event.contact_wechat}`)
    await supabase.from('event_participants').insert({
      event_id: event.id,
      user_id: profile.id,
      status: 'pending',
    }).select()
    await supabase.from('group_events').update({
      current_participants: (event.current_participants || 0) + 1
    }).eq('id', event.id)
    loadEvents()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      {/* 类型切换 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {(Object.keys(EVENT_CONFIG) as EventType[]).map(t => {
          const c = EVENT_CONFIG[t]
          return (
            <button key={t} onClick={() => { setActiveType(t); setView('list') }}
              style={{ flex: 1, minWidth: 120, padding: '12px 16px', borderRadius: 12, border: `1px solid ${activeType === t ? c.color : 'var(--border)'}`, background: activeType === t ? `${c.color}22` : 'rgba(255,255,255,0.03)', color: activeType === t ? c.color : 'var(--text2)', fontWeight: activeType === t ? 700 : 400, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 13 }}>{c.title}</div>
            </button>
          )
        })}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{cfg.icon} {cfg.title}</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>{cfg.desc}</p>
        <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>👥 {cfg.hostDesc}</p>
      </div>

      {/* 阶梯定价 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {cfg.tiers.map((tier, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${cfg.color}44`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>{tier.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>
              ¥{tier.price.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{tier.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--gold)' }}>名额 {tier.slots} 人</div>
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      {view === 'list' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={() => setView('create')}
            style={{ flex: 1, padding: '12px', borderRadius: 10, background: cfg.color, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>
            + 我要发起活动
          </button>
          <button onClick={() => setView('join')}
            style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--text)', fontWeight: 700, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14 }}>
            🔍 浏览活动报名
          </button>
        </div>
      )}

      {/* 发起表单 */}
      {view === 'create' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>发起{cfg.title}</h3>
            <button onClick={() => setView('list')} style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>取消</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>活动标题 *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={`例：${cfg.title} — 美妆品牌消费者招募`}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>活动日期 *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>活动地点</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="城市/线上"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>选择档位</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {cfg.tiers.map((t, i) => (
                  <button key={i} onClick={() => setForm(f => ({ ...f, selectedTier: i }))}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.selectedTier === i ? cfg.color : 'var(--border)'}`, background: form.selectedTier === i ? `${cfg.color}22` : 'transparent', color: form.selectedTier === i ? cfg.color : 'var(--text2)', cursor: 'pointer', fontSize: 12, fontWeight: form.selectedTier === i ? 700 : 400 }}>
                    {t.label}<br />¥{t.price.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>活动详情</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                placeholder="描述活动内容、参与要求、品牌需求等..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>联系微信 *</label>
              <input value={form.contactWechat} onChange={e => setForm(f => ({ ...f, contactWechat: e.target.value }))}
                placeholder="报名者通过此微信联系你"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            <button onClick={handleCreate} disabled={submitting}
              style={{ padding: '14px', borderRadius: 12, background: submitting ? `${cfg.color}66` : cfg.color, color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '发布中...' : `🚀 发布活动，获得 +${Math.floor(cfg.tiers[form.selectedTier].reward * 0.1)} 积分`}
            </button>
          </div>
        </div>
      )}

      {/* 活动列表 */}
      {(view === 'list' || view === 'join') && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text2)' }}>
            {loading ? '加载中...' : `当前有 ${events.length} 个活动`}
          </div>
          {events.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <div>暂无活动，成为第一个发起者！</div>
            </div>
          )}
          {events.map(ev => (
            <div key={ev.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${cfg.color}33`, borderRadius: 14, padding: '16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    📅 {ev.date} · 📍 {ev.location} · 👥 {ev.current_participants}/{ev.max_participants} 人
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>¥{(ev.price || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{ev.tier_label}</div>
                </div>
              </div>
              {ev.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>{ev.description}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>主办：{ev.profiles?.nickname || '匿名'}</div>
                <button onClick={() => handleJoin(ev)}
                  style={{ padding: '8px 20px', borderRadius: 99, background: cfg.color, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  立即报名
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
