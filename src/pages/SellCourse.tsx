import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CourseForm {
  title: string
  subtitle: string
  category: string
  price: string
  description: string
  outline: string
  contactWechat: string
  coverEmoji: string
}

const CATEGORIES = ['健康营养', '美妆护肤', '穿搭时尚', '投资理财', '短视频运营', '电商带货', '职场技能', '其他']
const EMOJIS = ['🎓', '💄', '👗', '💰', '📱', '🛒', '💼', '🌟', '🔥', '✨']

export default function SellCoursePage() {
  const { profile, wallet, setWallet } = useAuthStore()
  const [view, setView] = useState<'list' | 'create'>('list')
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CourseForm>({
    title: '', subtitle: '', category: '健康营养', price: '',
    description: '', outline: '', contactWechat: '', coverEmoji: '🎓'
  })

  useEffect(() => { loadCourses() }, [])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('user_courses')
        .select('*, profiles(nickname, avatar_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
      setCourses(data || [])
    } catch { setCourses([]) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!profile?.id) { toast.error('请先登录'); return }
    if (!form.title.trim()) { toast.error('请填写课程标题'); return }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('请设置课程价格'); return }
    if (!form.contactWechat.trim()) { toast.error('请填写联系微信'); return }

    setSubmitting(true)
    try {
      const reward = 500 // 发布课程奖励500积分

      await supabase.from('user_courses').insert({
        host_id: profile.id,
        title: form.title,
        subtitle: form.subtitle,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description,
        outline: form.outline,
        contact_wechat: form.contactWechat,
        cover_emoji: form.coverEmoji,
        status: 'active',
        students: 0,
      })

      await supabase.from('point_transactions').insert({
        user_id: profile.id,
        type: 'course_publish',
        amount: reward,
        description: `发布课程：${form.title}`,
        status: 'completed',
      })

      const newBalance = (wallet?.balance || 0) + reward
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
      setWallet({ ...(wallet as any), balance: newBalance })

      toast.success(`🎉 课程发布成功！获得 +${reward} 积分`)
      setView('list')
      setForm({ title: '', subtitle: '', category: '健康营养', price: '', description: '', outline: '', contactWechat: '', coverEmoji: '🎓' })
      loadCourses()
    } catch (err) {
      console.error(err)
      toast.error('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEnroll = (course: any) => {
    toast.success(`📞 报名成功！请添加讲师微信：${course.contact_wechat}`)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📚 卖自己的课程</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>分享你的专业知识，发布课程赚取收益，发布即得500积分</p>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView('create')}
          style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--gold)', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 14 }}>
          + 发布我的课程 <span style={{ fontSize: 12, fontWeight: 400 }}>（+500积分）</span>
        </button>
        <button onClick={() => setView('list')}
          style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14 }}>
          🔍 浏览课程
        </button>
      </div>

      {/* 发布表单 */}
      {view === 'create' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>发布课程</h3>
            <button onClick={() => setView('list')} style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>取消</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 封面emoji */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>课程封面图标</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, coverEmoji: e }))}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.coverEmoji === e ? 'var(--gold)' : 'var(--border)'}`, background: form.coverEmoji === e ? 'rgba(246,201,14,0.15)' : 'transparent', fontSize: 20, cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>课程标题 *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="例：30天变美计划：护肤+饮食+运动全攻略"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            {/* 副标题 */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>课程副标题</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                placeholder="一句话描述课程价值"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            {/* 分类 + 价格 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>课程分类</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>课程价格（¥）*</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="例：199"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* 课程简介 */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>课程简介</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                placeholder="描述课程内容、适合人群、学完能获得什么..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* 课程大纲 */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>课程大纲（选填）</label>
              <textarea value={form.outline} onChange={e => setForm(f => ({ ...f, outline: e.target.value }))} rows={4}
                placeholder="第1课：...\n第2课：...\n第3课：..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* 联系微信 */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>联系微信 *</label>
              <input value={form.contactWechat} onChange={e => setForm(f => ({ ...f, contactWechat: e.target.value }))}
                placeholder="学员通过此微信联系你报名"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            <button onClick={handleCreate} disabled={submitting}
              style={{ padding: '14px', borderRadius: 12, background: submitting ? 'rgba(246,201,14,0.4)' : 'var(--gold)', color: '#000', fontWeight: 800, fontSize: 15, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '发布中...' : '🚀 立即发布，获得 +500 积分'}
            </button>
          </div>
        </div>
      )}

      {/* 课程列表 */}
      {view === 'list' && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text2)' }}>
            {loading ? '加载中...' : `共 ${courses.length} 门课程`}
          </div>
          {courses.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 16, marginBottom: 8 }}>还没有课程</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>成为第一个发布课程的达人！</div>
              <button onClick={() => setView('create')}
                style={{ padding: '10px 28px', borderRadius: 99, background: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                发布课程
              </button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {courses.map(course => (
              <div key={course.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,rgba(246,201,14,0.15),rgba(246,201,14,0.05))', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48 }}>{course.cover_emoji || '🎓'}</div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 4 }}>{course.category}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}>{course.title}</h3>
                  {course.subtitle && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{course.subtitle}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>¥{course.price}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>👥 {course.students || 0}人已报名</div>
                    </div>
                    <button onClick={() => handleEnroll(course)}
                      style={{ padding: '8px 18px', borderRadius: 99, background: 'var(--gold)', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                      立即报名
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                    讲师：{course.profiles?.nickname || '匿名'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
